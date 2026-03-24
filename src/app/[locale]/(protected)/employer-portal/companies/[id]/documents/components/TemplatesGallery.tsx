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
  IconDeviceFloppy
} from "@tabler/icons-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { TemplateEditor } from "./TemplateEditor";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

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

  const typeGroups = {
    [DocumentType.PAYSLIP]: { label: "Payslips", icon: <IconFileInvoice className="h-4 w-4" /> },
    [DocumentType.SALARY_SHEET]: { label: "Salary Sheets", icon: <IconFileSpreadsheet className="h-4 w-4" /> },
    [DocumentType.ATTENDANCE_REPORT]: { label: "Attendance", icon: <IconClock className="h-4 w-4" /> },
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
          onSave={() => setEditingTemplate(null)}
          onCancel={() => setEditingTemplate(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 antialiased">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase dark:text-neutral-50 shadow-black/5 flex items-center gap-4">
            Template Hub
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium mt-1 text-lg">Manage your document layouts and professional styles.</p>
        </div>
        <Button 
          onClick={handleCreateNew}
          className="h-14 px-8 rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          <IconPlus className="mr-2 h-5 w-5 stroke-[3]" /> New Template
        </Button>
      </div>

      <Tabs 
        value={selectedType} 
        onValueChange={handleTabChange}
        className="w-full flex flex-col gap-10"
      >
        <TabsList className="bg-neutral-100/50 dark:bg-neutral-800/40 p-2 h-16 rounded-[2.5rem] border border-neutral-200/50 dark:border-neutral-700/30 shadow-inner backdrop-blur-sm self-start">
          {Object.entries(typeGroups).map(([type, { label, icon }]) => (
            <TabsTrigger 
              key={type} 
              value={type}
              className="rounded-[2rem] px-10 h-full font-black text-[11px] uppercase tracking-[0.15em] data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-2xl data-[state=active]:text-primary transition-all duration-300 gap-3"
            >
              <span className="scale-125">{icon}</span>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className={`group relative overflow-hidden rounded-[3rem] border-2 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] hover:-translate-y-2 ${
                template.isActive 
                  ? "border-primary/30 bg-primary/[0.02] dark:bg-primary/[0.03] shadow-xl shadow-primary/5" 
                  : "border-neutral-100 dark:border-neutral-800/50 bg-white dark:bg-neutral-900/40"
              }`}
            >
              {template.isActive && (
                <div className="absolute top-8 left-8 z-10">
                  <Badge className="bg-primary text-white px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/30 animate-in zoom-in-50">
                    <IconCheck className="w-4 h-4 mr-2 stroke-[3]" /> Active Default
                  </Badge>
                </div>
              )}

              <div className="absolute top-8 right-8 z-20">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl shadow-xl border border-white/50 dark:border-neutral-700/50 hover:bg-white dark:hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <IconDotsVertical className="h-5 w-5" />
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

              <CardHeader className="pt-20 pb-8 px-10">
                <div className="h-20 w-20 mb-6 rounded-3xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center text-neutral-400 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  {React.cloneElement(typeGroups[template.type].icon as React.ReactElement, { className: "h-8 w-8 stroke-[2.5]" })}
                </div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight line-clamp-1 dark:text-neutral-50 group-hover:text-primary transition-colors">{template.name}</CardTitle>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium line-clamp-2 mt-3 leading-relaxed">
                  {template.description || "A professionalized document layout designed for clarity and compliance."}
                </p>
              </CardHeader>

              <CardContent className="px-10 pb-10">
                <div className="flex flex-wrap gap-3">
                   {template.isDefault && (
                    <Badge variant="secondary" className="px-4 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-black uppercase tracking-[0.1em] text-[10px] rounded-xl border-none">
                      System Standard
                    </Badge>
                   )}
                   
                   {template.status === TemplateStatus.DRAFT && (
                    <Badge variant="outline" className="px-4 py-1.5 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-500 font-black uppercase tracking-[0.1em] text-[10px] rounded-xl bg-neutral-50/50 dark:bg-neutral-800/30">
                      <IconDeviceFloppy className="h-3 w-3 mr-1.5" /> Draft
                    </Badge>
                   )}
                   
                   {template.status === TemplateStatus.PENDING && (
                    <Badge variant="outline" className="px-4 py-1.5 border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-500 font-black uppercase tracking-[0.1em] text-[10px] rounded-xl bg-amber-50/50 dark:bg-amber-950/20">
                      <IconClockHour4 className="h-3 w-3 mr-1.5 animate-pulse" /> Pending
                    </Badge>
                   )}
                </div>
                
                <div className="mt-10">
                   <Button 
                    variant="ghost" 
                    className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-transparent hover:border-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm"
                    onClick={() => setEditingTemplate(template)}
                   >
                     Customize Layout
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
