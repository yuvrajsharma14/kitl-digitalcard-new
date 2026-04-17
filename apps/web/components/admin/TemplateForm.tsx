"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch }   from "@/components/ui/switch";
import { Badge }    from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardPreview } from "@/components/admin/CardPreview";
import {
  LAYOUT_OPTIONS,
  FONT_OPTIONS,
  DEFAULT_TEMPLATE_CONFIG,
  DEFAULT_TEMPLATE_FIELDS,
  FIELD_GROUPS,
  type TemplateConfig,
  type TemplateFields,
} from "@/lib/types/template";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// ── Zod schema ────────────────────────────────────────────────────────────────

const fieldsSchema = z.object({
  headshot:  z.boolean(),
  logo:      z.boolean(),
  banner:    z.boolean(),
  jobTitle:  z.boolean(),
  company:   z.boolean(),
  tagline:   z.boolean(),
  bio:       z.boolean(),
  email:     z.boolean(),
  phone:     z.boolean(),
  website:   z.boolean(),
  linkedin:  z.boolean(),
  facebook:  z.boolean(),
  instagram: z.boolean(),
  twitter:   z.boolean(),
});

const formSchema = z.object({
  name:         z.string().min(1, "Name is required").max(50, "Max 50 characters"),
  description:  z.string().max(200, "Max 200 characters").optional(),
  thumbnailUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isActive:     z.boolean(),
  config: z.object({
    layout:          z.enum(["classic", "modern", "minimal", "bold", "elegant", "sharp", "profile", "sidepanel"]),
    backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
    textColor:       z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
    accentColor:     z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
    fontFamily:      z.enum(["inter", "poppins", "roboto", "playfair", "montserrat"]),
    fields:          fieldsSchema,
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface TemplateFormProps {
  mode:         "create" | "edit";
  templateId?:  string;
  defaultValues?: Partial<FormValues>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TemplateForm({ mode, templateId, defaultValues }: TemplateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name:         defaultValues?.name         ?? "",
      description:  defaultValues?.description  ?? "",
      thumbnailUrl: defaultValues?.thumbnailUrl ?? "",
      isActive:     defaultValues?.isActive     ?? true,
      config: {
        ...DEFAULT_TEMPLATE_CONFIG,
        ...defaultValues?.config,
        fields: {
          ...DEFAULT_TEMPLATE_FIELDS,
          ...(defaultValues?.config?.fields ?? {}),
        },
      },
    },
  });

  const config = watch("config") as TemplateConfig & { fields: TemplateFields };

  async function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      const url    = mode === "create" ? "/api/v1/admin/templates" : `/api/v1/admin/templates/${templateId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json();
        setServerError(data?.error?.formErrors?.[0] ?? "Something went wrong");
        return;
      }

      router.push("/admin/templates");
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
      {/* ── Form ──────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Basic info */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Basic Info
          </h2>

          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input id="name" placeholder="e.g. Professional Dark" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Short description shown to users..."
              rows={2}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive">Active</Label>
              <p className="text-xs text-gray-500 mt-0.5">Visible to users in the card builder</p>
            </div>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </section>

        {/* Layout */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Layout</h2>
          <Controller
            name="config.layout"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {LAYOUT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={cn(
                      "rounded-lg border-2 p-3 text-left transition-colors",
                      field.value === opt.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                  </button>
                ))}
              </div>
            )}
          />
        </section>

        {/* Typography */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Typography</h2>
          <div className="space-y-2 max-w-xs">
            <Label>Font Family</Label>
            <Controller
              name="config.fontFamily"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </section>

        {/* Colors */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Colors</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {(
              [
                { name: "config.backgroundColor", label: "Background" },
                { name: "config.textColor",        label: "Text" },
                { name: "config.accentColor",      label: "Accent" },
              ] as const
            ).map(({ name, label }) => (
              <div key={name} className="space-y-2">
                <Label>{label}</Label>
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-9 w-12 cursor-pointer rounded border border-gray-200 p-0.5"
                      />
                      <Input
                        value={field.value}
                        onChange={(e) => {
                          if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))
                            field.onChange(e.target.value);
                        }}
                        className="font-mono text-sm uppercase"
                        maxLength={7}
                      />
                    </div>
                  )}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Fields */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Card Fields
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Choose which fields appear on cards using this template. Users can fill in any enabled field.
            </p>
          </div>

          {/* Name — always required, locked */}
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Full Name</p>
              <p className="text-xs text-gray-400">Always visible on every card</p>
            </div>
            <Badge variant="secondary" className="text-xs">Required</Badge>
          </div>

          {/* Grouped toggles */}
          {FIELD_GROUPS.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {group.label}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {group.fields.map((field) => (
                  <Controller
                    key={field.key}
                    name={`config.fields.${field.key}`}
                    control={control}
                    render={({ field: formField }) => (
                      <div
                        className={cn(
                          "flex items-center justify-between rounded-lg border px-4 py-3 transition-colors",
                          formField.value
                            ? "border-indigo-200 bg-indigo-50/50"
                            : "border-gray-100 bg-gray-50"
                        )}
                      >
                        <p
                          className={cn(
                            "text-sm font-medium",
                            formField.value ? "text-gray-800" : "text-gray-400"
                          )}
                        >
                          {field.label}
                        </p>
                        <Switch
                          checked={formField.value}
                          onCheckedChange={formField.onChange}
                        />
                      </div>
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {serverError}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Template" : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/templates")}>
            Cancel
          </Button>
        </div>
      </form>

      {/* ── Live preview ──────────────────────────────────────────── */}
      <div className="space-y-3 xl:self-start xl:sticky xl:top-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Live Preview
        </p>
        <div
          className="rounded-2xl flex items-center justify-center p-5"
          style={{
            background: `radial-gradient(ellipse at 60% 40%, ${config.accentColor}28 0%, transparent 65%), linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)`,
          }}
        >
          <CardPreview config={config} size="lg" />
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          Updates live as you change settings
        </p>
      </div>
    </div>
  );
}
