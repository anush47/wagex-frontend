"use client";

import React from "react";
import { DocumentType, DocumentTemplate, TemplateStatus } from "@/types/template";
import { useTemplates } from "@/hooks/use-templates";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  IconFileInvoice, 
  IconFileSpreadsheet, 
  IconClock, 
  IconPlus, 
  IconEdit, 
  IconCheck, 
  IconTrash,
  IconCopy,
  IconDotsVertical,
  IconClockHour4,
  IconDeviceFloppy,
  IconLayoutGrid,
  IconFiles,
  IconArrowLeft
} from "@tabler/icons-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { TemplateEditor } from "./TemplateEditor";
import { useSearchParams, usePathname } from "next/navigation";
import { useRouter } from "@/i18n/routing";

interface TemplatesGalleryProps {
  companyId: string;
}

export function TemplatesGallery({ companyId }: TemplatesGalleryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const currentTab = searchParams.get("tab") || DocumentType.PAYSLIP;
  const selectedType = currentTab as DocumentType;

  const [editingTemplate, setEditingTemplate] = React.useState<DocumentTemplate | null>(null);

  const { templatesQuery, updateTemplateMutation, deleteTemplateMutation } = useTemplates({ companyId });
  const templates = (templatesQuery.data || []) as DocumentTemplate[];

  const typeGroups: Record<string, { label: string; icon: any }> = {
    [DocumentType.PAYSLIP]: { label: "Payslips", icon: IconFileInvoice },
    [DocumentType.SALARY_SHEET]: { label: "Salary Sheets", icon: IconFileSpreadsheet },
    [DocumentType.ATTENDANCE_REPORT]: { label: "Attendance", icon: IconClock },
    [DocumentType.EPF_FORM]: { label: "EPF Forms", icon: IconFileInvoice },
    [DocumentType.ETF_FORM]: { label: "ETF Forms", icon: IconFileInvoice },
  };

  const filteredTemplates = templates.filter(t => t.type === selectedType);

  const handleSetActive = async (templateId: string) => {
    try {
      await updateTemplateMutation.mutateAsync({ 
        id: templateId, 
        data: { isActive: true, status: TemplateStatus.APPROVED } 
      });
      toast.success("Template approved and set as default");
    } catch (e) {
      toast.error("Failed to set default template");
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteTemplateMutation.mutateAsync(templateId);
      toast.success("Template deleted");
    } catch (e) {
      toast.error("Failed to delete template");
    }
  };

  const handleTabChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", val);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCreateNew = () => {
    router.push(`${pathname}/new?type=${selectedType}`);
  };

  const handleCustomLayout = (template: DocumentTemplate) => {
    router.push(`${pathname}/new?type=${template.type}&cloneId=${template.id}`);
  };

  if (editingTemplate) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <TemplateEditor 
          template={editingTemplate || undefined}
          type={selectedType}
          companyId={companyId}
          onSave={async () => {
            await templatesQuery.refetch();
            setEditingTemplate(null);
          }}
          onBack={() => setEditingTemplate(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 antialiased">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="flex items-center gap-6">
          <Button 
              variant="outline" 
              onClick={() => router.push(`/employer-portal/companies/${companyId}/documents`)}
              className="h-12 w-12 rounded-2xl border-2 border-neutral-100 dark:border-neutral-800 flex items-center justify-center bg-white dark:bg-neutral-900 shadow-sm hover:scale-110 active:scale-95 transition-all"
          >
              <IconArrowLeft className="h-5 w-5 text-neutral-400" />
          </Button>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-3 text-primary mb-1">
                <div className="h-7 w-7 rounded-xl bg-primary/10 flex items-center justify-center">
                    <IconLayoutGrid className="h-4 w-4" />
                </div>
                <h2 className="text-2xl font-black tracking-tight uppercase italic leading-none">
                  Hub
                </h2>
            </div>
            <p className="text-neutral-500 font-medium text-[11px] pl-0.5">Manage document styles.</p>
          </div>
        </div>
        <Button 
          onClick={handleCreateNew}
          className="h-12 px-8 rounded-2xl font-black bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-xl hover:scale-[1.05] active:scale-[0.95] transition-all text-xs uppercase tracking-widest border-none"
        >
          <IconPlus className="mr-2 h-5 w-5 stroke-[3]" /> New Template
        </Button>
      </div>

      <Tabs 
        value={selectedType} 
        onValueChange={handleTabChange}
        className="w-full flex flex-col gap-10"
      >
        <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1 h-10 rounded-xl border-none shadow-inner self-start gap-1">
          {Object.entries(typeGroups).map(([type, { label, icon: Icon }]) => (
            <TabsTrigger 
              key={type} 
              value={type}
              className="rounded-lg px-6 h-full font-bold text-[10px] uppercase tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-200 gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5 ${
                template.isActive 
                  ? "border-primary/30 bg-primary/[0.02] dark:bg-primary/[0.03] shadow-md shadow-primary/5" 
                  : "border-neutral-100 dark:border-neutral-800/50 bg-white dark:bg-neutral-900/40"
              }`}
            >
              {template.isActive && (
                <div className="absolute top-5 left-5 z-10">
                  <Badge className="bg-primary text-white px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary/30 animate-in zoom-in-50">
                    <IconCheck className="w-3 h-3 mr-1.5 stroke-[3]" /> Active
                  </Badge>
                </div>
              )}

              <div className="absolute top-3 right-3 z-20">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl shadow-md border border-white/50 dark:border-neutral-700/50 hover:bg-white dark:hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <IconDotsVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl shadow-2xl border-neutral-100 dark:border-neutral-800 p-2 min-w-[180px] backdrop-blur-3xl">
                      <DropdownMenuItem onClick={() => setEditingTemplate(template)} className="rounded-xl font-bold py-3 px-4 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer">
                        <IconEdit className="mr-3 h-4 w-4" /> Edit Layout
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCustomLayout(template)} className="rounded-xl font-bold py-3 px-4 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer">
                        <IconCopy className="mr-3 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      {!template.isActive && template.status === TemplateStatus.APPROVED && (
                        <DropdownMenuItem onClick={() => handleSetActive(template.id)} className="rounded-xl font-bold py-3 px-4 text-emerald-600 focus:bg-emerald-50 transition-colors cursor-pointer">
                          <IconCheck className="mr-3 h-4 w-4" /> Set as Default
                        </DropdownMenuItem>
                      )}
                      {!template.isDefault && (
                        <DropdownMenuItem onClick={() => handleDelete(template.id)} className="rounded-xl font-bold py-3 px-4 text-rose-500 focus:bg-rose-50 transition-colors cursor-pointer">
                          <IconTrash className="mr-3 h-4 w-4" /> Delete Permanently
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                 </DropdownMenu>
              </div>

              <CardHeader className="pt-6 pb-2 px-5 flex flex-col items-start gap-1">
                <div className="h-9 w-9 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center text-neutral-400 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-500 group-hover:scale-110 mb-2">
                  {(() => {
                    const Icon = typeGroups[template.type]?.icon || IconFileInvoice;
                    return <Icon className="h-4 w-4 stroke-[2.5]" />;
                  })()}
                </div>
                <CardTitle className="text-base font-black uppercase tracking-tight line-clamp-1 dark:text-neutral-50 group-hover:text-primary transition-colors leading-none">{template.name}</CardTitle>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium line-clamp-1 mt-1 leading-none italic opacity-80">
                  {template.description || "No description."}
                </p>
              </CardHeader>
 
              <CardContent className="px-5 pb-4">
                <div className="flex flex-wrap gap-1.5">
                   {template.isDefault && (
                    <Badge variant="secondary" className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-black uppercase tracking-widest text-[7px] rounded-md border-none">
                      System
                    </Badge>
                   )}
                   
                   {template.status === TemplateStatus.DRAFT && (
                    <Badge variant="outline" className="px-2 py-0.5 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-500 font-black uppercase tracking-widest text-[7px] rounded-md bg-neutral-50/50 dark:bg-neutral-800/30">
                      Draft
                    </Badge>
                   )}
                   
                   {template.status === TemplateStatus.PENDING && (
                    <Badge variant="outline" className="px-2 py-0.5 border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-500 font-black uppercase tracking-widest text-[7px] rounded-md bg-amber-50/50 dark:bg-amber-950/20">
                      Pending
                    </Badge>
                   )}
                </div>
                
                <div className="mt-4">
                   <Button 
                    className="w-full h-9 rounded-lg font-black text-[10px] uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 shadow-sm border-none"
                    onClick={() => setEditingTemplate(template)}
                   >
                     Customize
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredTemplates.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center border-4 border-dashed border-neutral-100 dark:border-neutral-800/50 rounded-[4rem] p-12 text-center bg-neutral-50/30 dark:bg-neutral-900/10">
              <div className="h-24 w-24 rounded-[2rem] bg-white dark:bg-neutral-800 flex items-center justify-center mb-6 shadow-2xl dark:shadow-none ring-1 ring-neutral-100 dark:ring-neutral-700/50">
                 <IconPlus className="h-10 w-10 text-neutral-300 dark:text-neutral-600 stroke-[3]" />
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tight text-neutral-400 dark:text-neutral-600">No custom templates found</h4>
              <p className="text-neutral-500 dark:text-neutral-500 mt-3 font-medium max-w-sm">Elevate your brand by creating professional document styles tailored to your needs.</p>
              <Button 
                variant="outline" 
                className="mt-8 rounded-xl h-12 px-8 font-black text-[11px] uppercase tracking-widest border-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
                onClick={handleCreateNew}
              >
                Create First Template
              </Button>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
