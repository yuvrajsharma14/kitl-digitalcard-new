import type { Metadata } from "next";
import Link from "next/link";
import {
  QrCode, Share2, Smartphone, Zap, RefreshCw, Globe,
  BarChart2, Shield, Star, Check, ArrowRight,
  Mail, Phone, Linkedin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "My Digital Card — Free Digital Business Cards",
  description:
    "Create your free digital business card in minutes. Share via QR code, link, or NFC. Always up to date. No paper, no waste.",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Zap,
    title: "Create in minutes",
    desc: "Fill in your details, pick a template, and your card is live instantly. No design skills needed.",
  },
  {
    icon: QrCode,
    title: "Share via QR code",
    desc: "Every card gets a unique QR code. People scan it and your contact lands straight in their phone.",
  },
  {
    icon: RefreshCw,
    title: "Always up to date",
    desc: "Update your number, title, or links anytime. Everyone with your card link sees the change instantly.",
  },
  {
    icon: Globe,
    title: "Works everywhere",
    desc: "Your card lives on the web — no app required for recipients. Share a link or QR code with anyone.",
  },
  {
    icon: BarChart2,
    title: "See who's viewing",
    desc: "Built-in analytics show how many people viewed your card and clicked your contact links.",
  },
  {
    icon: Shield,
    title: "100% free, forever",
    desc: "No credit card required. No hidden fees. Create and share as many cards as you need at no cost.",
  },
];

const STEPS = [
  { step: "01", title: "Sign up free", desc: "Create your account in seconds — no credit card required." },
  { step: "02", title: "Build your card", desc: "Add your name, contact info, socials, and pick a template." },
  { step: "03", title: "Share it", desc: "Copy your link or show your QR code — anyone can view it instantly." },
];

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
];

const SAMPLE_CARD = {
  name: "Alex Johnson",
  title: "Product Designer",
  company: "Studio Craft",
  email: "alex@studiocraft.co",
  phone: "+1 (555) 234-5678",
  linkedin: "linkedin.com/in/alexj",
};

// ─── Components ───────────────────────────────────────────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <QrCode className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">My Digital Card</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-500 sm:flex">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-white to-white pt-20 pb-24 sm:pt-28 sm:pb-32">
          {/* Background blobs */}
          <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-100/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-40 h-[400px] w-[400px] rounded-full bg-violet-100/40 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-xs font-semibold text-indigo-700 tracking-wide uppercase">100% Free · No credit card</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl leading-[1.08]">
                Your business card,{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  always in your pocket
                </span>
              </h1>

              <p className="mt-6 text-lg text-gray-500 sm:text-xl max-w-2xl mx-auto leading-relaxed">
                Create a stunning digital business card in minutes. Share via QR code or link.
                Update it anytime — everyone gets your latest info, automatically.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/signup"
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-[0.98]"
                >
                  Create your free card
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  See how it works
                </a>
              </div>

              <p className="mt-5 text-xs text-gray-400">
                Free forever · No design skills needed · Works on any device
              </p>
            </div>

            {/* Hero card mockup */}
            <div className="mt-16 flex justify-center">
              <div className="relative">
                {/* Glow */}
                <div className="absolute inset-0 rounded-3xl bg-indigo-400/20 blur-2xl scale-110" />

                {/* Phone frame */}
                <div className="relative mx-auto w-72 sm:w-80">
                  <div className="rounded-[2.5rem] border-[7px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden">
                    {/* Phone notch */}
                    <div className="flex justify-center pt-3 pb-2 bg-gray-800">
                      <div className="h-1.5 w-16 rounded-full bg-gray-700" />
                    </div>
                    {/* Screen */}
                    <div className="bg-gradient-to-b from-slate-50 to-white min-h-[420px] pb-6">
                      {/* Mini browser bar */}
                      <div className="flex items-center gap-2 bg-white/80 border-b border-gray-100 px-3 py-2 mx-2 mt-1 rounded-t-xl">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 rounded-full bg-red-400" />
                          <div className="h-2 w-2 rounded-full bg-amber-400" />
                          <div className="h-2 w-2 rounded-full bg-green-400" />
                        </div>
                        <div className="flex-1 rounded-md bg-gray-100 px-2 py-0.5 text-[8px] text-gray-400 text-center">
                          mydigitalcard.app/u/alex
                        </div>
                      </div>

                      {/* Card content */}
                      <div className="px-3 pt-4 space-y-3">
                        {/* Top gradient bar */}
                        <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />

                        {/* Avatar + name */}
                        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-white">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                            AJ
                          </div>
                          <div>
                            <p className="text-sm font-bold">{SAMPLE_CARD.name}</p>
                            <p className="text-[10px] text-white/80">{SAMPLE_CARD.title}</p>
                            <p className="text-[10px] text-white/60">{SAMPLE_CARD.company}</p>
                          </div>
                        </div>

                        {/* Contact rows */}
                        {[
                          { Icon: Mail,     val: SAMPLE_CARD.email },
                          { Icon: Phone,    val: SAMPLE_CARD.phone },
                          { Icon: Linkedin, val: SAMPLE_CARD.linkedin },
                        ].map(({ Icon, val }) => (
                          <div key={val} className="flex items-center gap-2.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-100">
                              <Icon className="h-3 w-3 text-indigo-600" />
                            </div>
                            <p className="text-[10px] text-gray-600 truncate">{val}</p>
                          </div>
                        ))}

                        {/* Save contact button */}
                        <button className="w-full rounded-lg bg-indigo-600 py-2 text-[11px] font-semibold text-white">
                          Save Contact
                        </button>

                        {/* QR row */}
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <QrCode className="h-8 w-8 text-indigo-300" />
                          <p className="text-[9px] text-gray-400">Scan to save contact</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -left-10 top-20 hidden sm:flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
                  <Share2 className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-gray-700">Shared via QR</span>
                </div>
                <div className="absolute -right-12 bottom-24 hidden sm:flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-xs font-semibold text-gray-700">42 views today</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Social proof bar ── */}
        <section className="border-y border-gray-100 bg-gray-50/50 py-6">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-gray-400">
              <span className="font-semibold text-gray-600">Loved by professionals at</span>
              {["Startups", "Freelancers", "Sales Teams", "Recruiters", "Consultants"].map((label) => (
                <span key={label} className="font-medium text-gray-500">{label}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-3">Features</p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need, nothing you don&apos;t
              </h2>
              <p className="mt-4 text-gray-500 text-lg">
                Built for people who want to make great first impressions without the hassle.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="bg-gradient-to-b from-gray-50 to-white py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-3">How it works</p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Up and running in 3 steps
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {STEPS.map(({ step, title, desc }, i) => (
                <div key={step} className="relative flex flex-col items-center text-center">
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="absolute left-[calc(50%+3rem)] top-8 hidden h-0.5 w-[calc(100%-6rem)] bg-indigo-100 sm:block" />
                  )}
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                    <span className="text-xl font-bold">{step}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="testimonials" className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-3">Testimonials</p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                People love going paperless
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {TESTIMONIALS.map(({ name, role, company, avatar, color, text, rating }) => (
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
          </div>
        </section>

        {/* ── Pricing — it's free ── */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-3">Pricing</p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Simple pricing — it&apos;s free
              </h2>
              <p className="mt-4 text-gray-500 text-lg">No plans. No tiers. No limits. Everything is free, forever.</p>
            </div>

            <div className="mx-auto max-w-md">
              <div className="rounded-3xl border-2 border-indigo-200 bg-white p-8 shadow-xl shadow-indigo-50 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Free forever</span>
                </div>
                <div className="text-6xl font-extrabold text-gray-900 mb-1">$0</div>
                <p className="text-gray-400 text-sm mb-8">No credit card. No catch.</p>
                <ul className="space-y-3 text-left mb-8">
                  {[
                    "Unlimited digital cards",
                    "QR code for every card",
                    "Shareable link",
                    "Analytics & view tracking",
                    "All templates included",
                    "vCard (.vcf) download",
                    "Social links",
                    "Mobile app (coming soon)",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="block w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors text-center"
                >
                  Create your free card
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Mobile app ── */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-14 sm:px-14 overflow-hidden relative">
              {/* Background decoration */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
              <div className="pointer-events-none absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-white/5" />

              <div className="relative flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="h-5 w-5 text-indigo-200" />
                    <span className="text-sm font-semibold text-indigo-200 uppercase tracking-wider">Mobile App</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white sm:text-4xl">
                    Take your card everywhere
                  </h2>
                  <p className="mt-4 text-indigo-100 text-base leading-relaxed">
                    The My Digital Card mobile app is coming soon to iOS and Android.
                    Get notified the moment it launches — free on both stores.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {/* App Store button */}
                    <span
                      className="flex items-center gap-3 rounded-xl bg-black/30 border border-white/20 px-5 py-3 cursor-not-allowed select-none"
                      title="Coming soon"
                    >
                      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <div>
                        <p className="text-[10px] text-white/70 leading-none mb-0.5">Coming soon to</p>
                        <p className="text-sm font-semibold text-white leading-none">App Store</p>
                      </div>
                    </span>

                    {/* Play Store button */}
                    <span
                      className="flex items-center gap-3 rounded-xl bg-black/30 border border-white/20 px-5 py-3 cursor-not-allowed select-none"
                      title="Coming soon"
                    >
                      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.18 23.76c.3.16.64.2.97.12l12.45-12.43L13 8l-9.82 15.76zM20.54 10.61l-2.54-1.47-3.35 3.35 3.35 3.35 2.56-1.48c.73-.43.73-1.51-.02-2.75zM2.11.27C1.8.44 1.6.78 1.6 1.22v21.56c0 .44.2.78.51.95L14.27 12 2.11.27zM16.63 1.66L4.18.18l9.86 9.86 2.59-2.59-3.07-1.77c.73-1.24.73-2.32.07-2.75z"/>
                      </svg>
                      <div>
                        <p className="text-[10px] text-white/70 leading-none mb-0.5">Coming soon to</p>
                        <p className="text-sm font-semibold text-white leading-none">Google Play</p>
                      </div>
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-indigo-200/70">
                    Sign up now and you&apos;ll be among the first to know when the app is ready.
                  </p>
                </div>

                {/* Phone illustration */}
                <div className="shrink-0 self-end sm:self-auto">
                  <div className="relative mx-auto w-40">
                    <div className="rounded-[2rem] border-[5px] border-white/20 bg-white/10 shadow-2xl overflow-hidden backdrop-blur-sm">
                      <div className="flex justify-center py-2 bg-white/5">
                        <div className="h-1 w-10 rounded-full bg-white/30" />
                      </div>
                      <div className="bg-indigo-700/50 h-64 flex flex-col items-center justify-center gap-3 px-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                          <QrCode className="h-7 w-7 text-white" />
                        </div>
                        <p className="text-center text-xs font-semibold text-white/90">My Digital Card</p>
                        <div className="w-full rounded-lg bg-white/10 px-3 py-2 text-center">
                          <p className="text-[10px] text-white/70">App coming soon</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="bg-gradient-to-b from-indigo-50/60 to-white py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Ready to go paperless?
            </h2>
            <p className="mt-5 text-lg text-gray-500">
              Join thousands of professionals who have ditched physical business cards.
              Create yours in minutes — it&apos;s completely free.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98]"
              >
                Create your free card
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Already have an account? Sign in →
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                <QrCode className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800">My Digital Card</span>
            </Link>

            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
              <a href="#features" className="hover:text-gray-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-gray-600 transition-colors">How it works</a>
              <a href="#testimonials" className="hover:text-gray-600 transition-colors">Reviews</a>
              <Link href="/login" className="hover:text-gray-600 transition-colors">Sign in</Link>
              <Link href="/signup" className="hover:text-gray-600 transition-colors">Sign up</Link>
            </nav>

            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} My Digital Card · Free forever
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
