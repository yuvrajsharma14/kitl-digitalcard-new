export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { Users, CreditCard, Eye, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatsCard } from "@/components/admin/StatsCard";
import { RecentUsers } from "@/components/admin/RecentUsers";
import { RecentCards } from "@/components/admin/RecentCards";

export const metadata: Metadata = { title: "Admin Dashboard" };

async function getStats() {
  const [totalUsers, totalCards, publishedCards, viewsResult, recentUsers, recentCards] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.card.count(),
      prisma.card.count({ where: { isPublished: true } }),
      prisma.cardAnalytics.aggregate({ _sum: { totalViews: true } }),
      prisma.user.findMany({
        where: { role: "USER" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
          _count: { select: { cards: true } },
        },
      }),
      prisma.card.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          displayName: true,
          slug: true,
          isPublished: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          analytics: { select: { totalViews: true } },
        },
      }),
    ]);

  return {
    totalUsers,
    totalCards,
    publishedCards,
    totalViews: viewsResult._sum.totalViews ?? 0,
    recentUsers,
    recentCards,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <AdminHeader
        title="Dashboard"
        subtitle="Welcome back — here's what's happening with My Digital Card."
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle="Registered accounts"
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatsCard
            title="Total Cards"
            value={stats.totalCards}
            subtitle="Cards created"
            icon={CreditCard}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
          <StatsCard
            title="Published Cards"
            value={stats.publishedCards}
            subtitle="Publicly accessible"
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatsCard
            title="Total Views"
            value={stats.totalViews}
            subtitle="All-time card views"
            icon={Eye}
            iconColor="text-orange-600"
            iconBg="bg-orange-50"
          />
        </div>

        {/* Recent activity */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentUsers users={stats.recentUsers} />
          <RecentCards cards={stats.recentCards} />
        </div>
      </main>
    </div>
  );
}
