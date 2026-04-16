import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Cards" };

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Cards</h1>
        <a
          href="/card/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + New Card
        </a>
      </div>
      {/* Cards grid — coming soon */}
    </div>
  );
}
