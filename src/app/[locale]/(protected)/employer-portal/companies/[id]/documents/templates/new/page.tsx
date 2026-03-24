"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { TemplateEditor } from "../../components/TemplateEditor";
import { DocumentType } from "@/types/template";
import { useTemplates } from "@/hooks/use-templates";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconLayout, IconPlus, IconLayoutGrid } from "@tabler/icons-react";

export default function NewTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = params.id as string;
  const type = (searchParams.get("type") as DocumentType) || DocumentType.PAYSLIP;
  const cloneId = searchParams.get("cloneId");

  const { templatesQuery } = useTemplates({ companyId });
  const templateToClone = templatesQuery.data?.find((t: any) => t.id === cloneId);

  const initialTemplate = templateToClone ? {
    ...templateToClone,
    id: undefined,
    name: `${templateToClone.name} (Copy)`,
    isActive: false,
    isDefault: false,
    companyId,
  } : undefined;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 px-4 py-8 max-w-[1600px] mx-auto">

        <TemplateEditor 
            template={initialTemplate}
            type={type}
            companyId={companyId}
            onSave={() => router.push(`/employer-portal/companies/${companyId}/documents/templates?tab=${type}`)}
            onCancel={() => router.back()}
        />
    </div>
  );
}
