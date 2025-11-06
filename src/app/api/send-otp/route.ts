
import { NextResponse } from 'next/server';
import * as Brevo from '@getbrevo/brevo';
import { otpCache } from '@/lib/otp-cache';

// Function to generate a secure 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  if (!apiKey || !senderEmail || !senderName) {
    console.error('Brevo environment variables are not set.');
    return NextResponse.json({ error: 'Server configuration error: Email service is not set up.' }, { status: 500 });
  }

  const otp = generateOtp();
  const expiry = Date.now() + 10 * 60 * 1000; // OTP is valid for 10 minutes

  // Store OTP in our in-memory cache
  otpCache.set(email, { otp, expiry });

  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.subject = `Your ArtCover AI Verification Code: ${otp}`;
  sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h1>ArtCover AI Email Verification</h1>
        <p>Your One-Time Password (OTP) is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otp}</p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </body>
    </html>
  `;
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.to = [{ email: email }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return NextResponse.json({ message: 'OTP sent successfully.', data }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending OTP with Brevo:', error?.response?.body || error.message);
    return NextResponse.json({ error: 'Failed to send OTP email.', details: error?.response?.body?.message || error.message }, { status: 500 });
  }
}
