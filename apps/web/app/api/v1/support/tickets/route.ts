import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  subject:  z.string().min(3, "Subject is too short").max(120, "Subject is too long"),
  message:  z.string().min(10, "Message is too short").max(2000, "Message is too long"),
  category: z.enum(["GENERAL", "SUGGESTION", "COMPLAINT", "BUG", "BILLING", "OTHER"]),
});

// POST /api/v1/support/tickets — user submits a ticket
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId:   session.user.id,
      subject:  parsed.data.subject,
      message:  parsed.data.message,
      category: parsed.data.category,
    },
  });

  return NextResponse.json({ ticket }, { status: 201 });
}

// GET /api/v1/support/tickets — user lists their own tickets
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await prisma.supportTicket.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, subject: true, category: true,
      status: true, adminNote: true, createdAt: true, updatedAt: true,
    },
  });

  return NextResponse.json({ tickets });
}
