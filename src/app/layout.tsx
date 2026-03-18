import type { Metadata } from "next";
import { DM_Sans, Barlow_Condensed } from "next/font/google";
import Link from "next/link";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AI Readiness Checker | Teclead Ventures",
  description: "How AI-Ready are you? Find out in 5 minutes with a personalized readiness score.",
  openGraph: {
    title: "AI Readiness Checker | Teclead Ventures",
    description: "How AI-Ready are you? Find out in 5 minutes.",
    type: "website",
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body
        className={`${dmSans.variable} ${barlowCondensed.variable} font-sans antialiased bg-background min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider messages={messages}>
          <TooltipProvider>
            {/* ── Header ── */}
            <header className="bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center relative sticky top-0 z-50">
              <Link
                href="/"
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/tlv-logo-small.svg" alt="Teclead Ventures" className="h-7 sm:hidden" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/tlv-logo.svg" alt="Teclead Ventures" className="hidden sm:block h-7" />
              </Link>
              <span className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-primary tracking-wide whitespace-nowrap">
                AI Readiness Check
              </span>
              <div className="flex ml-auto">
                <LanguageSwitcher />
              </div>
            </header>

            <main className="flex-1">
              {children}
            </main>

            {/* ── Footer ── */}
            <footer className="border-t border-border bg-[#2E3449] text-center py-5 space-y-1.5">
              <div className="text-base text-foreground tracking-wide">
                Powered by{" "}
                <a href="https://teclead-ventures.de/" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Teclead Ventures</a>
                {" "}· AI Readiness Assessment
              </div>
              <div className="text-sm text-muted-foreground">
                {locale === 'de'
                  ? 'Cookiefreie Analyse · Datenverarbeitung nur mit Einwilligung'
                  : 'Cookie-free analytics · Data processing only with consent'}
              </div>
              <div className="text-sm text-muted-foreground space-x-3">
                <a
                  href="https://teclead-ventures.de/imprint"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Impressum
                </a>
                <span>·</span>
                <a
                  href="/datenschutz"
                  className="hover:text-primary transition-colors"
                >
                  Datenschutz
                </a>
              </div>
            </footer>
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
