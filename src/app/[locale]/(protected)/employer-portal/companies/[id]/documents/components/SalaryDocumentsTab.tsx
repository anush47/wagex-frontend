"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconDownload, IconFileSpreadsheet, IconCalendar, IconFilter, IconX, IconRefresh } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { DocumentType } from "@/types/template";
import { useParams } from "next/navigation";
import { useTemplates } from "@/hooks/use-templates";
import { printDocument } from "@/services/document-print.service";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const monthsNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export function SalaryDocumentsTab() {
    const params = useParams();
    const companyId = params.id as string;
    
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [year, setYear] = React.useState(new Date().getFullYear());
    const [showFilters, setShowFilters] = React.useState(false);

    const { templatesQuery } = useTemplates({ companyId, type: DocumentType.SALARY_SHEET, isActive: true });
    
    const selectedTemplate = templatesQuery.data?.[0]?.id;
    const selectedTemplateName = templatesQuery.data?.[0]?.name || "System Standard";

    const handlePrintSheet = () => {
        if (!selectedTemplate) return toast.error("Please select a template first");
        const compositeId = `${companyId}_${month}_${year}`;
        printDocument(selectedTemplate, compositeId);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1.5">
                    <h3 className="text-xl font-black tracking-tight uppercase text-foreground/90">Salary Sheets</h3>
                    <p className="text-neutral-500 font-medium text-xs">Export and print company-wide monthly salary summaries</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "h-10 rounded-xl px-4 font-bold text-xs uppercase transition-all gap-2",
                            showFilters ? "bg-primary/10 text-primary border-primary/20" : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                        )}
                    >
                        <IconFilter className="h-4 w-4" />
                        <span>Filters</span>
                    </Button>
                    <Button 
                        className="rounded-2xl h-10 px-6 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all bg-primary text-white"
                        onClick={handlePrintSheet}
                    >
                        <IconDownload className="mr-2 h-4 w-4 stroke-[3]" />
                        Print Sheet
                    </Button>
                </div>
            </div>

            {showFilters && (
                <Card className="border-2 border-dashed border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-950/20 rounded-[2rem] p-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] pl-1">Configuration</Label>
                            <div className="h-14 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-5 flex items-center justify-between group shadow-sm">
                                <div className="flex items-center gap-3">
                                    <IconFileSpreadsheet className="h-5 w-5 text-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tight leading-none mb-1">Active Template</span>
                                        <span className="text-xs font-black uppercase tracking-tight text-foreground">{selectedTemplateName}</span>
                                    </div>
                                </div>
                                <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest h-6 px-3 rounded-lg">Active</Badge>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] pl-1">Report Period</Label>
                            <div className="flex gap-3">
                                <select 
                                    value={month}
                                    onChange={(e) => setMonth(parseInt(e.target.value))}
                                    className="flex-1 h-14 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-5 text-xs font-black uppercase tracking-wider focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                                >
                                    {monthsNames.map((m, i) => (
                                        <option key={i + 1} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                                <select 
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value))}
                                    className="w-32 h-14 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-5 text-xs font-black uppercase tracking-wider focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                                >
                                    {[2024, 2025, 2026].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="border border-neutral-200 dark:border-white/10 shadow-2xl bg-white dark:bg-neutral-900/40 overflow-hidden rounded-[3rem] ring-1 ring-neutral-100 dark:ring-neutral-800/50">
                <CardContent className="p-0">
                    <div className="flex flex-col items-center justify-center py-32 text-center gap-8">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-[2.5rem] bg-primary/5 flex items-center justify-center animate-pulse">
                                <IconCalendar className="h-10 w-10 text-primary/20" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-white dark:bg-neutral-800 shadow-xl flex items-center justify-center border border-neutral-100 dark:border-neutral-700">
                                <IconFileSpreadsheet className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="font-black text-3xl tracking-tighter uppercase text-foreground">
                                {monthsNames[month - 1]} {year} Report
                            </h3>
                            <p className="text-neutral-400 text-xs max-w-[280px] mx-auto font-bold uppercase tracking-widest leading-relaxed">
                                Ready for generation. This will compile all finalized salaries into a single summary sheet.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <Button 
                                size="lg"
                                className="h-16 px-12 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 bg-primary hover:scale-105 transition-transform"
                                onClick={handlePrintSheet}
                            >
                                <IconDownload className="mr-3 h-6 w-6 stroke-[3]" />
                                Download PDF
                            </Button>
                            <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] animate-pulse">Supports Multi-page Layouts</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
