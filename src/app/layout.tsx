import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "World Cup Group Analyzer",
  description:
    "Real-time team rankings, predictions and stats throughout the tournament.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlow.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-page font-body antialiased">
        <Navbar />
        <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-[calc(56px+24px)] sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
