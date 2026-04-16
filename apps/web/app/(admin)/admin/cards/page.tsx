import type { Metadata } from "next";

export const metadata: Metadata = { title: "Card Management" };

export default function AdminCardsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Card Management</h1>
      {/* Cards table — coming soon */}
    </div>
  );
}
