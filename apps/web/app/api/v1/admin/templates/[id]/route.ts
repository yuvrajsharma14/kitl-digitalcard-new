import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteContext {
  params: { id: string };
}

const configSchema = z.object({
  layout: z.enum(["classic", "modern", "minimal", "bold"]),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  fontFamily: z.enum(["inter", "poppins", "roboto", "playfair", "montserrat"]),
});

const updateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable().or(z.literal("")),
  config: configSchema.optional(),
  isActive: z.boolean().optional(),
});

// GET /api/v1/admin/templates/:id
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const template = await prisma.cardTemplate.findUnique({
    where: { id: params.id },
  });

  if (!template) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ template });
}

// PATCH /api/v1/admin/templates/:id
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

  const { thumbnailUrl, ...rest } = parsed.data;
  const template = await prisma.cardTemplate.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(thumbnailUrl !== undefined ? { thumbnailUrl: thumbnailUrl || null } : {}),
    },
  });

  return NextResponse.json({ template });
}

// DELETE /api/v1/admin/templates/:id
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.cardTemplate.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
