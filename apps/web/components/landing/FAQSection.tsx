"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/lib/landing/faqs";

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
