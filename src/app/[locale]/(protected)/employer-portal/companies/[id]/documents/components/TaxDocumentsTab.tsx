"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconDownload, IconGraph, IconSearch, IconFilter, IconX, IconRefresh } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SalaryPeriodQuickSelect } from "@/components/attendance/SalaryPeriodQuickSelect";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";
import { useParams } from "next/navigation";
import { format } from "date-fns";

const monthsNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export function TaxDocumentsTab() {
    const params = useParams();
    const companyId = params.id as string;
    const [startDate, setStartDate] = React.useState<string | undefined>();
    const [endDate, setEndDate] = React.useState<string | undefined>();
    const [employeeId, setEmployeeId] = React.useState<string | undefined>();
    const [showFilters, setShowFilters] = React.useState(false);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1.5">
                    <h3 className="text-xl font-black tracking-tight uppercase text-foreground/90">Tax Compliance</h3>
                    <p className="text-neutral-500 font-medium text-xs">Export individual tax certificates and APIT schedules</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "h-10 rounded-xl px-4 font-bold text-xs uppercase transition-all gap-2",
                            showFilters ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                        )}
                    >
                        <IconFilter className="h-4 w-4" />
                        <span>Filters</span>
                    </Button>
                    <Button 
                        className="rounded-2xl h-10 px-6 font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-[1.05] active:scale-[0.95] transition-all bg-rose-600 text-white"
                        disabled
                    >
                        <IconDownload className="mr-2 h-4 w-4 stroke-[3]" />
                        Bulk Export
                    </Button>
                </div>
            </div>


            <Card className="border border-neutral-200 dark:border-white/10 shadow-sm bg-white dark:bg-neutral-900/40 overflow-hidden rounded-[3rem] ring-1 ring-neutral-100 dark:ring-neutral-800/50">
                <CardHeader className="border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/30 dark:bg-neutral-950/20 px-8 py-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                    <IconGraph className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-black uppercase tracking-tight italic">Compliance Selection</CardTitle>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Select records for tax certificate generation</p>
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
                                }}
                            />
                            <div className="w-[280px]">
                                <SearchableEmployeeSelect 
                                    companyId={companyId}
                                    value={employeeId}
                                    onSelect={(id) => {
                                        setEmployeeId(id);
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
                <CardContent className="p-0">
                    <div className="flex flex-col items-center justify-center py-32 text-center gap-8">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-[2.5rem] bg-rose-500/5 flex items-center justify-center animate-pulse">
                                <IconGraph className="h-10 w-10 text-rose-500/20" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-white dark:bg-neutral-800 shadow-xl flex items-center justify-center border border-neutral-100 dark:border-neutral-700">
                                <IconDownload className="h-5 w-5 text-rose-500" />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="font-black text-3xl tracking-tighter uppercase text-foreground">
                                No Tax Data Found
                            </h3>
                            <p className="text-neutral-400 text-xs max-w-[280px] mx-auto font-bold uppercase tracking-widest leading-relaxed">
                                Tax records for {startDate ? format(new Date(startDate), 'MMMM yyyy') : 'this period'} have not been generated yet.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <Button 
                                variant="outline"
                                size="lg"
                                className="h-16 px-12 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] border-2 border-neutral-100 dark:border-neutral-800 opacity-60 cursor-not-allowed"
                                disabled
                            >
                                <IconRefresh className="mr-3 h-5 w-5 stroke-[2]" />
                                Initialize Tax Year
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
