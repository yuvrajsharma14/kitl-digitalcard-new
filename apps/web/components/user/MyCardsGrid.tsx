"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Pencil, Trash2, Globe, Lock, ExternalLink,
  Eye, MousePointerClick, Loader2, PlusCircle, Search, SlidersHorizontal, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface CardAnalytics { totalViews: number; totalClicks: number }

interface Card {
  id:          string;
  slug:        string;
  displayName: string;
  jobTitle:    string | null;
  company:     string | null;
  isPublished: boolean;
  isPrimary:   boolean;
  updatedAt:   string;
  styles:      Record<string, unknown> | null;
  analytics:   CardAnalytics | null;
}

type SortKey = "newest" | "oldest" | "name_asc" | "name_desc" | "views";
type FilterStatus = "all" | "published" | "draft";

export function MyCardsGrid({ initialCards }: { initialCards: Card[] }) {
  const [cards,      setCards]      = useState(initialCards);
  const [toggling,   setToggling]   = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [deleting,   setDeleting]   = useState<string | null>(null);

  const [search,       setSearch]       = useState("");
  const [sortKey,      setSortKey]      = useState<SortKey>("newest");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null);

  const visibleCards = useMemo(() => {
    let result = [...cards];

    // Filter by status
    if (filterStatus === "published") result = result.filter((c) => c.isPublished);
    if (filterStatus === "draft")     result = result.filter((c) => !c.isPublished);

    // Search across name, job title, company
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((c) =>
        c.displayName.toLowerCase().includes(q) ||
        (c.jobTitle ?? "").toLowerCase().includes(q) ||
        (c.company  ?? "").toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortKey) {
      case "newest":    result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); break;
      case "oldest":    result.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt)); break;
      case "name_asc":  result.sort((a, b) => a.displayName.localeCompare(b.displayName)); break;
      case "name_desc": result.sort((a, b) => b.displayName.localeCompare(a.displayName)); break;
      case "views":     result.sort((a, b) => (b.analytics?.totalViews ?? 0) - (a.analytics?.totalViews ?? 0)); break;
    }

    return result;
  }, [cards, search, sortKey, filterStatus]);

  // ── Publish toggle ──────────────────────────────────────────────────────────
  async function togglePublish(card: Card) {
    setToggling(card.id);
    try {
      const res = await fetch(`/api/v1/cards/${card.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: card.displayName,
          jobTitle:    card.jobTitle   ?? undefined,
          company:     card.company    ?? undefined,
          styles:      card.styles     ?? undefined,
          isPublished: !card.isPublished,
          socialLinks: [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, isPublished: data.card.isPublished } : c))
        );
      }
    } finally {
      setToggling(null);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete(cardId: string) {
    setDeleting(cardId);
    try {
      await fetch(`/api/v1/cards/${cardId}`, { method: "DELETE" });
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      setConfirmDel(null);
    } finally {
      setDeleting(null);
    }
  }

  // ── Set primary ────────────────────────────────────────────────────────────
  async function setPrimary(cardId: string) {
    setSettingPrimary(cardId);
    try {
      const res = await fetch(`/api/v1/cards/${cardId}/primary`, { method: "PATCH" });
      if (res.ok) {
        setCards((prev) =>
          prev.map((c) => ({ ...c, isPrimary: c.id === cardId }))
        );
      }
    } finally {
      setSettingPrimary(null);
    }
  }

  // ── No cards at all ─────────────────────────────────────────────────────────
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 mb-4">
          <PlusCircle className="h-8 w-8 text-indigo-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">No cards yet</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          Create your first digital business card and share it via QR code or link.
        </p>
        <Button asChild>
          <Link href="/card/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create my first card
          </Link>
        </Button>
      </div>
    );
  }

  const publishedCount = cards.filter((c) => c.isPublished).length;
  const draftCount     = cards.length - publishedCount;

  return (
    <div className="space-y-4">

      {/* ── Search / Sort / Filter bar ───────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, title or company…"
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="h-4 w-4 text-gray-400 shrink-0" />
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="h-9 w-44 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name_asc">Name A → Z</SelectItem>
              <SelectItem value="name_desc">Name Z → A</SelectItem>
              <SelectItem value="views">Most views</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Filter tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 text-sm">
        {(
          [
            { key: "all",       label: `All (${cards.length})` },
            { key: "published", label: `Published (${publishedCount})` },
            { key: "draft",     label: `Draft (${draftCount})` },
          ] as { key: FilterStatus; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filterStatus === key
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── No results from search/filter ───────────────────────────────── */}
      {visibleCards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <p className="text-sm text-gray-400">No cards match your search or filter.</p>
          <button
            onClick={() => { setSearch(""); setFilterStatus("all"); }}
            className="mt-3 text-xs text-indigo-500 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visibleCards.map((card) => {
        const accent  = (card.styles as { accentColor?: string } | null)?.accentColor ?? "#6366f1";
        const bg      = (card.styles as { backgroundColor?: string } | null)?.backgroundColor ?? "#ffffff";
        const views   = card.analytics?.totalViews  ?? 0;
        const clicks  = card.analytics?.totalClicks ?? 0;
        const isDelConfirm    = confirmDel    === card.id;
        const isDeleting      = deleting      === card.id;
        const isToggling      = toggling      === card.id;
        const isSettingPrimary = settingPrimary === card.id;

        return (
          <div
            key={card.id}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
          >
            {/* Colour strip */}
            <div
              className="h-20 relative"
              style={{ background: `linear-gradient(135deg, ${accent}22, ${bg})` }}
            >
              {/* Publish toggle */}
              <button
                onClick={() => togglePublish(card)}
                disabled={isToggling}
                className={`absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all shadow-sm ${
                  card.isPublished
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {isToggling ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : card.isPublished ? (
                  <Globe className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
                {card.isPublished ? "Published" : "Draft"}
              </button>

              {/* Primary badge */}
              {card.isPrimary && (
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700 shadow-sm">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Primary
                </div>
              )}

              <div className="absolute bottom-0 left-0 w-full h-8"
                style={{ background: "linear-gradient(to top, rgba(255,255,255,0.95), transparent)" }} />
            </div>

            {/* Card info */}
            <div className="px-5 pt-3 pb-4 flex flex-col flex-1">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{card.displayName}</p>
                {(card.jobTitle || card.company) && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {card.jobTitle}
                    {card.jobTitle && card.company && <span className="text-gray-400"> · </span>}
                    {card.company}
                  </p>
                )}

                {/* Mini stats */}
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Eye className="h-3.5 w-3.5" /> {views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MousePointerClick className="h-3.5 w-3.5" /> {clicks.toLocaleString()} clicks
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                {/* Primary actions */}
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs">
                    <Link href={`/card/${card.id}/edit`}>
                      <Pencil className="mr-1.5 h-3 w-3" /> Edit
                    </Link>
                  </Button>
                  {card.isPublished && (
                    <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs">
                      <Link href={`/u/${card.slug}`} target="_blank">
                        <ExternalLink className="mr-1.5 h-3 w-3" /> View
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Set as primary — only for published, non-primary cards */}
                {card.isPublished && !card.isPrimary && (
                  <button
                    onClick={() => setPrimary(card.id)}
                    disabled={isSettingPrimary}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-100 py-1.5 text-xs text-gray-400 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-60"
                  >
                    {isSettingPrimary
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Star className="h-3.5 w-3.5" />}
                    Set as primary
                  </button>
                )}

                {/* Delete */}
                {isDelConfirm ? (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-xs text-gray-500 flex-1">Delete this card?</span>
                    <button
                      onClick={() => handleDelete(card.id)}
                      disabled={isDeleting}
                      className="flex items-center gap-1 rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
                    >
                      {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes, delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDel(null)}
                      disabled={isDeleting}
                      className="rounded-md border border-gray-200 px-2.5 py-1 text-[11px] text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDel(card.id)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-100 py-1.5 text-xs text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete card
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Add new card tile — only show when not filtering/searching */}
      {!search && filterStatus === "all" && (
        <Link
          href="/card/new"
          className="rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-10 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors group min-h-[220px]"
        >
          <PlusCircle className="h-8 w-8 text-gray-300 group-hover:text-indigo-400 mb-2 transition-colors" />
          <p className="text-sm font-medium text-gray-400 group-hover:text-indigo-500 transition-colors">
            Add a card
          </p>
        </Link>
      )}
    </div>
      )}
    </div>
  );
}
