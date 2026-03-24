import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconDownload, IconFileSpreadsheet, IconSearch, IconCalendar, IconLayoutGrid } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemplateEditor } from "./TemplateEditor";
import { DocumentType } from "@/types/template";
import { useParams } from "next/navigation";
import { useTemplates } from "@/hooks/use-templates";
import { printDocument } from "@/services/document-print.service";
import { format } from "date-fns";
import { toast } from "sonner";

export function SalaryDocumentsTab() {
    const params = useParams();
    const companyId = params.id as string;
    const [isManagingTemplate, setIsManagingTemplate] = React.useState(false);
    
    // Filters
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [year, setYear] = React.useState(new Date().getFullYear());

    const { templatesQuery } = useTemplates({ companyId, type: DocumentType.SALARY_SHEET, isActive: true });
    const [selectedTemplate, setSelectedTemplate] = React.useState<string>("");

    React.useEffect(() => {
        if (templatesQuery.data?.length > 0 && !selectedTemplate) {
            setSelectedTemplate(templatesQuery.data[0].id);
        }
    }, [templatesQuery.data, selectedTemplate]);

    const handlePrintSheet = () => {
        if (!selectedTemplate) return toast.error("Please select a template first");
        const compositeId = `${companyId}_${month}_${year}`;
        printDocument(selectedTemplate, compositeId);
    };

    if (isManagingTemplate) {
        return (
            <TemplateEditor 
                type={DocumentType.SALARY_SHEET}
                companyId={companyId}
                onCancel={() => setIsManagingTemplate(false)}
                onSave={() => setIsManagingTemplate(false)}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Select Template</Label>
                    <select 
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="h-11 rounded-xl bg-white border border-neutral-100 shadow-sm px-4 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                        {templatesQuery.data?.map((t: any) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                        {(!templatesQuery.data || templatesQuery.data.length === 0) && (
                            <option disabled>No active templates found</option>
                        )}
                    </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Period</Label>
                    <div className="flex gap-2">
                        <select 
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="flex-1 h-11 rounded-xl bg-white border border-neutral-100 shadow-sm px-4 text-xs font-bold"
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>{format(new Date(2000, i), 'MMMM')}</option>
                            ))}
                        </select>
                        <select 
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="w-24 h-11 rounded-xl bg-white border border-neutral-100 shadow-sm px-4 text-xs font-bold"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-end gap-3">
                    <Button 
                        variant="outline" 
                        className="flex-1 h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-white shadow-sm border-neutral-100"
                        onClick={() => setIsManagingTemplate(true)}
                    >
                        <IconLayoutGrid className="mr-2 h-4 w-4 text-primary" />
                        Manage Template
                    </Button>
                </div>
            </div>

            <Card className="rounded-2xl border-none bg-white dark:bg-neutral-900 shadow-sm overflow-hidden border border-neutral-100">
                <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700/50 px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <IconFileSpreadsheet className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold">Salary Sheets</CardTitle>
                                <p className="text-xs text-neutral-500 font-medium">Export monthly company-wide salary summaries</p>
                            </div>
                        </div>
                        <Button 
                            className="h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg bg-primary hover:bg-primary/90"
                            onClick={handlePrintSheet}
                        >
                            <IconDownload className="mr-2 h-4 w-4" />
                            Generate & Print
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4 px-6 bg-blue-50/50 border-b border-blue-100">
                         <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                             <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Note: Multi-page layouts are supported for large sheets</span>
                         </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="h-16 w-16 rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                            <IconCalendar className="h-8 w-8 text-neutral-400" />
                        </div>
                        <h3 className="font-bold text-lg">{format(new Date(year, month - 1), 'MMMM yyyy')} Sheet Ready</h3>
                        <p className="text-neutral-500 text-sm max-w-xs mx-auto mt-2 font-medium">
                            Click the generate button above to preview and print the full salary summary for this period.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
