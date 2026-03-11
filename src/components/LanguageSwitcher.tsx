'use client';

import { useTranslations } from 'next-intl';

interface LanguageSwitcherProps {
  variant?: 'dark' | 'light';
}

export function LanguageSwitcher({ variant = 'dark' }: LanguageSwitcherProps) {
  const t = useTranslations('common');

  function setLocale(locale: string) {
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    window.location.reload();
  }

  const inactiveClass =
    variant === 'light'
      ? 'text-[#444D69] hover:text-[#FFAB54] cursor-pointer transition-colors'
      : 'text-white/70 hover:text-[#FFAB54] cursor-pointer transition-colors';

  const separatorClass =
    variant === 'light' ? 'text-gray-300 select-none' : 'text-white/40 select-none';

  return (
    <div className="flex items-center gap-1 text-sm">
      <span className={inactiveClass} onClick={() => setLocale('en')}>
        {t('english')}
      </span>
      <span className={separatorClass}>|</span>
      <span className={inactiveClass} onClick={() => setLocale('de')}>
        {t('german')}
      </span>
    </div>
  );
}
