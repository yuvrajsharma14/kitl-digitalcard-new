import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: { username: string };
}

// GET /api/v1/public/cards/:username — no auth required
export async function GET(req: NextRequest, { params }: RouteContext) {
  const card = await prisma.card.findFirst({
    where: { slug: params.username, isPublished: true },
    include: {
      socialLinks: { orderBy: { order: "asc" } },
      user:        { select: { avatarUrl: true } },
    },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  // Fall back to the user's profile photo if the card has no dedicated avatar
  const { user, ...cardData } = card;
  const resolvedCard = {
    ...cardData,
    avatarUrl: cardData.avatarUrl ?? user?.avatarUrl ?? null,
  };

  // Record view (fire-and-forget)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined;
  const userAgent = req.headers.get("user-agent") ?? undefined;

  prisma.cardView
    .create({ data: { cardId: card.id, ipAddress: ip, userAgent } })
    .then(() =>
      prisma.cardAnalytics.upsert({
        where: { cardId: card.id },
        update: { totalViews: { increment: 1 } },
        create: { cardId: card.id, totalViews: 1 },
      })
    )
    .catch(() => null);

  return NextResponse.json({ card: resolvedCard });
}
