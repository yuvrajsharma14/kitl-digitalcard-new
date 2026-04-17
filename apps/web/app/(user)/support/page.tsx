export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SupportPageClient } from "@/components/user/SupportPageClient";

export const metadata: Metadata = { title: "Support" };

async function getMyTickets(userId: string) {
  return prisma.supportTicket.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, subject: true, category: true,
      status: true, adminNote: true, createdAt: true, updatedAt: true,
    },
  });
}

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tickets = await getMyTickets(session.user.id);

  return <SupportPageClient tickets={tickets as never} />;
}
