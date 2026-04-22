"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  Mail, Phone, Globe, Linkedin, Facebook, Instagram,
  Twitter, Share2, Check, ChevronRight, Loader2, UserPlus,
} from "lucide-react";
import { CardPreview } from "@/components/admin/CardPreview";
import { DEFAULT_TEMPLATE_CONFIG } from "@/lib/types/template";
import type { TemplateConfig } from "@/lib/types/template";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialLink { id: string; platform: string; url: string; order: number }

interface Card {
  id: string; slug: string; displayName: string;
  jobTitle: string | null; company: string | null; bio: string | null;
  email: string | null; phone: string | null; website: string | null;
  avatarUrl: string | null; styles: Record<string, unknown> | null;
  socialLinks: SocialLink[];
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  LINKEDIN: Linkedin, FACEBOOK: Facebook, INSTAGRAM: Instagram, TWITTER: Twitter,
};
const SOCIAL_LABELS: Record<string, string> = {
  LINKEDIN: "LinkedIn", FACEBOOK: "Facebook", INSTAGRAM: "Instagram",
  TWITTER: "Twitter / X", GITHUB: "GitHub", YOUTUBE: "YouTube", TIKTOK: "TikTok", OTHER: "Link",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicCardPage() {
  const { username: slug } = useParams<{ username: string }>();

  const [card,     setCard]     = useState<Card | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied,   setCopied]   = useState(false);

  useEffect(() => {
    fetch(`/api/v1/public/cards/${slug}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then((d) => d && setCard(d.card ?? null))
      .finally(() => setLoading(false));
  }, [slug]);

  const publicUrl = typeof window !== "undefined"
    ? window.location.href
    : `https://mydigitalcard.app/u/${slug}`;

  async function handleShare() {
    if (navigator.share) {
      try { await navigator.share({ title: `${card?.displayName}'s Digital Card`, url: publicUrl }); return; }
      catch { /* cancelled */ }
    }
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const vcfUrl = `/api/v1/public/cards/${slug}/vcf`;

  const config: TemplateConfig = card?.styles
    ? { ...DEFAULT_TEMPLATE_CONFIG, ...(card.styles as Partial<TemplateConfig>) }
    : DEFAULT_TEMPLATE_CONFIG;

  const accent = config.accentColor ?? "#2563eb";
  const sp = (p: string) => card?.socialLinks.find((l) => l.platform === p)?.url;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
    </div>
  );

  if (notFound || !card) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
      <div className="text-5xl">🪪</div>
      <h1 className="text-xl font-bold text-gray-800">Card not found</h1>
      <p className="text-sm text-gray-500 max-w-xs">This card may have been unpublished or the link is incorrect.</p>
      <a href="/" className="mt-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
        Create your own card
      </a>
    </div>
  );

  // Contact + social rows
  const contactRows = [
    { icon: Mail,  label: "Email",   value: card.email,   href: `mailto:${card.email}` },
    { icon: Phone, label: "Phone",   value: card.phone,   href: `tel:${card.phone}` },
    { icon: Globe, label: "Website", value: card.website,
      href: card.website?.startsWith("http") ? card.website : `https://${card.website}` },
  ].filter(r => !!r.value);

  const socialRows = card.socialLinks.map((l) => ({
    icon:  SOCIAL_ICONS[l.platform] ?? Globe,
    label: SOCIAL_LABELS[l.platform] ?? l.platform,
    value: l.url,
    href:  l.url.startsWith("http") ? l.url : `https://${l.url}`,
  }));

  const allRows = [...contactRows, ...socialRows];

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(160deg, ${accent}22 0%, #f1f5f9 40%, #e2e8f0 100%)` }}>

      {/* ── Sticky top bar ── */}
      <header className="sticky top-0 z-20 flex h-11 items-center justify-between px-4 bg-white/60 backdrop-blur-md border-b border-white/50">
        <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">mydigitalcard</span>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-[11px] font-semibold text-gray-600 hover:bg-white transition-colors shadow-sm"
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Share2 className="h-3 w-3" />}
          {copied ? "Copied!" : "Share"}
        </button>
      </header>

      <main className="mx-auto w-full max-w-sm px-4 pb-10 pt-6 flex flex-col gap-5">

        {/* ── Card preview — large, full width, responsive ── */}
        <div className="w-full">
          {/* Scale wrapper: renders CardPreview at lg size then scales to fill container */}
          <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl" style={{ paddingBottom: "63%" }}>
            <div
              className="absolute inset-0 flex items-start justify-center"
              style={{ transformOrigin: "top center" }}
            >
              {/* Inner scaler: renders at 370px natural width, then CSS scales it to fill */}
              <div
                style={{
                  width: "370px",
                  transform: "scale(var(--card-scale, 1))",
                  transformOrigin: "top left",
                }}
                className="[--card-scale:calc((100vw-2rem)/370)] sm:[--card-scale:calc(336px/370)]"
              >
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
                  sampleLinkedin={sp("LINKEDIN")}
                  sampleFacebook={sp("FACEBOOK")}
                  sampleInstagram={sp("INSTAGRAM")}
                  sampleTwitter={sp("TWITTER")}
                  sampleUrl={publicUrl}
                  hideIfNoAvatar
                  hideEmptyFields
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Contact & social rows ── */}
        {allRows.length > 0 && (
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-white divide-y divide-gray-100 overflow-hidden">
            {allRows.map(({ icon: Icon, label, value, href }, i) => (
              <a
                key={i}
                href={href}
                target={href.startsWith("mailto") || href.startsWith("tel") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/80 active:bg-gray-100 transition-colors"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: accent + "18" }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-gray-400 leading-none mb-0.5">{label}</p>
                  <p className="text-sm text-gray-800 truncate">{value}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              </a>
            ))}
          </div>
        )}

        {/* ── Save contact + QR — compact inline row ── */}
        <div className="flex items-center gap-3">
          {/* Save Contact — downloads .vcf from server */}
          <a
            href={vcfUrl}
            download
            className="flex items-center gap-2 rounded-full border bg-white/80 backdrop-blur-sm px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-white hover:shadow-md active:scale-95 transition-all"
            style={{ borderColor: accent + "55" }}
          >
            <UserPlus className="h-3.5 w-3.5" style={{ color: accent }} />
            Save Contact
          </a>

          {/* QR code — small, inline, no extra label */}
          <div
            className="ml-auto flex items-center gap-2 rounded-xl border bg-white/80 backdrop-blur-sm px-3 py-2 shadow-sm"
            style={{ borderColor: accent + "33" }}
          >
            <QRCodeSVG
              value={publicUrl}
              size={36}
              fgColor={accent}
              bgColor="transparent"
              level="M"
            />
            <p className="text-[10px] font-medium text-gray-400 leading-tight">
              Scan<br />to share
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-[10px] text-gray-400">
          Powered by{" "}
          <a href="/" className="font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            mydigitalcard.app
          </a>
        </p>

      </main>
    </div>
  );
}
