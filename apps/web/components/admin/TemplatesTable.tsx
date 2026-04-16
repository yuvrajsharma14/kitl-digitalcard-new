"use client";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff, Plus } from "lucide-react";
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
  classic: "Classic",
  modern: "Modern",
  minimal: "Minimal",
  bold: "Bold",
};

export function TemplatesTable({ templates }: TemplatesTableProps) {
  const router = useRouter();

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {templates.length} template{templates.length !== 1 ? "s" : ""}
        </p>
        <Button asChild size="sm">
          <Link href="/admin/templates/new">
            <Plus className="mr-1.5 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-600">Template</TableHead>
              <TableHead className="font-semibold text-gray-600">Layout</TableHead>
              <TableHead className="font-semibold text-gray-600">Colors</TableHead>
              <TableHead className="font-semibold text-gray-600">Font</TableHead>
              <TableHead className="font-semibold text-gray-600">Status</TableHead>
              <TableHead className="font-semibold text-gray-600">Created</TableHead>
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
            ) : (
              templates.map((t) => (
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
