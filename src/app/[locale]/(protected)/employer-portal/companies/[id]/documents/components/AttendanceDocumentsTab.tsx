"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconDownload, IconClock, IconSearch, IconFilter, IconX, IconRefresh } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentType } from "@/types/template";
import { useParams } from "next/navigation";
import { useTemplates } from "@/hooks/use-templates";
import { printDocument } from "@/services/document-print.service";
import { format } from "date-fns";
import { toast } from "sonner";
import { useEmployees } from "@/hooks/use-employees";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { SalariesSelectionTable } from "@/components/payroll/SalariesSelectionTable";
import { SalaryPeriodQuickSelect } from "../../attendance/components/SalaryPeriodQuickSelect";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";

const monthsNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export function AttendanceDocumentsTab() {
    const params = useParams();
    const companyId = params.id as string;
    
    // Filters
    const [startDate, setStartDate] = React.useState<string | undefined>();
    const [endDate, setEndDate] = React.useState<string | undefined>();
    const [employeeId, setEmployeeId] = React.useState<string | undefined>();
    const [showFilters, setShowFilters] = React.useState(false);
    const [selectedSalaryIds, setSelectedSalaryIds] = React.useState<string[]>([]);

    const { templatesQuery } = useTemplates({ companyId, type: DocumentType.ATTENDANCE_REPORT, isActive: true });
    
    const selectedTemplate = templatesQuery.data?.[0]?.id;
    const selectedTemplateName = templatesQuery.data?.[0]?.name || "System Standard";

    const handleBulkPrint = () => {
        if (!selectedTemplate) return toast.error("Please select a template first");
        if (selectedSalaryIds.length === 0) return toast.error("Please select at least one employee");
        
        // Multi-print or single based on service capability
        // For attendance, we usually print a report for the period.
        // Assuming composite ID plus selected IDs.
        const compositeId = `${companyId}_${month}_${year}`;
        printDocument(selectedTemplate, compositeId, { salaryIds: selectedSalaryIds });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1.5">
                    <h3 className="text-xl font-black tracking-tight uppercase text-foreground/90 italic">Attendance Reports</h3>
                    <p className="text-neutral-500 font-medium text-xs">Export detailed time logs and attendance summaries</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "h-11 rounded-2xl px-5 font-bold text-xs uppercase transition-all gap-2 border-2",
                            showFilters ? "bg-primary/5 text-primary border-primary/20 shadow-inner" : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800"
                        )}
                    >
                        <IconFilter className="h-4 w-4" />
                        <span>Configuration</span>
                    </Button>
                    <Button 
                        className="rounded-2xl h-11 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all bg-primary text-white"
                        onClick={handleBulkPrint}
                        disabled={selectedSalaryIds.length === 0}
                    >
                        <IconDownload className="mr-2 h-4 w-4 stroke-[3]" />
                        Export Reports {selectedSalaryIds.length > 0 ? `(${selectedSalaryIds.length})` : ''}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border border-neutral-200 dark:border-white/10 shadow-sm bg-white dark:bg-neutral-900/40 overflow-hidden rounded-[2.5rem] ring-1 ring-neutral-100 dark:ring-neutral-800/50">
                        <CardHeader className="border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/30 dark:bg-neutral-950/20 px-8 py-6">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                            <IconClock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-black uppercase tracking-tight italic">Attendance Selection</CardTitle>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Select employees to generate logs for</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                    <SalaryPeriodQuickSelect 
                                        companyId={companyId}
                                        currentStart={startDate}
                                        currentEnd={endDate}
                                        onRangeSelect={(start, end) => {
                                            setStartDate(start);
                                            setEndDate(end);
                                            setSelectedSalaryIds([]);
                                        }}
                                    />
                                    <div className="w-[280px]">
                                        <SearchableEmployeeSelect 
                                            companyId={companyId}
                                            value={employeeId}
                                            onSelect={(id) => {
                                                setEmployeeId(id);
                                                setSelectedSalaryIds([]);
                                            }}
                                            placeholder="All Employees"
                                        />
                                    </div>
                                    {employeeId && (
                                        <Button variant="ghost" size="icon" onClick={() => setEmployeeId(undefined)} className="h-10 w-10 text-neutral-400 hover:text-red-500 rounded-xl">
                                            <IconX className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <SalariesSelectionTable 
                                companyId={companyId}
                                startDate={startDate}
                                endDate={endDate}
                                employeeId={employeeId}
                                selectedIds={selectedSalaryIds}
                                onSelectedIdsChange={setSelectedSalaryIds}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-6 sticky top-6">
                    <Card className="border-2 border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 rounded-[2.5rem] p-8 space-y-8 shadow-inner">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] pl-1">Configuration</Label>
                            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Period</span>
                                    <span className="text-[10px] font-black text-foreground uppercase">{startDate ? format(new Date(startDate), 'MMM yyyy') : 'Current'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Selection</span>
                                    <span className="text-[10px] font-black text-primary uppercase">{selectedSalaryIds.length} Records</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] pl-1">Selected Template</Label>
                            <div className="h-20 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-6 flex items-center justify-between group shadow-sm transition-all hover:border-primary/20">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                        <IconRefresh className="h-5 w-5 text-purple-600" stroke={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tight leading-none mb-1">Active Format</span>
                                        <span className="text-xs font-black uppercase tracking-tight text-foreground truncate max-w-[120px]">{selectedTemplateName}</span>
                                    </div>
                                </div>
                                <Badge className="bg-purple-100 text-purple-600 border-none text-[8px] font-black uppercase tracking-widest h-6 px-3 rounded-lg shadow-sm font-black italic">Active</Badge>
                            </div>
                        </div>

                        <div className="pt-4 space-y-4">
                            <div className="p-6 rounded-3xl bg-neutral-900 text-white shadow-2xl flex flex-col gap-2 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                                    <IconClock className="h-16 w-16" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest italic relative z-10">Summary Export</span>
                                <div className="flex flex-col gap-1 relative z-10">
                                    <span className="text-3xl font-black italic tracking-tighter text-primary">{selectedSalaryIds.length}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-tight opacity-50">Staff members</span>
                                </div>
                                <Button 
                                    className="mt-4 w-full h-14 rounded-2xl bg-primary text-white hover:scale-105 font-black text-xs uppercase tracking-[0.2em] shadow-lg relative z-10 transition-all border-none"
                                    onClick={handleBulkPrint}
                                    disabled={selectedSalaryIds.length === 0}
                                >
                                    Generate PDF
                                </Button>
                            </div>
                            <p className="text-[10px] font-bold text-neutral-400 text-center uppercase tracking-widest italic px-1 leading-relaxed">
                                Detailed reports include punch times, break durations, and late arrival flags.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
