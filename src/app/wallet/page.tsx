
'use client';

import { useState, useEffect } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import Header from '@/app/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, Wallet as WalletIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const MIN_USD = 3;
const MAX_USD = 100;
const MIN_NGN = 4500;
const MAX_NGN = 150000;
const DEFAULT_USD = 10;
const DEFAULT_NGN = 15000;

export default function WalletPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedAmount, setSelectedAmount] = useState<number>(DEFAULT_USD);
  const [loading, setLoading] = useState(false);
  const [paymentCurrency, setPaymentCurrency] = useState<'USD' | 'NGN'>('USD');
  const [conversionRates, setConversionRates] = useState<{ ngnToUsdRate: number | null; usdToNgnRate: number | null }>({
    ngnToUsdRate: null,
    usdToNgnRate: null,
  });


  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);

  const walletCurrency = userData?.wallet?.currency || 'USD';

  useEffect(() => {
    const fetchRates = async () => {
        try {
            const response = await fetch('/api/conversion-rate');
            if (!response.ok) throw new Error('Failed to fetch rates');
            const data = await response.json();
            setConversionRates(data);
        } catch (error) {
            console.error("Could not fetch conversion rates:", error);
            toast({
                variant: 'destructive',
                title: 'Could not load conversion rates',
                description: 'Displaying approximate values.'
            });
            // Set fallback rates if API fails
            setConversionRates({ ngnToUsdRate: 1/1500, usdToNgnRate: 1500 });
        }
    };
    fetchRates();
  }, [toast]);


  useEffect(() => {
    if (paymentCurrency === 'USD') {
        setSelectedAmount(DEFAULT_USD);
    } else {
        setSelectedAmount(DEFAULT_NGN);
    }
  }, [paymentCurrency]);

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY!,
    tx_ref: `artcover-ai-${Date.now()}-${user?.uid}`,
    amount: selectedAmount,
    currency: paymentCurrency,
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email || '',
      phone_number: user?.phoneNumber || '',
      name: user?.displayName || '',
    },
    customizations: {
      title: 'ArtCover AI Wallet Funding',
      description: `Funding wallet with ${paymentCurrency} ${selectedAmount}`,
      logo: 'https://imgpx.com/en/WEDtiT5dvWi9.png',
    },
    meta: {
      userId: user?.uid || '',
      amount: selectedAmount,
      currency: paymentCurrency,
    },
  };

  const handleFlutterwavePayment = useFlutterwave(config);

  const startPayment = (amount: number) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to fund your wallet.',
      });
      router.push('/login');
      return;
    }

    handleFlutterwavePayment({
      callback: async (response) => {
        setLoading(true);
        if (!userDocRef) return;

        try {
            const idToken = await user.getIdToken();
            const verificationResponse = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    transaction_id: response.transaction_id,
                    tx_ref: response.tx_ref,
                    amount: amount,
                    currency: paymentCurrency,
                }),
            });

          const result = await verificationResponse.json();

          if (!verificationResponse.ok) {
            throw new Error(result.error || 'Payment verification failed.');
          }

          toast({
            title: 'Payment Successful',
            description: `Your wallet has been credited.`,
          });
          router.push(`/payment-success?amount=${amount}&currency=${paymentCurrency}`);

        } catch (error: any) {
          console.error("Verification failed:", error);
          toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: error.message,
          });
          router.push(`/payment-failure?error=${encodeURIComponent(error.message)}`);
        } finally {
          setLoading(false);
          closePaymentModal();
        }
      },
      onClose: () => {
        if(loading) return;
        toast({
          title: 'Payment Cancelled',
          description: 'You have cancelled the payment process.',
        });
      },
    });
  };
  
  const isLoading = isUserLoading || (user && isUserDocLoading);
  const walletCurrencySymbol = walletCurrency === 'USD' ? '$' : '₦';
  const paymentCurrencySymbol = paymentCurrency === 'USD' ? '$' : '₦';
  
  const minAmount = paymentCurrency === 'USD' ? MIN_USD : MIN_NGN;
  const maxAmount = paymentCurrency === 'USD' ? MAX_USD : MAX_NGN;
  const step = paymentCurrency === 'USD' ? 1 : 100;

  const getConvertedAmount = () => {
    if (paymentCurrency === 'USD' && conversionRates.usdToNgnRate) {
        return `(approx. ₦${(selectedAmount * conversionRates.usdToNgnRate).toLocaleString(undefined, { maximumFractionDigits: 0 })})`;
    }
    if (paymentCurrency === 'NGN' && conversionRates.ngnToUsdRate) {
        return `(approx. $${(selectedAmount * conversionRates.ngnToUsdRate).toFixed(2)})`;
    }
    return null;
  };


  return (
    <div className="flex w-full flex-col items-center min-h-screen">
      <Header />
      <main className="w-full max-w-4xl flex-1 px-4 sm:px-6 md:px-8 pb-8">
        <div className="text-center my-10 md:my-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-headline">
            Fund Your Wallet
          </h1>
          <p className="max-w-2xl mx-auto mt-4 text-muted-foreground text-lg md:text-xl">
            Add funds to your wallet to purchase Afrocoins. Your wallet balance is in USD.
          </p>
        </div>

        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center space-y-2">
             {isLoading ? (
              <>
                <Skeleton className="h-8 w-40 mx-auto" />
                <Skeleton className="h-12 w-48 mx-auto" />
              </>
             ) : (
              <>
                <CardTitle className="text-xl">Current Balance</CardTitle>
                <CardDescription className="text-5xl font-bold text-green-400">
                  {walletCurrencySymbol}{userData?.wallet?.balance?.toFixed(2) ?? '0.00'}
                </CardDescription>
              </>
             )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
                 <h3 className="text-lg font-semibold text-center">1. Select Payment Currency</h3>
                 <Tabs defaultValue={paymentCurrency} className="w-auto" onValueChange={(value) => setPaymentCurrency(value as 'USD' | 'NGN')}>
                    <TabsList>
                        <TabsTrigger value="USD">USD ($)</TabsTrigger>
                        <TabsTrigger value="NGN">NGN (₦)</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">2. Choose Amount to Add</h3>
               <div className="flex justify-between items-center text-2xl font-bold text-primary">
                <span>Amount:</span>
                <div className="text-right">
                    <span>
                    {paymentCurrencySymbol}
                    {paymentCurrency === 'USD' 
                        ? selectedAmount.toFixed(2) 
                        : selectedAmount.toLocaleString()}
                    </span>
                    {getConvertedAmount() && (
                        <p className="text-sm font-normal text-muted-foreground">{getConvertedAmount()}</p>
                    )}
                </div>
              </div>

              <Slider
                value={[selectedAmount]}
                onValueChange={(value) => setSelectedAmount(value[0])}
                min={minAmount}
                max={maxAmount}
                step={step}
                disabled={loading || isLoading}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{paymentCurrencySymbol}{minAmount}</span>
                <span>{paymentCurrencySymbol}{maxAmount}</span>
              </div>
            </div>

             {loading && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground pt-4">
                <Loader2 className="w-8 h-8 mb-2 animate-spin text-primary" />
                <p className="font-semibold">Verifying Payment...</p>
                <p className="text-xs">Please do not close this page.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
             <Button 
                size="lg" 
                className="w-full"
                onClick={() => startPayment(selectedAmount)}
                disabled={!selectedAmount || loading || isLoading}
            >
                <ShieldCheck className="mr-2"/>
                Pay {paymentCurrencySymbol}{selectedAmount.toLocaleString()} with Flutterwave
             </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
