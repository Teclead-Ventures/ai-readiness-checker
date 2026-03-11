import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import en from '@/messages/en.json';
import de from '@/messages/de.json';

const locales = ['en', 'de'] as const;
type Locale = (typeof locales)[number];

const messages: Record<Locale, typeof en> = { en, de };

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  let locale: Locale = 'en';

  const cookieLocale = cookieStore.get('locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale;
  } else {
    const acceptLang = headerStore.get('accept-language') || '';
    if (acceptLang.includes('de')) {
      locale = 'de';
    }
  }

  return {
    locale,
    messages: messages[locale],
  };
});
