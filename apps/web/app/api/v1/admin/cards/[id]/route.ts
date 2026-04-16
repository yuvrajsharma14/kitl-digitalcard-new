import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteContext {
  params: { id: string };
}

const updateSchema = z.object({
  isPublished: z.boolean().optional(),
});

// PATCH /api/v1/admin/cards/:id — publish / unpublish
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const card = await prisma.card.update({
    where: { id: params.id },
    data: parsed.data,
    select: { id: true, displayName: true, isPublished: true },
  });

  return NextResponse.json({ card });
}

// DELETE /api/v1/admin/cards/:id
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.card.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
