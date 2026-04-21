"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  initialName:      string;
  initialEmail:     string;
  initialAvatarUrl: string | null;
  emailVerified:    string | null;
  createdAt:        string;
  oauthProviders:   string[];
}

export function ProfileSection({
  initialName,
  initialEmail,
  initialAvatarUrl,
  emailVerified,
  createdAt,
  oauthProviders,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName]             = useState(initialName);
  const [avatarUrl, setAvatarUrl]   = useState<string | null>(initialAvatarUrl);
  const [preview, setPreview]       = useState<string | null>(null); // local blob preview
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(false);

  const isDirty =
    name !== initialName ||
    avatarBase64 !== null ||
    removeAvatar;

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("Image must be under 3 MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setRemoveAvatar(false);

    const reader = new FileReader();
    reader.onload = () => setAvatarBase64(reader.result as string);
    reader.readAsDataURL(file);
  }

  function onRemoveAvatar() {
    setPreview(null);
    setAvatarBase64(null);
    setRemoveAvatar(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSave() {
    if (!isDirty) return;
    setError("");
    setSuccess(false);
    setSaving(true);

    const body: Record<string, unknown> = {};
    if (name !== initialName) body.name = name.trim();
    if (avatarBase64)          body.avatarBase64 = avatarBase64;
    if (removeAvatar)          body.removeAvatar = true;

    try {
      const res = await fetch("/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      // Persist new avatar URL and refresh session so header updates
      setAvatarUrl(data.avatarUrl ?? null);
      setPreview(null);
      setAvatarBase64(null);
      setRemoveAvatar(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } finally {
      setSaving(false);
    }
  }

  const displaySrc = preview ?? avatarUrl ?? "";

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>Profile updated successfully.</AlertDescription>
        </Alert>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <Avatar className="h-20 w-20">
            <AvatarImage src={displaySrc} alt={name} />
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-700 transition-colors"
            title="Change photo"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-700">Profile photo</p>
          <p className="text-xs text-gray-400">JPG, PNG or WEBP · max 3 MB</p>
          <div className="flex gap-2 mt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => fileRef.current?.click()}
            >
              Upload
            </Button>
            {(displaySrc) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-gray-400 hover:text-red-500"
                onClick={onRemoveAvatar}
              >
                <Trash2 className="mr-1 h-3 w-3" /> Remove
              </Button>
            )}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-email" className="flex items-center gap-1.5">
            Email address
            {emailVerified ? (
              <span className="text-[10px] font-normal text-green-600 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">Verified</span>
            ) : (
              <span className="text-[10px] font-normal text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">Unverified</span>
            )}
          </Label>
          <Input
            id="profile-email"
            value={initialEmail}
            disabled
            className="bg-gray-50 text-gray-500"
          />
          <p className="text-xs text-gray-400">Email cannot be changed.</p>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400 pt-1">
        <span>
          Member since{" "}
          <span className="text-gray-500 font-medium">
            {new Date(createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </span>
        {oauthProviders.length > 0 && (
          <span>
            Linked via{" "}
            <span className="text-gray-500 font-medium capitalize">
              {oauthProviders.join(", ")}
            </span>
          </span>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end pt-2">
        <Button onClick={onSave} disabled={!isDirty || saving} className="min-w-[110px]">
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
