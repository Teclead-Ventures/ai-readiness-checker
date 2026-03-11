'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useState } from 'react';

export default function Home() {
  const t = useTranslations();
  const [teamLink, setTeamLink] = useState('');

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 md:py-24">
      <div className="absolute top-3 right-4">
        <LanguageSwitcher />
      </div>

      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1a1f36]">
          {t('landing.headline')}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto">
          {t('landing.subhead')}
        </p>

        <div className="pt-4">
          <Link href="/survey">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-6 rounded-xl">
              {t('landing.cta')}
            </Button>
          </Link>
        </div>

        <Card className="mt-12 max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-3">{t('landing.teamLink')}</p>
            <div className="flex gap-2">
              <Input
                value={teamLink}
                onChange={(e) => setTeamLink(e.target.value)}
                placeholder={t('landing.teamLinkPlaceholder')}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (teamLink) {
                    try {
                      const url = new URL(teamLink);
                      window.location.href = url.pathname;
                    } catch {
                      // Try as relative path
                      window.location.href = teamLink;
                    }
                  }
                }}
              >
                Go
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
