
import { NextRequest, NextResponse } from 'next/server';
import Flutterwave from 'flutterwave-node-v3';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { App } from 'firebase-admin/app';

// Function to get the NGN to USD conversion rate.
// This now uses a fixed rate of 1 USD = 1600 NGN.
function getUsdConversionRate(): number {
    return 1 / 1600;
}


export async function POST(request: NextRequest) {
  let adminApp: App;
  try {
    adminApp = initializeFirebaseAdmin();
  } catch (error: any) {
    console.error('Firebase Admin Init Error:', error.message);
    return NextResponse.json({ error: 'Server configuration error: Could not connect to Firebase services.' }, { status: 500 });
  }

  const db = getFirestore(adminApp);
  const auth = getAuth(adminApp);
  
  const { transaction_id, tx_ref, amount, currency } = await request.json();

  // 1. Get user from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization header missing.' }, { status: 401 });
  }

  let decodedToken;
  try {
    const token = authHeader.split('Bearer ')[1];
    decodedToken = await auth.verifyIdToken(token);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired authentication token.' }, { status: 401 });
  }

  const userId = decodedToken.uid;


  // 2. Verify payment with Flutterwave
  const flw = new Flutterwave(process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY!, process.env.FLUTTERWAVE_SECRET_KEY!);
  
  try {
    const response = await flw.Transaction.verify({ id: String(transaction_id) });

    // 3. Perform security checks
    if (response.status !== 'success') {
      throw new Error('Flutterwave verification failed: Transaction not successful.');
    }
    if (response.data.tx_ref !== tx_ref) {
      throw new Error('Transaction reference mismatch.');
    }
    if (response.data.amount < amount) { // Allow for slightly higher amounts (e.g., fees) but not lower
      throw new Error(`Amount mismatch. Expected ${amount}, but got ${response.data.amount}.`);
    }
    if (response.data.currency !== currency) {
      throw new Error(`Currency mismatch. Expected ${currency}, but got ${response.data.currency}.`);
    }
    if (response.data.meta?.userId !== userId) {
      throw new Error('User ID mismatch. Transaction meta does not match authenticated user.');
    }
    
    // 4. Calculate amount to credit and credit user's wallet
    let amountToCreditInUsd = amount;

    if (currency === 'NGN') {
        const conversionRate = getUsdConversionRate();
        amountToCreditInUsd = amount * conversionRate;
    }

    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      'wallet.balance': FieldValue.increment(amountToCreditInUsd),
    });

    return NextResponse.json({ message: 'Payment verified and wallet credited successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    // Determine if it's a flutterwave-node-v3 error or a generic one
    const errorMessage = error.isAxiosError ? error.response?.data?.message : error.message;
    return NextResponse.json({ error: `Verification failed: ${errorMessage || 'Internal server error.'}` }, { status: 500 });
  }
}
