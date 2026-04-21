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

  const qrRef = useRef<HTMLDivElement>(null);

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

  // ── Print card (front + back — generates clean 2-page print HTML) ────────────
  function printCard() {
    if (!card) return;
    const accent = config.accentColor ?? "#2563eb";
    const bg     = config.backgroundColor ?? "#f8fafc";
    const text   = config.textColor ?? "#0f172a";

    // Front body rows
    const rows = [
      card.jobTitle ? `<p style="color:${accent};font-size:13px;margin:2px 0">${card.jobTitle}</p>` : "",
      card.company  ? `<p style="opacity:.65;font-size:12px;margin:2px 0">${card.company}</p>`      : "",
      card.email    ? `<p style="font-size:12px;margin:6px 0 2px">✉ ${card.email}</p>`             : "",
      card.phone    ? `<p style="font-size:12px;margin:2px 0">✆ ${card.phone}</p>`                 : "",
      card.website  ? `<p style="font-size:12px;margin:2px 0">⊕ ${card.website}</p>`              : "",
    ].filter(Boolean).join("");

    const avatar = card.avatarUrl
      ? `<img src="${card.avatarUrl}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;margin-bottom:10px;border:3px solid ${accent}" />`
      : "";

    // QR code data URL from the hidden canvas
    const qrCanvas = qrRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    const qrSrc    = qrCanvas ? qrCanvas.toDataURL("image/png") : "";
    const qrImg    = qrSrc
      ? `<img src="${qrSrc}" style="width:180px;height:180px;display:block;margin:0 auto 12px" />`
      : "";

    const backInfo = [
      card.displayName ? `<h2 style="font-size:18px;font-weight:bold;color:${text};margin:0 0 4px">${card.displayName}</h2>` : "",
      card.jobTitle    ? `<p style="font-size:13px;color:${accent};margin:0 0 2px">${card.jobTitle}</p>` : "",
      card.company     ? `<p style="font-size:12px;color:${text};opacity:.7;margin:0">${card.company}</p>` : "",
    ].filter(Boolean).join("");

    const html = `<!DOCTYPE html><html><head><title>${card.displayName}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:sans-serif; background:#f3f4f6; }
        .page { display:flex; align-items:center; justify-content:center; min-height:100vh; }
        @media print { .page { page-break-after: always; min-height:100vh; } }
        .card { background:${bg}; color:${text}; width:340px; border-radius:16px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,.15); }
        .band { background:${accent}; padding:20px 20px 14px; text-align:center; color:#fff; }
        .body { padding:18px 20px; }
        .back-body { padding:24px 20px; text-align:center; }
        .scan-label { font-size:10px; letter-spacing:.12em; color:#aaa; margin-bottom:16px; }
        .divider { width:40px; height:2px; background:${accent}; margin:12px auto; border-radius:1px; }
        .watermark { font-size:10px; color:#bbb; margin-top:14px; }
      </style></head>
      <body>
        <!-- FRONT -->
        <div class="page">
          <div class="card">
            <div class="band">${avatar}<h2 style="font-size:17px">${card.displayName}</h2></div>
            <div class="body">${rows}</div>
          </div>
        </div>
        <!-- BACK -->
        <div class="page">
          <div class="card">
            <div class="back-body">
              <p class="scan-label">SCAN TO CONNECT</p>
              ${qrImg}
              <div class="divider"></div>
              ${backInfo}
              <p class="watermark">mydigitalcard.app</p>
            </div>
          </div>
        </div>
      </body></html>`;

    const w = window.open("", "_blank", "width=460,height=600");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 600);
  }

  // ── Download PDF (front + back — drawn directly with jsPDF, no html2canvas) ─
  async function downloadPdf() {
    if (!card) return;
    setPdfLoading(true);
    try {
      const { jsPDF } = await import("jspdf");

      // ── Colour helpers ────────────────────────────────────────────────────────
      const rgb = (hex: string): [number, number, number] => {
        const h = (hex ?? "#000000").replace("#", "").padEnd(6, "0");
        return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
      };
      const luma = (r: number, g: number, b: number) => (0.299*r + 0.587*g + 0.114*b) / 255;

      const [aR,aG,aB] = rgb(config.accentColor      ?? "#2563eb");
      const [bR,bG,bB] = rgb(config.backgroundColor  ?? "#f8fafc");
      const [tR,tG,tB] = rgb(config.textColor         ?? "#0f172a");
      const onA: [number,number,number] = luma(aR,aG,aB) > 0.55 ? [17,17,17] : [255,255,255];

      // ── Load avatar ───────────────────────────────────────────────────────────
      let avatarImg: string | null = null;
      if (card.avatarUrl) {
        if (card.avatarUrl.startsWith("data:")) {
          avatarImg = card.avatarUrl;
        } else {
          try {
            const resp = await fetch(card.avatarUrl);
            const blob = await resp.blob();
            avatarImg = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          } catch { avatarImg = null; }
        }
      }

      // ── QR from hidden canvas — render at 4× for crisp output ────────────────
      let qrImg: string | null = null;
      const qrSrc = qrRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
      if (qrSrc) {
        // Redraw the QR at 4× resolution into a fresh canvas for PDF crispness
        const hiRes = document.createElement("canvas");
        const SCALE = 4;
        hiRes.width  = qrSrc.width  * SCALE;
        hiRes.height = qrSrc.height * SCALE;
        const ctx = hiRes.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(qrSrc, 0, 0, hiRes.width, hiRes.height);
          qrImg = hiRes.toDataURL("image/png");
        }
      }

      // ── Page = scaled business card (landscape 200 × 120 mm) ─────────────────
      // Each page IS the card — no wasted white space, no alignment issues.
      const PW = 200, PH = 120;
      const PAD = 8;   // inner padding mm

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [PH, PW] });

      // ── Reusable: draw full-page card background ──────────────────────────────
      const drawBg = () => {
        pdf.setFillColor(bR, bG, bB);
        pdf.rect(0, 0, PW, PH, "F");
      };

      // ════════════════════════════════════════════════════════════════════════
      // PAGE 1 — FRONT
      // ════════════════════════════════════════════════════════════════════════
      drawBg();

      // Full-width accent header band
      const BAND = 44;
      pdf.setFillColor(aR, aG, aB);
      pdf.rect(0, 0, PW, BAND, "F");

      // Avatar — entirely inside the header band, left side
      const AV = 28;
      const avX = PAD + 4;
      const avY = (BAND - AV) / 2;   // vertically centred in band

      if (avatarImg) {
        // White border ring
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(avX - 2, avY - 2, AV + 4, AV + 4, 2.5, 2.5, "F");
        pdf.addImage(avatarImg, "JPEG", avX, avY, AV, AV);
      }

      // Name + title — right of avatar (or from left if no avatar)
      const nameX = avatarImg ? avX + AV + 8 : PAD;
      const nameY = avatarImg ? avY + 9 : BAND / 2 - 2;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(onA[0], onA[1], onA[2]);
      pdf.text(card.displayName, nameX, nameY);

      if (card.jobTitle) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(onA[0], onA[1], onA[2]);
        pdf.text(card.jobTitle, nameX, nameY + 8);
      }

      // ── Body area ────────────────────────────────────────────────────────────
      let cY = BAND + PAD + 2;

      if (card.company) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(tR, tG, tB);
        pdf.text(card.company, PAD, cY);
        cY += 6;
      }

      // Accent rule
      pdf.setDrawColor(aR, aG, aB);
      pdf.setLineWidth(0.4);
      pdf.line(PAD, cY, PW - PAD, cY);
      cY += 5;

      // Contact rows — two columns if 3 items, single column otherwise
      const contacts = [
        { label: "Email",   value: card.email   },
        { label: "Phone",   value: card.phone   },
        { label: "Website", value: card.website },
      ].filter(c => !!c.value);

      contacts.forEach(({ label: lbl, value }) => {
        pdf.setFillColor(aR, aG, aB);
        pdf.circle(PAD + 1.8, cY - 1.5, 1.5, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(aR, aG, aB);
        pdf.text(lbl + ":", PAD + 6, cY);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(tR, tG, tB);
        pdf.text(value!, PAD + 28, cY);
        cY += 7;
      });

      // Watermark bottom-right
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.setTextColor(180, 180, 180);
      pdf.text("mydigitalcard.app", PW - PAD, PH - 4, { align: "right" });

      // ════════════════════════════════════════════════════════════════════════
      // PAGE 2 — BACK
      // ════════════════════════════════════════════════════════════════════════
      pdf.addPage([PH, PW], "landscape");
      drawBg();

      // QR code — perfectly square, centred horizontally, near top
      const QR = 68;                            // mm — square
      const qrX = (PW - QR) / 2;
      const qrY = PAD;

      if (qrImg) {
        // Clean white frame, same padding on all 4 sides
        const FRAME = 4;
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(qrX - FRAME, qrY - FRAME, QR + FRAME * 2, QR + FRAME * 2, 3, 3, "F");
        // Accent border
        pdf.setDrawColor(aR, aG, aB);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(qrX - FRAME, qrY - FRAME, QR + FRAME * 2, QR + FRAME * 2, 3, 3, "S");
        // QR: width === height → no stretching
        pdf.addImage(qrImg, "PNG", qrX, qrY, QR, QR);
      }

      // Info below QR
      let bY = qrY + QR + 7;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(170, 170, 170);
      pdf.text("SCAN TO CONNECT", PW / 2, bY, { align: "center" });
      bY += 3.5;

      // Accent divider
      pdf.setDrawColor(aR, aG, aB);
      pdf.setLineWidth(0.5);
      pdf.line(PW / 2 - 14, bY, PW / 2 + 14, bY);
      bY += 5.5;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(tR, tG, tB);
      pdf.text(card.displayName, PW / 2, bY, { align: "center" });
      bY += 5.5;

      if (card.jobTitle) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(aR, aG, aB);
        pdf.text(card.jobTitle, PW / 2, bY, { align: "center" });
        bY += 5;
      }
      if (card.company) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(tR, tG, tB);
        pdf.text(card.company, PW / 2, bY, { align: "center" });
      }

      // Watermark
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.setTextColor(180, 180, 180);
      pdf.text("mydigitalcard.app", PW - PAD, PH - 4, { align: "right" });

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

    </div>
  );
}
