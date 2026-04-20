"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Eye, CheckCircle2 } from "lucide-react";
import { CardPreview } from "@/components/admin/CardPreview";
import { TemplateConfig, DEFAULT_TEMPLATE_CONFIG } from "@/lib/types/template";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Template {
  id:          string;
  name:        string;
  description: string | null;
  config:      TemplateConfig;
}

interface TemplatePickerProps {
  selectedId:         string | null;
  onChange:           (template: Template) => void;
  previewName?:       string;
  previewTitle?:      string;
  previewCompany?:    string;
  previewEmail?:      string;
  previewPhone?:      string;
  previewWebsite?:    string;
  previewAvatar?:     string | null;
  previewLinkedin?:   string;
  previewFacebook?:   string;
  previewInstagram?:  string;
  previewTwitter?:    string;
  hideIfNoAvatar?:    boolean;
  hideEmptyFields?:   boolean;
}

export function TemplatePicker({
  selectedId,
  onChange,
  previewName,
  previewTitle,
  previewCompany,
  previewEmail,
  previewPhone,
  previewWebsite,
  previewAvatar,
  previewLinkedin,
  previewFacebook,
  previewInstagram,
  previewTwitter,
  hideIfNoAvatar  = false,
  hideEmptyFields = false,
}: TemplatePickerProps) {
  const [templates, setTemplates]             = useState<Template[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetch("/api/v1/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []))
      .finally(() => setLoading(false));
  }, []);

  function selectAndClose(t: Template) {
    onChange(t);
    setPreviewTemplate(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading templates…
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-gray-400">
        No templates available yet. Your card will use the default style.
      </div>
    );
  }

  const previewConfig: TemplateConfig | null = previewTemplate
    ? { ...DEFAULT_TEMPLATE_CONFIG, ...(previewTemplate.config as Partial<TemplateConfig>) }
    : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {templates.map((t) => {
          const config: TemplateConfig = { ...DEFAULT_TEMPLATE_CONFIG, ...(t.config as Partial<TemplateConfig>) };
          const isSelected = selectedId === t.id;

          return (
            <div
              key={t.id}
              className={cn(
                "group flex flex-col rounded-2xl overflow-hidden bg-white transition-all duration-200",
                isSelected
                  ? "ring-2 ring-indigo-500 shadow-lg shadow-indigo-100"
                  : "ring-1 ring-gray-200 hover:ring-indigo-300 hover:shadow-md"
              )}
            >
              {/* ── Thumbnail ── */}
              <button
                type="button"
                onClick={() => setPreviewTemplate(t)}
                className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 pt-5 pb-3 px-3 focus:outline-none cursor-pointer"
              >
                {/* Selected badge */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-semibold rounded-full px-2 py-0.5 shadow">
                    <Check className="h-2.5 w-2.5" /> Active
                  </div>
                )}

                {/* Card thumbnail — scale the full 260 px card down to ~120 px wide */}
                <div className="flex justify-center overflow-hidden rounded-xl">
                  {/* Clipping box sized to the visual result of 260×196 px scaled at 0.46 */}
                  <div style={{ width: "120px", height: "90px", overflow: "hidden", position: "relative", flexShrink: 0 }}>
                    <div style={{ width: "260px", transform: "scale(0.46)", transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
                      <CardPreview
                        config={config}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Hover hint overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors rounded-t-2xl">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-white/90 text-gray-700 text-xs font-medium rounded-full px-3 py-1.5 shadow-sm">
                    <Eye className="h-3.5 w-3.5" /> Click to preview
                  </span>
                </div>
              </button>

              {/* ── Info ── */}
              <div className="px-3 pt-2.5 pb-1">
                <p className="text-xs font-semibold text-gray-800 truncate">{t.name}</p>
                {t.description && (
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{t.description}</p>
                )}
              </div>

              {/* ── Action buttons ── */}
              <div className="flex gap-2 px-3 pb-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-1.5 text-[11px] font-medium text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </button>

                <button
                  type="button"
                  onClick={() => onChange(t)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-semibold transition-all",
                    isSelected
                      ? "bg-green-500 text-white shadow-sm shadow-green-200"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                  )}
                >
                  {isSelected
                    ? <><CheckCircle2 className="h-3 w-3" /> Selected</>
                    : <><Check className="h-3 w-3" /> Use</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Full-size preview dialog ── */}
      <Dialog open={!!previewTemplate} onOpenChange={(v) => !v && setPreviewTemplate(null)}>
        <DialogContent className="w-full max-w-xl p-0 overflow-hidden gap-0">
          <DialogHeader className="px-5 py-4 border-b border-gray-100">
            <DialogTitle className="text-base font-semibold">
              {previewTemplate?.name}
              {previewTemplate?.description && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {previewTemplate.description}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100 px-6 py-8 gap-4">
            {previewConfig && (
              <CardPreview
                config={previewConfig}
                size="lg"
                sampleName={previewName ?? "Your Name"}
                sampleTitle={hideEmptyFields ? previewTitle : (previewTitle ?? "Your Title")}
                sampleCompany={hideEmptyFields ? previewCompany : (previewCompany ?? "Your Company")}
                sampleEmail={previewEmail}
                samplePhone={previewPhone}
                sampleWebsite={previewWebsite}
                sampleAvatar={previewAvatar}
                sampleLinkedin={previewLinkedin}
                sampleFacebook={previewFacebook}
                sampleInstagram={previewInstagram}
                sampleTwitter={previewTwitter}
                hideIfNoAvatar={hideIfNoAvatar}
                hideEmptyFields={hideEmptyFields}
              />
            )}

            {/* Hint — only shown in user mode where fields may be incomplete */}
            {hideEmptyFields && (
              <p className="text-[11px] text-center text-gray-400 max-w-[260px] leading-relaxed">
                Only your entered details are shown. You can always add or edit information after creating your card.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-white">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-500"
              onClick={() => setPreviewTemplate(null)}
            >
              Close
            </Button>

            {previewTemplate && selectedId === previewTemplate.id ? (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                <CheckCircle2 className="h-4 w-4" /> Template selected
              </span>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => previewTemplate && selectAndClose(previewTemplate)}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
              >
                <Check className="h-3.5 w-3.5" /> Use this template
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
