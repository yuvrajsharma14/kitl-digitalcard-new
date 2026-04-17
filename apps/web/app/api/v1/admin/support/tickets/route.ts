import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/v1/admin/support/tickets — admin lists all tickets
export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status   = searchParams.get("status")   ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const tickets = await prisma.supportTicket.findMany({
    where: {
      ...(status   ? { status:   status   as never } : {}),
      ...(category ? { category: category as never } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ tickets });
}
