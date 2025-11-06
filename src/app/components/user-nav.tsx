
'use client';

import Link from 'next/link';
import { useUser, useAuth, useFirestore, useMemoFirebase } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LifeBuoy, LogIn, LogOut, User, UserPlus, Coins, ChevronDown, Menu, Wand2, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);

  const currencySymbols: Record<string, string> = { USD: '$', NGN: '₦' };


  const handleLogout = async () => {
    if (auth) {
      try {
        await auth.signOut();
        toast({
          title: 'Logged Out',
          description: 'You have been successfully logged out.',
        });
        router.push('/');
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Logout Failed',
          description: error.message,
        });
      }
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  if (isUserLoading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!user) {
    return (
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Menu className="h-5 w-5 md:hidden" />
            <span className="hidden md:inline">Menu</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
           <DropdownMenuItem asChild className="md:hidden text-xl">
              <Link href="/about">About</Link>
           </DropdownMenuItem>
           <DropdownMenuItem asChild className="md:hidden text-xl">
              <Link href="/contact">Contact Us</Link>
           </DropdownMenuItem>
           <DropdownMenuSeparator className="md:hidden" />
          <DropdownMenuItem asChild className="text-xl">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              <span>Log In</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="text-xl">
            <Link href="/signup">
              <UserPlus className="mr-2 h-4 w-4" />
              <span>Sign Up</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-sm">
            {isUserDocLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ) : (
                <div className="space-y-1">
                   <Link href="/wallet" className="flex items-center gap-2 text-green-400 hover:underline">
                      <Wallet className="w-4 h-4" />
                       <span>
                        {currencySymbols[userData?.wallet?.currency || 'USD']}
                        {userData?.wallet?.balance?.toFixed(2) ?? '0.00'}
                      </span>
                    </Link>
                   <Link href="/wallet" className="flex items-center gap-2 text-amber-400 hover:underline">
                      <Coins className="w-4 h-4" />
                      <span>{userData?.afrocoins ?? 0} Afrocoins</span>
                    </Link>
                    <Link href="/wallet" className="flex items-center gap-2 text-purple-400 hover:underline">
                      <Wand2 className="w-4 h-4" />
                      <span>{userData?.refinedImages ?? 0} Refines left</span>
                    </Link>
                </div>
              )}
          </div>
        <DropdownMenuSeparator/>
           <DropdownMenuItem asChild className="md:hidden text-xl">
              <Link href="/about">About</Link>
           </DropdownMenuItem>
           <DropdownMenuItem asChild className="md:hidden text-xl">
              <Link href="/contact">Contact Us</Link>
           </DropdownMenuItem>
        <DropdownMenuSeparator className="md:hidden" />
        <DropdownMenuItem asChild className="text-xl">
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-xl">
          <Link href="/support">
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Support</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-xl">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
