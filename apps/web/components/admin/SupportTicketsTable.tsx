"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge }  from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  TicketDetailDialog,
  type Ticket, type TicketStatus, type TicketCategory,
} from "@/components/admin/TicketDetailDialog";

interface SupportTicketsTableProps {
  tickets: Ticket[];
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN:        "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED:    "Resolved",
  CLOSED:      "Closed",
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN:        "bg-blue-100 text-blue-700 hover:bg-blue-100",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  RESOLVED:    "bg-green-100 text-green-700 hover:bg-green-100",
  CLOSED:      "bg-gray-100 text-gray-500 hover:bg-gray-100",
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  GENERAL:    "General",
  SUGGESTION: "Suggestion",
  COMPLAINT:  "Complaint",
  BUG:        "Bug Report",
  BILLING:    "Billing",
  OTHER:      "Other",
};

const CATEGORY_COLORS: Record<TicketCategory, string> = {
  GENERAL:    "bg-slate-100 text-slate-600",
  SUGGESTION: "bg-purple-100 text-purple-700",
  COMPLAINT:  "bg-red-100 text-red-700",
  BUG:        "bg-orange-100 text-orange-700",
  BILLING:    "bg-teal-100 text-teal-700",
  OTHER:      "bg-gray-100 text-gray-500",
};

type SortKey = "subject" | "category" | "status" | "createdAt";
type SortDir = "asc" | "desc";

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
  return sortDir === "asc"
    ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-indigo-600" />
    : <ArrowDown className="ml-1 h-3.5 w-3.5 text-indigo-600" />;
}

export function SupportTicketsTable({ tickets: initialTickets }: SupportTicketsTableProps) {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [search,   setSearch]   = useState("");
  const [filterStatus,   setFilterStatus]   = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = tickets;
    if (filterStatus !== "ALL")   result = result.filter((t) => t.status === filterStatus);
    if (filterCategory !== "ALL") result = result.filter((t) => t.category === filterCategory);
    if (q) result = result.filter(
      (t) => t.subject.toLowerCase().includes(q) ||
             t.user.name.toLowerCase().includes(q) ||
             t.user.email.toLowerCase().includes(q)
    );
    return [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "subject")   cmp = a.subject.localeCompare(b.subject);
      if (sortKey === "category")  cmp = a.category.localeCompare(b.category);
      if (sortKey === "status")    cmp = a.status.localeCompare(b.status);
      if (sortKey === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [tickets, search, filterStatus, filterCategory, sortKey, sortDir]);

  function handleUpdated(updated: Ticket) {
    setTickets((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    router.refresh();
  }

  return (
    <>
      <TicketDetailDialog
        open={!!selected}
        onOpenChange={(o) => { if (!o) setSelected(null); }}
        ticket={selected}
        onUpdated={handleUpdated}
      />

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input placeholder="Search tickets..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {(Object.entries(STATUS_LABELS) as [TicketStatus, string][]).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {(Object.entries(CATEGORY_LABELS) as [TicketCategory, string][]).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-sm text-gray-500 self-center sm:ml-auto shrink-0">
            {displayed.length} of {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-600">
                  <button type="button" onClick={() => toggleSort("subject")} className="flex items-center hover:text-gray-900 transition-colors">
                    Subject <SortIcon col="subject" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-gray-600">User</TableHead>
                <TableHead className="font-semibold text-gray-600">
                  <button type="button" onClick={() => toggleSort("category")} className="flex items-center hover:text-gray-900 transition-colors">
                    Category <SortIcon col="category" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  <button type="button" onClick={() => toggleSort("status")} className="flex items-center hover:text-gray-900 transition-colors">
                    Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  <button type="button" onClick={() => toggleSort("createdAt")} className="flex items-center hover:text-gray-900 transition-colors">
                    Submitted <SortIcon col="createdAt" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-12">
                    No support tickets yet.
                  </TableCell>
                </TableRow>
              ) : displayed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-12">
                    No tickets match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((t) => (
                  <TableRow key={t.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => setSelected(t)}>
                    <TableCell>
                      <p className="text-sm font-medium text-gray-900 hover:text-indigo-600 max-w-[260px] truncate">
                        {t.subject}
                      </p>
                      {t.adminNote && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">
                          Reply: {t.adminNote}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-700">{t.user.name}</p>
                      <p className="text-xs text-gray-400">{t.user.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${CATEGORY_COLORS[t.category]} hover:${CATEGORY_COLORS[t.category]}`}>
                        {CATEGORY_LABELS[t.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[t.status]}>
                        {STATUS_LABELS[t.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        onClick={() => setSelected(t)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
