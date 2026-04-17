export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SupportTicketsTable } from "@/components/admin/SupportTicketsTable";

export const metadata: Metadata = { title: "Support Tickets" };

async function getTickets() {
  return prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export default async function AdminSupportPage() {
  const tickets = await getTickets();

  const open       = tickets.filter((t) => t.status === "OPEN").length;
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <AdminHeader
        title="Support Tickets"
        subtitle={`${tickets.length} total · ${open} open · ${inProgress} in progress`}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <SupportTicketsTable tickets={tickets as never} />
      </main>
    </div>
  );
}
