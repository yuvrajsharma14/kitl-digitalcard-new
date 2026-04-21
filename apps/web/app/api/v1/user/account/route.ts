import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email!;

  // Delete everything belonging to this user in dependency order
  await prisma.$transaction([
    // Card-level children first
    prisma.cardView.deleteMany({
      where: { card: { userId } },
    }),
    prisma.cardAnalytics.deleteMany({
      where: { card: { userId } },
    }),
    prisma.socialLink.deleteMany({
      where: { card: { userId } },
    }),
    prisma.card.deleteMany({ where: { userId } }),
    // User-level children
    prisma.supportTicket.deleteMany({ where: { userId } }),
    prisma.verificationToken.deleteMany({ where: { identifier: userEmail } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.account.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  return NextResponse.json({ success: true });
}
