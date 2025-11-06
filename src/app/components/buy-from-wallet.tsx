
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, writeBatch, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Coins, Loader2, ShoppingCart, Wand2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const MIN_PURCHASE_USD = 3;

export default function BuyFromWallet() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData } = useDoc(userDocRef);

  const pricePerCoin = 0.10; // 10 cents
  const minCoins = Math.ceil(MIN_PURCHASE_USD / pricePerCoin);

  const [coinsToBuy, setCoinsToBuy] = useState(minCoins);
  const [loading, setLoading] = useState(false);

  const walletBalance = userData?.wallet?.balance ?? 0;
  const currency = 'USD';
  
  const totalCost = coinsToBuy * pricePerCoin;
  
  const maxCoins = walletBalance > 0 ? Math.floor(walletBalance / pricePerCoin) : 0;
  const canAfford = walletBalance >= totalCost;
  const currencySymbol = '$';

  // Calculate refine bonus as 50% of coins bought, rounded down.
  const refineBonus = Math.floor(coinsToBuy * 0.5);

  const handlePurchase = async () => {
    if (!user || !firestore || !userDocRef) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not logged in.' });
      return;
    }
    if (!canAfford) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Your wallet balance is too low.' });
      return;
    }
    if (coinsToBuy < minCoins) {
        toast({ variant: 'destructive', title: 'Invalid Amount', description: `You must purchase at least ${minCoins} coins.` });
        return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(firestore);
      const updatedData: { [key: string]: any } = {
        afrocoins: increment(coinsToBuy),
        'wallet.balance': increment(-totalCost),
        'wallet.currency': currency, 
        'refinedImages': increment(refineBonus)
      };

      batch.update(userDocRef, updatedData);
      await batch.commit()
      .catch(e => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw e;
      });

      toast({
        title: 'Purchase Successful!',
        description: `You bought ${coinsToBuy} Afrocoins and got ${refineBonus} bonus refines!`,
      });
      const newMaxCoins = Math.floor(((walletBalance - totalCost) * 100) / (pricePerCoin * 100));
      setCoinsToBuy(Math.max(minCoins, newMaxCoins > 0 ? Math.floor(newMaxCoins / 2) : minCoins));
    } catch (error: any) {
      console.error('Purchase failed:', error);
      if (error.name !== 'FirebaseError') { // Don't double-toast for permission errors
        toast({
            variant: 'destructive',
            title: 'Purchase Failed',
            description: error.message || 'An unexpected error occurred.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold font-headline flex items-center gap-2">
          <ShoppingCart className="w-7 h-7 text-primary" />
          Buy Afrocoins from Wallet
        </CardTitle>
        <CardDescription>
          Use your USD wallet balance to purchase Afrocoins. Minimum purchase is {currencySymbol}{MIN_PURCHASE_USD.toFixed(2)}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>{coinsToBuy} <span className="text-amber-400">Afrocoins</span></span>
            <span>Cost: <span className="text-green-400">{currencySymbol}{totalCost.toFixed(2)}</span></span>
          </div>
          <Slider
            value={[coinsToBuy]}
            onValueChange={(value) => setCoinsToBuy(value[0])}
            min={minCoins}
            max={Math.max(minCoins, maxCoins)}
            step={1}
            disabled={maxCoins < minCoins || loading}
          />
           <div className="flex justify-between text-xs text-muted-foreground">
                <span>{minCoins}</span>
                <span>{Math.max(minCoins, maxCoins)}</span>
            </div>
             {refineBonus > 0 && (
                <div className="text-center text-sm font-medium text-purple-400 bg-purple-500/10 p-2 rounded-md flex items-center justify-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    <span>Bonus: You get {refineBonus} free refines with this purchase! (50% of coins)</span>
                </div>
            )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handlePurchase}
          disabled={!canAfford || loading || coinsToBuy < minCoins}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <Coins className="mr-2" />
          )}
          Buy {coinsToBuy} Coins
        </Button>
      </CardFooter>
    </Card>
  );
}
