"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconDownload, IconActivity, IconSearch, IconFilter, IconX, IconRefresh, IconReceiptTax } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

import { StatutorySelectionTable } from "@/components/payroll/StatutorySelectionTable";
import { SalaryPeriodQuickSelect } from "@/components/attendance/SalaryPeriodQuickSelect";
import { format } from "date-fns";

const monthsNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export function EtfDocumentsTab() {
    const params = useParams();
    const companyId = params.id as string;
    
    const [startDate, setStartDate] = React.useState<string | undefined>();
    const [endDate, setEndDate] = React.useState<string | undefined>();
    const [selectedBatchIds, setSelectedBatchIds] = React.useState<string[]>([]);
    const [showFilters, setShowFilters] = React.useState(false);

    // Derived month/year from startDate for StatutorySelectionTable
    const month = startDate ? new Date(startDate).getMonth() + 1 : undefined;
    const year = startDate ? new Date(startDate).getFullYear() : undefined;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1.5">
                    <h3 className="text-xl font-black tracking-tight uppercase text-foreground/90 italic">ETF Returns</h3>
                    <p className="text-neutral-500 font-medium text-xs">Generate and download official ETF R1 and R2 returns</p>
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
                        disabled={selectedBatchIds.length === 0}
                    >
                        <IconDownload className="mr-2 h-4 w-4 stroke-[3]" />
                        Download Returns {selectedBatchIds.length > 0 ? `(${selectedBatchIds.length})` : ''}
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
                                            <IconReceiptTax className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-black uppercase tracking-tight italic">Batch Selection</CardTitle>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Select calculated ETF batches for return generation</p>
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
                                            setSelectedBatchIds([]);
                                        }}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <StatutorySelectionTable 
                                type="ETF"
                                companyId={companyId}
                                month={month}
                                year={year}
                                selectedIds={selectedBatchIds}
                                onSelectedIdsChange={setSelectedBatchIds}
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
                                    <span className="text-[10px] font-black text-primary uppercase">{selectedBatchIds.length} Batches</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] pl-1 text-center block">Search Reference</Label>
                            <div className="relative group p-1">
                                <IconSearch className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                                <Input 
                                    placeholder="Ref no..." 
                                    className="pl-12 h-12 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-[10px] font-black uppercase tracking-widest focus:border-primary/50 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="pt-4 space-y-4">
                            <div className="p-6 rounded-3xl bg-blue-600 text-white shadow-2xl shadow-blue-600/20 flex flex-col gap-2 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                                    <IconReceiptTax className="h-16 w-16" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-white/70 tracking-widest italic relative z-10">Compliance Export</span>
                                <div className="flex flex-col gap-1 relative z-10">
                                    <span className="text-3xl font-black italic tracking-tighter">{selectedBatchIds.length}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-tight opacity-80">Batches Selected</span>
                                </div>
                                <Button 
                                    className={cn(
                                        "mt-4 w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg relative z-10 transition-all border-none",
                                        selectedBatchIds.length > 0 ? "bg-white text-blue-600 hover:bg-neutral-50" : "bg-white/50 text-blue-600/50 cursor-not-allowed"
                                    )}
                                    disabled={selectedBatchIds.length === 0}
                                >
                                    Generate Return
                                </Button>
                            </div>
                            <p className="text-[10px] font-bold text-neutral-400 text-center uppercase tracking-widest italic px-1 leading-relaxed">
                                ETF returns are generated based on the selected batches and required no further inputs.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
