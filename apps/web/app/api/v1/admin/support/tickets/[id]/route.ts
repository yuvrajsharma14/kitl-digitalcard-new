import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteContext { params: { id: string } }

const updateSchema = z.object({
  status:    z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  adminNote: z.string().max(2000).optional().nullable(),
});

// GET /api/v1/admin/support/tickets/:id
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ticket });
}

// PATCH /api/v1/admin/support/tickets/:id
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.update({
    where: { id: params.id },
    data:  parsed.data,
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ ticket });
}
