export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserHeader } from "@/components/user/UserHeader";
import { MyCardsGrid } from "@/components/user/MyCardsGrid";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export const metadata: Metadata = { title: "My Cards" };

export default async function MyCardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [cards, user] = await Promise.all([
    prisma.card.findMany({
      where:   { userId: session.user.id },
      include: { analytics: true, socialLinks: { orderBy: { order: "asc" } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { avatarUrl: true } }),
  ]);

  // Serialise dates so they can be passed to the client component
  const serialised = cards.map((c) => ({
    id:          c.id,
    slug:        c.slug,
    displayName: c.displayName,
    jobTitle:    c.jobTitle,
    company:     c.company,
    avatarUrl:   c.avatarUrl ?? user?.avatarUrl ?? null,
    email:       c.email,
    phone:       c.phone,
    website:     c.website,
    socialLinks: c.socialLinks.map((s) => ({ platform: s.platform, url: s.url })),
    isPublished: c.isPublished,
    isPrimary:   c.isPrimary,
    updatedAt:   c.updatedAt.toISOString(),
    styles:      c.styles as Record<string, unknown> | null,
    analytics:   c.analytics
      ? { totalViews: c.analytics.totalViews, totalClicks: c.analytics.totalClicks }
      : null,
  }));

  const publishedCount = cards.filter((c) => c.isPublished).length;

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <UserHeader
        title="My Cards"
        subtitle={
          cards.length === 0
            ? "Create your first digital business card"
            : `${cards.length} card${cards.length !== 1 ? "s" : ""} · ${publishedCount} published`
        }
      >
        <Button asChild size="sm">
          <Link href="/card/new">
            <PlusCircle className="mr-1.5 h-4 w-4" /> New Card
          </Link>
        </Button>
      </UserHeader>

      <main className="flex-1 overflow-y-auto p-6">
        <MyCardsGrid initialCards={serialised} />
      </main>
    </div>
  );
}
