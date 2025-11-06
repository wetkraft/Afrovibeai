
'use client';

import { Sparkles, Coins, Wand2, Wallet } from 'lucide-react';
import UserNav from './user-nav';
import Link from 'next/link';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'text-primary-foreground bg-primary/20'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </Link>
  );
}


export default function Header() {
  const isMobile = useIsMobile();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);

  const currencySymbols: Record<string, string> = { USD: '$', NGN: '₦' };


  return (
    <header className="sticky top-0 z-50 py-4 px-4 sm:px-6 md:px-8 w-full bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="absolute inset-0 bg-grid-zinc-700/20 [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="https://imgpx.com/en/WEDtiT5dvWi9.png" alt="Afrovibe AI Art Logo" width={40} height={40} className="rounded-lg" />
            <h1 className="text-xl md:text-2xl font-bold font-headline tracking-tight text-foreground">
              <span className="hidden md:inline">Afrovibe AI Art</span>
              <span className="md:hidden">Afrovibe AI</span>
            </h1>
          </Link>
        </div>
        
        {!isMobile && (
             <nav className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/about">About</NavLink>
                <NavLink href="/contact">Contact</NavLink>
             </nav>
          )}

        <div className="flex items-center gap-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
