import type { Metadata } from "next";
import Link from "next/link";
import { UserHeader } from "@/components/user/UserHeader";
import { Zap, ScanLine, PenLine, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Create New Card" };

const METHODS = [
  {
    href:        "/card/new/quick",
    icon:        Zap,
    iconBg:      "bg-amber-50",
    iconColor:   "text-amber-500",
    borderHover: "hover:border-amber-300 hover:shadow-amber-100",
    tag:         "Fastest",
    tagColor:    "bg-amber-100 text-amber-700",
    title:       "Quick Card",
    description: "Enter your name, upload a photo and pick a template. Your card is ready in under 60 seconds.",
    cta:         "Start quick card",
    ctaColor:    "text-amber-600",
  },
  {
    href:        "/card/new/scan",
    icon:        ScanLine,
    iconBg:      "bg-blue-50",
    iconColor:   "text-blue-500",
    borderHover: "hover:border-blue-300 hover:shadow-blue-100",
    tag:         "AI Powered",
    tagColor:    "bg-blue-100 text-blue-700",
    title:       "Scan Existing Card",
    description: "Take or upload a photo of your current business card. AI reads it and fills everything for you.",
    cta:         "Upload & scan",
    ctaColor:    "text-blue-600",
  },
  {
    href:        "/card/new/builder",
    icon:        PenLine,
    iconBg:      "bg-indigo-50",
    iconColor:   "text-indigo-500",
    borderHover: "hover:border-indigo-300 hover:shadow-indigo-100",
    tag:         "Full Control",
    tagColor:    "bg-indigo-100 text-indigo-700",
    title:       "Build from Scratch",
    description: "Add all your details step by step — contact info, social links, bio — with a live preview as you type.",
    cta:         "Start building",
    ctaColor:    "text-indigo-600",
  },
  {
    href:        "/card/new/import",
    icon:        Sparkles,
    iconBg:      "bg-purple-50",
    iconColor:   "text-purple-500",
    borderHover: "hover:border-purple-300 hover:shadow-purple-100",
    tag:         "AI Powered",
    tagColor:    "bg-purple-100 text-purple-700",
    title:       "AI Import",
    description: "Paste your LinkedIn bio, email signature or any text about yourself. AI extracts and builds your card.",
    cta:         "Paste & import",
    ctaColor:    "text-purple-600",
  },
];

export default function NewCardPage() {
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <UserHeader title="Create New Card" subtitle="Choose how you'd like to create your digital business card" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">

          {/* Hero blurb */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your digital business card, your way
            </h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Create a beautiful card that you can share via link or QR code — no printing needed.
              Pick the method that works best for you.
            </p>
          </div>

          {/* Method cards grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {METHODS.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className={`group relative flex flex-col rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg ${m.borderHover}`}
                >
                  {/* Tag */}
                  <span className={`absolute top-4 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${m.tagColor}`}>
                    {m.tag}
                  </span>

                  {/* Icon */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${m.iconBg} mb-5`}>
                    <Icon className={`h-6 w-6 ${m.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{m.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{m.description}</p>

                  {/* CTA */}
                  <div className={`flex items-center gap-1 mt-5 text-sm font-medium ${m.ctaColor}`}>
                    {m.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-8">
            All methods create the same card — you can edit every detail afterwards.
          </p>
        </div>
      </main>
    </div>
  );
}
