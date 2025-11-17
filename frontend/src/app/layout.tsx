import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "./providers";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900"
});

export const metadata: Metadata = {
  title: "Bank X Suite",
  description: "Full-stack Bank X account management portal"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${geistMono.variable} antialiased transition-colors`}>
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
