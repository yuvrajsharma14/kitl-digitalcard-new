"use client";

import { TemplateConfig, FONT_FAMILY_CSS } from "@/lib/types/template";
import { Globe, Mail, Phone, Linkedin, Twitter, Instagram } from "lucide-react";

interface CardPreviewProps {
  config: TemplateConfig;
  sampleName?: string;
  sampleTitle?: string;
  sampleCompany?: string;
}

export function CardPreview({
  config,
  sampleName = "Alex Johnson",
  sampleTitle = "Product Designer",
  sampleCompany = "Acme Corp",
}: CardPreviewProps) {
  const { layout, backgroundColor, textColor, accentColor, fontFamily } = config;

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

  if (layout === "classic") {
    return (
      <div
        style={cardStyle}
        className="w-full max-w-[280px] rounded-2xl shadow-xl overflow-hidden border"
        role="img"
        aria-label="Card preview"
      >
        {/* Header band */}
        <div style={accentBgStyle} className="h-16 w-full" />
        {/* Avatar */}
        <div className="flex justify-center -mt-8">
          <div
            style={{ ...accentBorderStyle, backgroundColor }}
            className="h-16 w-16 rounded-full border-4 flex items-center justify-center text-lg font-bold shadow"
          >
            <span style={accentStyle}>{initials}</span>
          </div>
        </div>
        {/* Info */}
        <div className="px-6 pt-3 pb-6 text-center">
          <p className="text-base font-semibold">{sampleName}</p>
          <p style={accentStyle} className="text-xs font-medium mt-0.5">
            {sampleTitle}
          </p>
          <p className="text-xs opacity-60 mt-0.5">{sampleCompany}</p>
          <div className="mt-4 flex justify-center gap-3 opacity-70">
            <Mail className="h-3.5 w-3.5" />
            <Phone className="h-3.5 w-3.5" />
            <Globe className="h-3.5 w-3.5" />
          </div>
          <div className="mt-2 flex justify-center gap-3 opacity-50">
            <Linkedin className="h-3 w-3" />
            <Twitter className="h-3 w-3" />
            <Instagram className="h-3 w-3" />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "modern") {
    return (
      <div
        style={cardStyle}
        className="w-full max-w-[280px] rounded-2xl shadow-xl overflow-hidden border"
        role="img"
        aria-label="Card preview"
      >
        <div className="flex items-center gap-4 p-5">
          <div
            style={{ ...accentBgStyle }}
            className="h-16 w-16 shrink-0 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{sampleName}</p>
            <p style={accentStyle} className="text-xs font-medium mt-0.5 truncate">
              {sampleTitle}
            </p>
            <p className="text-xs opacity-60 mt-0.5 truncate">{sampleCompany}</p>
          </div>
        </div>
        <div style={{ borderColor: accentColor + "30" }} className="border-t mx-5" />
        <div className="px-5 py-4 space-y-2 opacity-70">
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
      </div>
    );
  }

  if (layout === "minimal") {
    return (
      <div
        style={cardStyle}
        className="w-full max-w-[280px] rounded-2xl shadow-xl overflow-hidden border p-6"
        role="img"
        aria-label="Card preview"
      >
        <div
          style={accentBgStyle}
          className="h-1 w-8 rounded-full mb-5"
        />
        <p className="text-lg font-semibold">{sampleName}</p>
        <p style={accentStyle} className="text-xs font-medium mt-1">
          {sampleTitle} — {sampleCompany}
        </p>
        <div className="mt-5 space-y-1.5 opacity-60">
          {[
            { icon: Mail, label: "alex@acme.com" },
            { icon: Phone, label: "+1 555 000 1234" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <Icon className="h-3 w-3 shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3 opacity-50">
          <Linkedin className="h-3.5 w-3.5" />
          <Twitter className="h-3.5 w-3.5" />
          <Instagram className="h-3.5 w-3.5" />
        </div>
      </div>
    );
  }

  // bold
  return (
    <div
      style={{ ...cardStyle, backgroundColor: accentColor }}
      className="w-full max-w-[280px] rounded-2xl shadow-xl overflow-hidden"
      role="img"
      aria-label="Card preview"
    >
      <div className="p-6 pb-4">
        <div
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          className="h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white mb-4"
        >
          {initials}
        </div>
        <p className="text-base font-bold text-white">{sampleName}</p>
        <p className="text-xs text-white/80 mt-0.5">{sampleTitle}</p>
        <p className="text-xs text-white/60 mt-0.5">{sampleCompany}</p>
      </div>
      <div style={{ backgroundColor }} className="px-6 py-4 space-y-1.5">
        {[
          { icon: Mail, label: "alex@acme.com" },
          { icon: Phone, label: "+1 555 000 1234" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} style={{ color: textColor }} className="flex items-center gap-2 text-xs opacity-70">
            <Icon className="h-3 w-3 shrink-0" style={accentStyle} />
            <span>{label}</span>
          </div>
        ))}
        <div className="flex gap-3 pt-1 opacity-50">
          <Linkedin style={{ color: textColor }} className="h-3.5 w-3.5" />
          <Twitter style={{ color: textColor }} className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
