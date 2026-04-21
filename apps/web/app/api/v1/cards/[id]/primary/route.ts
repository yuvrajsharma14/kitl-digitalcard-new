import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: { id: string };
}

// PATCH /api/v1/cards/:id/primary  — set this card as the user's primary card
export async function PATCH(_req: NextRequest, { params }: RouteContext) {
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

  if (!card.isPublished) {
    return NextResponse.json(
      { error: "Only published cards can be set as primary" },
      { status: 400 }
    );
  }

  // Use a transaction: clear all, then set this one
  await prisma.$transaction([
    prisma.card.updateMany({
      where: { userId: session.user.id },
      data:  { isPrimary: false },
    }),
    prisma.card.update({
      where: { id: params.id },
      data:  { isPrimary: true },
    }),
  ]);

  return NextResponse.json({ success: true });
}
