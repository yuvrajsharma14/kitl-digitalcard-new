"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Loader2, Sparkles, CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TemplatePicker, type Template } from "@/components/user/card/TemplatePicker";
import { SocialLinksEditor } from "@/components/user/card/SocialLinksEditor";
import { DEFAULT_TEMPLATE_CONFIG } from "@/lib/types/template";
import type { SocialLinkInput } from "@/lib/validations/card";

const STEPS = ["Paste Text", "Review Details", "Choose Template"];

const EXAMPLES = [
  "Your LinkedIn About section",
  "Email signature",
  "Resume summary",
  "Twitter/X bio",
];

export default function ImportCardPage() {
  const router = useRouter();

  const [step, setStep]         = useState(0);
  const [inputText, setInputText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [jobTitle, setJobTitle]       = useState("");
  const [company, setCompany]         = useState("");
  const [bio, setBio]                 = useState("");
  const [email, setEmail]             = useState("");
  const [phone, setPhone]             = useState("");
  const [website, setWebsite]         = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLinkInput[]>([]);

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [saving, setSaving]  = useState(false);
  const [error, setError]    = useState("");
  const [done, setDone]      = useState(false);

  async function extractFromText() {
    if (!inputText.trim()) return;
    setExtracting(true);
    setExtractError("");
    try {
      const res = await fetch("/api/v1/user/card/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setExtractError(data.error ?? "Extraction failed.");
      } else {
        const ex = data.extracted ?? {};
        if (ex.displayName) setDisplayName(ex.displayName);
        if (ex.jobTitle)    setJobTitle(ex.jobTitle);
        if (ex.company)     setCompany(ex.company);
        if (ex.bio)         setBio(ex.bio);
        if (ex.email)       setEmail(ex.email);
        if (ex.phone)       setPhone(ex.phone);
        if (ex.website)     setWebsite(ex.website);
        if (ex.socialLinks) setSocialLinks(ex.socialLinks);
      }
    } finally {
      setExtracting(false);
      setStep(1);
    }
  }

  async function createCard() {
    if (!displayName.trim()) { setError("Name is required."); return; }
    setError("");
    setSaving(true);
    try {
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
          bio:         bio.trim() || undefined,
          email:       email.trim() || undefined,
          phone:       phone.trim() || undefined,
          website:     website.trim() || undefined,
          styles,
          isPublished: false,
          socialLinks: socialLinks.filter((l) => l.url.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create card."); return; }
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2500);
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col overflow-hidden h-full">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-6">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-semibold text-gray-800">AI Import</span>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-5">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Card created!</h2>
          <p className="text-sm text-gray-500">Redirecting to your dashboard…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden h-full">
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
              <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold
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
        <div className="max-w-xl mx-auto">

          {/* ── Step 0: Paste ── */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Paste your text</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  AI will read your text and extract your name, title, contact info, and more.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <span key={ex} className="text-xs bg-purple-50 text-purple-600 border border-purple-200 rounded-full px-3 py-1">
                    {ex}
                  </span>
                ))}
              </div>

              {extractError && (
                <Alert variant="destructive"><AlertDescription>{extractError}</AlertDescription></Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="ai-text">Your text</Label>
                <Textarea
                  id="ai-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={"Paste your LinkedIn About section, email signature, or any text about yourself here…\n\nExample:\nJane Smith | Product Manager at Acme Corp\njane@acme.com · +1 555 123 4567\nlinkedin.com/in/janesmith"}
                  rows={10}
                  className="resize-none text-sm"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={extractFromText}
                  disabled={!inputText.trim() || extracting}
                  className="gap-2 min-w-[160px]"
                >
                  {extracting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Extracting…</>
                    : <><Sparkles className="h-4 w-4" /> Extract with AI <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 1: Review ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Review extracted details</h2>
                <p className="text-sm text-gray-500 mt-0.5">Edit anything the AI got wrong or missed.</p>
              </div>

              {extractError && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertDescription className="text-amber-700">{extractError} Please fill in the details below.</AlertDescription>
                </Alert>
              )}

              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Full name <span className="text-red-500">*</span></Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your full name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Job title</Label>
                    <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Designer" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Company</Label>
                    <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Bio</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio (optional)" rows={3} className="resize-none" />
                </div>
                <div className="space-y-2">
                  <Label>Social Links</Label>
                  <SocialLinksEditor links={socialLinks} onChange={setSocialLinks} />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(0)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep(2)} disabled={!displayName.trim()} className="gap-2">
                  Choose template <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Template ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Choose a template</h2>
                <p className="text-sm text-gray-500 mt-0.5">Pick a style for your card.</p>
              </div>

              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

              <TemplatePicker
                selectedId={selectedTemplate?.id ?? null}
                onChange={setSelectedTemplate}
                previewName={displayName}
                previewTitle={jobTitle || undefined}
                previewCompany={company || undefined}
              />

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={createCard} disabled={saving} className="gap-2 min-w-[130px]">
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
  );
}
