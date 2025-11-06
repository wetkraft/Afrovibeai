'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '../components/header';
import { Mail, ShieldCheck } from 'lucide-react';

export default function OtpTestPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      toast({
        title: 'OTP Sent!',
        description: `Successfully sent a code to ${email}.`,
      });
      setOtpSent(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send OTP',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Verification failed');
        }

        toast({
            title: 'Success!',
            description: 'Your email has been verified.',
        });

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: error.message,
        });
    } finally {
        setLoading(false);
    }
  };


  return (
    <div className="flex w-full flex-col items-center">
      <Header />
      <div className="flex flex-1 w-full items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail /> OTP Email Test</CardTitle>
            <CardDescription>
              Use this form to send and verify an OTP.
            </CardDescription>
          </CardHeader>
          {!otpSent ? (
             <form onSubmit={handleSendOtp}>
                <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="email">Recipient Email</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="recipient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />
                </div>
                </CardContent>
                <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending...' : 'Send OTP'}
                </Button>
                </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
                <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    />
                </div>
                </CardContent>
                <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                    <ShieldCheck />
                </Button>
                </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
