"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import {
  CheckCircle2, Pencil, Share2, Download, Printer,
  FileText, Globe, Contact, LayoutDashboard, Copy,
  Check, Eye, EyeOff, ExternalLink, Sparkles,
} from "lucide-react";
import { CardPreview } from "@/components/admin/CardPreview";
import { DEFAULT_TEMPLATE_CONFIG } from "@/lib/types/template";
import type { TemplateConfig } from "@/lib/types/template";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  order: number;
}

interface Card {
  id: string;
  slug: string;
  displayName: string;
  jobTitle: string | null;
  company: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  avatarUrl: string | null;
  isPublished: boolean;
  styles: Record<string, unknown> | null;
  socialLinks: SocialLink[];
}

// ─── Action Card ──────────────────────────────────────────────────────────────

function ActionCard({
  icon: Icon,
  label,
  description,
  onClick,
  href,
  variant = "default",
  disabled = false,
  active = false,
  loading = false,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "primary" | "success" | "warning";
  disabled?: boolean;
  active?: boolean;
  loading?: boolean;
}) {
  const variantClasses = {
    default:  "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
    primary:  "border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50",
    success:  "border-green-200 hover:border-green-300 hover:bg-green-50",
    warning:  "border-amber-200 hover:border-amber-300 hover:bg-amber-50",
  };
  const iconClasses = {
    default:  "bg-gray-100 text-gray-600",
    primary:  "bg-indigo-100 text-indigo-600",
    success:  "bg-green-100 text-green-600",
    warning:  "bg-amber-100 text-amber-600",
  };

  const base = (
    <div
      className={`
        flex items-center gap-4 rounded-xl border p-4 transition-all cursor-pointer select-none
        ${variantClasses[variant]}
        ${active ? "ring-2 ring-offset-1 ring-indigo-400" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
      `}
      onClick={!disabled && !href ? onClick : undefined}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClasses[variant]}`}>
        {loading
          ? <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          : <Icon className="h-5 w-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{base}</Link>;
  }
  return base;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardCreatedPage() {
  const params   = useParams<{ id: string }>();
  const cardId   = params.id;

  const [card,        setCard]        = useState<Card | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [publishing,  setPublishing]  = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [pdfLoading,  setPdfLoading]  = useState(false);

  const qrRef      = useRef<HTMLDivElement>(null);
  const cardFront  = useRef<HTMLDivElement>(null);
  const cardBack   = useRef<HTMLDivElement>(null);

  // ── Fetch card ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/v1/cards/${cardId}`)
      .then((r) => r.json())
      .then((data) => setCard(data.card ?? null))
      .finally(() => setLoading(false));
  }, [cardId]);

  // ── Public URL ─────────────────────────────────────────────────────────────
  const publicUrl = card
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/u/${card.slug}`
    : "";

  // ── Toggle publish ─────────────────────────────────────────────────────────
  async function togglePublish() {
    if (!card) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/v1/cards/${card.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: card.displayName,
          jobTitle:    card.jobTitle    ?? undefined,
          company:     card.company     ?? undefined,
          bio:         card.bio         ?? undefined,
          email:       card.email       ?? undefined,
          phone:       card.phone       ?? undefined,
          website:     card.website     ?? undefined,
          avatarUrl:   card.avatarUrl   ?? undefined,
          styles:      card.styles      ?? undefined,
          isPublished: !card.isPublished,
          socialLinks: card.socialLinks.map(({ platform, url, order }) => ({ platform, url, order })),
        }),
      });
      const data = await res.json();
      if (res.ok) setCard(data.card);
    } finally {
      setPublishing(false);
    }
  }

  // ── Copy share link ────────────────────────────────────────────────────────
  async function copyShareLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Download QR ────────────────────────────────────────────────────────────
  function downloadQR() {
    const canvas = qrRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const url  = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${card?.slug ?? "card"}-qr.png`;
    link.href = url;
    link.click();
  }

  // ── Download vCard ─────────────────────────────────────────────────────────
  function downloadVCard() {
    if (!card) return;
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${card.displayName}`,
      card.jobTitle ? `TITLE:${card.jobTitle}` : "",
      card.company  ? `ORG:${card.company}` : "",
      card.email    ? `EMAIL:${card.email}` : "",
      card.phone    ? `TEL:${card.phone}` : "",
      card.website  ? `URL:${card.website}` : "",
      `URL;type=profile:${publicUrl}`,
      "END:VCARD",
    ].filter(Boolean).join("\n");

    const blob = new Blob([lines], { type: "text/vcard" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${card.slug ?? "card"}.vcf`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ── Print card (front only via CSS print) ─────────────────────────────────
  function printCard() {
    const front = cardFront.current;
    if (!front) return;
    const html = `<!DOCTYPE html><html><head><title>${card?.displayName ?? "Card"}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f3f4f6; }
      </style></head><body>${front.innerHTML}</body></html>`;
    const w = window.open("", "_blank", "width=600,height=500");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  }

  // ── Download PDF (front + back as two pages) ───────────────────────────────
  async function downloadPdf() {
    if (!card || !cardFront.current || !cardBack.current) return;
    setPdfLoading(true);
    try {
      const [html2canvas, { jsPDF }] = await Promise.all([
        import("html2canvas").then((m) => m.default),
        import("jspdf"),
      ]);

      // Capture front
      const frontCanvas = await html2canvas(cardFront.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      // Capture back
      const backCanvas = await html2canvas(cardBack.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      // Standard business card ratio: 3.5" x 2" = 252pt x 144pt
      const W = frontCanvas.width  / 3;
      const H = frontCanvas.height / 3;
      const pxToPt = 72 / 96; // CSS px → points
      const ptW = W * pxToPt;
      const ptH = H * pxToPt;

      const pdf = new jsPDF({
        orientation: ptW > ptH ? "landscape" : "portrait",
        unit: "pt",
        format: [ptW, ptH],
      });

      // Page 1: front
      pdf.addImage(frontCanvas.toDataURL("image/png"), "PNG", 0, 0, ptW, ptH);

      // Page 2: back
      pdf.addPage([ptW, ptH], ptW > ptH ? "landscape" : "portrait");
      pdf.addImage(backCanvas.toDataURL("image/png"), "PNG", 0, 0, ptW, ptH);

      pdf.save(`${card.slug ?? "card"}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  }

  // ── CardPreview config ─────────────────────────────────────────────────────
  const config = card?.styles
    ? { ...DEFAULT_TEMPLATE_CONFIG, ...card.styles }
    : DEFAULT_TEMPLATE_CONFIG;

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center p-6">
        <p className="text-gray-500">Card not found.</p>
        <Link href="/dashboard" className="text-indigo-600 text-sm hover:underline">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">

      {/* ── Header ── */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Card Created!</p>
          <p className="text-xs text-gray-500">{card.displayName}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Card Preview ── */}
        <div className="flex w-80 xl:w-96 shrink-0 flex-col items-center justify-start gap-6 border-r border-gray-200 bg-white p-6 overflow-y-auto">

          {/* Success badge */}
          <div className="flex w-full items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
            <Sparkles className="h-4 w-4 text-green-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-green-800">Your card is ready</p>
              <p className="text-xs text-green-600 mt-0.5">
                {card.isPublished ? "Live and shareable" : "Saved as draft — publish to share"}
              </p>
            </div>
          </div>

          {/* Card preview */}
          <div className="w-full">
            <CardPreview
              config={config as Parameters<typeof CardPreview>[0]["config"]}
              size="lg"
              sampleName={card.displayName}
              sampleTitle={card.jobTitle ?? undefined}
              sampleCompany={card.company ?? undefined}
              sampleTagline={card.bio ?? undefined}
              sampleEmail={card.email ?? undefined}
              samplePhone={card.phone ?? undefined}
              sampleWebsite={card.website ?? undefined}
              sampleAvatar={card.avatarUrl}
              hideIfNoAvatar
              hideEmptyFields
              key={card.id}
            />
          </div>

          {/* QR code (hidden canvas for download) */}
          <div ref={qrRef} className="hidden">
            <QRCodeCanvas value={publicUrl} size={256} />
          </div>

          {/* Public URL pill */}
          <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs text-gray-400 mb-1">Public URL</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-gray-700 truncate font-mono">/u/{card.slug}</code>
              <button
                onClick={copyShareLink}
                className="flex items-center gap-1 rounded-md bg-white border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Actions ── */}
        <div className="flex-1 overflow-y-auto p-6">

          <div className="max-w-2xl mx-auto space-y-6">

            {/* Section: Publishing */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Visibility</h2>
              <div className="grid gap-3">

                <div
                  className={`
                    flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all
                    ${card.isPublished
                      ? "border-green-300 bg-green-50 hover:bg-green-100"
                      : "border-gray-200 bg-white hover:bg-gray-50"}
                  `}
                  onClick={togglePublish}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.isPublished ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                    {publishing
                      ? <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      : card.isPublished ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {card.isPublished ? "Published — tap to unpublish" : "Unpublished — tap to publish"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {card.isPublished
                        ? "Anyone with the link can view your card"
                        : "Your card is private and not accessible via link"}
                    </p>
                  </div>
                  <div className={`h-5 w-9 rounded-full transition-colors ${card.isPublished ? "bg-green-500" : "bg-gray-300"} relative`}>
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${card.isPublished ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                </div>

                {card.isPublished && (
                  <ActionCard
                    icon={ExternalLink}
                    label="Open Public Card"
                    description={`/u/${card.slug}`}
                    href={`/u/${card.slug}`}
                    variant="success"
                  />
                )}
              </div>
            </div>

            {/* Section: Share */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Share</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <ActionCard
                  icon={copied ? Check : Share2}
                  label={copied ? "Link Copied!" : "Copy Share Link"}
                  description="Share your card URL with anyone"
                  onClick={copyShareLink}
                  variant="primary"
                />
                <ActionCard
                  icon={Download}
                  label="Download QR Code"
                  description="PNG image — scan to open card"
                  onClick={downloadQR}
                  variant="primary"
                />
              </div>
            </div>

            {/* Section: Save */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Save & Export</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <ActionCard
                  icon={Contact}
                  label="Add to Contacts"
                  description="Download .vcf file for any phone or app"
                  onClick={downloadVCard}
                  variant="default"
                />
                <ActionCard
                  icon={Printer}
                  label="Print Card"
                  description="Sends card front &amp; back to your printer"
                  onClick={printCard}
                  variant="default"
                />
                <ActionCard
                  icon={FileText}
                  label="Download PDF"
                  description="Front &amp; back as a 2-page PDF file"
                  onClick={downloadPdf}
                  loading={pdfLoading}
                  variant="default"
                />
                <ActionCard
                  icon={Globe}
                  label="Embed on Website"
                  description="Coming soon — iframe embed code"
                  onClick={undefined}
                  variant="default"
                  disabled
                />
              </div>
            </div>

            {/* Section: Manage */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Manage</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <ActionCard
                  icon={Pencil}
                  label="Edit Card"
                  description="Update your card details anytime"
                  href={`/card/${card.id}/edit`}
                  variant="default"
                />
                <ActionCard
                  icon={LayoutDashboard}
                  label="Go to Dashboard"
                  description="View all your cards and analytics"
                  href="/dashboard"
                  variant="default"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Hidden card faces for PDF/Print capture — no controls, no 3D ── */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden>
        <div ref={cardFront}>
          <CardPreview
            config={config as TemplateConfig}
            size="lg"
            sampleName={card.displayName}
            sampleTitle={card.jobTitle ?? undefined}
            sampleCompany={card.company ?? undefined}
            sampleTagline={card.bio ?? undefined}
            sampleEmail={card.email ?? undefined}
            samplePhone={card.phone ?? undefined}
            sampleWebsite={card.website ?? undefined}
            sampleAvatar={card.avatarUrl}
            staticFace="front"
            hideIfNoAvatar
            hideEmptyFields
            key={`front-${card.id}`}
          />
        </div>
        <div ref={cardBack}>
          <CardPreview
            config={config as TemplateConfig}
            size="lg"
            sampleName={card.displayName}
            sampleTitle={card.jobTitle ?? undefined}
            sampleCompany={card.company ?? undefined}
            sampleTagline={card.bio ?? undefined}
            sampleEmail={card.email ?? undefined}
            samplePhone={card.phone ?? undefined}
            sampleWebsite={card.website ?? undefined}
            sampleAvatar={card.avatarUrl}
            staticFace="back"
            hideIfNoAvatar
            hideEmptyFields
            key={`back-${card.id}`}
          />
        </div>
      </div>
    </div>
  );
}
