"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { TemplateEditor } from "../../components/TemplateEditor";
import { DocumentType } from "@/types/template";
import { useTemplates } from "@/hooks/use-templates";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconLayout, IconPlus } from "@tabler/icons-react";

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
        {/* Page Header - Consistent with EPF/Salaries */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="flex items-center gap-6">
                <Button 
                    variant="outline"
                    onClick={() => router.back()}
                    className="h-12 w-12 rounded-2xl border-2 border-neutral-100 dark:border-neutral-800 flex items-center justify-center bg-white dark:bg-neutral-900 shadow-sm hover:scale-110 active:scale-95 transition-all"
                >
                    <IconArrowLeft className="h-6 w-6 text-neutral-400" />
                </Button>
                <div className="space-y-1.5">
                    <h3 className="text-xl font-black tracking-tight uppercase text-foreground/90">
                        {templateToClone ? "Clone Template" : "New Layout Designer"}
                    </h3>
                    <p className="text-neutral-500 font-medium text-xs">Configure your automated {type.replace('_', ' ')} format</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                 <div className="h-10 w-[2px] bg-neutral-100 dark:bg-neutral-800 hidden md:block" />
                 <div className="text-right hidden md:block">
                     <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Company Context</p>
                     <p className="text-xs font-bold text-primary">{companyId.substring(0, 8)}...</p>
                 </div>
            </div>
        </div>

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
