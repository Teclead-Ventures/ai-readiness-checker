import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['en', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // 1. Check cookie
  let locale = cookieStore.get('locale')?.value as Locale | undefined;

  // 2. Check Accept-Language header
  if (!locale) {
    const acceptLang = headerStore.get('accept-language') || '';
    if (acceptLang.includes('de')) {
      locale = 'de';
    }
  }

  // 3. Default to English
  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
