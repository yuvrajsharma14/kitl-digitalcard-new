"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff, Plus, ScanEye, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TemplatePreviewDialog } from "@/components/admin/TemplatePreviewDialog";
import type { TemplateConfig } from "@/lib/types/template";

interface Template {
  id: string;
  name: string;
  description: string | null;
  config: TemplateConfig;
  isActive: boolean;
  createdAt: Date;
}

interface TemplatesTableProps {
  templates: Template[];
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

type SortKey = "name" | "layout" | "status" | "createdAt";
type SortDir = "asc" | "desc";

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
  return sortDir === "asc"
    ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-indigo-600" />
    : <ArrowDown className="ml-1 h-3.5 w-3.5 text-indigo-600" />;
}

export function TemplatesTable({ templates }: TemplatesTableProps) {
  const router = useRouter();
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [search, setSearch]     = useState("");
  const [sortKey, setSortKey]   = useState<SortKey>("createdAt");
  const [sortDir, setSortDir]   = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? templates.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            (t.description ?? "").toLowerCase().includes(q) ||
            (LAYOUT_LABELS[t.config.layout] ?? t.config.layout).toLowerCase().includes(q)
        )
      : templates;

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name")      cmp = a.name.localeCompare(b.name);
      if (sortKey === "layout")    cmp = (LAYOUT_LABELS[a.config.layout] ?? a.config.layout).localeCompare(LAYOUT_LABELS[b.config.layout] ?? b.config.layout);
      if (sortKey === "status")    cmp = Number(b.isActive) - Number(a.isActive);
      if (sortKey === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [templates, search, sortKey, sortDir]);

  async function handleToggleActive(id: string, current: boolean) {
    await fetch(`/api/v1/admin/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete template "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/v1/admin/templates/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
    <TemplatePreviewDialog
      open={!!previewTemplate}
      onOpenChange={(open) => { if (!open) setPreviewTemplate(null); }}
      template={previewTemplate}
    />
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3 sm:ml-auto">
          <p className="text-sm text-gray-500 shrink-0">
            {displayed.length} of {templates.length} template{templates.length !== 1 ? "s" : ""}
          </p>
          <Button asChild size="sm">
            <Link href="/admin/templates/new">
              <Plus className="mr-1.5 h-4 w-4" />
              New Template
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-600">
                <button type="button" onClick={() => toggleSort("name")} className="flex items-center hover:text-gray-900 transition-colors">
                  Template <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                <button type="button" onClick={() => toggleSort("layout")} className="flex items-center hover:text-gray-900 transition-colors">
                  Layout <SortIcon col="layout" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="font-semibold text-gray-600">Colors</TableHead>
              <TableHead className="font-semibold text-gray-600">Font</TableHead>
              <TableHead className="font-semibold text-gray-600">
                <button type="button" onClick={() => toggleSort("status")} className="flex items-center hover:text-gray-900 transition-colors">
                  Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                <button type="button" onClick={() => toggleSort("createdAt")} className="flex items-center hover:text-gray-900 transition-colors">
                  Created <SortIcon col="createdAt" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-12">
                  No templates yet.{" "}
                  <Link href="/admin/templates/new" className="text-indigo-600 hover:underline">
                    Create your first template.
                  </Link>
                </TableCell>
              </TableRow>
            ) : displayed.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-12">
                  No templates match &ldquo;{search}&rdquo;.
                </TableCell>
              </TableRow>
            ) : (
              displayed.map((t) => (
                <TableRow key={t.id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* Color swatch */}
                      <div
                        className="h-9 w-9 shrink-0 rounded-lg border shadow-sm"
                        style={{ backgroundColor: t.config.backgroundColor }}
                      >
                        <div
                          className="h-full w-full rounded-lg opacity-50"
                          style={{ backgroundColor: t.config.accentColor }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.name}</p>
                        {t.description && (
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 capitalize">
                      {LAYOUT_LABELS[t.config.layout] ?? t.config.layout}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {[t.config.backgroundColor, t.config.textColor, t.config.accentColor].map(
                        (color, i) => (
                          <div
                            key={i}
                            title={color}
                            className="h-5 w-5 rounded-full border border-gray-200 shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 capitalize">
                      {t.config.fontFamily}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        t.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-100"
                      }
                    >
                      {t.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-indigo-600"
                        title="Preview card"
                        onClick={() => setPreviewTemplate(t)}
                      >
                        <ScanEye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewTemplate(t)}>
                            <ScanEye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/templates/${t.id}/edit`} className="flex items-center">
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(t.id, t.isActive)}
                          >
                            {t.isActive ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4 text-orange-500" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4 text-green-500" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(t.id, t.name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
