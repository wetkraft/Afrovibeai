
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, writeBatch, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Loader2, ShoppingCart, Wand2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const MIN_PURCHASE_USD = 3;

export default function BuyRefines() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData } = useDoc(userDocRef);

  const pricePerRefine = 0.10; // 10 cents per refine
  const minRefines = Math.ceil(MIN_PURCHASE_USD / pricePerRefine);

  const [refinesToBuy, setRefinesToBuy] = useState(minRefines);
  const [loading, setLoading] = useState(false);

  const walletBalance = userData?.wallet?.balance ?? 0;
  
  const totalCost = refinesToBuy * pricePerRefine;
  
  const maxAffordableRefines = walletBalance > 0 ? Math.floor(walletBalance / pricePerRefine) : 0;
  const maxRefines = Math.min(100, maxAffordableRefines);

  const canAfford = walletBalance >= totalCost;
  const currencySymbol = '$';

  const handlePurchase = async () => {
    if (!user || !firestore || !userDocRef) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not logged in.' });
      return;
    }
    if (!canAfford) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Your wallet balance is too low.' });
      return;
    }
    if (refinesToBuy < minRefines) {
        toast({ variant: 'destructive', title: 'Invalid Amount', description: `You must purchase at least ${minRefines} refine credits.` });
        return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(firestore);
      const updatedData = {
        'refinedImages': increment(refinesToBuy),
        'wallet.balance': increment(-totalCost),
        'wallet.currency': 'USD',
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
        description: `You bought ${refinesToBuy} image refine credits!`,
      });
      const newMax = Math.floor((walletBalance - totalCost) / pricePerRefine);
      setRefinesToBuy(Math.max(minRefines, newMax > 0 ? Math.floor(newMax / 2) : minRefines));

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
          <Wand2 className="w-7 h-7 text-primary" />
          Buy Image Refines
        </CardTitle>
        <CardDescription>
          Use your wallet balance to purchase more refine credits. Minimum purchase is {currencySymbol}{MIN_PURCHASE_USD.toFixed(2)}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>{refinesToBuy} <span className="text-purple-400">Refines</span></span>
            <span>Cost: <span className="text-green-400">{currencySymbol}{totalCost.toFixed(2)}</span></span>
          </div>
          <Slider
            value={[refinesToBuy]}
            onValueChange={(value) => setRefinesToBuy(value[0])}
            min={minRefines}
            max={Math.max(minRefines, maxRefines)}
            step={1}
            disabled={maxRefines < minRefines || loading}
          />
           <div className="flex justify-between text-xs text-muted-foreground">
                <span>{minRefines}</span>
                <span>{Math.max(minRefines, maxRefines)}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handlePurchase}
          disabled={!canAfford || loading || refinesToBuy < minRefines}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="mr-2" />
          )}
          Buy {refinesToBuy} Refines
        </Button>
      </CardFooter>
    </Card>
  );
}
