"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Loader2, Sparkles, CheckCircle2,
  Camera, Upload, X, Eye, EyeOff, ClipboardPaste,
  Linkedin, Mail, FileText, Twitter,
} from "lucide-react";
import Link from "next/link";
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

const STEPS = ["Paste Text", "Review & Photo", "Choose Template"];

const SOURCES = [
  {
    id: "linkedin",
    label: "LinkedIn About",
    icon: Linkedin,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    activeBg: "bg-blue-600 text-white border-blue-600",
    placeholder: `Paste your LinkedIn "About" section here…\n\nExample:\nSenior Product Designer with 8+ years helping SaaS companies craft intuitive experiences. Currently at Acme Corp, where I lead design for our core product suite.\n\nlinkedin.com/in/janesmith`,
  },
  {
    id: "email",
    label: "Email Signature",
    icon: Mail,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    activeBg: "bg-green-600 text-white border-green-600",
    placeholder: `Paste your email signature here…\n\nExample:\nJane Smith\nSenior Product Designer | Acme Corp\nT: +1 555 123 4567 | E: jane@acme.com\nwww.acme.com | linkedin.com/in/janesmith`,
  },
  {
    id: "resume",
    label: "Resume Summary",
    icon: FileText,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    activeBg: "bg-orange-600 text-white border-orange-600",
    placeholder: `Paste your resume summary or profile section here…\n\nExample:\nResults-driven Product Manager with 5 years of experience in B2B SaaS. Proven track record of launching products that increased ARR by 40%. Skilled in roadmap planning, cross-functional leadership, and data-driven decision making.`,
  },
  {
    id: "twitter",
    label: "Twitter / X Bio",
    icon: Twitter,
    color: "text-sky-500",
    bg: "bg-sky-50 border-sky-200",
    activeBg: "bg-sky-500 text-white border-sky-500",
    placeholder: `Paste your Twitter/X bio or any short personal description here…\n\nExample:\nProduct Designer @AcmeCorp • Building things people love • Previously @StartupXYZ • jane@acme.com`,
  },
];

type ExtractedFields = Set<string>;

interface FieldVisibility {
  jobTitle:    boolean;
  company:     boolean;
  bio:         boolean;
  email:       boolean;
  phone:       boolean;
  website:     boolean;
  socialLinks: boolean;
}

export default function ImportCardPage() {
  const router   = useRouter();
  const avatarRef = useRef<HTMLInputElement>(null);

  const [step, setStep]           = useState(0);
  const [sourceId, setSourceId]   = useState("linkedin");
  const [inputText, setInputText] = useState("");
  const [extracting, setExtracting]   = useState(false);
  const [extractError, setExtractError] = useState("");
  const [extractedFields, setExtractedFields] = useState<ExtractedFields>(new Set());
  const [cameraOpen, setCameraOpen] = useState(false);

  // Editable fields
  const [displayName, setDisplayName] = useState("");
  const [jobTitle,    setJobTitle]    = useState("");
  const [company,     setCompany]     = useState("");
  const [bio,         setBio]         = useState("");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [website,     setWebsite]     = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLinkInput[]>([]);

  // Photo
  const [avatarBase64,  setAvatarBase64]  = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Visibility toggles
  const [visible, setVisible] = useState<FieldVisibility>({
    jobTitle: true, company: true, bio: true,
    email: true, phone: true, website: true, socialLinks: true,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const activeSource = SOURCES.find((s) => s.id === sourceId) ?? SOURCES[0];
  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // ── Handlers ───────────────────────────────────────────────────

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
    setAvatarBase64(dataUrl);
    setAvatarPreview(dataUrl);
  }

  function toggleField(field: keyof FieldVisibility) {
    setVisible((v) => ({ ...v, [field]: !v[field] }));
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInputText(text);
    } catch {
      // clipboard access denied — user can paste manually
    }
  }

  // ── AI Extraction ───────────────────────────────────────────────

  async function extractFromText() {
    if (!inputText.trim()) return;
    setExtracting(true);
    setExtractError("");
    setExtractedFields(new Set());

    try {
      const res = await fetch("/api/v1/user/card/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();

      if (!res.ok) {
        setExtractError(data.error ?? "Extraction failed. Fill in manually below.");
      } else {
        const ex = data.extracted ?? {};
        const filled = new Set<string>();

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

  // ── Avatar upload ───────────────────────────────────────────────

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

  // ── Create card ─────────────────────────────────────────────────

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
          avatarUrl:   avatarUrl           ?? undefined,
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

  // ── Done ────────────────────────────────────────────────────────

  // ── Render ──────────────────────────────────────────────────────

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
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-semibold text-gray-800">AI Import</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                  i < step  ? "bg-purple-600 text-white"
                  : i === step ? "bg-purple-100 text-purple-700 border border-purple-300"
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

            {/* ══ Step 0: Paste ════════════════════════════════════ */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Paste your text</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    AI will read your text and extract your name, title, contact info, and more automatically.
                  </p>
                </div>

                {/* Source type chips */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">What are you pasting?</p>
                  <div className="flex flex-wrap gap-2">
                    {SOURCES.map((src) => {
                      const Icon = src.icon;
                      const isActive = sourceId === src.id;
                      return (
                        <button
                          key={src.id}
                          type="button"
                          onClick={() => setSourceId(src.id)}
                          className={cn(
                            "flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border transition-all",
                            isActive ? src.activeBg : `${src.bg} ${src.color} hover:opacity-80`
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {src.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {extractError && (
                  <Alert variant="destructive"><AlertDescription>{extractError}</AlertDescription></Alert>
                )}

                {/* Text area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ai-text">Your text</Label>
                    <button
                      type="button"
                      onClick={pasteFromClipboard}
                      className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
                    >
                      <ClipboardPaste className="h-3.5 w-3.5" /> Paste from clipboard
                    </button>
                  </div>
                  <div className="relative">
                    <Textarea
                      id="ai-text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={activeSource.placeholder}
                      rows={11}
                      className="resize-none text-sm pr-8"
                    />
                    {inputText && (
                      <button
                        type="button"
                        onClick={() => setInputText("")}
                        className="absolute top-2.5 right-2.5 text-gray-300 hover:text-gray-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 text-right">{inputText.length} characters</p>
                </div>

                {/* Tips */}
                <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3 flex gap-3">
                  <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-purple-700 space-y-1">
                    <p className="font-semibold">Tips for best results</p>
                    <ul className="list-disc list-inside space-y-0.5 opacity-80">
                      <li>Include your full name, job title, and company name</li>
                      <li>Add email, phone, and website if you want them on your card</li>
                      <li>Include LinkedIn / social URLs for automatic social link detection</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={extractFromText}
                    disabled={!inputText.trim() || extracting}
                    className="gap-2 min-w-[180px] bg-purple-600 hover:bg-purple-700"
                  >
                    {extracting
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Extracting with AI…</>
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
                    Check the extracted details, add a profile photo, and hide any fields you don&apos;t need.
                  </p>
                </div>

                {extractedFields.size > 0 && (
                  <div className="flex items-center gap-2 rounded-xl bg-purple-50 border border-purple-100 px-4 py-3">
                    <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />
                    <p className="text-sm text-purple-700">
                      AI extracted <strong>{extractedFields.size} field{extractedFields.size !== 1 ? "s" : ""}</strong> from your text.
                      Fields marked <span className="inline-flex items-center gap-0.5 font-semibold">AI</span> were filled automatically.
                    </p>
                  </div>
                )}

                {extractError && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertDescription className="text-amber-700">
                      {extractError} — please fill in the details below.
                    </AlertDescription>
                  </Alert>
                )}

                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                {/* Profile photo */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-4">
                    Profile photo
                    <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
                  </p>
                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <Avatar className="h-20 w-20 ring-2 ring-white shadow-md">
                        <AvatarImage src={avatarPreview ?? ""} className="object-cover" />
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-xl font-bold">
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
                        className="gap-2 h-9 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
                        onClick={() => setCameraOpen(true)}
                      >
                        <Camera className="h-4 w-4" /> Take a photo
                      </Button>
                      <Button
                        type="button" variant="ghost" size="sm"
                        className="gap-2 h-9 text-gray-500 hover:text-gray-700"
                        onClick={() => avatarRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" /> Upload from device
                      </Button>
                      <p className="text-[11px] text-gray-400">JPG, PNG · max 5 MB</p>
                    </div>
                  </div>
                </div>
                <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onAvatarFile} />

                {/* Fields */}
                <div className="space-y-4">
                  <ImportField label="Full name" required extracted={extractedFields.has("displayName")}>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your full name" />
                  </ImportField>

                  <div className="grid grid-cols-2 gap-3">
                    <ImportField label="Job title" extracted={extractedFields.has("jobTitle")} visible={visible.jobTitle} onToggle={() => toggleField("jobTitle")}>
                      <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Designer" disabled={!visible.jobTitle} />
                    </ImportField>
                    <ImportField label="Company" extracted={extractedFields.has("company")} visible={visible.company} onToggle={() => toggleField("company")}>
                      <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp" disabled={!visible.company} />
                    </ImportField>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <ImportField label="Email" extracted={extractedFields.has("email")} visible={visible.email} onToggle={() => toggleField("email")}>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={!visible.email} />
                    </ImportField>
                    <ImportField label="Phone" extracted={extractedFields.has("phone")} visible={visible.phone} onToggle={() => toggleField("phone")}>
                      <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" disabled={!visible.phone} />
                    </ImportField>
                  </div>

                  <ImportField label="Website" extracted={extractedFields.has("website")} visible={visible.website} onToggle={() => toggleField("website")}>
                    <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" disabled={!visible.website} />
                  </ImportField>

                  <ImportField label="Bio" extracted={extractedFields.has("bio")} visible={visible.bio} onToggle={() => toggleField("bio")}>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Short bio (optional)"
                      rows={3}
                      className="resize-none"
                      disabled={!visible.bio}
                    />
                  </ImportField>

                  <ImportField label="Social links" extracted={extractedFields.has("socialLinks")} visible={visible.socialLinks} onToggle={() => toggleField("socialLinks")}>
                    {visible.socialLinks && (
                      <SocialLinksEditor links={socialLinks} onChange={setSocialLinks} />
                    )}
                  </ImportField>
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
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    Choose template <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ══ Step 2: Template ═════════════════════════════════ */}
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
                    className="gap-2 min-w-[140px] bg-purple-600 hover:bg-purple-700"
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

      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={onCameraCapture}
      />
    </>
  );
}

// ── Sub-component ───────────────────────────────────────────────

interface ImportFieldProps {
  label:      string;
  required?:  boolean;
  extracted?: boolean;
  visible?:   boolean;
  onToggle?:  () => void;
  children:   React.ReactNode;
}

function ImportField({ label, required, extracted, visible = true, onToggle, children }: ImportFieldProps) {
  return (
    <div className={cn("space-y-1.5 transition-opacity", !visible && "opacity-40")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </Label>
          {extracted && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-purple-100 text-purple-600 border-0">
              AI
            </Badge>
          )}
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
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
