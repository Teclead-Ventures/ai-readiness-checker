import type { Metadata } from "next";
import { DM_Sans, Barlow_Condensed } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
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
    <html lang={locale}>
      <body
        className={`${dmSans.variable} ${barlowCondensed.variable} font-sans antialiased bg-background min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider messages={messages}>
          <TooltipProvider>
            {/* ── Header ── */}
            <header className="bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-50">
              <Link
                href="/"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/TLV NEW_orange_white.png"
                  alt="Teclead Ventures"
                  width={148}
                  height={32}
                  priority
                  className="h-8 w-auto"
                />
                <div className="h-5 w-px bg-border" aria-hidden="true" />
                <span className="text-[11px] text-primary font-medium tracking-wider uppercase">
                  AI Readiness Check
                </span>
              </Link>
              <LanguageSwitcher />
            </header>

            <main className="flex-1">
              {children}
            </main>

            {/* ── Footer ── */}
            <footer className="border-t border-border bg-card text-center py-5 space-y-1.5">
              <div className="text-xs text-muted-foreground tracking-wide">
                Powered by{" "}
                <span className="text-primary font-medium">Teclead Ventures</span>
                {" "}· AI Readiness Assessment
              </div>
              <div className="text-[10px] text-muted-foreground/60">
                {locale === 'de'
                  ? 'Cookiefreie, anonyme Analyse · Keine personenbezogenen Daten'
                  : 'Cookie-free, anonymous analytics · No personal data'}
              </div>
              <div className="text-[10px] text-muted-foreground/60 space-x-3">
                <a
                  href="https://teclead-ventures.de/impressum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Impressum
                </a>
                <span>·</span>
                <a
                  href="https://teclead-ventures.de/datenschutz"
                  target="_blank"
                  rel="noopener noreferrer"
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
