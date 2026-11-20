import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { SiteFrame } from "@/components/layout/site-frame";
import { SiteFooter } from "@/components/layout/site-footer";
import { UmamiAnalytics } from "@/components/analytics/umami-analytics";

import { SITE_URL, IDENTITY_SENTENCE } from "@/lib/seo/site";
import { JsonLd } from "@/components/seo/json-ld";
import { buildWebSiteSchema, buildOrganizationSchema } from "@/lib/seo/schemas";
import "./globals.css";

// Hanken Grotesk: display + body font for photo-forward design (D-02).
// Weight 800 is the headline/sig weight used in hero and section headings.
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// One sentence, one home: the meta description, the Person node's
// description, /llms.txt and /about all read from IDENTITY_SENTENCE so they
// can never drift apart (quick task 260921-ed0).
const SITE_DESCRIPTION = IDENTITY_SENTENCE;
const SITE_TITLE = "Monty Singer | Founder of Prometheus, Builder, Writer";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: "EV4m-VDmZ4Zqq2sjmhq9qW0OFkBWdMk6eXDAKXOQOcA",
    // Bing Webmaster Tools. Set BING_SITE_VERIFICATION once the property is
    // claimed; unset, `other` is undefined and Next renders no meta tag.
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
  title: {
    default: SITE_TITLE,
    template: "%s | Monty Singer",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/blog/feed.xml" },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Monty Singer",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
      className={`${hanken.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bg text-text antialiased">
        {/* Site-level entity markup, emitted once for every route (260728-kcg).
            The Organization node joined it in 260921-ed0 so Prometheus is an
            entity in its own right, linked to the Person by @id. */}
        <JsonLd data={buildWebSiteSchema()} />
        <JsonLd data={buildOrganizationSchema()} />
        <LenisProvider>
          <MotionProvider>
            <SiteFrame footer={<SiteFooter />}>{children}</SiteFrame>
          </MotionProvider>
        </LenisProvider>
        <UmamiAnalytics />

      </body>
    </html>
  );
}
