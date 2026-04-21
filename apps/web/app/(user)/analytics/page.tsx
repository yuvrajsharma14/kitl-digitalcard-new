export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserHeader } from "@/components/user/UserHeader";
import { ViewsChart, type DayData } from "@/components/user/ViewsChart";
import { StatsCard } from "@/components/admin/StatsCard";
import {
  Eye, MousePointerClick, CreditCard, Globe,
  TrendingUp, ExternalLink, Lock,
} from "lucide-react";

export const metadata: Metadata = { title: "Analytics" };

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function getAnalyticsData(userId: string) {
  // All cards with analytics
  const cards = await prisma.card.findMany({
    where:   { userId },
    include: { analytics: true },
    orderBy: { updatedAt: "desc" },
  });

  const cardIds = cards.map((c) => c.id);

  // Last 30 days of view events
  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const viewEvents = cardIds.length
    ? await prisma.cardView.findMany({
        where:  { cardId: { in: cardIds }, viewedAt: { gte: since } },
        select: { viewedAt: true },
        orderBy: { viewedAt: "asc" },
      })
    : [];

  // Build 30-day bucket map (always 30 entries, even if 0)
  const buckets: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    buckets[d.toISOString().slice(0, 10)] = 0;
  }
  for (const ev of viewEvents) {
    const key = ev.viewedAt.toISOString().slice(0, 10);
    if (key in buckets) buckets[key]++;
  }
  const dailyData: DayData[] = Object.entries(buckets).map(([date, count]) => ({ date, count }));

  // Summary totals
  const totalViews    = cards.reduce((s, c) => s + (c.analytics?.totalViews  ?? 0), 0);
  const totalClicks   = cards.reduce((s, c) => s + (c.analytics?.totalClicks ?? 0), 0);
  const publishedCards = cards.filter((c) => c.isPublished).length;

  return { cards, dailyData, totalViews, totalClicks, publishedCards };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cards, dailyData, totalViews, totalClicks, publishedCards } =
    await getAnalyticsData(session.user.id);

  const recentViews = dailyData.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <UserHeader title="Analytics" subtitle="Views and engagement across all your cards" />

      <main className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* ── Summary stats ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            title="Total Views"
            value={totalViews}
            subtitle="All-time across all cards"
            icon={Eye}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <StatsCard
            title="Last 30 Days"
            value={recentViews}
            subtitle="Views in the past month"
            icon={TrendingUp}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatsCard
            title="Link Clicks"
            value={totalClicks}
            subtitle="Contact & social taps"
            icon={MousePointerClick}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
          <StatsCard
            title="Published Cards"
            value={publishedCards}
            subtitle={`of ${cards.length} total card${cards.length !== 1 ? "s" : ""}`}
            icon={Globe}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
        </div>

        {/* ── 30-day chart ─────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Daily Views</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 30 days · all cards combined</p>
            </div>
          </div>

          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Eye className="h-8 w-8 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-400">No cards yet</p>
              <p className="text-xs text-gray-300 mt-1">Create your first card to start seeing views here.</p>
              <Link
                href="/card/new"
                className="mt-4 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Create a card
              </Link>
            </div>
          ) : recentViews === 0 ? (
            <div className="space-y-4">
              <ViewsChart data={dailyData} />
              <p className="text-xs text-center text-gray-400">
                No views yet in this period. Share your card link to start getting views!
              </p>
            </div>
          ) : (
            <ViewsChart data={dailyData} />
          )}
        </section>

        {/* ── Per-card breakdown ────────────────────────────────────────── */}
        {cards.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Card Performance</h2>
              <span className="text-xs text-gray-400">{cards.length} card{cards.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                <div className="col-span-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Card</div>
                <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Status</div>
                <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Views</div>
                <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Clicks</div>
                <div className="col-span-1" />
              </div>

              {/* Rows */}
              {cards.map((card, idx) => {
                const views  = card.analytics?.totalViews  ?? 0;
                const clicks = card.analytics?.totalClicks ?? 0;
                const accent = (card.styles as { accentColor?: string } | null)?.accentColor ?? "#6366f1";

                return (
                  <div
                    key={card.id}
                    className={`grid grid-cols-12 gap-4 items-center px-5 py-4 ${
                      idx < cards.length - 1 ? "border-b border-gray-100" : ""
                    } hover:bg-gray-50/60 transition-colors`}
                  >
                    {/* Card name + slug */}
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <div
                        className="h-8 w-8 shrink-0 rounded-lg"
                        style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}88)` }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{card.displayName}</p>
                        {card.jobTitle && (
                          <p className="text-xs text-gray-400 truncate">{card.jobTitle}</p>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="col-span-2 flex justify-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        card.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {card.isPublished
                          ? <><Globe className="h-2.5 w-2.5" /> Live</>
                          : <><Lock className="h-2.5 w-2.5" /> Draft</>}
                      </span>
                    </div>

                    {/* Views */}
                    <div className="col-span-2 text-right">
                      <p className="text-sm font-semibold text-gray-900">{views.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">views</p>
                    </div>

                    {/* Clicks */}
                    <div className="col-span-2 text-right">
                      <p className="text-sm font-semibold text-gray-900">{clicks.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">clicks</p>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-end gap-1.5">
                      {card.isPublished && (
                        <Link
                          href={`/u/${card.slug}`}
                          target="_blank"
                          className="flex items-center justify-center rounded-md border border-gray-200 p-1.5 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                          title="View public card"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Empty state (no cards at all) ─────────────────────────────── */}
        {cards.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-16 text-center">
            <CreditCard className="h-10 w-10 text-gray-200 mb-3" />
            <h3 className="text-sm font-semibold text-gray-500 mb-1">No cards yet</h3>
            <p className="text-xs text-gray-400 max-w-xs mb-5">
              Create your first digital business card to start tracking views and engagement.
            </p>
            <Link
              href="/card/new"
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Create my first card
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
