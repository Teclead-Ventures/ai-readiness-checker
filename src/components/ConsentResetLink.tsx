'use client';

import { useTranslations } from 'next-intl';
import { useConsent } from '@/hooks/useConsent';

export function ConsentResetLink() {
  const t = useTranslations('consent');
  const { reset } = useConsent();

  return (
    <button
      type="button"
      onClick={() => {
        reset();
        window.location.reload();
      }}
      className="hover:text-primary transition-colors cursor-pointer"
    >
      {t('manageCookies')}
    </button>
  );
}
