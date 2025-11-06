
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Wallet } from 'lucide-react';
import Header from '../components/header';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');
  const currencySymbol = currency === 'USD' ? '$' : '₦';

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 dark:bg-green-900/50 rounded-full p-4 w-fit">
            <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold mt-4">Payment Successful!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {amount
              ? `Congratulations! You have successfully added ${currencySymbol}${amount} to your wallet.`
              : 'Your wallet has been funded.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Your wallet balance has been updated. You can now purchase Afrocoins from your profile page.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={() => router.push('/profile#buy-afrocoins')}
            className="w-full"
            size="lg"
          >
            <Wallet className="mr-2 h-5 w-5" />
            Go to My Profile
          </Button>
           <Button
            onClick={() => router.push('/')}
            className="w-full"
            size="lg"
            variant="outline"
          >
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
    return (
      <div className="flex w-full flex-col items-center min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center w-full">
            <Suspense fallback={<div>Loading...</div>}>
                <SuccessContent />
            </Suspense>
        </main>
      </div>
    )
}
