"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CardPreview } from "@/components/admin/CardPreview";
import { DEFAULT_TEMPLATE_CONFIG } from "@/lib/types/template";
import type { CardLayout, TemplateConfig } from "@/lib/types/template";

const SAMPLE = {
  name:    "Alex Johnson",
  title:   "Product Designer",
  company: "Studio Craft",
  tagline: "Creating digital experiences that matter",
  email:   "alex@studiocraft.co",
  phone:   "+1 (555) 234-5678",
  website: "studiocraft.co",
};

const TEMPLATES: { label: string; layout: CardLayout; bg: string; text: string; accent: string }[] = [
  { label: "Classic",    layout: "classic",   bg: "#ffffff", text: "#1a1a2e", accent: "#6366f1" },
  { label: "Modern",     layout: "modern",    bg: "#0f172a", text: "#f1f5f9", accent: "#38bdf8" },
  { label: "Minimal",    layout: "minimal",   bg: "#fafafa", text: "#111827", accent: "#374151" },
  { label: "Bold",       layout: "bold",      bg: "#1e1b4b", text: "#ffffff", accent: "#a78bfa" },
  { label: "Elegant",    layout: "elegant",   bg: "#fffbf5", text: "#1c1917", accent: "#b45309" },
  { label: "Sharp",      layout: "sharp",     bg: "#ffffff", text: "#111827", accent: "#ef4444" },
  { label: "Profile",    layout: "profile",   bg: "#f0fdf4", text: "#14532d", accent: "#16a34a" },
  { label: "Side Panel", layout: "sidepanel", bg: "#ffffff", text: "#1e293b", accent: "#0ea5e9" },
];

export function TemplateShowcase() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(i => (i === 0 ? TEMPLATES.length - 1 : i - 1));
  const next = () => setCurrent(i => (i === TEMPLATES.length - 1 ? 0 : i + 1));

  const tpl = TEMPLATES[current];
  const config: TemplateConfig = {
    ...DEFAULT_TEMPLATE_CONFIG,
    layout:          tpl.layout,
    backgroundColor: tpl.bg,
    textColor:       tpl.text,
    accentColor:     tpl.accent,
  };

  return (
    <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">

      {/* Template list — left on desktop, dots on mobile */}
      <div className="hidden lg:flex lg:flex-col lg:gap-2 lg:shrink-0">
        {TEMPLATES.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setCurrent(i)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
              i === current
                ? "bg-indigo-50 border border-indigo-200"
                : "hover:bg-gray-50 border border-transparent"
            }`}
          >
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: t.accent }}
            />
            <span className={`text-sm font-medium ${i === current ? "text-indigo-700" : "text-gray-600"}`}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* Card preview — centre */}
      <div className="flex flex-1 flex-col items-center gap-6">
        {/* Phone frame */}
        <div className="relative w-72">
          {/* Glow */}
          <div
            className="absolute inset-0 rounded-3xl blur-2xl scale-105 opacity-20 transition-colors duration-300"
            style={{ backgroundColor: tpl.accent }}
          />
          <div className="relative rounded-[2.5rem] border-[7px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden">
            <div className="flex justify-center pt-3 pb-2 bg-gray-800">
              <div className="h-1.5 w-16 rounded-full bg-gray-700" />
            </div>
            <div className="overflow-hidden" style={{ minHeight: 360, pointerEvents: "none" }}>
              <CardPreview
                config={config}
                staticFace="front"
                size="sm"
                sampleName={SAMPLE.name}
                sampleTitle={SAMPLE.title}
                sampleCompany={SAMPLE.company}
                sampleTagline={SAMPLE.tagline}
                sampleEmail={SAMPLE.email}
                samplePhone={SAMPLE.phone}
                sampleWebsite={SAMPLE.website}
                hideIfNoAvatar
                hideEmptyFields
              />
            </div>
          </div>
        </div>

        {/* Label + nav */}
        <div className="flex items-center gap-5">
          <button
            onClick={prev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>

          <div className="text-center min-w-[120px]">
            <p className="text-base font-semibold text-gray-900">{tpl.label}</p>
            <p className="text-xs text-gray-400">{current + 1} of {TEMPLATES.length}</p>
          </div>

          <button
            onClick={next}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Mobile dots */}
        <div className="flex gap-2 lg:hidden">
          {TEMPLATES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-200 ${
                i === current ? "w-6 bg-indigo-600" : "w-2 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right side text */}
      <div className="lg:shrink-0 lg:max-w-xs text-center lg:text-left">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-3">Templates</p>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          8 designs to match your style
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Every template is fully free. Switch between them any time — your data stays, only the look changes.
        </p>
        <ul className="space-y-2 text-sm text-gray-600 text-left">
          {["All templates free", "Switch any time", "Custom colours", "Works on any device"].map(f => (
            <li key={f} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
