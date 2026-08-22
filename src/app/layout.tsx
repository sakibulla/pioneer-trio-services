import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieConsent } from "@/components/cookie-consent";
import { Analytics } from "@/components/analytics";
import { siteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pioneer Trio Services | Immigration & Marriage Consultancy, Bangladesh",
    template: "%s | Pioneer Trio Services",
  },
  description:
    "Pioneer Trio Services helps Bangladeshis move abroad and find a spouse — with verified process, real people, and no hidden broker fees.",
  keywords: [
    "immigration consultancy Bangladesh",
    "marriage consultancy Bangladesh",
    "verified matchmaking Bangladesh",
  ],
  openGraph: {
    title: "Pioneer Trio Services | Immigration & Marriage Consultancy, Bangladesh",
    description:
      "Two of life's biggest decisions. One trusted partner. Verified process, real people, no hidden broker fees.",
    url: siteUrl,
    siteName: "Pioneer Trio Services",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-stone-900">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
