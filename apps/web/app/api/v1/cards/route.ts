import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cardSchema } from "@/lib/validations/card";
import { slugify } from "@/lib/utils";

// GET /api/v1/cards — list current user's cards
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await prisma.card.findMany({
    where: { userId: session.user.id },
    include: { socialLinks: { orderBy: { order: "asc" } }, analytics: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ cards });
}

// POST /api/v1/cards — create a new card
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = cardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { socialLinks, styles, avatarUrl, ...rest } = parsed.data;

  // Generate unique slug
  let slug = slugify(rest.displayName);
  const existing = await prisma.card.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const card = await prisma.card.create({
    data: {
      ...rest,
      slug,
      userId:    session.user.id,
      avatarUrl: avatarUrl || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      styles: styles ? (styles as any) : null,
      socialLinks: {
        create: socialLinks,
      },
    },
    include: { socialLinks: true },
  });

  // Create analytics record
  await prisma.cardAnalytics.create({ data: { cardId: card.id } });

  return NextResponse.json({ card }, { status: 201 });
}
