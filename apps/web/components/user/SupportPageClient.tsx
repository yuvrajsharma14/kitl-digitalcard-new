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
import { Badge }    from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type TicketStatus   = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type TicketCategory = "GENERAL" | "SUGGESTION" | "COMPLAINT" | "BUG" | "BILLING" | "OTHER";

interface MyTicket {
  id:        string;
  subject:   string;
  category:  TicketCategory;
  status:    TicketStatus;
  adminNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Props { tickets: MyTicket[] }

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN:        "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED:    "Resolved",
  CLOSED:      "Closed",
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN:        "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED:    "bg-green-100 text-green-700",
  CLOSED:      "bg-gray-100 text-gray-500",
};

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: "GENERAL",    label: "General Enquiry" },
  { value: "SUGGESTION", label: "Suggestion" },
  { value: "COMPLAINT",  label: "Complaint" },
  { value: "BUG",        label: "Bug Report" },
  { value: "BILLING",    label: "Billing" },
  { value: "OTHER",      label: "Other" },
];

// ── Form schema ───────────────────────────────────────────────────────────────

const formSchema = z.object({
  subject:  z.string().min(3, "Subject must be at least 3 characters").max(120),
  category: z.enum(["GENERAL", "SUGGESTION", "COMPLAINT", "BUG", "BILLING", "OTHER"]),
  message:  z.string().min(10, "Message must be at least 10 characters").max(2000),
});
type FormValues = z.infer<typeof formSchema>;

// ── Component ─────────────────────────────────────────────────────────────────

export function SupportPageClient({ tickets: initialTickets }: Props) {
  const router = useRouter();
  const [tickets, setTickets] = useState<MyTicket[]>(initialTickets);
  const [showForm, setShowForm]   = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { subject: "", category: "GENERAL", message: "" },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      const res = await fetch("/api/v1/support/tickets", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json();
        setServerError(data?.error?.formErrors?.[0] ?? "Something went wrong. Please try again.");
        return;
      }
      const { ticket } = await res.json();
      setTickets((prev) => [ticket, ...prev]);
      reset();
      setShowForm(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col overflow-hidden h-full">
    <div className="flex-1 overflow-y-auto p-8">
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="text-sm text-gray-500 mt-1">Submit a ticket and our team will get back to you.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> New Ticket
          </Button>
        )}
      </div>

      {/* New ticket form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">New Support Ticket</h2>
            <button type="button" onClick={() => { setShowForm(false); setServerError(null); reset(); }}
              className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input id="subject" placeholder="Brief summary of your issue" {...register("subject")} />
                {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Controller name="category" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea id="message" rows={5} placeholder="Describe your issue in detail..." {...register("message")} />
              {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
            </div>

            {serverError && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {serverError}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Ticket
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset(); }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets list */}
      {tickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-400 text-sm">You haven&apos;t submitted any tickets yet.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowForm(true)}>
            Submit your first ticket
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Your Tickets</h2>
          {tickets.map((t) => (
            <div key={t.id} className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-gray-900">{t.subject}</p>
                  <p className="text-xs text-gray-400">
                    {CATEGORY_OPTIONS.find((c) => c.value === t.category)?.label} ·{" "}
                    {new Date(t.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <Badge className={`${STATUS_COLORS[t.status]} shrink-0`}>
                  {STATUS_LABELS[t.status]}
                </Badge>
              </div>
              {t.adminNote && (
                <div className="mt-3 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">
                  <p className="text-xs font-semibold text-indigo-600 mb-1">Response from Support</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{t.adminNote}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
    </div>
  );
}
