"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "Marketing Director",
    company: "BrightPath Agency",
    avatar: "SM",
    color: "bg-violet-500",
    text: "I used to hand out 500 business cards a year. Now I just show my QR code. Everyone asks where I got it.",
    rating: 5,
  },
  {
    name: "James Okoye",
    role: "Freelance Developer",
    company: "Self-employed",
    avatar: "JO",
    color: "bg-blue-500",
    text: "Updated my phone number and every client automatically had the new one. That alone is worth switching.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Sales Manager",
    company: "NovaTech Solutions",
    avatar: "PS",
    color: "bg-emerald-500",
    text: "My whole sales team uses My Digital Card now. The analytics are surprisingly useful for follow-ups.",
    rating: 5,
  },
  {
    name: "Daniel Fernandez",
    role: "Real Estate Agent",
    company: "Fernandez Properties",
    avatar: "DF",
    color: "bg-orange-500",
    text: "I meet dozens of new people every week at open houses. One QR code scan and they have all my details. It's seamless.",
    rating: 5,
  },
  {
    name: "Ayesha Noor",
    role: "UX Designer",
    company: "Pixel Studio",
    avatar: "AN",
    color: "bg-pink-500",
    text: "As a designer I'm picky about how I present myself. The templates are clean and professional — exactly what I needed.",
    rating: 5,
  },
  {
    name: "Tom Brennan",
    role: "Startup Founder",
    company: "LaunchPad HQ",
    avatar: "TB",
    color: "bg-cyan-500",
    text: "Handed out 200 paper cards at a conference and got maybe 10 follow-ups. Switched to digital — the difference is night and day.",
    rating: 5,
  },
  {
    name: "Mei Lin",
    role: "HR Business Partner",
    company: "CoreTalent Group",
    avatar: "ML",
    color: "bg-teal-500",
    text: "We rolled this out across our recruiting team. Candidates are always impressed — it sets a modern tone from the first interaction.",
    rating: 5,
  },
  {
    name: "Raj Patel",
    role: "Financial Advisor",
    company: "Wealth Forward",
    avatar: "RP",
    color: "bg-indigo-500",
    text: "My clients are busy professionals. Having a card they can tap to save straight to their phone removes all friction.",
    rating: 5,
  },
  {
    name: "Claire Dubois",
    role: "Event Photographer",
    company: "Lumière Studio",
    avatar: "CD",
    color: "bg-rose-500",
    text: "I put my QR code on the back of my camera strap. People scan it on the spot and book me before they leave the event.",
    rating: 5,
  },
];

const PER_PAGE = 3;

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function TestimonialsSlider() {
  const totalPages = Math.ceil(TESTIMONIALS.length / PER_PAGE);
  const [page, setPage] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const goTo = useCallback((next: number, dir: "left" | "right") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setPage(next);
      setAnimating(false);
    }, 220);
  }, [animating]);

  const prev = () => goTo(page === 0 ? totalPages - 1 : page - 1, "left");
  const next = () => goTo(page === totalPages - 1 ? 0 : page + 1, "right");

  // Auto-advance every 5 seconds
  useEffect(() => {
    const t = setTimeout(() => goTo(page === totalPages - 1 ? 0 : page + 1, "right"), 5000);
    return () => clearTimeout(t);
  }, [page, totalPages, goTo]);

  const visible = TESTIMONIALS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const slideClass = animating
    ? direction === "right"
      ? "opacity-0 translate-x-4"
      : "opacity-0 -translate-x-4"
    : "opacity-100 translate-x-0";

  return (
    <div className="relative">
      {/* Cards */}
      <div
        className={`grid gap-6 sm:grid-cols-3 transition-all duration-200 ease-in-out ${slideClass}`}
      >
        {visible.map(({ name, role, company, avatar, color, text, rating }) => (
          <div
            key={name}
            className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <StarRating count={rating} />
            <p className="mt-4 flex-1 text-sm text-gray-600 leading-relaxed">
              &ldquo;{text}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3 border-t border-gray-50 pt-5">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} text-xs font-bold text-white`}>
                {avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{name}</p>
                <p className="text-xs text-gray-400">{role} · {company}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-10 flex items-center justify-center gap-4">
        <button
          onClick={prev}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > page ? "right" : "left")}
              className={`h-2 rounded-full transition-all duration-200 ${
                i === page ? "w-6 bg-indigo-600" : "w-2 bg-gray-200 hover:bg-gray-300"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Page counter */}
      <p className="mt-3 text-center text-xs text-gray-400">
        {page + 1} / {totalPages}
      </p>
    </div>
  );
}
