
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Wallet } from 'lucide-react';
import Header from '../components/header';

function FailureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-red-100 dark:bg-red-900/50 rounded-full p-4 w-fit">
            <XCircle className="w-16 h-16 text-red-500 dark:text-red-400" />
          </div>
          <CardTitle className="text-3xl font-bold mt-4">Payment Failed</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Unfortunately, we couldn't process your payment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
             <div className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md">
                <p className="font-bold">Error Details:</p>
                <p>{decodeURIComponent(error)}</p>
            </div>
          ) : (
            <p>An unknown error occurred. Please try again or contact support.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => router.push('/wallet')}
            className="w-full"
            size="lg"
            variant="outline"
          >
            <Wallet className="mr-2 h-5 w-5" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentFailurePage() {
    return (
      <div className="flex w-full flex-col items-center min-h-screen">
        <Header />
         <main className="flex-1 flex items-center justify-center w-full">
            <Suspense fallback={<div>Loading...</div>}>
                <FailureContent />
            </Suspense>
        </main>
      </div>
    )
}
