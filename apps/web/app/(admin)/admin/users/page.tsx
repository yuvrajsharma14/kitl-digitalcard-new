export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { UsersTable } from "@/components/admin/UsersTable";

export const metadata: Metadata = { title: "User Management" };

interface PageProps {
  searchParams: { page?: string; search?: string };
}

async function getUsers(page: number, search: string) {
  const limit = 15;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        role: "USER" as const,
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : { role: "USER" as const };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { cards: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit };
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { users, total, limit } = await getUsers(page, search);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <AdminHeader
        title="User Management"
        subtitle={`${total} registered user${total !== 1 ? "s" : ""}`}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <UsersTable
          users={users}
          total={total}
          page={page}
          totalPages={totalPages}
          search={search}
        />
      </main>
    </div>
  );
}
