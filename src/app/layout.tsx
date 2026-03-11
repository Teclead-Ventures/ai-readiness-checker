import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "AI Readiness Checker | Teclead Ventures",
  description: "How AI-Ready is your team? Find out in 5 minutes with a personalized readiness score.",
  openGraph: {
    title: "AI Readiness Checker | Teclead Ventures",
    description: "How AI-Ready is your team? Find out in 5 minutes.",
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
      <body className={`${dmSans.variable} font-sans antialiased bg-gray-50 min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <TooltipProvider>
            <header className="bg-[#121212] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
              <div className="font-bold text-lg tracking-tight">Teclead Ventures</div>
              <LanguageSwitcher />
            </header>
            <main className="flex-1">
              {children}
            </main>
            <footer className="text-center text-sm text-[#444D69] py-4 border-t border-gray-100 bg-white">
              Powered by Teclead Ventures · AI Readiness Assessment
            </footer>
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
