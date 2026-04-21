/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Mail, Phone, Globe, Linkedin, Facebook, Instagram, Twitter } from "lucide-react";
import {
  TemplateConfig,
  TemplateFields,
  DEFAULT_TEMPLATE_FIELDS,
  FONT_FAMILY_CSS,
} from "@/lib/types/template";

// ─── Sample assets ────────────────────────────────────────────────────────────

/**
 * Per-layout professional banner images — each chosen to match the layout's theme.
 * The accent-colour overlay applied on top makes them feel "branded" to the template.
 */
const BANNER_URLS: Record<string, string> = {
  classic:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&h=320&q=80",
  modern:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&h=320&q=80",
  minimal:
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&h=320&q=80",
  bold:
    "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?auto=format&fit=crop&w=800&h=320&q=80",
  elegant:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&h=320&q=80",
  sharp:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&h=320&q=80",
  profile:
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&h=320&q=80",
  sidepanel:
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&h=320&q=80",
};

/**
 * Generates a simple inline SVG logo that reflects the template's accent colour.
 * Returns a data-URI so it works as an <img src> with no external requests.
 */
function makeLogoSvg(accentHex: string, onDark = false): string {
  const bg  = onDark ? "rgba(255,255,255,0.18)" : accentHex;
  const bdr = onDark ? "rgba(255,255,255,0.35)" : "none";
  const fg  = "white";
  const svg =
    `<svg width="96" height="34" xmlns="http://www.w3.org/2000/svg">` +
    `<rect width="96" height="34" rx="7" fill="${bg}" stroke="${bdr}" stroke-width="1.2"/>` +
    `<circle cx="17" cy="17" r="8" fill="rgba(255,255,255,0.22)"/>` +
    `<text x="58" y="22" font-size="11.5" fill="${fg}" text-anchor="middle" ` +
    `font-family="system-ui,sans-serif" font-weight="700" letter-spacing="1.5">KIT</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CardPreviewProps {
  config:             TemplateConfig;
  size?:              "sm" | "lg";
  sampleName?:        string;
  sampleTitle?:       string;
  sampleCompany?:     string;
  sampleTagline?:     string;
  sampleEmail?:       string;
  samplePhone?:       string;
  sampleWebsite?:     string;
  sampleUrl?:         string;
  sampleAvatar?:      string | null;
  /** User-provided logo URL — when hideEmptyFields is true, logo only appears if set */
  sampleLogo?:        string | null;
  /** User-provided social URLs — when hideEmptyFields is true, icons only appear if set */
  sampleLinkedin?:    string;
  sampleFacebook?:    string;
  sampleInstagram?:   string;
  sampleTwitter?:     string;
  defaultFlipped?:    boolean;
  /** Render only the card face — no toggle pills, no 3D container. Used for PDF/print capture. */
  staticFace?:        "front" | "back";
  /** When true, hide the headshot slot entirely if no sampleAvatar is provided. */
  hideIfNoAvatar?:    boolean;
  /** When true, hide every field whose sample value is empty/undefined. */
  hideEmptyFields?:   boolean;
}

const SAMPLE_URL = "https://mydigitalcard.app/u/alex-johnson";

// ─── Colour helpers ───────────────────────────────────────────────────────────

function isLight(hex: string | null | undefined): boolean {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#") || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

function resolveFields(fields?: TemplateFields): TemplateFields {
  return { ...DEFAULT_TEMPLATE_FIELDS, ...(fields ?? {}) };
}

// ─── Component ────────────────────────────────────────────────────────────────

// Sample fallbacks used only in admin/demo mode (when hideEmptyFields is false)
const SAMPLE_TITLE    = "Senior Product Designer";
const SAMPLE_COMPANY  = "KITLabs Inc.";
const SAMPLE_TAGLINE  = "Building products people love.";
const SAMPLE_EMAIL    = "alex@kitlabs.com";
const SAMPLE_PHONE    = "+1 (415) 555-0192";
const SAMPLE_WEBSITE  = "kitlabs.com";

export function CardPreview({
  config,
  size             = "sm",
  sampleName       = "Alex Johnson",
  sampleTitle,
  sampleCompany,
  sampleTagline,
  sampleEmail,
  samplePhone,
  sampleWebsite,
  sampleUrl        = SAMPLE_URL,
  sampleAvatar     = null,
  sampleLogo       = null,
  sampleLinkedin,
  sampleFacebook,
  sampleInstagram,
  sampleTwitter,
  defaultFlipped   = false,
  staticFace,
  hideIfNoAvatar   = false,
  hideEmptyFields  = false,
}: CardPreviewProps) {
  // Normalise — DB-stored configs can have null fields that override the spread defaults
  const layout          = config.layout          ?? "classic";
  const backgroundColor = config.backgroundColor ?? "#ffffff";
  const textColor       = config.textColor       ?? "#1a1a2e";
  const accentColor     = config.accentColor     ?? "#6366f1";
  const fontFamily      = config.fontFamily      ?? "inter";
  const lg = size === "lg";

  const [flipped, setFlipped] = useState(defaultFlipped);

  const f = resolveFields(config.fields);

  // In admin/demo mode fall back to sample strings; in user mode use raw value (undefined = hide)
  const displayTitle   = hideEmptyFields ? sampleTitle   : (sampleTitle   ?? SAMPLE_TITLE);
  const displayCompany = hideEmptyFields ? sampleCompany : (sampleCompany ?? SAMPLE_COMPANY);
  const displayTagline = hideEmptyFields ? sampleTagline : (sampleTagline ?? SAMPLE_TAGLINE);
  const displayEmail   = hideEmptyFields ? sampleEmail   : (sampleEmail   ?? SAMPLE_EMAIL);
  const displayPhone   = hideEmptyFields ? samplePhone   : (samplePhone   ?? SAMPLE_PHONE);
  const displayWebsite = hideEmptyFields ? sampleWebsite : (sampleWebsite ?? SAMPLE_WEBSITE);

  // Suppress headshot slot when caller opted in and no real avatar was provided
  const showHeadshot = f.headshot && (!hideIfNoAvatar || !!sampleAvatar);

  // Suppress any field whose resolved display value is absent
  const he = hideEmptyFields;
  const showLogo    = f.logo    && (!he || !!sampleLogo);
  const showJobTitle = f.jobTitle && (!he || !!displayTitle);
  const showCompany  = f.company  && (!he || !!displayCompany);
  const showTagline  = f.tagline  && (!he || !!displayTagline);
  const showBio      = f.bio      && (!he || !!displayTagline);

  const maxW = lg ? "w-[370px]" : "w-[260px]";

  // Layout-specific banner URL
  const bannerUrl = BANNER_URLS[layout] ?? BANNER_URLS.classic;

  // Style objects
  const cardSty: React.CSSProperties = {
    backgroundColor,
    color: textColor,
    fontFamily: FONT_FAMILY_CSS[fontFamily],
  };
  const aBg:   React.CSSProperties = { backgroundColor: accentColor };
  const aText: React.CSSProperties = { color: accentColor };

  // Readable text on the accent background
  const onA    = isLight(accentColor) ? "#111111" : "#ffffff";
  const onAMut = isLight(accentColor) ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.65)";

  // ── Sub-components ────────────────────────────────────────────────

  /**
   * Circular headshot — always overlaps adjacent elements via z-index.
   *
   * float  — floating on top of a banner photo (white ring + accent halo + deep shadow)
   * dark   — sitting on a dark accent panel (white ring, no accent halo)
   * ring   — explicit ring/halo colour override
   */
  const Headshot = ({
    cls,
    ring,
    float = false,
    dark  = false,
  }: { cls?: string; ring?: string; float?: boolean; dark?: boolean }) => {
    let shadow: string;
    if (float) {
      const ringCol = ring ?? backgroundColor;
      shadow = `0 0 0 3px ${ringCol}, 0 0 0 6px ${accentColor}88, 0 8px 24px rgba(0,0,0,0.22)`;
    } else if (dark) {
      shadow = `0 0 0 2px rgba(255,255,255,0.40), 0 4px 14px rgba(0,0,0,0.28)`;
    } else {
      shadow = `0 0 0 2px ${ring ?? accentColor}66, 0 2px 8px rgba(0,0,0,0.10)`;
    }

    // Avatar fill — subtle tint of the accent colour for the placeholder bg
    const avatarBg  = `${accentColor}22`;
    const avatarFg  = dark ? "rgba(255,255,255,0.55)" : `${accentColor}cc`;

    return (
      <div
        className={`rounded-full overflow-hidden shrink-0 relative ${cls ?? ""}`}
        style={{ boxShadow: shadow }}
      >
        {sampleAvatar ? (
          <img
            src={sampleAvatar}
            alt="Headshot"
            className="w-full h-full object-cover"
            style={{ objectPosition: "50% 15%" }}
            referrerPolicy="no-referrer"
          />
        ) : (
          /* Generic person silhouette — no real photo, no external request */
          <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            style={{ background: avatarBg }}
          >
            {/* Head */}
            <circle cx="50" cy="36" r="20" fill={avatarFg} />
            {/* Shoulders / body */}
            <ellipse cx="50" cy="85" rx="32" ry="24" fill={avatarFg} />
          </svg>
        )}
      </div>
    );
  };

  /**
   * Logo badge — SVG that uses the template's accent colour so it updates live.
   */
  const Logo = ({ dark = false, cls }: { dark?: boolean; cls?: string }) => (
    <img
      src={makeLogoSvg(accentColor, dark)}
      alt="Sample logo"
      className={`shrink-0 rounded-lg object-cover ${cls ?? ""}`}
      referrerPolicy="no-referrer"
    />
  );

  /**
   * Banner section — professional photo with a subtle diagonal accent-colour overlay.
   * neg — flush banner to padded card edges (respects lg vs sm padding).
   */
  const Banner = ({
    banH,
    logoSlot,
    neg = false,
  }: {
    banH:      string;
    logoSlot?: React.ReactNode;
    neg?:      boolean;
  }) => (
    <div
      className={`relative w-full ${banH} overflow-hidden shrink-0 ${
        neg ? (lg ? "-mx-6 -mt-6" : "-mx-4 -mt-4") : ""
      }`}
    >
      <img
        src={bannerUrl}
        alt="Business banner"
        className="absolute inset-0 w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${accentColor}66 0%, ${accentColor}11 100%)` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.32))` }}
      />
      {logoSlot && <div className="absolute top-2.5 right-2.5">{logoSlot}</div>}
    </div>
  );

  // Active socials
  const SOCIAL_DEFS: { key: keyof TemplateFields; Icon: React.ElementType; sample: string | undefined }[] = [
    { key: "linkedin",  Icon: Linkedin,  sample: sampleLinkedin  },
    { key: "facebook",  Icon: Facebook,  sample: sampleFacebook  },
    { key: "instagram", Icon: Instagram, sample: sampleInstagram },
    { key: "twitter",   Icon: Twitter,   sample: sampleTwitter   },
  ];
  // In user mode (hideEmptyFields) only show icons for platforms the user actually filled in
  const socials = SOCIAL_DEFS.filter(({ key, sample }) => f[key] && (!hideEmptyFields || !!sample));

  const SocialRow = ({
    dark = false,
    cls  = "",
  }: { dark?: boolean; cls?: string }) => {
    if (socials.length === 0) return null;
    return (
      <div
        className={`flex gap-2.5 ${cls}`}
        style={{ color: dark ? "rgba(255,255,255,0.55)" : textColor, opacity: dark ? 1 : 0.45 }}
      >
        {socials.map(({ key, Icon }) => (
          <Icon key={key} className={lg ? "h-4 w-4" : "h-3.5 w-3.5"} />
        ))}
      </div>
    );
  };

  // Active contact items
  const contacts = [
    { key: "email"   as const, Icon: Mail,  label: displayEmail   },
    { key: "phone"   as const, Icon: Phone, label: displayPhone   },
    { key: "website" as const, Icon: Globe, label: displayWebsite },
  ].filter(({ key, label }) => f[key] && (!he || !!label));

  const Contacts = ({
    cls    = "",
    center = false,
    max,
  }: { cls?: string; center?: boolean; max?: number }) => {
    const items = max ? contacts.slice(0, max) : contacts;
    if (items.length === 0) return null;
    return (
      <div className={`space-y-1.5 ${cls}`}>
        {items.map(({ key, Icon, label }) => (
          <div
            key={key}
            className={`flex items-center gap-2 text-[11px] opacity-60 ${center ? "justify-center" : ""}`}
          >
            <Icon className={`shrink-0 ${lg ? "h-3.5 w-3.5" : "h-3 w-3"}`} style={aText} />
            {lg && <span className="truncate">{label}</span>}
          </div>
        ))}
      </div>
    );
  };

  const Identity = ({
    center   = false,
    dark     = false,
    nameSize,
  }: { center?: boolean; dark?: boolean; nameSize?: string }) => {
    const ns = nameSize ?? (lg ? "text-sm" : "text-xs");
    return (
      <div className={center ? "text-center" : ""}>
        <p className={`${ns} font-bold leading-snug`} style={{ color: dark ? onA : textColor }}>
          {sampleName}
        </p>
        {showJobTitle && (
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: dark ? onAMut : accentColor }}>
            {displayTitle}
          </p>
        )}
        {showCompany && (
          <p className="text-[10px] mt-0.5 opacity-55" style={{ color: dark ? onA : textColor }}>
            {displayCompany}
          </p>
        )}
        {showTagline && (
          <p className="text-[9px] italic mt-0.5 opacity-60" style={{ color: dark ? onA : accentColor }}>
            &ldquo;{displayTagline}&rdquo;
          </p>
        )}
        {showBio && lg && (
          <p className="text-[9px] mt-2 leading-relaxed opacity-40 line-clamp-2">
            {displayTagline}
          </p>
        )}
      </div>
    );
  };

  const Divider = ({ cls = "mx-4" }: { cls?: string }) => (
    <div className={`border-t ${cls}`} style={{ borderColor: accentColor + "1a" }} />
  );

  // ─── Front card — one branch per layout ───────────────────────────

  let frontCard: React.ReactNode;

  // ── 1. CLASSIC ───────────────────────────────────────────────────
  if (layout === "classic") {
    const banH  = lg ? "h-20" : "h-14";
    const hsW   = lg ? "h-20 w-20" : "h-14 w-14";
    const hsFlt = f.banner ? (lg ? "-mt-10" : "-mt-7") : (lg ? "mt-5" : "mt-4");

    frontCard = (
      <div style={cardSty} className="w-full rounded-2xl shadow-lg overflow-hidden border border-black/[0.06]">
        {f.banner && (
          <Banner
            banH={banH}
            logoSlot={showLogo ? <Logo dark cls={lg ? "h-8 w-16" : "h-6 w-12"} /> : undefined}
          />
        )}
        {showHeadshot && (
          <div className="flex justify-center">
            <Headshot cls={`${hsW} ${hsFlt}`} float />
          </div>
        )}
        {!f.banner && showLogo && (
          <div className={`flex justify-center ${showHeadshot ? "mt-3" : "mt-5"}`}>
            <Logo cls={lg ? "h-9 w-20" : "h-7 w-16"} />
          </div>
        )}
        <div className={`text-center ${lg ? "px-7 pt-3 pb-6" : "px-5 pt-2 pb-5"}`}>
          <Identity center />
          <Contacts cls="mt-3" center />
          {socials.length > 0 && (
            <div className="mt-3 flex justify-center"><SocialRow /></div>
          )}
        </div>
      </div>
    );

  // ── 2. MODERN ────────────────────────────────────────────────────
  } else if (layout === "modern") {
    const hsW = lg ? "h-16 w-16" : "h-12 w-12";

    frontCard = (
      <div style={cardSty} className="w-full rounded-2xl shadow-lg overflow-hidden border border-black/[0.06]">
        {f.banner && <Banner banH={lg ? "h-12" : "h-9"} />}
        <div className={`flex items-start gap-3 ${lg ? "p-5" : "p-4"}`}>
          {showHeadshot && <Headshot cls={`${hsW} rounded-xl`} />}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1"><Identity /></div>
              {showLogo && <Logo cls={lg ? "h-8 w-16 ml-1" : "h-6 w-12 ml-1"} />}
            </div>
          </div>
        </div>
        {contacts.length > 0 && (
          <>
            <Divider />
            <Contacts cls={lg ? "px-5 py-3" : "px-4 py-2.5"} />
          </>
        )}
        {socials.length > 0 && (
          <>
            <Divider />
            <div className={lg ? "px-5 py-3" : "px-4 py-2.5"}>
              <SocialRow />
            </div>
          </>
        )}
      </div>
    );

  // ── 3. MINIMAL ───────────────────────────────────────────────────
  } else if (layout === "minimal") {
    const hsW = lg ? "h-16 w-16" : "h-12 w-12";
    const pad = lg ? "p-6" : "p-4";

    frontCard = (
      <div style={cardSty} className={`w-full rounded-2xl shadow-lg overflow-hidden border border-black/[0.06] ${pad}`}>
        {f.banner && (
          <div className={lg ? "-mx-6 -mt-6 mb-4" : "-mx-4 -mt-4 mb-4"}>
            <Banner banH={lg ? "h-12" : "h-9"} />
          </div>
        )}
        {(showLogo || showHeadshot) && (
          <div className="flex items-start justify-between mb-4">
            {showLogo ? <Logo cls={lg ? "h-10 w-20" : "h-7 w-14"} /> : <div />}
            {showHeadshot && <Headshot cls={`${hsW} rounded-2xl`} />}
          </div>
        )}
        <div style={{ backgroundColor: accentColor }} className={`h-0.5 rounded-full mb-3 ${lg ? "w-12" : "w-8"}`} />
        <Identity />
        <Contacts cls="mt-3" max={lg ? 3 : 2} />
        {socials.length > 0 && <div className="mt-3"><SocialRow /></div>}
        <div
          className="mt-4 pt-3"
          style={{ borderTop: `1px solid ${accentColor}1a` }}
        >
          <span className="text-[8px] opacity-20">mydigitalcard.app</span>
        </div>
      </div>
    );

  // ── 4. BOLD ──────────────────────────────────────────────────────
  } else if (layout === "bold") {
    const banH  = lg ? "h-28" : "h-20";
    const hsW   = lg ? "h-20 w-20" : "h-14 w-14";
    const hsFlt = f.banner ? (lg ? "-mt-10" : "-mt-7") : (lg ? "mt-5" : "mt-4");

    frontCard = (
      <div style={{ fontFamily: FONT_FAMILY_CSS[fontFamily] }} className="w-full rounded-2xl shadow-lg overflow-hidden border border-black/[0.06]">
        {f.banner && (
          <Banner
            banH={banH}
            logoSlot={showLogo ? <Logo dark cls={lg ? "h-8 w-16" : "h-6 w-12"} /> : undefined}
          />
        )}
        {showHeadshot && (
          <div style={{ backgroundColor }} className="flex justify-center">
            <Headshot cls={`${hsW} ${hsFlt}`} float />
          </div>
        )}
        {!f.banner && showLogo && (
          <div style={{ backgroundColor }} className={`flex justify-center ${showHeadshot ? "mt-3" : "mt-5"}`}>
            <Logo cls={lg ? "h-9 w-20" : "h-7 w-16"} />
          </div>
        )}
        <div style={{ backgroundColor }} className={`text-center ${lg ? "px-6 pt-3 pb-6" : "px-4 pt-2 pb-4"}`}>
          <Identity center nameSize={lg ? "text-base" : "text-sm"} />
          <Contacts cls="mt-3" center />
          {socials.length > 0 && <div className="mt-3 flex justify-center"><SocialRow /></div>}
        </div>
      </div>
    );

  // ── 5. ELEGANT ───────────────────────────────────────────────────
  } else if (layout === "elegant") {
    const hsW = lg ? "h-16 w-16" : "h-12 w-12";

    frontCard = (
      <div style={cardSty} className="w-full rounded-2xl shadow-lg overflow-hidden border border-black/[0.06] flex">
        <div style={aBg} className={lg ? "w-2 shrink-0" : "w-1.5 shrink-0"} />
        <div className={`flex-1 min-w-0 ${lg ? "p-5" : "p-4"}`}>
          {f.banner && (
            <div className={lg ? "-mx-5 -mt-5 mb-4" : "-mx-4 -mt-4 mb-4"}>
              <Banner banH={lg ? "h-14" : "h-10"} />
            </div>
          )}
          <div className="flex items-start justify-between mb-3">
            {showHeadshot ? <Headshot cls={`${hsW} rounded-xl`} /> : <div />}
            {showLogo && <Logo cls={lg ? "h-8 w-16" : "h-6 w-12"} />}
          </div>
          <div style={{ backgroundColor: accentColor + "33" }} className="h-px w-full mb-3" />
          <Identity />
          <Contacts cls="mt-3" />
          {socials.length > 0 && <div className="mt-4"><SocialRow /></div>}
        </div>
      </div>
    );

  // ── 6. SHARP ─────────────────────────────────────────────────────
  } else if (layout === "sharp") {
    const hsW = lg ? "h-16 w-16" : "h-12 w-12";

    frontCard = (
      <div style={{ fontFamily: FONT_FAMILY_CSS[fontFamily] }} className="w-full rounded-2xl shadow-lg overflow-hidden border border-black/[0.06]">
        <div className={`relative ${lg ? "px-6 py-5" : "px-4 py-4"}`}>
          {f.banner ? (
            <>
              <img
                src={bannerUrl}
                alt="Business banner"
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${accentColor}dd 0%, ${accentColor}99 100%)` }}
              />
            </>
          ) : (
            <div className="absolute inset-0" style={aBg} />
          )}
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={`${lg ? "text-lg" : "text-base"} font-extrabold leading-tight`} style={{ color: onA }}>
                {sampleName}
              </p>
              {showJobTitle && (
                <p className="text-[11px] font-semibold mt-1" style={{ color: onAMut }}>
                  {displayTitle}
                </p>
              )}
              {showLogo && (
                <div className="mt-3">
                  <Logo dark cls={lg ? "h-7 w-16" : "h-6 w-12"} />
                </div>
              )}
            </div>
            {showHeadshot && <Headshot cls={`${hsW} shrink-0`} dark />}
          </div>
        </div>
        <div style={cardSty} className={`${lg ? "px-6 py-4" : "px-4 py-3"}`}>
          {(showCompany || showTagline || showBio) && (
            <div className="mb-3">
              {showCompany && <p className="text-[11px] opacity-55">{displayCompany}</p>}
              {showTagline && (
                <p className="text-[10px] italic mt-0.5 opacity-60" style={aText}>
                  &ldquo;{displayTagline}&rdquo;
                </p>
              )}
              {showBio && lg && (
                <p className="text-[9px] opacity-35 mt-2 leading-relaxed line-clamp-2">
                  {displayTagline}
                </p>
              )}
            </div>
          )}
          <Contacts cls="mb-3" />
          {socials.length > 0 && <SocialRow />}
        </div>
      </div>
    );

  // ── 7. PROFILE ───────────────────────────────────────────────────
  } else if (layout === "profile") {
    const banH  = lg ? "h-24" : "h-16";
    const hsW   = lg ? "h-20 w-20" : "h-14 w-14";
    const hsFlt = f.banner ? (lg ? "-mt-10" : "-mt-7") : (lg ? "mt-5" : "mt-4");

    frontCard = (
      <div style={cardSty} className="w-full rounded-2xl shadow-lg overflow-hidden border border-black/[0.06]">
        {f.banner && (
          <Banner
            banH={banH}
            logoSlot={showLogo ? <Logo dark cls={lg ? "h-7 w-14" : "h-5 w-10"} /> : undefined}
          />
        )}
        {showHeadshot && (
          <div className="flex justify-center">
            <Headshot cls={`${hsW} ${hsFlt}`} float />
          </div>
        )}
        {!f.banner && showLogo && (
          <div className={`flex justify-center ${showHeadshot ? "mt-3" : "mt-5"}`}>
            <Logo cls={lg ? "h-9 w-20" : "h-7 w-14"} />
          </div>
        )}
        <div className={`text-center ${lg ? "px-6 pt-3 pb-1" : "px-4 pt-2 pb-1"}`}>
          <Identity center />
        </div>
        {socials.length > 0 && (
          <>
            <Divider cls={lg ? "mx-7 mt-3" : "mx-5 mt-2"} />
            <div className={`flex justify-center gap-3 ${lg ? "py-3 px-6" : "py-2.5 px-4"}`}>
              {socials.map(({ key, Icon }) => (
                <div
                  key={key}
                  className={`flex items-center justify-center rounded-full ${lg ? "h-9 w-9" : "h-7 w-7"}`}
                  style={{ backgroundColor: accentColor + "18" }}
                >
                  <Icon className={lg ? "h-4 w-4" : "h-3 w-3"} style={aText} />
                </div>
              ))}
            </div>
          </>
        )}
        {contacts.length > 0 && (
          <>
            <Divider />
            <Contacts cls={lg ? "px-6 py-3" : "px-4 py-2.5"} center />
          </>
        )}
      </div>
    );

  // ── 8. SIDEPANEL (+ fallback) ────────────────────────────────────
  } else {
    const sideW = lg ? "w-[104px]" : "w-[76px]";

    frontCard = (
      <div
        style={{ fontFamily: FONT_FAMILY_CSS[fontFamily] }}
        className="w-full rounded-2xl shadow-lg overflow-hidden border border-black/[0.06] flex"
      >
        <div
          style={aBg}
          className={`${sideW} shrink-0 flex flex-col items-center ${lg ? "py-6 px-3 gap-4" : "py-4 px-2 gap-3"}`}
        >
          {showHeadshot && <Headshot cls={lg ? "h-16 w-16" : "h-12 w-12"} dark />}
          {showLogo && <Logo dark cls={lg ? "h-7 w-20" : "h-5 w-14"} />}
          <div className="w-8 h-px bg-white/25" />
          {socials.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              {socials.map(({ key, Icon }) => (
                <Icon
                  key={key}
                  className={lg ? "h-4 w-4" : "h-3.5 w-3.5"}
                  style={{ color: "rgba(255,255,255,0.6)" }}
                />
              ))}
            </div>
          )}
        </div>
        <div style={cardSty} className={`flex-1 min-w-0 flex flex-col ${lg ? "p-5" : "p-3.5"}`}>
          {f.banner && (
            <div className={lg ? "-mx-5 -mt-5 mb-4" : "-mx-3.5 -mt-3.5 mb-4"}>
              <Banner banH={lg ? "h-14" : "h-10"} />
            </div>
          )}
          <div style={{ backgroundColor: accentColor + "2a" }} className="h-0.5 w-full rounded-full mb-4" />
          <Identity />
          {contacts.length > 0 && (
            <>
              <div style={{ borderColor: accentColor + "1a" }} className="border-t mt-3 mb-3" />
              <Contacts />
            </>
          )}
          <div className="mt-auto pt-3">
            <div style={{ borderColor: accentColor + "15" }} className="border-t pt-2">
              <span className="text-[8px] opacity-20">mydigitalcard.app</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Back card ────────────────────────────────────────────────────────────────
  //  Fixed layout: large QR code centred, name / job title / company below.
  //  Always shows these three fields regardless of individual field toggles.
  // ─────────────────────────────────────────────────────────────────────────────

  const backQrSize = lg ? 128 : 86;

  const backCard = (
    <div
      style={cardSty}
      className="w-full h-full rounded-2xl shadow-lg overflow-hidden border border-black/[0.06] flex flex-col"
    >
      {/* Centre: QR + "Scan to connect" + identity */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-4">
        <div
          className="rounded-2xl"
          style={{
            padding:         lg ? "12px" : "8px",
            backgroundColor: "#ffffff",
            boxShadow:       `0 0 0 1px ${accentColor}22, 0 6px 24px rgba(0,0,0,0.12)`,
          }}
        >
          <QRCodeSVG
            value={sampleUrl}
            size={backQrSize}
            fgColor={accentColor}
            bgColor="transparent"
            level="M"
          />
        </div>

        <p className="text-[9px] opacity-35 tracking-wide uppercase" style={{ color: textColor }}>
          Scan to connect
        </p>

        {/* Accent divider */}
        <div
          className={`rounded-full ${lg ? "h-0.5 w-10" : "h-px w-8"}`}
          style={{ backgroundColor: accentColor + "55" }}
        />

        {/* Name · Job Title · Company — no headshot */}
        <div className="text-center space-y-0.5">
          <p
            className={`${lg ? "text-base" : "text-sm"} font-bold leading-snug`}
            style={{ color: textColor }}
          >
            {sampleName}
          </p>
          {showJobTitle && (
            <p
              className="text-[11px] font-semibold"
              style={{ color: accentColor }}
            >
              {displayTitle}
            </p>
          )}
          {showCompany && (
            <p
              className="text-[10px] opacity-50"
              style={{ color: textColor }}
            >
              {displayCompany}
            </p>
          )}
        </div>
      </div>

      {/* Bottom branding strip */}
      <div
        className={`text-center ${lg ? "py-3" : "py-2"}`}
        style={{ borderTop: `1px solid ${accentColor}18` }}
      >
        <span className="text-[8px] opacity-20 tracking-widest uppercase" style={{ color: textColor }}>
          mydigitalcard.app
        </span>
      </div>
    </div>
  );

  // ─── Flip toggle + 3-D card container ────────────────────────────────────────

  // Static face — bare card only, no controls or 3D container (used for PDF/print capture)
  if (staticFace) {
    return staticFace === "back" ? backCard : frontCard;
  }

  return (
    <div className="flex flex-col items-center gap-3">

      {/* Side toggle pills */}
      <div className="flex items-center gap-1 rounded-full bg-black/[0.06] p-1">
        <button
          type="button"
          onClick={() => setFlipped(false)}
          className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
            !flipped
              ? "bg-white shadow-sm text-gray-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Front
        </button>
        <button
          type="button"
          onClick={() => setFlipped(true)}
          className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
            flipped
              ? "bg-white shadow-sm text-gray-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Back
        </button>
      </div>

      {/* 3-D flip container */}
      <div
        className={maxW}
        style={{ perspective: "1200px" }}
      >
        <div
          style={{
            transformStyle:  "preserve-3d",
            transition:      "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            transform:       flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            position:        "relative",
            // Ensure the back card always has enough height to show QR + name + branding
            minHeight:       lg ? "280px" : "240px",
          }}
        >
          {/* Front face */}
          <div style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}>
            {frontCard}
          </div>

          {/* Back face — absolutely overlays the front, same dimensions */}
          <div
            style={{
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility:       "hidden",
              transform:                "rotateY(180deg)",
              position:                 "absolute",
              inset:                    0,
            }}
          >
            {backCard}
          </div>
        </div>
      </div>

    </div>
  );
}
