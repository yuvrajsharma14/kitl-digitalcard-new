export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { TemplateForm } from "@/components/admin/TemplateForm";
import type { TemplateConfig } from "@/lib/types/template";

export const metadata: Metadata = { title: "Edit Template" };

interface PageProps {
  params: { id: string };
}

export default async function EditTemplatePage({ params }: PageProps) {
  const template = await prisma.cardTemplate.findUnique({
    where: { id: params.id },
  });

  if (!template) notFound();

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <AdminHeader
        title="Edit Template"
        subtitle={template.name}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <TemplateForm
          mode="edit"
          templateId={template.id}
          defaultValues={{
            name: template.name,
            description: template.description ?? "",
            thumbnailUrl: template.thumbnailUrl ?? "",
            isActive: template.isActive,
            config: template.config as unknown as TemplateConfig,
          }}
        />
      </main>
    </div>
  );
}
