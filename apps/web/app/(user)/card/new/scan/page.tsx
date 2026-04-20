"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Loader2, ScanLine, UploadCloud, CheckCircle2,
  Sparkles, Camera, X, RefreshCw, User, Eye, EyeOff,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TemplatePicker, type Template } from "@/components/user/card/TemplatePicker";
import { SocialLinksEditor } from "@/components/user/card/SocialLinksEditor";
import { CameraCapture } from "@/components/user/card/CameraCapture";
import { DEFAULT_TEMPLATE_CONFIG } from "@/lib/types/template";
import { cn } from "@/lib/utils";
import type { SocialLinkInput } from "@/lib/validations/card";

const STEPS = ["Scan Card", "Review & Photo", "Choose Template"];

interface ExtractedData {
  displayName?: string;
  jobTitle?:    string;
  company?:     string;
  bio?:         string;
  email?:       string;
  phone?:       string;
  website?:     string;
  socialLinks?: SocialLinkInput[];
}

// Which fields were populated by AI (to show a badge)
type ExtractedFields = Set<keyof ExtractedData>;

interface CardImageSlot {
  base64:  string | null;
  preview: string | null;
}

// Visibility toggle state
interface FieldVisibility {
  jobTitle:    boolean;
  company:     boolean;
  bio:         boolean;
  email:       boolean;
  phone:       boolean;
  website:     boolean;
  socialLinks: boolean;
}

export default function ScanCardPage() {
  const router     = useRouter();
  const frontRef   = useRef<HTMLInputElement>(null);
  const backRef    = useRef<HTMLInputElement>(null);
  const avatarRef  = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);

  // Card images (front + back)
  const [front, setFront] = useState<CardImageSlot>({ base64: null, preview: null });
  const [back,  setBack]  = useState<CardImageSlot>({ base64: null, preview: null });
  const [cameraTarget, setCameraTarget] = useState<"front" | "back" | "avatar" | null>(null);

  const [extracting,    setExtracting]    = useState(false);
  const [extractError,  setExtractError]  = useState("");
  const [extractedFields, setExtractedFields] = useState<ExtractedFields>(new Set());

  // Editable fields
  const [displayName, setDisplayName] = useState("");
  const [jobTitle,    setJobTitle]    = useState("");
  const [company,     setCompany]     = useState("");
  const [bio,         setBio]         = useState("");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [website,     setWebsite]     = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLinkInput[]>([]);

  // Profile photo
  const [avatarBase64,  setAvatarBase64]  = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Visibility toggles
  const [visible, setVisible] = useState<FieldVisibility>({
    jobTitle: true, company: true, bio: true,
    email: true, phone: true, website: true, socialLinks: true,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState("");
  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // ── Image helpers ──────────────────────────────────────────────

  function readFile(file: File, onResult: (base64: string, preview: string) => void) {
    if (file.size > 10 * 1024 * 1024) { setExtractError("Image must be under 10 MB."); return; }
    setExtractError("");
    const preview = URL.createObjectURL(file);
    const reader  = new FileReader();
    reader.onload = () => onResult(reader.result as string, preview);
    reader.readAsDataURL(file);
  }

  function onFrontFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file, (b, p) => setFront({ base64: b, preview: p }));
    e.target.value = "";
  }

  function onBackFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file, (b, p) => setBack({ base64: b, preview: p }));
    e.target.value = "";
  }

  function onAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Photo must be under 5 MB."); return; }
    setAvatarPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => setAvatarBase64(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function onCameraCapture(dataUrl: string) {
    if (cameraTarget === "front")  { setFront({ base64: dataUrl, preview: dataUrl }); }
    if (cameraTarget === "back")   { setBack({ base64: dataUrl, preview: dataUrl }); }
    if (cameraTarget === "avatar") { setAvatarBase64(dataUrl); setAvatarPreview(dataUrl); }
    setCameraTarget(null);
  }

  // ── AI Extraction ──────────────────────────────────────────────

  async function extractFromCard() {
    if (!front.base64 && !back.base64) return;
    setExtracting(true);
    setExtractError("");
    setExtractedFields(new Set());

    try {
      const res = await fetch("/api/v1/user/card/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontImageBase64: front.base64 ?? undefined,
          backImageBase64:  back.base64  ?? undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setExtractError(data.error ?? "Extraction failed. Fill in manually below.");
      } else {
        const ex: ExtractedData = data.extracted ?? {};
        const filled = new Set<keyof ExtractedData>();

        if (ex.displayName) { setDisplayName(ex.displayName); filled.add("displayName"); }
        if (ex.jobTitle)    { setJobTitle(ex.jobTitle);       filled.add("jobTitle"); }
        if (ex.company)     { setCompany(ex.company);         filled.add("company"); }
        if (ex.bio)         { setBio(ex.bio);                 filled.add("bio"); }
        if (ex.email)       { setEmail(ex.email);             filled.add("email"); }
        if (ex.phone)       { setPhone(ex.phone);             filled.add("phone"); }
        if (ex.website)     { setWebsite(ex.website);         filled.add("website"); }
        if (ex.socialLinks?.length) { setSocialLinks(ex.socialLinks); filled.add("socialLinks"); }

        setExtractedFields(filled);
      }
    } finally {
      setExtracting(false);
      setStep(1);
    }
  }

  // ── Avatar upload ──────────────────────────────────────────────

  async function uploadAvatar(): Promise<string | null> {
    if (!avatarBase64) return null;
    const res = await fetch("/api/v1/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarBase64 }),
    });
    const d = await res.json();
    return d.avatarUrl ?? null;
  }

  // ── Create card ────────────────────────────────────────────────

  async function createCard() {
    if (!displayName.trim()) { setError("Name is required."); return; }
    setError("");
    setSaving(true);
    try {
      const avatarUrl = avatarBase64 ? await uploadAvatar() : null;
      const styles = selectedTemplate
        ? { ...DEFAULT_TEMPLATE_CONFIG, ...(selectedTemplate.config ?? {}) }
        : DEFAULT_TEMPLATE_CONFIG;

      const res = await fetch("/api/v1/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          jobTitle:    visible.jobTitle    && jobTitle.trim()  ? jobTitle.trim()  : undefined,
          company:     visible.company     && company.trim()   ? company.trim()   : undefined,
          bio:         visible.bio         && bio.trim()       ? bio.trim()       : undefined,
          email:       visible.email       && email.trim()     ? email.trim()     : undefined,
          phone:       visible.phone       && phone.trim()     ? phone.trim()     : undefined,
          website:     visible.website     && website.trim()   ? website.trim()   : undefined,
          avatarUrl:   avatarUrl ?? undefined,
          styles,
          isPublished: false,
          socialLinks: visible.socialLinks
            ? socialLinks.filter((l) => l.url.trim())
            : [],
        }),
      });

      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Failed to create card."); return; }
      router.push(`/card/${d.card.id}/created`);
    } finally {
      setSaving(false);
    }
  }

  function toggleField(field: keyof FieldVisibility) {
    setVisible((v) => ({ ...v, [field]: !v[field] }));
  }


  // ── Render ─────────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col overflow-hidden h-full">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-3">
            <Link href="/card/new" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-800">Scan Existing Card</span>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                  i < step  ? "bg-blue-500 text-white"
                  : i === step ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-100 text-gray-400"
                )}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={cn("hidden text-xs sm:block", i === step ? "font-medium text-gray-700" : "text-gray-400")}>
                  {s}
                </span>
                {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-200" />}
              </div>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">

            {/* ══ Step 0: Scan ══════════════════════════════════════ */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Scan your physical card</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Upload or photograph the front and back of your business card.
                    AI will extract all the information automatically.
                  </p>
                </div>

                {extractError && (
                  <Alert variant="destructive"><AlertDescription>{extractError}</AlertDescription></Alert>
                )}

                {/* Front + Back slots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Front */}
                  <CardImageSlotUI
                    label="Front of card"
                    required
                    slot={front}
                    onUpload={() => frontRef.current?.click()}
                    onCamera={() => setCameraTarget("front")}
                    onClear={() => setFront({ base64: null, preview: null })}
                  />
                  {/* Back */}
                  <CardImageSlotUI
                    label="Back of card"
                    slot={back}
                    onUpload={() => backRef.current?.click()}
                    onCamera={() => setCameraTarget("back")}
                    onClear={() => setBack({ base64: null, preview: null })}
                  />
                </div>

                {/* Hidden file inputs */}
                <input ref={frontRef} type="file" accept="image/*" className="hidden" onChange={onFrontFile} />
                <input ref={backRef}  type="file" accept="image/*" className="hidden" onChange={onBackFile} />

                <div className="flex justify-end">
                  <Button
                    onClick={extractFromCard}
                    disabled={(!front.base64 && !back.base64) || extracting}
                    className="gap-2 min-w-[180px] bg-blue-600 hover:bg-blue-700"
                  >
                    {extracting
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Scanning with AI…</>
                      : <><Sparkles className="h-4 w-4" /> Extract Details <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </div>
              </div>
            )}

            {/* ══ Step 1: Review & Photo ════════════════════════════ */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Review & add your photo</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Check the extracted details, add a profile photo, and hide any fields you don&apos;t want on your card.
                  </p>
                </div>

                {extractError && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertDescription className="text-amber-700">
                      {extractError} — some fields may be empty, please fill them in.
                    </AlertDescription>
                  </Alert>
                )}

                {extractedFields.size > 0 && (
                  <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                    <Sparkles className="h-4 w-4 text-blue-500 shrink-0" />
                    <p className="text-sm text-blue-700">
                      AI extracted <strong>{extractedFields.size} fields</strong> from your card.
                      Review and edit below.
                    </p>
                  </div>
                )}

                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                {/* ── Profile photo ── */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-4">
                    Profile photo
                    <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
                  </p>
                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <Avatar className="h-20 w-20 ring-2 ring-white shadow-md">
                        <AvatarImage src={avatarPreview ?? ""} className="object-cover" />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={() => { setAvatarBase64(null); setAvatarPreview(null); }}
                          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button" variant="outline" size="sm"
                        className="gap-2 h-9 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                        onClick={() => setCameraTarget("avatar")}
                      >
                        <Camera className="h-4 w-4" /> Take a photo
                      </Button>
                      <Button
                        type="button" variant="ghost" size="sm"
                        className="gap-2 h-9 text-gray-500 hover:text-gray-700"
                        onClick={() => avatarRef.current?.click()}
                      >
                        <UploadCloud className="h-4 w-4" /> Upload from device
                      </Button>
                      <p className="text-[11px] text-gray-400">JPG, PNG · max 5 MB</p>
                    </div>
                  </div>
                </div>
                <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onAvatarFile} />

                {/* ── Editable fields ── */}
                <div className="space-y-4">

                  {/* Name — always shown */}
                  <FieldRow label="Full name" required extracted={extractedFields.has("displayName")}>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </FieldRow>

                  <div className="grid grid-cols-2 gap-3">
                    <FieldRow
                      label="Job title"
                      extracted={extractedFields.has("jobTitle")}
                      visible={visible.jobTitle}
                      onToggle={() => toggleField("jobTitle")}
                    >
                      <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Designer" disabled={!visible.jobTitle} />
                    </FieldRow>
                    <FieldRow
                      label="Company"
                      extracted={extractedFields.has("company")}
                      visible={visible.company}
                      onToggle={() => toggleField("company")}
                    >
                      <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp" disabled={!visible.company} />
                    </FieldRow>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FieldRow
                      label="Email"
                      extracted={extractedFields.has("email")}
                      visible={visible.email}
                      onToggle={() => toggleField("email")}
                    >
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={!visible.email} />
                    </FieldRow>
                    <FieldRow
                      label="Phone"
                      extracted={extractedFields.has("phone")}
                      visible={visible.phone}
                      onToggle={() => toggleField("phone")}
                    >
                      <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" disabled={!visible.phone} />
                    </FieldRow>
                  </div>

                  <FieldRow
                    label="Website"
                    extracted={extractedFields.has("website")}
                    visible={visible.website}
                    onToggle={() => toggleField("website")}
                  >
                    <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" disabled={!visible.website} />
                  </FieldRow>

                  <FieldRow
                    label="Bio"
                    extracted={extractedFields.has("bio")}
                    visible={visible.bio}
                    onToggle={() => toggleField("bio")}
                  >
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Short bio (optional)"
                      rows={3}
                      className="resize-none"
                      disabled={!visible.bio}
                    />
                  </FieldRow>

                  <FieldRow
                    label="Social links"
                    extracted={extractedFields.has("socialLinks")}
                    visible={visible.socialLinks}
                    onToggle={() => toggleField("socialLinks")}
                  >
                    {visible.socialLinks && (
                      <SocialLinksEditor links={socialLinks} onChange={setSocialLinks} />
                    )}
                  </FieldRow>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(0)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!displayName.trim()) { setError("Name is required."); return; }
                      setError("");
                      setStep(2);
                    }}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    Choose template <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ══ Step 2: Template ══════════════════════════════════ */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Choose a template</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Pick a style for your digital card.</p>
                </div>

                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                <TemplatePicker
                  selectedId={selectedTemplate?.id ?? null}
                  onChange={setSelectedTemplate}
                  previewName={displayName}
                  previewTitle={jobTitle || undefined}
                  previewCompany={company || undefined}
                  previewAvatar={avatarPreview}
                />

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={createCard}
                    disabled={saving}
                    className="gap-2 min-w-[140px] bg-blue-600 hover:bg-blue-700"
                  >
                    {saving
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
                      : <><CheckCircle2 className="h-4 w-4" /> Create Card</>}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Camera dialog */}
      <CameraCapture
        open={cameraTarget !== null}
        onClose={() => setCameraTarget(null)}
        onCapture={onCameraCapture}
      />
    </>
  );
}

// ── Sub-components ──────────────────────────────────────────────

interface CardImageSlotUIProps {
  label:    string;
  required?: boolean;
  slot:     CardImageSlot;
  onUpload: () => void;
  onCamera: () => void;
  onClear:  () => void;
}

function CardImageSlotUI({ label, required, slot, onUpload, onCamera, onClear }: CardImageSlotUIProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
        {!required && <span className="text-xs text-gray-400">(optional)</span>}
      </div>

      <div className={cn(
        "relative rounded-2xl border-2 border-dashed bg-gray-50 overflow-hidden transition-colors",
        slot.preview ? "border-blue-300" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"
      )} style={{ minHeight: 180 }}>

        {slot.preview ? (
          <>
            <Image
              src={slot.preview}
              alt={label}
              width={400}
              height={220}
              className="w-full h-44 object-contain p-2"
            />
            {/* Clear button */}
            <button
              type="button"
              onClick={onClear}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {/* Replace actions */}
            <div className="flex gap-2 p-2 bg-white border-t border-gray-100">
              <button
                type="button"
                onClick={onCamera}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-[11px] font-medium text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <RefreshCw className="h-3 w-3" /> Retake
              </button>
              <button
                type="button"
                onClick={onUpload}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-[11px] font-medium text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <UploadCloud className="h-3 w-3" /> Replace
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 h-44">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <User className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 text-center px-4">Photo or scan of card</p>
            <div className="flex gap-2 px-4 w-full">
              <button
                type="button"
                onClick={onCamera}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-white py-2 text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Camera className="h-3.5 w-3.5" /> Camera
              </button>
              <button
                type="button"
                onClick={onUpload}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 py-2 text-xs font-medium hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <UploadCloud className="h-3.5 w-3.5" /> Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface FieldRowProps {
  label:      string;
  required?:  boolean;
  extracted?: boolean;
  visible?:   boolean;
  onToggle?:  () => void;
  children:   React.ReactNode;
}

function FieldRow({ label, required, extracted, visible = true, onToggle, children }: FieldRowProps) {
  return (
    <div className={cn("space-y-1.5 transition-opacity", !visible && "opacity-40")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</Label>
          {extracted && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-blue-100 text-blue-600 border-0">
              AI
            </Badge>
          )}
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
            title={visible ? "Hide from card" : "Show on card"}
          >
            {visible
              ? <><Eye className="h-3.5 w-3.5" /> Visible</>
              : <><EyeOff className="h-3.5 w-3.5" /> Hidden</>}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
