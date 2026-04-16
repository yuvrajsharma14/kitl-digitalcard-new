import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar — coming soon */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6">
          <span className="text-xl font-bold text-blue-600">My Digital Card</span>
        </div>
        {/* Nav items — coming soon */}
      </aside>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
