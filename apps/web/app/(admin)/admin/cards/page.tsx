import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CardsTable } from "@/components/admin/CardsTable";

export const metadata: Metadata = { title: "Card Management" };

interface PageProps {
  searchParams: { page?: string; search?: string };
}

async function getCards(page: number, search: string) {
  const limit = 15;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { displayName: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
          { user: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [cards, total] = await Promise.all([
    prisma.card.findMany({
      where,
      select: {
        id: true,
        displayName: true,
        slug: true,
        jobTitle: true,
        company: true,
        isPublished: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        analytics: { select: { totalViews: true } },
        _count: { select: { socialLinks: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.card.count({ where }),
  ]);

  return { cards, total, page, limit };
}

export default async function AdminCardsPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { cards, total, limit } = await getCards(page, search);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <AdminHeader
        title="Card Management"
        subtitle={`${total} card${total !== 1 ? "s" : ""} created`}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <CardsTable
          cards={cards}
          total={total}
          page={page}
          totalPages={totalPages}
          search={search}
        />
      </main>
    </div>
  );
}
