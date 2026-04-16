import { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { TemplateForm } from "@/components/admin/TemplateForm";

export const metadata: Metadata = { title: "New Template" };

export default function NewTemplatePage() {
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <AdminHeader title="New Template" subtitle="Design a card template for users" />
      <main className="flex-1 overflow-y-auto p-6">
        <TemplateForm mode="create" />
      </main>
    </div>
  );
}
