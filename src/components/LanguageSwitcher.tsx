'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const t = useTranslations('common');

  function setLocale(locale: string) {
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    window.location.reload();
  }

  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="sm" onClick={() => setLocale('en')} className="text-xs px-2">
        {t('english')}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setLocale('de')} className="text-xs px-2">
        {t('german')}
      </Button>
    </div>
  );
}
