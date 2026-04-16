import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/v1/admin/stats
export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalCards, publishedCards, totalViews] = await Promise.all([
    prisma.user.count(),
    prisma.card.count(),
    prisma.card.count({ where: { isPublished: true } }),
    prisma.cardAnalytics.aggregate({ _sum: { totalViews: true } }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalCards,
    publishedCards,
    totalViews: totalViews._sum.totalViews ?? 0,
  });
}
