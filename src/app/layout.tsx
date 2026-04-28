import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "CareerOrbit - Adaptive Career Navigation",
  description: "AI-powered vocational training and career orbit synchronization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <LanguageProvider>
            <Navbar />
            <main className="pt-24 min-h-screen">
              {children}
            </main>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
