'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, updateDoc, getDoc, increment } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { ToastAction } from '@/components/ui/toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const createFormSchema = (mode: 'login' | 'signup') => z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' }),
  artistName: z.string().optional(),
}).refine(data => mode !== 'signup' || (!!data.artistName && data.artistName.length > 0), {
  message: "Artist name is required.",
  path: ["artistName"],
});

const otpSchema = z.object({
    otp: z.string().min(6, { message: "Your OTP must be 6 characters." }),
});

type UserFormValue = z.infer<ReturnType<typeof createFormSchema>>;
type OtpFormValue = z.infer<typeof otpSchema>;

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { user: loggedInUser, isUserLoading } = useUser();
  
  const formSchema = createFormSchema(mode);
  
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      artistName: '',
    }
  });

  const otpForm = useForm<OtpFormValue>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    }
  });


  useEffect(() => {
    if (loggedInUser && !isUserLoading && !loggedInUser.emailVerified) {
        const checkVerificationInDB = async () => {
            const userRef = doc(firestore, 'users', loggedInUser.uid);
            try {
                const userDoc = await getDoc(userRef);
                if (userDoc.exists() && userDoc.data().emailVerified === false) {
                    setUserEmail(loggedInUser.email!);
                    setShowOtpForm(true);
                }
            } catch (error) {
                console.error("Error checking user verification status in DB:", error);
            }
        };
        checkVerificationInDB();
    }
  }, [loggedInUser, isUserLoading, firestore]);


  const sendOtp = async (email: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send OTP.');
      }
      toast({
        title: 'OTP Sent',
        description: 'Check your email for the 6-digit verification code.',
      });
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      toast({
        variant: 'destructive',
        title: 'Could Not Send OTP',
        description: error.message,
      });
    } finally {
        setLoading(false);
    }
  };

  const handleOtpVerification = async (data: OtpFormValue) => {
    setLoading(true);
    try {
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, otp: data.otp }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'OTP verification failed.');
        }

        if (loggedInUser) {
            const userRef = doc(firestore, 'users', loggedInUser.uid);
            await updateDoc(userRef, { 
                emailVerified: true,
                afrocoins: increment(10), // Give 10 coins on verification
            });
             toast({
                title: 'Email Verified!',
                description: 'Your account is now active with 10 Afrocoins. Welcome!',
            });
            router.push('/');
        } else {
            throw new Error("User session not found. Please log in again.");
        }

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: error.message,
        });
    } finally {
        setLoading(false);
    }
  }


  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        if (user) {
          await updateProfile(user, {
            displayName: data.artistName,
          });

          const userRef = doc(firestore, 'users', user.uid);
          const userData = {
            displayName: data.artistName,
            email: data.email,
            creationDate: serverTimestamp(),
            emailVerified: false, 
            afrocoins: 0, 
            refinedImages: 5,
            wallet: {
              balance: 0,
              currency: 'USD'
            }
          };
          
          await setDoc(userRef, userData).catch(e => {
             const permissionError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'create',
                requestResourceData: userData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
          });
          
          setUserEmail(data.email);
          await sendOtp(data.email);
          setShowOtpForm(true);
          
          toast({
            title: 'Sign Up Successful',
            description: 'One more step! Please verify your email.',
          });
        }
      } else { // mode === 'login'
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;
        
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().emailVerified === false) {
            setUserEmail(user.email!);
            await sendOtp(user.email!);
            setShowOtpForm(true);
            toast({
              title: 'Verification Required',
              description: 'Please check your email and verify your account.',
            });
        } else {
            toast({
              title: 'Login Successful',
              description: "You're now logged in.",
            });
            router.push('/');
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: `${mode === 'login' ? 'Login' : 'Sign Up'} Failed`,
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (showOtpForm) {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                <CardDescription>We've sent a 6-digit code to {userEmail}. Please enter it below.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={otpForm.handleSubmit(handleOtpVerification)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="otp">Verification Code</Label>
                        <Input
                            id="otp"
                            placeholder="123456"
                            {...otpForm.register('otp')}
                            maxLength={6}
                        />
                        {otpForm.formState.errors.otp && (
                            <p className="text-xs text-destructive">{otpForm.formState.errors.otp.message}</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                        <span>Verify & Get 10 Afrocoins</span>
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Didn't receive a code?{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => sendOtp(userEmail)} disabled={loading}>
                        {loading ? 'Sending...' : 'Resend'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
  }

  const title = mode === 'login' ? 'Welcome Back' : 'Create an Account';
  const description =
    mode === 'login'
      ? "Enter your credentials to access your account."
      : 'Sign up to get 10 free Afrocoins and 5 free refined images!';
  const buttonText = mode === 'login' ? 'Log In' : 'Sign Up';
  const ButtonIcon = mode === 'login' ? LogIn : UserPlus;
  const linkText =
    mode === 'login'
      ? "Don't have an account?"
      : 'Already have an account?';
  const linkHref = mode === 'login' ? '/signup' : '/login';

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="artistName">Artist Name</Label>
              <Input
                id="artistName"
                placeholder="Your artist name"
                {...form.register('artistName')}
              />
              {form.formState.errors.artistName && (
                <p className="text-xs text-destructive">{form.formState.errors.artistName.message}</p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="m@example.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ButtonIcon />
            )}
            <span>{buttonText}</span>
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          {linkText}{' '}
          <Link href={linkHref} className="underline">
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
