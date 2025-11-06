
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokens = searchParams.get('tokens');

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 dark:bg-green-900/50 rounded-full p-4 w-fit">
            <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold mt-4">Payment Successful!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {tokens
              ? `Congratulations! You have successfully purchased ${tokens} tokens.`
              : 'Your purchase was successful.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Your token balance has been updated. You can now continue creating amazing album art.</p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => router.push('/')}
            className="w-full"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Start Creating
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    )
}
