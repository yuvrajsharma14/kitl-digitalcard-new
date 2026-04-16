import type { Metadata } from "next";

export const metadata: Metadata = { title: "User Management" };

export default function AdminUsersPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">User Management</h1>
      {/* Users table — coming soon */}
    </div>
  );
}
