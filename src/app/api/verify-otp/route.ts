import { NextResponse } from 'next/server';
import { otpCache } from '@/lib/otp-cache';

export async function POST(request: Request) {
  const { email, otp } = await request.json();

  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
  }

  const cachedData = otpCache.get(email);

  if (!cachedData) {
    return NextResponse.json({ error: 'Invalid or expired OTP. Please request a new one.' }, { status: 400 });
  }

  if (Date.now() > cachedData.expiry) {
    otpCache.delete(email);
    return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
  }

  if (cachedData.otp !== otp) {
    return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
  }

  // OTP is correct. Clean up the used OTP and send success response.
  // The client will handle updating Firestore.
  otpCache.delete(email);

  return NextResponse.json({ message: 'OTP successfully verified.' }, { status: 200 });
}
