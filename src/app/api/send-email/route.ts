import { NextResponse } from 'next/server';
import * as Brevo from '@getbrevo/brevo';

export async function POST(request: Request) {
  const { to, subject, htmlContent } = await request.json();

  if (!to || !subject || !htmlContent) {
    return NextResponse.json({ error: 'Missing required fields: to, subject, htmlContent' }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  if (!apiKey || !senderEmail || !senderName) {
    console.error('Brevo environment variables are not set.');
    return NextResponse.json({ error: 'Server configuration error: Email service is not set up.' }, { status: 500 });
  }
  
  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey)

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.to = [{ email: to }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return NextResponse.json({ message: 'Email sent successfully', data }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending email with Brevo:', error?.response?.body || error.message);
    return NextResponse.json({ error: 'Failed to send email', details: error?.response?.body?.message || error.message }, { status: 500 });
  }
}
