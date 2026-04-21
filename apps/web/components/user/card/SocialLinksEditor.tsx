"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { SocialLinkInput } from "@/lib/validations/card";

const PLATFORMS = [
  { value: "LINKEDIN",  label: "LinkedIn" },
  { value: "TWITTER",   label: "X (Twitter)" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK",  label: "Facebook" },
  { value: "GITHUB",    label: "GitHub" },
  { value: "YOUTUBE",   label: "YouTube" },
  { value: "TIKTOK",    label: "TikTok" },
  { value: "OTHER",     label: "Other" },
];

const PLACEHOLDERS: Record<string, string> = {
  LINKEDIN:  "https://linkedin.com/in/yourname",
  TWITTER:   "https://twitter.com/yourhandle",
  INSTAGRAM: "https://instagram.com/yourhandle",
  FACEBOOK:  "https://facebook.com/yourname",
  GITHUB:    "https://github.com/yourname",
  YOUTUBE:   "https://youtube.com/@yourchannel",
  TIKTOK:    "https://tiktok.com/@yourhandle",
  OTHER:     "https://yourwebsite.com",
};

interface Props {
  links:    SocialLinkInput[];
  onChange: (links: SocialLinkInput[]) => void;
}

export function SocialLinksEditor({ links, onChange }: Props) {
  const usedPlatforms = new Set(links.map((l) => l.platform));

  // Pick the first platform not yet added, falling back to the first option
  function nextAvailablePlatform(): SocialLinkInput["platform"] {
    const available = PLATFORMS.find((p) => !usedPlatforms.has(p.value as SocialLinkInput["platform"]));
    return (available?.value ?? PLATFORMS[0].value) as SocialLinkInput["platform"];
  }

  function addLink() {
    const platform = nextAvailablePlatform();
    onChange([...links, { platform, url: "", order: links.length }]);
  }

  function removeLink(idx: number) {
    onChange(links.filter((_, i) => i !== idx).map((l, i) => ({ ...l, order: i })));
  }

  function updateLink(idx: number, patch: Partial<SocialLinkInput>) {
    onChange(links.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  // All platforms are already added — hide the add button
  const allUsed = usedPlatforms.size >= PLATFORMS.length;

  return (
    <div className="space-y-3">
      {links.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded-xl">
          No social links added yet.
        </p>
      )}

      {links.map((link, idx) => {
        // Each row can select its own platform + any not yet used by other rows
        const availableForRow = PLATFORMS.filter(
          (p) => p.value === link.platform || !usedPlatforms.has(p.value as SocialLinkInput["platform"])
        );

        return (
          <div key={idx} className="flex items-center gap-2">
            <Select
              value={link.platform}
              onValueChange={(val) =>
                updateLink(idx, { platform: val as SocialLinkInput["platform"], url: "" })
              }
            >
              <SelectTrigger className="w-36 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableForRow.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              className="flex-1 text-sm"
              placeholder={PLACEHOLDERS[link.platform] ?? "https://..."}
              value={link.url}
              onChange={(e) => updateLink(idx, { url: e.target.value })}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-gray-400 hover:text-red-500"
              onClick={() => removeLink(idx)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      {!allUsed && links.length < 10 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-dashed text-gray-500 hover:text-indigo-600 hover:border-indigo-400"
          onClick={addLink}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Social Link
        </Button>
      )}
    </div>
  );
}
