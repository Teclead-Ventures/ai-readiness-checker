'use client';

import { useLocale } from 'next-intl';

interface LanguageSwitcherProps {
  variant?: 'dark' | 'light';
}

const TECLEAD_ORANGE = '#F97316';

export function LanguageSwitcher({ variant = 'dark' }: LanguageSwitcherProps) {
  const currentLocale = useLocale();

  function setLocale(locale: string) {
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    window.location.reload();
  }

  const inactiveClass =
    variant === 'light'
      ? 'text-[#444D69] hover:text-primary cursor-pointer transition-colors'
      : 'text-white/70 hover:text-primary cursor-pointer transition-colors';

  const separatorClass =
    variant === 'light' ? 'text-gray-300 select-none' : 'text-white/40 select-none';

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <span
        className={currentLocale === 'en' ? 'cursor-default' : inactiveClass}
        style={currentLocale === 'en' ? { color: TECLEAD_ORANGE } : undefined}
        onClick={() => setLocale('en')}
      >
        EN
      </span>
      <span className={separatorClass}>|</span>
      <span
        className={currentLocale === 'de' ? 'cursor-default' : inactiveClass}
        style={currentLocale === 'de' ? { color: TECLEAD_ORANGE } : undefined}
        onClick={() => setLocale('de')}
      >
        DE
      </span>
    </div>
  );
}
