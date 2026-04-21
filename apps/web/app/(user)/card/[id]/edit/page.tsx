"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, Save, Camera, Upload, X,
  Mail, Phone, Globe, AtSign,
  User, Briefcase, Building2, AlignLeft,
  Palette, CheckCircle2, Trash2,
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialLink { id: string; platform: string; url: string; order: number }

interface Card {
  id: string; slug: string; displayName: string;
  jobTitle: string | null; company: string | null; bio: string | null;
  email: string | null; phone: string | null; website: string | null;
  avatarUrl: string | null; isPublished: boolean;
  styles: Record<string, unknown> | null;
  socialLinks: SocialLink[];
}

// ─── Section header helper ────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 pb-1 border-b border-gray-100">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
        <Icon className="h-4 w-4 text-indigo-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Form field helper ────────────────────────────────────────────────────────

interface FormFieldProps {
  label: string; icon: React.ElementType; required?: boolean; hint?: string; children: React.ReactNode;
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

// ─── Preview field ────────────────────────────────────────────────────────────

function PreviewField({ icon: Icon, value, placeholder }: { icon: React.ElementType; value: string; placeholder: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
      <span className={cn("truncate text-xs", value ? "text-gray-700" : "text-gray-300 italic")}>
        {value || placeholder}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditCardPage() {
  const { id: cardId } = useParams<{ id: string }>();
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Load state ──
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);

  // ── Card fields ──
  const [displayName, setDisplayName] = useState("");
  const [jobTitle,    setJobTitle]    = useState("");
  const [company,     setCompany]     = useState("");
  const [bio,         setBio]         = useState("");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [website,     setWebsite]     = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLinkInput[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  // ── Avatar ──
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(null);
  const [avatarBase64,  setAvatarBase64]  = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen]       = useState(false);

  // ── Template ──
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [existingStyles, setExistingStyles]      = useState<Record<string, unknown> | null>(null);

  // ── Status ──
  const [error,       setError]       = useState("");
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  // ── Fetch card on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/v1/cards/${cardId}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then((data: { card: Card } | null) => {
        if (!data?.card) return;
        const c = data.card;
        setDisplayName(c.displayName ?? "");
        setJobTitle(c.jobTitle   ?? "");
        setCompany(c.company     ?? "");
        setBio(c.bio             ?? "");
        setEmail(c.email         ?? "");
        setPhone(c.phone         ?? "");
        setWebsite(c.website     ?? "");
        setSocialLinks(c.socialLinks.map(({ platform, url, order }) => ({ platform: platform as SocialLinkInput["platform"], url, order })));
        setIsPublished(c.isPublished);
        setExistingAvatarUrl(c.avatarUrl ?? null);
        setAvatarPreview(c.avatarUrl ?? null);
        setExistingStyles(c.styles ?? null);
      })
      .finally(() => setLoading(false));
  }, [cardId]);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // Preview config: new template takes priority, otherwise existing styles, otherwise default
  const previewConfig: TemplateConfig = selectedTemplate
    ? { ...DEFAULT_TEMPLATE_CONFIG, ...(selectedTemplate.config ?? {}) }
    : existingStyles
    ? { ...DEFAULT_TEMPLATE_CONFIG, ...existingStyles }
    : DEFAULT_TEMPLATE_CONFIG;

  // ── Photo handlers ────────────────────────────────────────────────────────────

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
    setExistingAvatarUrl(null);
  }

  // ── Upload avatar ─────────────────────────────────────────────────────────────

  async function uploadAvatar(): Promise<string | null> {
    if (!avatarBase64) return null;
    const res = await fetch("/api/v1/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarBase64 }),
    });
    const data = await res.json();
    return data.avatarUrl ?? null;
  }

  // ── Save ──────────────────────────────────────────────────────────────────────

  async function saveCard() {
    if (!displayName.trim()) { setError("Full name is required."); return; }
    setError("");
    setSaving(true);
    try {
      // If a new photo was picked, upload it first
      const avatarUrl = avatarBase64
        ? await uploadAvatar()
        : existingAvatarUrl ?? undefined;

      const styles = selectedTemplate
        ? { ...DEFAULT_TEMPLATE_CONFIG, ...(selectedTemplate.config ?? {}) }
        : existingStyles ?? DEFAULT_TEMPLATE_CONFIG;

      // Normalise URLs — prepend https:// when the user omits the protocol
      const normalizeUrl = (u: string) => {
        const t = u.trim();
        if (!t || t.startsWith("http://") || t.startsWith("https://")) return t;
        return "https://" + t;
      };

      const res = await fetch(`/api/v1/cards/${cardId}`, {
        method: "PUT",
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
          isPublished,
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

      // Update local avatar state from response
      if (data.card?.avatarUrl) {
        setExistingAvatarUrl(data.card.avatarUrl);
        setAvatarPreview(data.card.avatarUrl);
        setAvatarBase64(null);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete card ───────────────────────────────────────────────────────────────

  async function deleteCard() {
    setDeleting(true);
    try {
      await fetch(`/api/v1/cards/${cardId}`, { method: "DELETE" });
      router.push("/dashboard");
    } finally {
      setDeleting(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
    </div>
  );

  if (notFound) return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center p-6">
      <p className="text-gray-500">Card not found.</p>
      <Link href="/dashboard" className="text-indigo-600 text-sm hover:underline">Go to Dashboard</Link>
    </div>
  );

  return (
    <>
      <div className="flex flex-col overflow-hidden h-full">

        {/* ── Header ── */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm font-semibold text-gray-800">Edit Card</p>
              <p className="text-xs text-gray-400">{displayName || "Loading…"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Publish toggle */}
            <button
              type="button"
              onClick={() => setIsPublished((p) => !p)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                isPublished
                  ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", isPublished ? "bg-green-500" : "bg-gray-400")} />
              {isPublished ? "Published" : "Draft"}
            </button>

            {/* Delete button / confirm */}
            {confirmDel ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 hidden sm:inline">Delete this card?</span>
                <button
                  onClick={deleteCard}
                  disabled={deleting}
                  className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
                >
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDel(false)}
                  disabled={deleting}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDel(true)}
                className="flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Delete card"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            {/* Save button */}
            <Button
              onClick={saveCard}
              disabled={saving}
              className={cn(
                "gap-2 min-w-[120px]",
                saved ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"
              )}
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              ) : saved ? (
                <><CheckCircle2 className="h-4 w-4" /> Saved!</>
              ) : (
                <><Save className="h-4 w-4" /> Save Changes</>
              )}
            </Button>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="flex-1 overflow-hidden flex">

          {/* ── Form panel ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-xl mx-auto px-6 py-8 space-y-10">

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* ══ Profile photo ══════════════════════════════════════════════ */}
              <section className="space-y-5">
                <SectionHeader icon={User} title="Profile Photo" subtitle="Optional — appears on your card" />

                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
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
                      <Button type="button" variant="outline" size="sm"
                        className="gap-2 h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        onClick={() => setCameraOpen(true)}>
                        <Camera className="h-4 w-4" /> Take a photo
                      </Button>
                      <Button type="button" variant="ghost" size="sm"
                        className="gap-2 h-9 text-gray-500 hover:text-gray-700"
                        onClick={() => fileRef.current?.click()}>
                        <Upload className="h-4 w-4" /> Upload from device
                      </Button>
                      <p className="text-[11px] text-gray-400">JPG, PNG · max 5 MB</p>
                    </div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} />
                </div>
              </section>

              {/* ══ Identity ═══════════════════════════════════════════════════ */}
              <section className="space-y-5">
                <SectionHeader icon={User} title="Identity" subtitle="Name, role, and bio" />
                <div className="space-y-4">
                  <FormField label="Full name" required icon={User}>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Jane Smith" />
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
              </section>

              {/* ══ Contact ════════════════════════════════════════════════════ */}
              <section className="space-y-5">
                <SectionHeader icon={Mail} title="Contact" subtitle="All fields optional — add what you want to share" />
                <div className="space-y-4">
                  <FormField label="Email address" icon={Mail}>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </FormField>
                  <FormField label="Phone number" icon={Phone}>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
                  </FormField>
                  <FormField label="Website" icon={Globe}>
                    <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" />
                  </FormField>
                </div>
              </section>

              {/* ══ Social links ═══════════════════════════════════════════════ */}
              <section className="space-y-5">
                <SectionHeader icon={AtSign} title="Social Links" subtitle="LinkedIn, Instagram, Twitter, and more" />
                <SocialLinksEditor links={socialLinks} onChange={setSocialLinks} />
              </section>

              {/* ══ Template ══════════════════════════════════════════════════ */}
              <section className="space-y-5">
                <SectionHeader icon={Palette} title="Template" subtitle="Change the look of your card — optional" />
                <TemplatePicker
                  selectedId={selectedTemplate?.id ?? null}
                  onChange={setSelectedTemplate}
                  previewName={displayName  || "Your Name"}
                  previewTitle={jobTitle    || undefined}
                  previewCompany={company   || undefined}
                  previewEmail={email       || undefined}
                  previewPhone={phone       || undefined}
                  previewWebsite={website   || undefined}
                  previewAvatar={avatarPreview}
                  previewLinkedin={socialLinks.find((l) => l.platform === "LINKEDIN")?.url}
                  previewFacebook={socialLinks.find((l) => l.platform === "FACEBOOK")?.url}
                  previewInstagram={socialLinks.find((l) => l.platform === "INSTAGRAM")?.url}
                  previewTwitter={socialLinks.find((l) => l.platform === "TWITTER")?.url}
                  hideIfNoAvatar
                  hideEmptyFields
                />
                {!selectedTemplate && existingStyles && (
                  <p className="text-xs text-gray-400 text-center">
                    Your existing template style is preserved. Select a new template above to change it.
                  </p>
                )}
              </section>

              {/* ══ Bottom save + delete ══════════════════════════════════════ */}
              <div className="flex items-center justify-between pb-6">
                {/* Delete */}
                {confirmDel ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Delete this card?</span>
                    <button
                      onClick={deleteCard}
                      disabled={deleting}
                      className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
                    >
                      {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Yes, delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDel(false)}
                      disabled={deleting}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDel(true)}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Delete card
                  </button>
                )}

                {/* Save */}
                <Button
                  onClick={saveCard}
                  disabled={saving}
                  className={cn(
                    "gap-2 min-w-[150px]",
                    saved ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"
                  )}
                >
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  ) : saved ? (
                    <><CheckCircle2 className="h-4 w-4" /> Saved!</>
                  ) : (
                    <><Save className="h-4 w-4" /> Save Changes</>
                  )}
                </Button>
              </div>

            </div>
          </div>

          {/* ── Live preview panel (desktop) ── */}
          <div className="hidden lg:flex w-80 xl:w-96 shrink-0 flex-col border-l border-gray-200 bg-gradient-to-br from-slate-50 to-gray-100">
            <div className="px-5 py-4 border-b border-gray-200 bg-white/60">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Preview</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Updates as you type</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 overflow-y-auto">
              <CardPreview
                key={selectedTemplate?.id ?? "existing"}
                config={previewConfig}
                size="lg"
                sampleName={displayName  || "Your Name"}
                sampleTitle={jobTitle    || "Your Title"}
                sampleCompany={company   || "Your Company"}
                sampleTagline={bio       || undefined}
                sampleEmail={email       || undefined}
                samplePhone={phone       || undefined}
                sampleWebsite={website   || undefined}
                sampleAvatar={avatarPreview}
                sampleLinkedin={socialLinks.find((l) => l.platform === "LINKEDIN")?.url}
                sampleFacebook={socialLinks.find((l) => l.platform === "FACEBOOK")?.url}
                sampleInstagram={socialLinks.find((l) => l.platform === "INSTAGRAM")?.url}
                sampleTwitter={socialLinks.find((l) => l.platform === "TWITTER")?.url}
                hideIfNoAvatar
                hideEmptyFields
              />

              {/* Field summary */}
              <div className="w-full rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 text-xs overflow-hidden mt-2">
                <PreviewField icon={User}      value={displayName} placeholder="Your name" />
                <PreviewField icon={Briefcase} value={jobTitle}    placeholder="Job title" />
                <PreviewField icon={Building2} value={company}     placeholder="Company" />
                <PreviewField icon={Mail}      value={email}       placeholder="Email" />
                <PreviewField icon={Phone}     value={phone}       placeholder="Phone" />
                <PreviewField icon={Globe}     value={website}     placeholder="Website" />
              </div>

              {selectedTemplate && (
                <div className="w-full flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2">
                  <span className="text-[11px] font-medium text-indigo-700">
                    Template: {selectedTemplate.name}
                  </span>
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
