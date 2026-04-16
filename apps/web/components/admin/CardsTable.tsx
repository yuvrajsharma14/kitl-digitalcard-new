"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
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
import {
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface Card {
  id: string;
  displayName: string;
  slug: string;
  jobTitle: string | null;
  company: string | null;
  isPublished: boolean;
  createdAt: Date;
  user: { name: string; email: string };
  analytics: { totalViews: number } | null;
  _count: { socialLinks: number };
}

interface CardsTableProps {
  cards: Card[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
}

export function CardsTable({ cards, total, page, totalPages, search }: CardsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [pathname, router, searchParams]
  );

  async function handleTogglePublish(cardId: string, currentState: boolean) {
    await fetch(`/api/v1/admin/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !currentState }),
    });
    router.refresh();
  }

  async function handleDelete(cardId: string, name: string) {
    if (!confirm(`Delete card "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/v1/admin/cards/${cardId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, slug or owner..."
            defaultValue={search}
            onChange={(e) => updateParams({ search: e.target.value, page: "1" })}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-gray-500 ml-auto">
          {total} card{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-600">Card</TableHead>
              <TableHead className="font-semibold text-gray-600">Owner</TableHead>
              <TableHead className="font-semibold text-gray-600">Views</TableHead>
              <TableHead className="font-semibold text-gray-600">Links</TableHead>
              <TableHead className="font-semibold text-gray-600">Status</TableHead>
              <TableHead className="font-semibold text-gray-600">Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-12">
                  No cards found.
                </TableCell>
              </TableRow>
            ) : (
              cards.map((card) => (
                <TableRow key={card.id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 text-xs font-bold">
                        {card.displayName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{card.displayName}</p>
                        <p className="text-xs text-gray-400">
                          {card.jobTitle}
                          {card.jobTitle && card.company ? " · " : ""}
                          {card.company}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-700">{card.user.name}</p>
                      <p className="text-xs text-gray-400">{card.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Eye className="h-3.5 w-3.5 text-gray-400" />
                      {card.analytics?.totalViews ?? 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{card._count.socialLinks}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        card.isPublished
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-100"
                      }
                    >
                      {card.isPublished ? "Live" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(card.createdAt).toLocaleDateString("en-US", {
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
                        {card.isPublished && (
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/u/${card.slug}`}
                              target="_blank"
                              className="flex items-center"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Card
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleTogglePublish(card.id, card.isPublished)}
                        >
                          {card.isPublished ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4 text-orange-500" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4 text-green-500" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(card.id, card.displayName)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Card
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
