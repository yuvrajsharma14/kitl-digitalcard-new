export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { TemplatesTable } from "@/components/admin/TemplatesTable";
import type { TemplateConfig } from "@/lib/types/template";

export const metadata: Metadata = { title: "Card Templates" };

async function getTemplates() {
  return prisma.cardTemplate.findMany({ orderBy: { createdAt: "desc" } });
}

export default async function AdminTemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <AdminHeader
        title="Card Templates"
        subtitle={`${templates.length} template${templates.length !== 1 ? "s" : ""}`}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <TemplatesTable
          templates={templates.map((t) => ({
            ...t,
            config: t.config as unknown as TemplateConfig,
          }))}
        />
      </main>
    </div>
  );
}
