"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconDownload, IconFileInvoice, IconSearch, IconFilter, IconX, IconRefresh, IconMail } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentType } from "@/types/template";
import { useParams } from "next/navigation";
import { useTemplates } from "@/hooks/use-templates";
import { useSalaries } from "@/hooks/use-salaries";
import { printDocument, bulkPrintDocuments } from "@/services/document-print.service";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";

const monthsNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export function PayslipsDocumentsTab() {
    const params = useParams();
    const companyId = params.id as string;
    
    // Filters
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [year, setYear] = React.useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = React.useState("");
    const [showFilters, setShowFilters] = React.useState(false);

    const { salariesQuery } = useSalaries({
        companyId,
        month,
        year,
    });

    const { templatesQuery } = useTemplates({ companyId, type: DocumentType.PAYSLIP, isActive: true });
    
    const selectedTemplate = templatesQuery.data?.[0]?.id;
    const selectedTemplateName = templatesQuery.data?.[0]?.name || "System Standard";
    const [selectedSalaries, setSelectedSalaries] = React.useState<string[]>([]);

    const handlePrintIndividual = (salaryId: string) => {
        if (!selectedTemplate) return toast.error("Please select a template first");
        printDocument(selectedTemplate, salaryId);
    };

    const handleBulkPrint = () => {
        if (!selectedTemplate) return toast.error("Please select a template first");
        if (selectedSalaries.length === 0) return toast.error("Please select at least one employee");
        bulkPrintDocuments(selectedTemplate, selectedSalaries);
    };

    const toggleSalarySelection = (id: string) => {
        setSelectedSalaries(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        const allIds = salariesQuery.data?.items?.map((s: any) => s.id) || [];
        setSelectedSalaries(selectedSalaries.length === allIds.length ? [] : allIds);
    };

    const filteredSalaries = (salariesQuery.data?.items || []).filter((s: any) => 
        s.employee?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.employee?.employeeNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasActiveFilters = searchTerm !== "" || month !== new Date().getMonth() + 1 || year !== new Date().getFullYear();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1.5">
                    <h3 className="text-xl font-black tracking-tight uppercase text-foreground/90">Employee Payslips</h3>
                    <p className="text-neutral-500 font-medium text-xs">Generate and distribute monthly payslips to your staff</p>
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
                    {selectedSalaries.length > 0 ? (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                             <Button 
                                variant="outline" 
                                className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white text-primary border-2 border-primary/10 hover:bg-primary/5 transition-all"
                                onClick={handleBulkPrint}
                             >
                                <IconDownload className="mr-2 h-4 w-4 stroke-[3]" />
                                Bulk Print ({selectedSalaries.length})
                             </Button>
                             <Button className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary text-white hover:scale-105 transition-all">
                                <IconMail className="mr-2 h-4 w-4 stroke-[3]" />
                                Email Batch
                             </Button>
                        </div>
                    ) : (
                        <Button className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest opacity-40 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800 text-neutral-400" disabled>
                            Select Employees
                        </Button>
                    )}
                </div>
            </div>

            {showFilters && (
                <Card className="border-2 border-dashed border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-950/20 rounded-[2rem] p-8 animate-in slide-in-from-top-4 duration-300 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] pl-1">Configuration</Label>
                            <div className="h-14 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-5 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <IconFileInvoice className="h-5 w-5 text-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tight leading-none mb-1">Active Template</span>
                                        <span className="text-xs font-black uppercase tracking-tight text-foreground">{selectedTemplateName}</span>
                                    </div>
                                </div>
                                <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest h-6 px-3 rounded-lg">Default</Badge>
                            </div>
                        </div>

                        <div className="space-y-3 lg:col-span-2">
                            <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] pl-1">Period & Search</Label>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex flex-1 gap-3">
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
                                <div className="relative flex-[1.5] group">
                                    <IconSearch className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                                    <Input 
                                        placeholder="Search by name or ID..." 
                                        className="pl-12 h-14 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-xs font-black uppercase tracking-wide focus:border-primary/50 transition-all shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                                            <IconX className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="border border-neutral-200 dark:border-white/10 shadow-sm bg-white dark:bg-neutral-900/40 overflow-hidden rounded-[2.5rem] ring-1 ring-neutral-100 dark:ring-neutral-800/50">
                <CardContent className="p-0">
                    {salariesQuery.isLoading ? (
                        <div className="p-32 flex flex-col items-center justify-center gap-4 animate-pulse">
                            <IconRefresh className="h-10 w-10 animate-spin text-primary/30" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Syncing Records...</span>
                        </div>
                    ) : filteredSalaries.length === 0 ? (
                        <div className="p-32 flex flex-col items-center justify-center text-center gap-6">
                            <div className="h-20 w-20 rounded-[2rem] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-2 shadow-inner ring-1 ring-neutral-100 dark:ring-neutral-700">
                                <IconSearch className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-black uppercase tracking-tight text-neutral-400 dark:text-neutral-500">No staff records found</h4>
                                <p className="text-[11px] font-medium text-neutral-400 max-w-[240px]">We couldn't find any salaries for the selected period. Ensure payroll is generated first.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50/50 dark:bg-neutral-800/30 border-b border-neutral-100 dark:border-neutral-800">
                                        <th className="py-6 px-8 w-16">
                                            <Checkbox 
                                                checked={selectedSalaries.length === filteredSalaries.length && filteredSalaries.length > 0}
                                                onCheckedChange={toggleAll}
                                                className="rounded-md border-2 border-neutral-300 dark:border-neutral-700"
                                            />
                                        </th>
                                        <th className="py-6 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-neutral-400">Employee Details</th>
                                        <th className="py-6 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-neutral-400 text-right">Net Pay (LKR)</th>
                                        <th className="py-6 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-neutral-400 text-center">Export</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSalaries.map((s: any) => (
                                        <tr key={s.id} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-all duration-300 border-b border-neutral-50 dark:border-neutral-800 last:border-0 cursor-pointer" onClick={() => toggleSalarySelection(s.id)}>
                                            <td className="py-6 px-8" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox 
                                                    checked={selectedSalaries.includes(s.id)}
                                                    onCheckedChange={() => toggleSalarySelection(s.id)}
                                                    className="rounded-md border-2 border-neutral-300 dark:border-neutral-700"
                                                />
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm uppercase tracking-tight text-foreground/90">{s.employee?.fullName}</span>
                                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-0.5">STAFF REF: {s.employee?.employeeNo || "---"}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8 text-right">
                                                <span className="font-black text-sm tracking-tight text-foreground">
                                                    {formatCurrency(s.netSalary)}
                                                </span>
                                            </td>
                                            <td className="py-6 px-8 text-center" onClick={(e) => e.stopPropagation()}>
                                                <Button 
                                                    variant="ghost" 
                                                    className="h-11 w-11 p-0 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 shadow-lg"
                                                    onClick={() => handlePrintIndividual(s.id)}
                                                >
                                                    <IconDownload className="h-5 w-5 stroke-[2.5]" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
