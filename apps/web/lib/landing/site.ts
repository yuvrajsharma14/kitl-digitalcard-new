/**
 * Single source of truth for canonical site URL, brand strings, and social
 * handles used by metadata, JSON-LD, robots.txt, sitemap.xml, and OG images.
 */
export const siteConfig = {
  name:        "My Digital Card",
  shortName:   "MDC",
  url:         (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mydigitalcard.app").replace(/\/$/, ""),
  tagline:     "Free Digital Business Cards — share your contact instantly",
  description:
    "Create your free digital business card in minutes. Share via QR code or a link, save contacts straight to phone, and update your details anytime — your card stays in sync everywhere.",
  keywords: [
    "digital business card",
    "virtual business card",
    "QR code business card",
    "online business card",
    "electronic business card",
    "contactless business card",
    "vCard generator",
    "free business card",
    "shareable business card",
    "professional networking",
    "paperless networking",
    "smart business card",
  ],
  ogImage: "/og-image.png",
  twitter: "@mydigitalcard",
  authorName: "My Digital Card",
} as const;
