
'use client';
import ArtCoverGenerator from '@/app/components/art-cover-generator';
import Header from '@/app/components/header';
import { useEffect, useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { getRedirectResult, User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function Home() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        if (!auth || !firestore) {
          setIsLoading(false);
          return;
        };

        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const user = result.user;
          const userRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            // This is a new user, create their profile
            const userData = {
              displayName: user.displayName,
              email: user.email,
              creationDate: serverTimestamp(),
              emailVerified: user.emailVerified, // Google users are pre-verified
              afrocoins: 10,
              refinedImages: 5
            };
            await setDoc(userRef, userData);
            toast({
              title: 'Account Created!',
              description: 'Welcome! You have been credited with 10 Afrocoins.',
            });
          } else {
            toast({
              title: 'Login Successful',
              description: "You're now logged in.",
            });
          }
          router.push('/');
        }
      } catch (error: any) {
        console.error('Google Sign-In Error:', error);
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description: error.message || 'An unexpected error occurred.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    handleAuthRedirect();

  }, [auth, firestore, router, toast]);

  if (isLoading) {
    // You can return a loading spinner here if you want
    return null; 
  }
  
  return (
    <div className="flex w-full flex-col items-center">
      <Header />
      <div className="w-full max-w-7xl">
        <main className="w-full flex-1 px-4 sm:px-6 md:px-8 pb-8">
          <div className="text-center my-10 md:my-12">
             <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-headline">
                <span className="bg-gradient-to-r from-primary via-red-400 to-yellow-400 text-transparent bg-clip-text">
                    Create Stunning Art Covers
                </span>
            </h1>
            <p className="max-w-2xl mx-auto mt-4 text-muted-foreground text-lg md:text-xl">
                Turn your ideas into professional visuals for music, social media, and film. Describe your vision and let our AI bring it to life.
            </p>
          </div>
          <ArtCoverGenerator />
        </main>
      </div>
    </div>
  );
}
