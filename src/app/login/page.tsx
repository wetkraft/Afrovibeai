'use client';
import { AuthForm } from '@/app/components/auth-form';
import Header from '@/app/components/header';

export default function LoginPage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
