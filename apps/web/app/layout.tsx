import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { siteConfig } from "@/lib/landing/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.authorName, url: siteConfig.url }],
  creator: siteConfig.authorName,
  publisher: siteConfig.authorName,
  category: "Business",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type:        "website",
    siteName:    siteConfig.name,
    title:       `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url:         siteConfig.url,
    locale:      "en_US",
    images: [
      {
        url:    siteConfig.ogImage,
        width:  1200,
        height: 630,
        alt:    `${siteConfig.name} — ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card:        "summary_large_image",
    title:       `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images:      [siteConfig.ogImage],
    creator:     siteConfig.twitter,
    site:        siteConfig.twitter,
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:           true,
      follow:          true,
      "max-image-preview": "large",
      "max-snippet":       -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon:     "/favicon.ico",
    shortcut: "/favicon.ico",
    apple:    "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email:     false,
    telephone: false,
    address:   false,
  },
};

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className={`${inter.className} h-full overflow-hidden`}>{children}</body>
    </html>
  );
}
