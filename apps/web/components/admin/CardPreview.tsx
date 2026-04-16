"use client";

import { QRCodeSVG } from "qrcode.react";
import { TemplateConfig, FONT_FAMILY_CSS } from "@/lib/types/template";
import { Globe, Mail, Phone, Linkedin, Twitter, Instagram } from "lucide-react";

interface CardPreviewProps {
  config: TemplateConfig;
  size?: "sm" | "lg";
  sampleName?: string;
  sampleTitle?: string;
  sampleCompany?: string;
  sampleUrl?: string;
}

const SAMPLE_URL = "https://mydigitalcard.app/u/alex-johnson";

export function CardPreview({
  config,
  size = "sm",
  sampleName = "Alex Johnson",
  sampleTitle = "Product Designer",
  sampleCompany = "Acme Corp",
  sampleUrl = SAMPLE_URL,
}: CardPreviewProps) {
  const { layout, backgroundColor, textColor, accentColor, fontFamily } = config;
  const isLg = size === "lg";

  const qrSize = isLg ? 64 : 40;
  const maxW = isLg ? "max-w-[360px]" : "max-w-[280px]";

  const cardStyle: React.CSSProperties = {
    backgroundColor,
    color: textColor,
    fontFamily: FONT_FAMILY_CSS[fontFamily],
  };
  const accentStyle: React.CSSProperties = { color: accentColor };
  const accentBgStyle: React.CSSProperties = { backgroundColor: accentColor };
  const accentBorderStyle: React.CSSProperties = { borderColor: accentColor };

  const initials = sampleName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const QrBlock = ({ center = false }: { center?: boolean }) => (
    <div
      className={`flex ${center ? "justify-center" : "justify-end"} items-end gap-2 mt-3`}
    >
      {center && (
        <span className="text-[9px] opacity-40 self-center">Scan to connect</span>
      )}
      <div
        className="rounded-lg p-1 shadow-sm"
        style={{ backgroundColor: "#ffffff", border: `1px solid ${accentColor}22` }}
      >
        <QRCodeSVG
          value={sampleUrl}
          size={qrSize}
          fgColor={textColor === "#ffffff" || textColor === "#fafaf9" || textColor === "#f1f5f9" || textColor === "#fef3c7" || textColor === "#fef08a"
            ? "#1a1a1a"
            : textColor}
          bgColor="transparent"
          level="M"
        />
      </div>
      {!center && (
        <span className="text-[9px] opacity-40 self-end pb-0.5">Scan</span>
      )}
    </div>
  );

  // ── Classic ──────────────────────────────────────────────────────────────
  if (layout === "classic") {
    return (
      <div
        style={cardStyle}
        className={`w-full ${maxW} rounded-2xl shadow-xl overflow-hidden border`}
        role="img"
        aria-label="Card preview"
      >
        <div style={accentBgStyle} className={isLg ? "h-20 w-full" : "h-16 w-full"} />
        <div className="flex justify-center -mt-8">
          <div
            style={{ ...accentBorderStyle, backgroundColor }}
            className={`${isLg ? "h-16 w-16" : "h-14 w-14"} rounded-full border-4 flex items-center justify-center font-bold shadow`}
          >
            <span style={accentStyle} className={isLg ? "text-base" : "text-sm"}>
              {initials}
            </span>
          </div>
        </div>
        <div className={`${isLg ? "px-7 pt-3 pb-6" : "px-5 pt-2 pb-5"} text-center`}>
          <p className={`${isLg ? "text-base" : "text-sm"} font-semibold`}>{sampleName}</p>
          <p style={accentStyle} className="text-xs font-medium mt-0.5">
            {sampleTitle}
          </p>
          <p className="text-xs opacity-60 mt-0.5">{sampleCompany}</p>
          <div className={`mt-3 flex justify-center gap-3 opacity-70 ${isLg ? "text-xs" : ""}`}>
            {isLg ? (
              <>
                <span className="flex items-center gap-1 text-xs"><Mail className="h-3 w-3" /> alex@acme.com</span>
                <span className="flex items-center gap-1 text-xs"><Phone className="h-3 w-3" /> +1 555 000</span>
              </>
            ) : (
              <>
                <Mail className="h-3 w-3" />
                <Phone className="h-3 w-3" />
                <Globe className="h-3 w-3" />
              </>
            )}
          </div>
          <div className="mt-2 flex justify-center gap-3 opacity-50">
            <Linkedin className={isLg ? "h-3.5 w-3.5" : "h-3 w-3"} />
            <Twitter className={isLg ? "h-3.5 w-3.5" : "h-3 w-3"} />
            <Instagram className={isLg ? "h-3.5 w-3.5" : "h-3 w-3"} />
          </div>
          <QrBlock center />
        </div>
      </div>
    );
  }

  // ── Modern ───────────────────────────────────────────────────────────────
  if (layout === "modern") {
    return (
      <div
        style={cardStyle}
        className={`w-full ${maxW} rounded-2xl shadow-xl overflow-hidden border`}
        role="img"
        aria-label="Card preview"
      >
        <div className={`flex items-center gap-3 ${isLg ? "p-6" : "p-4"}`}>
          <div
            style={accentBgStyle}
            className={`${isLg ? "h-16 w-16" : "h-12 w-12"} shrink-0 rounded-xl flex items-center justify-center font-bold text-white shadow`}
          >
            <span className={isLg ? "text-base" : "text-sm"}>{initials}</span>
          </div>
          <div className="min-w-0">
            <p className={`${isLg ? "text-sm" : "text-xs"} font-semibold truncate`}>{sampleName}</p>
            <p style={accentStyle} className="text-xs font-medium mt-0.5 truncate">
              {sampleTitle}
            </p>
            <p className="text-xs opacity-60 mt-0.5 truncate">{sampleCompany}</p>
          </div>
        </div>
        <div style={{ borderColor: accentColor + "30" }} className="border-t mx-4" />
        <div className={`${isLg ? "px-6 py-4" : "px-4 py-3"} space-y-1.5 opacity-70`}>
          {[
            { icon: Mail, label: "alex@acme.com" },
            { icon: Phone, label: "+1 555 000 1234" },
            { icon: Globe, label: "acmecorp.com" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <Icon className="h-3 w-3 shrink-0" style={accentStyle} />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>
        <div className={`${isLg ? "px-6 pb-5" : "px-4 pb-3"}`}>
          <QrBlock />
        </div>
      </div>
    );
  }

  // ── Minimal ──────────────────────────────────────────────────────────────
  if (layout === "minimal") {
    return (
      <div
        style={cardStyle}
        className={`w-full ${maxW} rounded-2xl shadow-xl overflow-hidden border ${isLg ? "p-7" : "p-5"}`}
        role="img"
        aria-label="Card preview"
      >
        <div style={accentBgStyle} className="h-1 w-8 rounded-full mb-4" />
        <p className={`${isLg ? "text-lg" : "text-sm"} font-semibold`}>{sampleName}</p>
        <p style={accentStyle} className="text-xs font-medium mt-1">
          {sampleTitle} — {sampleCompany}
        </p>
        <div className="mt-4 space-y-1.5 opacity-60">
          {[
            { icon: Mail, label: "alex@acme.com" },
            { icon: Phone, label: "+1 555 000 1234" },
            { icon: Globe, label: "acmecorp.com" },
          ].slice(0, isLg ? 3 : 2).map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <Icon className="h-3 w-3 shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-3 opacity-50">
          <Linkedin className="h-3.5 w-3.5" />
          <Twitter className="h-3.5 w-3.5" />
          <Instagram className="h-3.5 w-3.5" />
        </div>
        <div
          style={{ borderColor: accentColor + "25" }}
          className="border-t mt-3 pt-2 flex items-end justify-between"
        >
          <span className="text-[9px] opacity-30">mydigitalcard.app</span>
          <div
            className="rounded-lg p-1"
            style={{ backgroundColor: "#ffffff", border: `1px solid ${accentColor}22` }}
          >
            <QRCodeSVG
              value={sampleUrl}
              size={qrSize}
              fgColor={
                textColor === "#fafaf9" || textColor === "#fef3c7"
                  ? "#1a1a1a"
                  : textColor
              }
              bgColor="transparent"
              level="M"
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Bold ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ color: textColor, fontFamily: FONT_FAMILY_CSS[fontFamily] }}
      className={`w-full ${maxW} rounded-2xl shadow-xl overflow-hidden`}
      role="img"
      aria-label="Card preview"
    >
      {/* Header band — accent color */}
      <div style={accentBgStyle} className={`${isLg ? "p-6 pb-5" : "p-4 pb-4"}`}>
        <div
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          className={`${isLg ? "h-14 w-14" : "h-11 w-11"} rounded-2xl flex items-center justify-center font-bold text-white mb-3`}
        >
          <span className={isLg ? "text-base" : "text-sm"}>{initials}</span>
        </div>
        <p className={`${isLg ? "text-base" : "text-sm"} font-bold text-white`}>{sampleName}</p>
        <p className="text-xs text-white/80 mt-0.5">{sampleTitle}</p>
        <p className="text-xs text-white/60 mt-0.5">{sampleCompany}</p>
      </div>
      {/* Info band — card background */}
      <div style={{ backgroundColor }} className={`${isLg ? "px-6 py-4" : "px-4 py-3"}`}>
        <div className="space-y-1.5">
          {[
            { icon: Mail, label: "alex@acme.com" },
            { icon: Phone, label: "+1 555 000 1234" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ color: textColor }} className="flex items-center gap-2 text-xs opacity-70">
              <Icon className="h-3 w-3 shrink-0" style={accentStyle} />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-end justify-between mt-3">
          <div className="flex gap-3 opacity-50">
            <Linkedin style={{ color: textColor }} className="h-3.5 w-3.5" />
            <Twitter style={{ color: textColor }} className="h-3.5 w-3.5" />
          </div>
          <div
            className="rounded-lg p-1 shadow-sm"
            style={{ backgroundColor: "#ffffff", border: `1px solid ${accentColor}33` }}
          >
            <QRCodeSVG
              value={sampleUrl}
              size={qrSize}
              fgColor={
                textColor === "#ffffff" || textColor === "#fafaf9"
                  ? "#1a1a1a"
                  : textColor
              }
              bgColor="transparent"
              level="M"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
