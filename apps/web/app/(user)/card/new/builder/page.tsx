"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Loader2, PenLine, CheckCircle2,
  Camera, Upload, X, Mail, Phone, Globe, AtSign,
  User, Briefcase, Building2, AlignLeft,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TemplatePicker, type Template } from "@/components/user/card/TemplatePicker";
import { SocialLinksEditor } from "@/components/user/card/SocialLinksEditor";
import { CameraCapture } from "@/components/user/card/CameraCapture";
import { CardPreview } from "@/components/admin/CardPreview";
import { DEFAULT_TEMPLATE_CONFIG, type TemplateConfig } from "@/lib/types/template";
import type { SocialLinkInput } from "@/lib/validations/card";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Template",  icon: PenLine,    desc: "Pick a style for your card" },
  { label: "Identity",  icon: User,       desc: "Your name, role & photo" },
  { label: "Contact",   icon: Mail,       desc: "Email, phone & website" },
  { label: "Social",    icon: AtSign,     desc: "Social media profiles" },
];

export default function BuilderPage() {
  const router    = useRouter();
  const fileRef   = useRef<HTMLInputElement>(null);

  const [step, setStep]         = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);

  // ── Card data ──
  const [displayName, setDisplayName] = useState("");
  const [jobTitle,    setJobTitle]    = useState("");
  const [company,     setCompany]     = useState("");
  const [bio,         setBio]         = useState("");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [website,     setWebsite]     = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLinkInput[]>([]);

  // ── Avatar ──
  const [avatarBase64,  setAvatarBase64]  = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // ── Template ──
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // ── Status ──
  const [error,  setError]  = useState("");
  const [saving, setSaving] = useState(false);
  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const previewConfig: TemplateConfig = selectedTemplate
    ? { ...DEFAULT_TEMPLATE_CONFIG, ...(selectedTemplate.config ?? {}) }
    : DEFAULT_TEMPLATE_CONFIG;

  // ── Photo handlers ──────────────────────────────────────────────

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Photo must be under 5 MB."); return; }
    setError("");
    setAvatarPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => setAvatarBase64(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function onCameraCapture(dataUrl: string) {
    setAvatarBase64(dataUrl);
    setAvatarPreview(dataUrl);
    setError("");
  }

  function removePhoto() {
    setAvatarBase64(null);
    setAvatarPreview(null);
  }

  // ── Avatar upload ───────────────────────────────────────────────

  async function uploadAvatar(): Promise<string | null> {
    if (!avatarBase64) return null;
    setUploadingAvatar(true);
    try {
      const res = await fetch("/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarBase64 }),
      });
      const data = await res.json();
      return data.avatarUrl ?? null;
    } finally {
      setUploadingAvatar(false);
    }
  }

  // ── Navigation ──────────────────────────────────────────────────

  function validateStep(): boolean {
    setError("");
    if (step === 1 && !displayName.trim()) {
      setError("Full name is required to continue.");
      return false;
    }
    return true;
  }

  function next() { if (validateStep()) setStep((s) => s + 1); }
  function back() { setError(""); setStep((s) => s - 1); }

  // ── Create card ─────────────────────────────────────────────────

  async function createCard() {
    if (!displayName.trim()) { setError("Name is required."); return; }
    setError("");
    setSaving(true);
    try {
      const avatarUrl = avatarBase64 ? await uploadAvatar() : null;
      const styles    = { ...DEFAULT_TEMPLATE_CONFIG, ...(selectedTemplate?.config ?? {}) };

      const normalizeUrl = (u: string) => {
        const t = u.trim();
        if (!t || t.startsWith("http://") || t.startsWith("https://")) return t;
        return "https://" + t;
      };

      const res = await fetch("/api/v1/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          jobTitle:    jobTitle.trim()  || undefined,
          company:     company.trim()   || undefined,
          bio:         bio.trim()       || undefined,
          email:       email.trim()     || undefined,
          phone:       phone.trim()     || undefined,
          website:     normalizeUrl(website) || undefined,
          avatarUrl:   avatarUrl        ?? undefined,
          styles,
          isPublished: false,
          socialLinks: socialLinks
            .filter((l) => l.url.trim())
            .map((l) => ({ ...l, url: normalizeUrl(l.url) })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = typeof data.error === "string" ? data.error : "Please check your inputs and try again.";
        setError(msg);
        return;
      }
      router.push(`/card/${data.card.id}/created`);
    } finally {
      setSaving(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────

  const isLastStep = step === STEPS.length - 1;

  return (
    <>
      <div className="flex flex-col overflow-hidden h-full">

        {/* ── Header ── */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-3">
            <Link href="/card/new" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <PenLine className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-semibold text-gray-800">Build from Scratch</span>
            </div>
          </div>

          {/* Step pills */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all",
                    i < step
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                      : i === step
                      ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300"
                      : "bg-gray-100 text-gray-400 cursor-default"
                  )}
                  title={i < step ? `Go back to ${s.label}` : s.label}
                >
                  {i < step ? "✓" : i + 1}
                </button>
                <span className={cn(
                  "hidden text-xs lg:block transition-colors",
                  i === step ? "font-semibold text-gray-800" : i < step ? "text-indigo-500" : "text-gray-400"
                )}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <div className="w-3 h-px bg-gray-200 mx-0.5" />}
              </div>
            ))}
          </div>
        </header>

        {/* ── Body: form + live preview side by side ── */}
        <div className="flex-1 overflow-hidden flex">

          {/* Form panel */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-lg mx-auto px-6 py-8 space-y-6">

              {/* Step header */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                  {(() => { const Icon = STEPS[step].icon; return <Icon className="h-4.5 w-4.5 text-indigo-600" />; })()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{STEPS[step].label}</h2>
                  <p className="text-xs text-gray-500">{STEPS[step].desc}</p>
                </div>
                <div className="ml-auto text-xs text-gray-400 font-medium">
                  Step {step + 1} of {STEPS.length}
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* ══ Step 0: Template ════════════════════════════ */}
              {step === 0 && (
                <div className="space-y-5">
                  <p className="text-sm text-gray-500">
                    Choose a style first — you can change it any time. The live preview updates on the right.
                  </p>

                  <TemplatePicker
                    selectedId={selectedTemplate?.id ?? null}
                    onChange={setSelectedTemplate}
                    previewName={displayName || "Your Name"}
                    previewTitle={jobTitle || undefined}
                    previewCompany={company || undefined}
                    previewEmail={email || undefined}
                    previewPhone={phone || undefined}
                    previewWebsite={website || undefined}
                    previewAvatar={avatarPreview}
                    previewLinkedin={socialLinks.find((l) => l.platform === "LINKEDIN")?.url}
                    previewFacebook={socialLinks.find((l) => l.platform === "FACEBOOK")?.url}
                    previewInstagram={socialLinks.find((l) => l.platform === "INSTAGRAM")?.url}
                    previewTwitter={socialLinks.find((l) => l.platform === "TWITTER")?.url}
                    hideIfNoAvatar
                    hideEmptyFields
                  />

                </div>
              )}

              {/* ══ Step 1: Identity ══════════════════════════════ */}
              {step === 1 && (
                <div className="space-y-5">
                  {/* Photo */}
                  <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-4">
                      Profile photo
                      <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
                    </p>
                    <div className="flex items-center gap-5">
                      <div className="relative shrink-0">
                        <Avatar className="h-20 w-20 ring-2 ring-white shadow-md">
                          <AvatarImage src={avatarPreview ?? ""} className="object-cover" />
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {avatarPreview && (
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button" variant="outline" size="sm"
                          className="gap-2 h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400"
                          onClick={() => setCameraOpen(true)}
                        >
                          <Camera className="h-4 w-4" /> Take a photo
                        </Button>
                        <Button
                          type="button" variant="ghost" size="sm"
                          className="gap-2 h-9 text-gray-500 hover:text-gray-700"
                          onClick={() => fileRef.current?.click()}
                        >
                          <Upload className="h-4 w-4" /> Upload from device
                        </Button>
                        <p className="text-[11px] text-gray-400">JPG, PNG · max 5 MB</p>
                      </div>
                    </div>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} />
                  </div>

                  {/* Name & role */}
                  <div className="space-y-4">
                    <FormField label="Full name" required icon={User}>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Jane Smith"
                        autoFocus
                      />
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Job title" icon={Briefcase}>
                        <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Designer" />
                      </FormField>
                      <FormField label="Company" icon={Building2}>
                        <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp" />
                      </FormField>
                    </div>
                    <FormField label="Bio" icon={AlignLeft} hint="optional · max 500 chars">
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value.slice(0, 500))}
                        placeholder="A short tagline or about you…"
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-400 text-right">{bio.length}/500</p>
                    </FormField>
                  </div>
                </div>
              )}

              {/* ══ Step 2: Contact ══════════════════════════════ */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">All fields are optional — add what you want to share.</p>
                  <FormField label="Email address" icon={Mail}>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
                  </FormField>
                  <FormField label="Phone number" icon={Phone}>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
                  </FormField>
                  <FormField label="Website" icon={Globe}>
                    <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" />
                  </FormField>
                  <StepSummary items={[
                    { icon: User,      value: displayName },
                    { icon: Briefcase, value: jobTitle },
                    { icon: Building2, value: company },
                  ]} onEdit={() => setStep(1)} />
                </div>
              )}

              {/* ══ Step 3: Social ══════════════════════════════ */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Add social profiles you want people to see on your card. All optional.</p>
                  <SocialLinksEditor links={socialLinks} onChange={setSocialLinks} />
                  <StepSummary items={[
                    { icon: User,  value: displayName },
                    { icon: Mail,  value: email },
                    { icon: Phone, value: phone },
                    { icon: Globe, value: website },
                  ]} onEdit={() => setStep(2)} />
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-2">
                {step > 0 ? (
                  <Button variant="outline" onClick={back} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                ) : <div />}

                {isLastStep ? (
                  <Button
                    onClick={createCard}
                    disabled={saving || uploadingAvatar}
                    className="gap-2 min-w-[150px] bg-indigo-600 hover:bg-indigo-700"
                  >
                    {saving || uploadingAvatar
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
                      : <><CheckCircle2 className="h-4 w-4" /> Create Card</>}
                  </Button>
                ) : (
                  <Button onClick={next} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

            </div>
          </div>

          {/* ── Live preview panel (always visible on desktop) ── */}
          <div className="hidden lg:flex w-80 xl:w-96 shrink-0 flex-col border-l border-gray-200 bg-gradient-to-br from-slate-50 to-gray-100">
            <div className="px-5 py-4 border-b border-gray-200 bg-white/60">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Preview</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Updates as you type</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 overflow-y-auto">
              <CardPreview
                key={selectedTemplate?.id ?? "default"}
                config={previewConfig}
                size="lg"
                sampleName={displayName   || "Your Name"}
                sampleTitle={jobTitle     || "Your Title"}
                sampleCompany={company    || "Your Company"}
                sampleTagline={bio        || undefined}
                sampleEmail={email        || undefined}
                samplePhone={phone        || undefined}
                sampleWebsite={website    || undefined}
                sampleAvatar={avatarPreview}
                hideIfNoAvatar
                  hideEmptyFields
              />
              {/* Quick info summary */}
              <div className="w-full rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 text-xs overflow-hidden mt-2">
                <PreviewField icon={User}      value={displayName} placeholder="Your name" />
                <PreviewField icon={Briefcase} value={jobTitle}    placeholder="Job title" />
                <PreviewField icon={Building2} value={company}     placeholder="Company" />
                <PreviewField icon={Mail}      value={email}       placeholder="Email" />
                <PreviewField icon={Phone}     value={phone}       placeholder="Phone" />
                <PreviewField icon={Globe}     value={website}     placeholder="Website" />
              </div>

              {/* Template indicator */}
              {selectedTemplate && (
                <div className="w-full flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2">
                  <span className="text-[11px] font-medium text-indigo-700">
                    Template: {selectedTemplate.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-[11px] text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Camera dialog */}
      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={onCameraCapture}
      />
    </>
  );
}

// ── Sub-components ──────────────────────────────────────────────

interface FormFieldProps {
  label:    string;
  icon:     React.ElementType;
  required?: boolean;
  hint?:    string;
  children: React.ReactNode;
}

function FormField({ label, icon: Icon, required, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-gray-400" />
        <Label className="text-sm">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
          {hint && <span className="ml-1.5 text-xs font-normal text-gray-400">({hint})</span>}
        </Label>
      </div>
      {children}
    </div>
  );
}

interface StepSummaryItem {
  icon:   React.ElementType;
  value:  string;
  show?:  boolean;
}

function StepSummary({ items, onEdit }: { items: StepSummaryItem[]; onEdit: () => void }) {
  const filled = items.filter((it) => it.show !== false && it.value?.trim());
  if (!filled.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 flex items-start justify-between gap-3">
      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        {filled.map((it, i) => {
          const Icon = it.icon;
          return (
            <span key={i} className="flex items-center gap-1 text-[11px] text-gray-500">
              <Icon className="h-3 w-3 text-gray-400" />
              {it.value}
            </span>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 shrink-0 transition-colors"
      >
        Edit
      </button>
    </div>
  );
}

function PreviewField({ icon: Icon, value, placeholder }: { icon: React.ElementType; value: string; placeholder: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
      <span className={cn("truncate", value ? "text-gray-700" : "text-gray-300 italic")}>
        {value || placeholder}
      </span>
    </div>
  );
}
