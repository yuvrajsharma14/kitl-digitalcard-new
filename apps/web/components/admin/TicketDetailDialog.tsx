"use client";

import { useState, useTransition } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge }    from "@/components/ui/badge";
import { Button }   from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label }    from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export type TicketStatus   = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketCategory = "GENERAL" | "SUGGESTION" | "COMPLAINT" | "BUG" | "BILLING" | "OTHER";

export interface Ticket {
  id:        string;
  subject:   string;
  message:   string;
  category:  TicketCategory;
  status:    TicketStatus;
  adminNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; email: string };
}

interface Props {
  open:           boolean;
  onOpenChange:   (open: boolean) => void;
  ticket:         Ticket | null;
  onUpdated:      (ticket: Ticket) => void;
}

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

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  GENERAL:    "General",
  SUGGESTION: "Suggestion",
  COMPLAINT:  "Complaint",
  BUG:        "Bug Report",
  BILLING:    "Billing",
  OTHER:      "Other",
};

export function TicketDetailDialog({ open, onOpenChange, ticket, onUpdated }: Props) {
  const [status,    setStatus]    = useState<TicketStatus>(ticket?.status ?? "OPEN");
  const [adminNote, setAdminNote] = useState(ticket?.adminNote ?? "");
  const [isPending, startTransition] = useTransition();

  // Sync local state when ticket changes
  if (ticket && ticket.status !== status && !isPending) {
    setStatus(ticket.status);
    setAdminNote(ticket.adminNote ?? "");
  }

  if (!ticket) return null;

  async function handleSave() {
    if (!ticket) return;
    startTransition(async () => {
      const res = await fetch(`/api/v1/admin/support/tickets/${ticket.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status, adminNote: adminNote || null }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdated(data.ticket);
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <DialogTitle className="text-lg leading-snug pr-6">{ticket.subject}</DialogTitle>
            <Badge className={STATUS_COLORS[ticket.status]}>
              {STATUS_LABELS[ticket.status]}
            </Badge>
          </div>
        </DialogHeader>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 -mt-1">
          <span><span className="font-medium text-gray-700">From:</span> {ticket.user.name} ({ticket.user.email})</span>
          <span><span className="font-medium text-gray-700">Category:</span> {CATEGORY_LABELS[ticket.category]}</span>
          <span><span className="font-medium text-gray-700">Submitted:</span> {new Date(ticket.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
        </div>

        {/* Message */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Message</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
        </div>

        {/* Admin response */}
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Admin Response</p>

          <div className="space-y-2">
            <Label htmlFor="status">Update Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
              <SelectTrigger id="status" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(STATUS_LABELS) as [TicketStatus, string][]).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminNote">Note / Response <span className="text-gray-400 font-normal">(visible to user)</span></Label>
            <Textarea
              id="adminNote"
              rows={4}
              placeholder="Write a response or internal note..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Response
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
