import type { Metadata } from "next";

export const metadata: Metadata = { title: "Account Settings" };

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Account Settings</h1>
      {/* Settings form — coming soon */}
    </div>
  );
}
