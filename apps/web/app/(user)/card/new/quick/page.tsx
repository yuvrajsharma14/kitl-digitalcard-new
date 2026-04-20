"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ArrowLeft, ArrowRight, Loader2, Zap, Upload, X } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TemplatePicker, type Template } from "@/components/user/card/TemplatePicker";
import { CameraCapture } from "@/components/user/card/CameraCapture";
import { DEFAULT_TEMPLATE_CONFIG } from "@/lib/types/template";

const STEPS = ["Your Details", "Choose Template", "Done"];

export default function QuickCardPage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep]               = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [jobTitle, setJobTitle]       = useState("");
  const [company, setCompany]         = useState("");
  const [email, setEmail]             = useState("");
  const [phone, setPhone]             = useState("");
  const [avatarBase64, setAvatarBase64]   = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [uploadingAvatar, setUploadingAvatar]   = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  function setPhoto(dataUrl: string, previewUrl: string) {
    setAvatarBase64(dataUrl);
    setAvatarPreview(previewUrl);
    setError("");
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Photo must be under 5 MB."); return; }
    setError("");
    setAvatarPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => setAvatarBase64(reader.result as string);
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function onCameraCapture(dataUrl: string) {
    setPhoto(dataUrl, dataUrl);
  }

  function removePhoto() {
    setAvatarBase64(null);
    setAvatarPreview(null);
  }

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

  async function createCard() {
    if (!displayName.trim()) { setError("Please enter your name."); return; }
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
          jobTitle:    jobTitle.trim() || undefined,
          company:     company.trim() || undefined,
          email:       email.trim() || undefined,
          phone:       phone.trim() || undefined,
          avatarUrl:   avatarUrl ?? undefined,
          styles,
          isPublished: false,
          socialLinks: [],
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create card."); return; }
      router.push(`/card/${data.card.id}/created`);
    } finally {
      setSaving(false);
    }
  }

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
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-gray-800">Quick Card</span>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors
                  ${i < step ? "bg-indigo-600 text-white" : i === step ? "bg-indigo-100 text-indigo-700 border border-indigo-300" : "bg-gray-100 text-gray-400"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`hidden text-xs sm:block ${i === step ? "font-medium text-gray-700" : "text-gray-400"}`}>{s}</span>
                {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-200" />}
              </div>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-lg mx-auto">

            {/* ── Step 0: Details ── */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Your details</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Just a few things to get started. Everything except your name is optional.</p>
                </div>

                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                {/* Photo section */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5">
                  <p className="text-sm font-medium text-gray-700 mb-4">Profile photo <span className="text-xs font-normal text-gray-400">(optional)</span></p>

                  <div className="flex items-center gap-5">
                    {/* Avatar preview */}
                    <div className="relative shrink-0">
                      <Avatar className="h-24 w-24 ring-2 ring-white shadow-md">
                        <AvatarImage src={avatarPreview ?? ""} className="object-cover" />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {/* Remove photo button */}
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
                          title="Remove photo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {/* Photo action buttons */}
                    <div className="flex flex-col gap-2">
                      {/* Take photo — primary action */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2 h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400"
                        onClick={() => setCameraOpen(true)}
                      >
                        <Camera className="h-4 w-4" />
                        Take a photo
                      </Button>

                      {/* Upload file */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-2 h-9 text-gray-500 hover:text-gray-700"
                        onClick={() => fileRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Upload from device
                      </Button>

                      <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG · max 5 MB</p>
                    </div>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onFileChange}
                />

                {/* Name & details fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="qname">Full name <span className="text-red-500">*</span></Label>
                    <Input
                      id="qname"
                      placeholder="e.g. Jane Smith"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="qtitle">Job title</Label>
                      <Input id="qtitle" placeholder="e.g. Product Manager" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="qcompany">Company</Label>
                      <Input id="qcompany" placeholder="e.g. Acme Corp" value={company} onChange={(e) => setCompany(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="qemail">Email</Label>
                      <Input id="qemail" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="qphone">Phone</Label>
                      <Input id="qphone" type="tel" placeholder="+1 555 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      if (!displayName.trim()) { setError("Please enter your name."); return; }
                      setError("");
                      setStep(1);
                    }}
                    className="gap-2"
                  >
                    Choose template <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 1: Template ── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Choose a template</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Pick a style for your card. You can change it any time.</p>
                </div>

                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                <TemplatePicker
                  selectedId={selectedTemplate?.id ?? null}
                  onChange={setSelectedTemplate}
                  previewName={displayName || "Your Name"}
                  previewTitle={jobTitle || undefined}
                  previewCompany={company || undefined}
                  previewEmail={email || undefined}
                  previewPhone={phone || undefined}
                  previewAvatar={avatarPreview}
                  hideIfNoAvatar
                  hideEmptyFields
                />

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(0)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={createCard} disabled={saving || uploadingAvatar} className="gap-2 min-w-[130px]">
                    {saving || uploadingAvatar
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
                      : <><Zap className="h-4 w-4" /> Create Card</>}
                  </Button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Camera capture dialog */}
      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={onCameraCapture}
      />
    </>
  );
}
