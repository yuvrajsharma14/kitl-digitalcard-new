import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Card" };

export default function EditCardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Edit Card</h1>
      {/* Card builder (edit mode) — coming soon */}
    </div>
  );
}
