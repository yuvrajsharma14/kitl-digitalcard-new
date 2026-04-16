import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create New Card" };

export default function NewCardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Create Your Card</h1>
      {/* Card builder — coming soon */}
    </div>
  );
}
