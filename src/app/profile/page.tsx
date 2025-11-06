
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, useMemoFirebase } from '@/firebase'; 
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '../components/header';
import { LogOut, Coins, Wand2, Wallet, PlusCircle, ShoppingCart } from 'lucide-react';
import BuyFromWallet from '@/app/components/buy-from-wallet';
import BuyRefines from '@/app/components/buy-refines';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/');
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const currencySymbol = '$';


  if (isUserLoading || (user && isUserDocLoading)) {
    return (
      <div className="flex w-full flex-col items-center">
        <Header />
        <div className="w-full max-w-4xl flex-1 px-4 sm:px-6 md:px-8 pb-8 pt-8">
           <div className="space-y-8 max-w-lg mx-auto">
              <Card>
                  <CardHeader className="items-center text-center">
                      <Skeleton className="h-24 w-24 rounded-full" />
                      <Skeleton className="h-6 w-3/4 mt-4" />
                      <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                  </CardContent>
                  <CardFooter className="flex-col sm:flex-row gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
              </Card>
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
       <div className="flex w-full flex-col items-center">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="flex w-full flex-col items-center">
        <Header />
        <div className="w-full max-w-4xl">
            <main className="w-full flex-1 px-4 sm:px-6 md:px-8 pb-8 pt-8">
                <div className="space-y-8 max-w-lg mx-auto">
                    {/* User Info and Balances Card */}
                    <Card>
                        <CardHeader className="flex flex-col items-center gap-0 p-4 text-center">
                            <Avatar className="w-20 h-20">
                            <AvatarImage src={user.photoURL || undefined} />
                            <AvatarFallback className="text-3xl">
                                {getInitials(user.displayName)}
                            </AvatarFallback>
                            </Avatar>
                            <div className="mt-2">
                                <CardTitle className="text-2xl">{user.displayName || 'User'}</CardTitle>
                                <CardDescription>{user.email}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-2 text-center p-4 pt-0">
                             <div className="p-2 flex-1 rounded-lg bg-card/50">
                                <h3 className="text-sm font-medium text-muted-foreground">Wallet</h3>
                                <p className="text-xl sm:text-2xl font-bold text-green-400 flex items-center justify-center gap-2">
                                     <Wallet className="w-5 h-5 sm:w-6 sm:h-6"/>
                                      <span>
                                        {currencySymbol}
                                        {userData?.wallet?.balance?.toFixed(2) ?? '0.00'}
                                      </span>
                                </p>
                            </div>
                             <div className="p-2 flex-1 rounded-lg bg-card/50">
                                <h3 className="text-sm font-medium text-muted-foreground">Afrocoins</h3>
                                <p className="text-xl sm:text-2xl font-bold text-amber-400 flex items-center justify-center gap-2">
                                    <Coins className="w-5 h-5 sm:w-6 sm:h-6"/>
                                    <span>{userData?.afrocoins ?? 0}</span>
                                </p>
                            </div>
                           <div className="p-2 flex-1 rounded-lg bg-card/50">
                                <h3 className="text-sm font-medium text-muted-foreground">Refines</h3>
                                <p className="text-xl sm:text-2xl font-bold text-purple-400 flex items-center justify-center gap-2">
                                    <Wand2 className="w-5 h-5 sm:w-6 sm:h-6"/>
                                    <span>{userData?.refinedImages ?? 0}</span>
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row gap-2 p-4 pt-0">
                            <Button onClick={() => router.push('/wallet')} className="w-full">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Fund Wallet
                            </Button>
                            <Button onClick={handleLogout} className="w-full" variant="outline">
                                <LogOut />
                                Log Out
                            </Button>
                        </CardFooter>
                    </Card>
                    
                    {/* Marketplace */}
                    <div id="marketplace" className="scroll-mt-20">
                         <h2 className="text-2xl font-bold font-headline flex items-center gap-3 mb-6">
                          <ShoppingCart className="w-7 h-7 text-primary" />
                          Marketplace
                        </h2>
                        <div className="grid grid-cols-1 gap-8">
                            <BuyFromWallet />
                            <BuyRefines />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
}
