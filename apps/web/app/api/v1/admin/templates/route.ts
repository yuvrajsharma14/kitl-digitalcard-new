import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const configSchema = z.object({
  layout: z.enum(["classic", "modern", "minimal", "bold"]),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  fontFamily: z.enum(["inter", "poppins", "roboto", "playfair", "montserrat"]),
});

const createSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  config: configSchema,
  isActive: z.boolean().default(true),
});

// GET /api/v1/admin/templates
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const templates = await prisma.cardTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ templates });
}

// POST /api/v1/admin/templates
export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { thumbnailUrl, ...rest } = parsed.data;
  const template = await prisma.cardTemplate.create({
    data: {
      ...rest,
      thumbnailUrl: thumbnailUrl || null,
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}
