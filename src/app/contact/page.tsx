
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/app/components/header';
import type { Metadata } from 'next';
import { Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Afrovibe AI Art Cover team. We\'d love to hear from you!',
};

export default function ContactPage() {
  return (
    <div className="flex w-full flex-col items-center">
      <Header />
      <main className="w-full flex-1 px-4 sm:px-6 md:px-8 pb-8">
        <div className="container mx-auto max-w-4xl py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold font-headline">Contact Us</CardTitle>
              <CardDescription className="text-lg">
                We're here to help. Reach out to us with any questions or feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  General Inquiries
                </h3>
                <p className="text-muted-foreground">
                  For general questions, feedback, or just to say hello, please email us at:
                </p>
                <a href="mailto:support@artcover.afrovibe.com" className="text-primary hover:underline">
                  support@artcover.afrovibe.com
                </a>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Support
                </h3>
                <p className="text-muted-foreground">
                  If you need technical assistance or are experiencing issues with our platform, our support team is ready to help.
                </p>
                 <a href="mailto:support@artcover.afrovibe.com" className="text-primary hover:underline">
                  support@artcover.afrovibe.com
                </a>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Business Hours</h3>
                <p className="text-muted-foreground">
                  Our team is available Monday - Friday, 9:00 AM - 5:00 PM (WAT).
                </p>
              </div>

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
