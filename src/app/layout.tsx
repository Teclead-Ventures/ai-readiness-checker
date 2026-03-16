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

/**
 * Teclead V-mark:
 * - Left arm: large, full-height parallelogram from top-left to bottom-center
 * - Right inner piece: shorter, starts slightly lower, creates the asymmetric double-chevron
 */
function TecleadMark({ className }: { className?: string }) {
  return (
    <svg
      width="36"
      height="28"
      viewBox="0 0 36 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left arm: full height, dominant */}
      <path d="M0 0 L10 0 L19 26 L9 26 Z" fill="#F5A623" />
      {/* Right inner piece: starts lower, creates double-V effect */}
      <path d="M13 5 L23 5 L27 26 L18 26 Z" fill="#F5A623" />
    </svg>
  );
}

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
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group"
              >
                <TecleadMark />
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-sm tracking-widest text-foreground uppercase">
                    Teclead Ventures
                  </span>
                  <span className="text-[10px] text-primary font-medium tracking-wider uppercase">
                    AI Readiness Check
                  </span>
                </div>
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
