"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  Mail, Phone, Globe, Linkedin, Facebook, Instagram,
  Twitter, Download, Share2, Check, ExternalLink, Loader2,
} from "lucide-react";
import { CardPreview } from "@/components/admin/CardPreview";
import { DEFAULT_TEMPLATE_CONFIG } from "@/lib/types/template";
import type { TemplateConfig } from "@/lib/types/template";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialLink {
  id:       string;
  platform: string;
  url:      string;
  order:    number;
}

interface Card {
  id:          string;
  slug:        string;
  displayName: string;
  jobTitle:    string | null;
  company:     string | null;
  bio:         string | null;
  email:       string | null;
  phone:       string | null;
  website:     string | null;
  avatarUrl:   string | null;
  styles:      Record<string, unknown> | null;
  socialLinks: SocialLink[];
}

// ─── Social icon map ──────────────────────────────────────────────────────────

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  LINKEDIN:  Linkedin,
  FACEBOOK:  Facebook,
  INSTAGRAM: Instagram,
  TWITTER:   Twitter,
};

const SOCIAL_LABELS: Record<string, string> = {
  LINKEDIN:  "LinkedIn",
  FACEBOOK:  "Facebook",
  INSTAGRAM: "Instagram",
  TWITTER:   "Twitter / X",
  GITHUB:    "GitHub",
  YOUTUBE:   "YouTube",
  TIKTOK:    "TikTok",
  OTHER:     "Website",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicCardPage() {
  const params   = useParams<{ username: string }>();
  const slug     = params.username;

  const [card,    setCard]    = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    fetch(`/api/v1/public/cards/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => data && setCard(data.card ?? null))
      .finally(() => setLoading(false));
  }, [slug]);

  const publicUrl =
    typeof window !== "undefined" ? window.location.href : `https://mydigitalcard.app/u/${slug}`;

  // ── Share / copy ─────────────────────────────────────────────────────────────
  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: card ? `${card.displayName}'s Digital Card` : "Digital Card",
          url:   publicUrl,
        });
        return;
      } catch { /* user cancelled */ }
    }
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Download vCard ────────────────────────────────────────────────────────────
  function downloadVCard() {
    if (!card) return;
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${card.displayName}`,
      card.jobTitle ? `TITLE:${card.jobTitle}` : "",
      card.company  ? `ORG:${card.company}` : "",
      card.email    ? `EMAIL:${card.email}` : "",
      card.phone    ? `TEL:${card.phone}` : "",
      card.website  ? `URL:${card.website}` : "",
      `URL;type=profile:${publicUrl}`,
      "END:VCARD",
    ].filter(Boolean).join("\n");

    const blob = new Blob([lines], { type: "text/vcard" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.download = `${card.slug}.vcf`;
    a.href     = url;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Config ───────────────────────────────────────────────────────────────────
  const config: TemplateConfig = card?.styles
    ? { ...DEFAULT_TEMPLATE_CONFIG, ...(card.styles as Partial<TemplateConfig>) }
    : DEFAULT_TEMPLATE_CONFIG;

  const accentColor = config.accentColor ?? "#2563eb";

  // ── Social helpers ────────────────────────────────────────────────────────────
  const socialByPlatform = (platform: string) =>
    card?.socialLinks.find((l) => l.platform === platform)?.url;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (notFound || !card) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
        <div className="text-5xl">🪪</div>
        <h1 className="text-xl font-bold text-gray-800">Card not found</h1>
        <p className="text-sm text-gray-500 max-w-xs">
          This card may have been unpublished or the link is incorrect.
        </p>
        <a
          href="/"
          className="mt-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Create your own card
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-200">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-white/40 bg-white/70 backdrop-blur-md px-4">
        <span className="text-xs font-semibold text-gray-400 tracking-wide">mydigitalcard.app</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Share"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-8 space-y-6">

        {/* ── Card preview ── */}
        <div className="flex justify-center">
          <CardPreview
            config={config}
            size="lg"
            sampleName={card.displayName}
            sampleTitle={card.jobTitle ?? undefined}
            sampleCompany={card.company ?? undefined}
            sampleTagline={card.bio ?? undefined}
            sampleEmail={card.email ?? undefined}
            samplePhone={card.phone ?? undefined}
            sampleWebsite={card.website ?? undefined}
            sampleAvatar={card.avatarUrl}
            sampleLinkedin={socialByPlatform("LINKEDIN")}
            sampleFacebook={socialByPlatform("FACEBOOK")}
            sampleInstagram={socialByPlatform("INSTAGRAM")}
            sampleTwitter={socialByPlatform("TWITTER")}
            sampleUrl={publicUrl}
            hideIfNoAvatar
            hideEmptyFields
          />
        </div>

        {/* ── Contact actions ── */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">

          {card.email && (
            <a
              href={`mailto:${card.email}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: accentColor + "18" }}>
                <Mail className="h-4 w-4" style={{ color: accentColor }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800 truncate">{card.email}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-gray-300 ml-auto shrink-0" />
            </a>
          )}

          {card.phone && (
            <a
              href={`tel:${card.phone}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: accentColor + "18" }}>
                <Phone className="h-4 w-4" style={{ color: accentColor }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-800 truncate">{card.phone}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-gray-300 ml-auto shrink-0" />
            </a>
          )}

          {card.website && (
            <a
              href={card.website.startsWith("http") ? card.website : `https://${card.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: accentColor + "18" }}>
                <Globe className="h-4 w-4" style={{ color: accentColor }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Website</p>
                <p className="text-sm font-medium text-gray-800 truncate">{card.website}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-gray-300 ml-auto shrink-0" />
            </a>
          )}

          {/* Social links */}
          {card.socialLinks.map((link) => {
            const Icon  = SOCIAL_ICONS[link.platform] ?? Globe;
            const label = SOCIAL_LABELS[link.platform] ?? link.platform;
            const href  = link.url.startsWith("http") ? link.url : `https://${link.url}`;
            return (
              <a
                key={link.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: accentColor + "18" }}>
                  <Icon className="h-4 w-4" style={{ color: accentColor }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{link.url}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-gray-300 ml-auto shrink-0" />
              </a>
            );
          })}
        </div>

        {/* ── Save contact + QR ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={downloadVCard}
            className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: accentColor }}>
              <Download className="h-5 w-5 text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800">Save Contact</p>
              <p className="text-xs text-gray-400 mt-0.5">Add to phone</p>
            </div>
          </button>

          <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm">
            <QRCodeSVG
              value={publicUrl}
              size={72}
              fgColor={accentColor}
              bgColor="transparent"
              level="M"
            />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800">Scan QR</p>
              <p className="text-xs text-gray-400 mt-0.5">Share this card</p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="text-center pb-4">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span>Create your free digital card at</span>
            <span className="font-semibold text-gray-500">mydigitalcard.app</span>
          </a>
        </div>

      </main>
    </div>
  );
}
