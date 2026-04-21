import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cardSchema } from "@/lib/validations/card";

interface RouteContext {
  params: { id: string };
}

// GET /api/v1/cards/:id
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const card = await prisma.card.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      socialLinks: { orderBy: { order: "asc" } },
      analytics:   true,
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

  return NextResponse.json({ card: resolvedCard });
}

// PUT /api/v1/cards/:id
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const card = await prisma.card.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = cardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { socialLinks, styles, avatarUrl, ...rest } = parsed.data;

  const updated = await prisma.card.update({
    where: { id: params.id },
    data: {
      ...rest,
      avatarUrl: avatarUrl || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      styles: styles ? (styles as any) : null,
      socialLinks: {
        deleteMany: {},
        create: socialLinks,
      },
    },
    include: { socialLinks: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ card: updated });
}

// DELETE /api/v1/cards/:id
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const card = await prisma.card.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  await prisma.card.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
