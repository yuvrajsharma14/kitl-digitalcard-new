"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { CardPreview } from "@/components/admin/CardPreview";
import type { TemplateConfig } from "@/lib/types/template";

// CardPreview size="lg" natural width in px
const CARD_WIDTH = 370;

interface SocialLinkItem { platform: string; url: string }

interface Props {
  config:       TemplateConfig;
  displayName:  string;
  jobTitle?:    string | null;
  company?:     string | null;
  avatarUrl?:   string | null;
  email?:       string | null;
  phone?:       string | null;
  website?:     string | null;
  socialLinks?: SocialLinkItem[];
  slug:         string;
}

export function CardPreviewTile({
  config, displayName, jobTitle, company, avatarUrl,
  email, phone, website, socialLinks = [], slug,
}: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const [scale,           setScale]           = useState(1);
  const [containerHeight, setContainerHeight] = useState(220);
  const [ready,           setReady]           = useState(false);
  const [face,            setFace]            = useState<"front" | "back">("front");

  const recalc = useCallback(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    // 1. Reset transform so we can measure the card's natural height
    inner.style.transform       = "none";
    inner.style.transformOrigin = "top left";

    const naturalH = inner.offsetHeight;
    const outerW   = outer.offsetWidth;
    const newScale = outerW / CARD_WIDTH;

    // 2. Apply the fill-width scale
    inner.style.transform = `scale(${newScale})`;

    // 3. The outer container must be exactly (naturalHeight × scale) tall
    setScale(newScale);
    setContainerHeight(Math.ceil(naturalH * newScale));
    setReady(true);
  }, []);

  // Initial mount + container resize
  useEffect(() => {
    recalc();
    const ro = new ResizeObserver(recalc);
    if (outerRef.current) ro.observe(outerRef.current);
    return () => ro.disconnect();
  }, [recalc]);

  // Re-measure whenever the face changes (front vs back have different heights)
  useEffect(() => {
    setReady(false);
    // Let the new face render first, then measure
    const t = requestAnimationFrame(() => recalc());
    return () => cancelAnimationFrame(t);
  }, [face, recalc]);

  const byPlatform = Object.fromEntries(
    socialLinks.map((s) => [s.platform.toLowerCase(), s.url])
  );

  return (
    <div className="w-full">
      {/* Scaled card */}
      <div
        ref={outerRef}
        className="w-full overflow-hidden bg-gray-50"
        style={{ height: containerHeight }}
      >
        <div
          ref={innerRef}
          style={{
            width:           CARD_WIDTH,
            transformOrigin: "top left",
            transform:       `scale(${scale})`,
            opacity:         ready ? 1 : 0,
            transition:      "opacity 0.15s",
          }}
        >
          <CardPreview
            config={config}
            size="lg"
            staticFace={face}
            hideEmptyFields
            hideIfNoAvatar={!avatarUrl}
            sampleName={displayName}
            sampleTitle={jobTitle     ?? undefined}
            sampleCompany={company    ?? undefined}
            sampleAvatar={avatarUrl   ?? null}
            sampleEmail={email        ?? undefined}
            samplePhone={phone        ?? undefined}
            sampleWebsite={website    ?? undefined}
            sampleLinkedin={byPlatform["linkedin"]}
            sampleFacebook={byPlatform["facebook"]}
            sampleInstagram={byPlatform["instagram"]}
            sampleTwitter={byPlatform["twitter"]}
            sampleUrl={`/u/${slug}`}
          />
        </div>
      </div>

      {/* Front / Back toggle */}
      <div className="flex justify-center py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center gap-0.5 rounded-full bg-gray-200/70 p-0.5">
          {(["front", "back"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFace(f)}
              className={`px-3.5 py-1 rounded-full text-[11px] font-medium transition-all capitalize ${
                face === f
                  ? "bg-white shadow-sm text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
