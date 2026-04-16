"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CardPreview } from "@/components/admin/CardPreview";
import type { TemplateConfig } from "@/lib/types/template";

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    name: string;
    description: string | null;
    config: TemplateConfig;
    isActive: boolean;
  } | null;
}

const LAYOUT_LABELS: Record<string, string> = {
  classic:   "Classic",
  modern:    "Modern",
  minimal:   "Minimal",
  bold:      "Bold",
  elegant:   "Elegant",
  sharp:     "Sharp",
  profile:   "Profile",
  sidepanel: "Side Panel",
};

const FONT_LABELS: Record<string, string> = {
  inter: "Inter",
  poppins: "Poppins",
  roboto: "Roboto",
  playfair: "Playfair Display",
  montserrat: "Montserrat",
};

export function TemplatePreviewDialog({
  open,
  onOpenChange,
  template,
}: TemplatePreviewDialogProps) {
  if (!template) return null;

  const { config } = template;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_280px]">
          {/* Left — details */}
          <div className="p-7 flex flex-col gap-5">
            <DialogHeader>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl">{template.name}</DialogTitle>
                <Badge
                  className={
                    template.isActive
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-100"
                  }
                >
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {template.description && (
                <p className="text-sm text-gray-500 mt-1">{template.description}</p>
              )}
            </DialogHeader>

            {/* Style specs */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Layout & Typography
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {LAYOUT_LABELS[config.layout] ?? config.layout}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {FONT_LABELS[config.fontFamily] ?? config.fontFamily}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Color Palette
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Background", color: config.backgroundColor },
                    { label: "Text", color: config.textColor },
                    { label: "Accent", color: config.accentColor },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div
                        className="h-6 w-6 rounded-md border border-gray-200 shadow-sm shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-gray-600">{label}</span>
                      <span className="text-xs font-mono text-gray-400 uppercase">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  QR Code
                </p>
                <p className="text-xs text-gray-500">
                  Each card includes a scannable QR code linking to the user&apos;s public card URL.
                </p>
              </div>
            </div>
          </div>

          {/* Right — live card preview */}
          <div
            className="flex items-center justify-center p-6 sm:border-l border-gray-100"
            style={{
              background: `radial-gradient(circle at center, ${config.accentColor}15, transparent 70%), #f8fafc`,
            }}
          >
            <CardPreview config={config} size="lg" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
