import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/v1/templates — active templates for card builder (authenticated users)
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await prisma.cardTemplate.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      thumbnailUrl: true,
      config: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ templates });
}
