import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", preload: false });

export const metadata: Metadata = {
  title: {
    default: "My Digital Card",
    template: "%s | My Digital Card",
  },
  description:
    "Create, manage, and share your professional digital business card. Go paperless and always stay up to date.",
  keywords: ["digital business card", "virtual business card", "QR code card"],
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
