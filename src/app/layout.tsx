
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: {
    default: 'Free AI Art Cover Generator - Create Album & Social Media Art | Afrovibe AI Art',
    template: '%s - Afrovibe AI Art',
  },
  description: 'Generate stunning, free AI art covers for your music, social media, and videos in seconds. Our AI-powered tool helps you create professional album art, TikTok thumbnails, and Instagram graphics at no cost.',
  keywords: ['free ai art generator', 'ai album cover generator', 'free cover art maker', 'ai social media graphics', 'youtube thumbnail maker', 'tiktok cover generator', 'afrovibe ai art', 'ai image generator free'],
  openGraph: {
    title: 'Free AI Art Cover Generator | Afrovibe AI Art',
    description: 'Instantly create professional cover art for free. Perfect for musicians, creators, and marketers. Describe your vision and let our AI bring it to life.',
    url: 'https://artcover.afrovibe.com', 
    siteName: 'Afrovibe AI Art',
    images: [
      {
        url: 'https://i.imgur.com/MhZ39wS.png', 
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Art Cover Generator by Afrovibe AI Art',
    description: 'Stop paying for cover art. Create unique, professional-quality covers for your music and social media for free with our powerful AI generator.',
    images: ['https://i.imgur.com/MhZ39wS.png'], 
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Afrovibe AI Art",
  "url": "https://artcover.afrovibe.com",
  "mainEntity": {
    "@type": "SiteNavigationElement",
    "name": "Main Navigation",
    "about": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "url": "https://artcover.afrovibe.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "About Us",
        "url": "https://artcover.afrovibe.com/about"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Contact Us",
        "url": "https://artcover.afrovibe.com/contact"
      }
    ]
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{colorScheme: 'dark'}}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link rel="icon" href="https://imgpx.com/en/WEDtiT5dvWi9.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&family=Bebas+Neue&family=Lobster&family=Permanent+Marker&family=Special+Elite&family=Righteous&family=Orbitron:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        <FirebaseClientProvider>
          <div className="relative flex min-h-screen w-full flex-col">
            {children}
          </div>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
