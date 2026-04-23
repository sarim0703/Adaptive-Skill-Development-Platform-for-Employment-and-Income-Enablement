import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillSync — Learn Skills That Actually Pay",
  description: "AI-powered adaptive learning platform that builds personalized, practical career paths for India's workforce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans bg-[#F2F2F7] text-[#1D1D1F] antialiased" suppressHydrationWarning>
        <LanguageProvider>
          <Navbar />
          <main className="pt-24 min-h-screen">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
