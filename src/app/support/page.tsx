
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/app/components/header';
import type { Metadata } from 'next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Support & FAQ',
  description: 'Get help and find answers to frequently asked questions about ArtCover AI.',
};

const faqs = [
  {
    question: 'How do I get more Afrocoins?',
    answer: 'You can purchase Afrocoins by funding your wallet with USD or NGN. Once your wallet has a balance, you can use it to buy Afrocoins directly from your profile page. You also get 10 free coins when you verify your email!',
  },
  {
    question: 'What are Refines and how do I get more?',
    answer: 'Refines are credits that allow you to make edits to an AI-generated image. You get 5 free refines when you sign up. You can get more refines as a bonus when you purchase Afrocoins.',
  },
  {
    question: 'What if I don\'t like the generated image?',
    answer: 'No problem! You can either try generating a new image with a different prompt, or use a "Refine" credit to edit the existing image with new instructions. For example, you can ask the AI to "make it more vibrant" or "change the background to a forest".',
  },
  {
    question: 'Are there any restrictions on the AI prompts?',
    answer: 'Yes. To ensure a safe and positive experience, our AI will not generate images that contain nudity, violence, hate speech, or recognizable human faces. Prompts asking for such content will be blocked.',
  },
  {
    question: 'Can I use the generated images for commercial purposes?',
    answer: 'Yes! The images you create with ArtCover AI are yours to use for any purpose, including album covers, social media marketing, and more. You have full commercial rights to the artwork you generate.',
  },
   {
    question: 'I have a payment issue, what should I do?',
    answer: 'If you encounter any issues with funding your wallet or purchasing coins, please contact our support team immediately by sending an email to support@artcover.afrovibe.com. Please include your user email and any relevant transaction details.',
  },
];


export default function SupportPage() {
  return (
    <div className="flex w-full flex-col items-center">
      <Header />
      <main className="w-full flex-1 px-4 sm:px-6 md:px-8 pb-8">
        <div className="container mx-auto max-w-4xl py-8 space-y-8">

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold font-headline">Support & FAQ</CardTitle>
              <CardDescription className="text-lg">
                Find answers to common questions or get in touch with our team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2 p-6 rounded-lg bg-card/50">
                    <h3 className="font-semibold flex items-center gap-2 text-xl">
                    <Mail className="w-5 h-5 text-primary" />
                    Contact Support
                    </h3>
                    <p className="text-muted-foreground">
                    For payment issues, account problems, or other questions not answered in the FAQ, please email our support team. We're here to help!
                    </p>
                    <Link href="mailto:support@artcover.afrovibe.com" className="text-primary hover:underline">
                    support@artcover.afrovibe.com
                    </Link>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold font-headline">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
