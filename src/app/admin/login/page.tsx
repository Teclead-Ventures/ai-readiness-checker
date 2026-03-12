'use client';

import { signIn } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const labels = {
  en: {
    title: 'Admin Login',
    subtitle: 'Sign in with your authorized Google account to access the admin dashboard.',
    signIn: 'Sign in with Google',
    error: 'Access denied. Your Google account is not authorized for admin access.',
    errorDefault: 'Something went wrong. Please try again.',
  },
  de: {
    title: 'Admin-Anmeldung',
    subtitle: 'Melde dich mit deinem autorisierten Google-Konto an, um auf das Admin-Dashboard zuzugreifen.',
    signIn: 'Mit Google anmelden',
    error: 'Zugriff verweigert. Dein Google-Konto ist nicht fur den Admin-Zugang autorisiert.',
    errorDefault: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
  },
} as const;

export default function AdminLoginPage() {
  const locale = useLocale() as 'en' | 'de';
  const l = labels[locale] || labels.en;
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-xl text-[#121212]">
            {l.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {l.subtitle}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 text-center">
              {error === 'AccessDenied' ? l.error : l.errorDefault}
            </p>
          )}
          <Button
            className="w-full bg-[#121212] hover:bg-[#333] text-white"
            onClick={() => signIn('google', { callbackUrl: '/admin' })}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {l.signIn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
