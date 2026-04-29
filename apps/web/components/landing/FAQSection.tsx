"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Is My Digital Card really free?",
    a: "Yes — completely free, forever. No credit card required, no trial period, no hidden fees. Create as many cards as you need and share them with anyone at no cost.",
  },
  {
    q: "Do my contacts need to download an app to view my card?",
    a: "No app needed. Your card lives on the web — anyone can open it instantly from any phone, tablet, or computer just by scanning your QR code or clicking your link.",
  },
  {
    q: "Can I update my card after I've shared it?",
    a: "Yes, and that's one of the biggest advantages. Update your phone number, job title, company, or any detail at any time. Everyone who has your link or QR code will automatically see the latest version.",
  },
  {
    q: "How do people save my contact details to their phone?",
    a: "Your card page has a 'Save Contact' button that downloads a vCard (.vcf) file. Tapping it adds your full contact info directly to their phone's contacts app — no manual typing needed.",
  },
  {
    q: "Can I have more than one card?",
    a: "Yes. You can create multiple cards — one for your main job, one for a side project, one for freelance work, and so on. Each gets its own unique link and QR code.",
  },
  {
    q: "What information can I put on my card?",
    a: "Name, job title, company, bio, email, phone, website, and social links (LinkedIn, Twitter/X, Instagram, Facebook, GitHub, YouTube, TikTok). You can show or hide any field.",
  },
  {
    q: "Can I see who viewed my card?",
    a: "Yes. Your dashboard shows total views, clicks, and a 30-day view chart per card — so you can see how much engagement your card is getting.",
  },
  {
    q: "Is there a mobile app?",
    a: "A native iOS and Android app is coming soon. For now, the web app works great on mobile browsers — you can add it to your home screen for an app-like experience.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-gray-100">
      {FAQS.map(({ q, a }, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 py-5 text-left"
          >
            <span className="text-base font-medium text-gray-900">{q}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                open === i ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              open === i ? "max-h-40 pb-5" : "max-h-0"
            }`}
          >
            <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
