import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlphaRadar — Discovery for Tokenized Stocks on BNB Chain",
  description:
    "Non-custodial discovery engine for bStocks, Ondo and xStocks on BNB Chain. Ranks activity, liquidity, momentum and the premium/discount vs reference price.",
  keywords: [
    "tokenized stocks",
    "BNB Chain",
    "bStocks",
    "xStocks",
    "Ondo",
    "RWA",
    "AlphaRadar",
    "BNB Hack",
  ],
  openGraph: {
    title: "AlphaRadar — Tokenized Stocks Discovery",
    description:
      "See why a tokenized stock is receiving attention before you trade.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
