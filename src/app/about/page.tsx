
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/app/components/header';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Instagram } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About ArtCover AI',
  description: 'Learn more about ArtCover AI and our mission to empower all creators with powerful, AI-driven visual tools.',
};

export default function AboutPage() {
  return (
    <div className="flex w-full flex-col items-center">
      <Header />
      <main className="w-full flex-1 px-px sm:px-6 md:px-8 pb-8">
        <div className="container mx-auto max-w-4xl py-8 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold font-headline">About ArtCover AI</CardTitle>
              <CardDescription className="text-lg">
                Empowering creativity on every platform through artificial intelligence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Welcome to ArtCover AI, your creative partner in the digital content landscape. Our mission is to provide creators of all kinds—musicians, social media influencers, filmmakers, and more—with powerful, intuitive tools to turn their ideas into stunning visual masterpieces.
              </p>
              <p>
                We believe that every great creation deserves an equally great visual identity. In today's fast-paced digital world, a captivating image is the first point of contact with your audience. Whether it's an album cover, a TikTok video thumbnail, an Instagram Reel cover, or a poster for your short film, compelling visuals are more important than ever.
              </p>
              <p>
                However, creating professional-quality artwork can be time-consuming and expensive. That's where we come in. By harnessing the power of advanced AI, we've built a platform that makes it easy for anyone to generate unique, high-quality cover art in seconds. Just describe your vision, and our AI will bring it to life for any format you need.
              </p>
              <p>
                Our platform is designed for the modern creator. Generate eye-catching covers for:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2">
                <li>Music Singles and Albums</li>
                <li>TikTok & Instagram Reels</li>
                <li>YouTube Video Thumbnails</li>
                <li>Facebook Post Graphics</li>
                <li>Short Film Posters</li>
                <li>And much more!</li>
              </ul>
              <p>
                Our team is a passionate group of developers, designers, and content enthusiasts dedicated to pushing the boundaries of creativity and technology. We are committed to building a platform that is not only powerful but also accessible and easy to use for everyone.
              </p>
              <p>
                Thank you for joining us on this journey. We can't wait to see what you create.
              </p>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold font-headline">Meet the Founder</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-lg">
                <Image
                    src="https://imgpx.com/en/3AX7vAZ96UeT.jpg"
                    alt="Kingdom Ijoegbe"
                    fill
                    className="object-cover"
                />
                </div>
                <div className="text-center sm:text-left">
                <h3 className="text-xl font-semibold">Kingdom Ijoegbe</h3>
                <p className="text-primary">Founder & Developer</p>
                <p className="text-muted-foreground mt-2 max-w-md">
                    Kingdom is a passionate software developer and creative technologist dedicated to building tools that empower creators.
                </p>
                <Button asChild variant="outline" className="mt-4">
                    <Link href="https://www.instagram.com/wetkraft/" target="_blank" rel="noopener noreferrer">
                        <Instagram />
                        Follow on Instagram
                    </Link>
                </Button>
                </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
