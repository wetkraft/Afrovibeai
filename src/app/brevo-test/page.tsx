
'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '../components/header';
import { Mail } from 'lucide-react';

export default function BrevoTestPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Test Email from ArtCover AI',
          htmlContent: `
            <html>
              <body>
                <h1>Hello from ArtCover AI!</h1>
                <p>This is a test email sent from the Next.js application using the Brevo SDK.</p>
                <p>If you received this, it means your setup is working correctly.</p>
              </body>
            </html>
          `,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || 'Something went wrong');
      }

      toast({
        title: 'Email Sent!',
        description: `Successfully sent a test email to ${email}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send Email',
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
            <CardTitle className="flex items-center gap-2"><Mail /> Brevo Email Test</CardTitle>
            <CardDescription>
              Use this form to send a test email via the Brevo API route.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
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
                {loading ? 'Sending...' : 'Send Test Email'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
