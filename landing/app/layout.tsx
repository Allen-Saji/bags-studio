import type { Metadata } from "next";
import { Geist, Syne, Space_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "BagsStudio — Post-Launch Creator Studio for Bags Coins",
  description:
    "Turn launch hype into lasting community momentum. Identify real supporters, run campaigns, and reward the wallets keeping your coin alive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${syne.variable} ${spaceMono.variable} antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
