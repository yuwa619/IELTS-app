import type { Metadata } from "next";
import { Hanken_Grotesk, Newsreader, Roboto_Mono } from "next/font/google";
import { MockModeBanner } from "@/components/layout/mock-mode-banner";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clearband",
  description:
    "Mobile-first IELTS General Training preparation for Canadian Express Entry.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${newsreader.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <MockModeBanner />
        {children}
      </body>
    </html>
  );
}
