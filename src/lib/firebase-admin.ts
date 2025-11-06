import { initializeApp, getApps, cert, App } from 'firebase-admin/app';

// Helper to initialize Firebase Admin SDK
export function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    const existingApp = getApps().find(app => app?.name === '[DEFAULT]');
    if (existingApp) {
        return existingApp;
    }
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error('Firebase environment variables (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID) are not set.');
  }

  // The private key from environment variables often has escaped newlines.
  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: formattedPrivateKey,
    }),
  });
}
