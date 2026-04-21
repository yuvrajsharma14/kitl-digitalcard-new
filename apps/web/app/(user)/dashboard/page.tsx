export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserHeader } from "@/components/user/UserHeader";
import { StatsCard } from "@/components/admin/StatsCard";
import {
  CreditCard, Eye, MousePointerClick, Share2,
  PlusCircle, Pencil, Globe, Lock, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteCardButton } from "@/components/user/DeleteCardButton";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardData(userId: string) {
  const cards = await prisma.card.findMany({
    where:   { userId },
    include: { analytics: true },
    orderBy: { updatedAt: "desc" },
  });

  const totalCards     = cards.length;
  const publishedCards = cards.filter((c) => c.isPublished).length;
  const totalViews     = cards.reduce((s, c) => s + (c.analytics?.totalViews  ?? 0), 0);
  const totalClicks    = cards.reduce((s, c) => s + (c.analytics?.totalClicks ?? 0), 0);

  return { cards, totalCards, publishedCards, totalViews, totalClicks };
}

function greeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  const first = name.split(" ")[0];
  return { time, first };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cards, totalCards, publishedCards, totalViews, totalClicks } =
    await getDashboardData(session.user.id);

  const { time, first } = greeting(session.user.name ?? "there");

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <UserHeader
        title="Dashboard"
        subtitle={`Good ${time}, ${first}!`}
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* ── Stats row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            title="Total Cards"
            value={totalCards}
            subtitle="Cards created"
            icon={CreditCard}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <StatsCard
            title="Published"
            value={publishedCards}
            subtitle={`${totalCards - publishedCards} draft${totalCards - publishedCards !== 1 ? "s" : ""}`}
            icon={Globe}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatsCard
            title="Total Views"
            value={totalViews}
            subtitle="Across all cards"
            icon={Eye}
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
        </div>

        {/* ── Recent Cards ──────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Recent Cards</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {totalCards === 0
                  ? "Create your first digital business card."
                  : `${totalCards} card${totalCards !== 1 ? "s" : ""} · ${publishedCards} published`}
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/card/new">
                <PlusCircle className="mr-1.5 h-4 w-4" /> New Card
              </Link>
            </Button>
          </div>

          {cards.length === 0 ? (
            /* Empty state */
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 mb-4">
                <CreditCard className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">No cards yet</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs">
                Create your first digital business card and share it with the world via QR code or link.
              </p>
              <Button asChild>
                <Link href="/card/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create my first card
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Show only 3 most recent cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.slice(0, 3).map((card) => {
                  const accent = (card.styles as { accentColor?: string } | null)?.accentColor ?? "#6366f1";
                  const bg     = (card.styles as { backgroundColor?: string } | null)?.backgroundColor ?? "#ffffff";
                  const views  = card.analytics?.totalViews  ?? 0;
                  const clicks = card.analytics?.totalClicks ?? 0;

                  return (
                    <div key={card.id}
                      className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                      <div className="h-20 relative"
                        style={{ background: `linear-gradient(135deg, ${accent}22, ${bg})` }}>
                        <div className="absolute top-3 right-3">
                          <Badge
                            className={card.isPublished
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-100"}>
                            {card.isPublished
                              ? <><Globe className="mr-1 h-3 w-3 inline" />Published</>
                              : <><Lock className="mr-1 h-3 w-3 inline" />Draft</>}
                          </Badge>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-8"
                          style={{ background: "linear-gradient(to top, rgba(255,255,255,0.95), transparent)" }} />
                      </div>

                      <div className="px-5 pt-3 pb-4 flex flex-col flex-1">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{card.displayName}</p>
                          {card.jobTitle && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">{card.jobTitle}
                              {card.company && <span className="text-gray-400"> · {card.company}</span>}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Eye className="h-3.5 w-3.5" /> {views.toLocaleString()} views
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <MousePointerClick className="h-3.5 w-3.5" /> {clicks.toLocaleString()} clicks
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                          <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs">
                            <Link href={`/card/${card.id}/edit`}>
                              <Pencil className="mr-1.5 h-3 w-3" /> Edit
                            </Link>
                          </Button>
                          {card.isPublished && (
                            <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs">
                              <Link href={`/u/${card.slug}`} target="_blank">
                                <Share2 className="mr-1.5 h-3 w-3" /> View
                              </Link>
                            </Button>
                          )}
                          <DeleteCardButton cardId={card.id} displayName={card.displayName} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View all link */}
              <div className="flex justify-center pt-1">
                <Link
                  href="/card"
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
                >
                  View all {totalCards} card{totalCards !== 1 ? "s" : ""}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </section>

      </main>
    </div>
  );
}
