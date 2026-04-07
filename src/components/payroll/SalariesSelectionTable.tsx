"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { SalaryService } from "@/services/salary.service";
import { Checkbox } from "@/components/ui/checkbox";
import { IconRefresh, IconUser, IconCash, IconCalendarTime, IconSearch, IconX } from "@tabler/icons-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SalariesSelectionTableProps {
    companyId: string;
    selectedIds: string[];
    onSelectedIdsChange: (ids: string[]) => void;
    month?: number;
    year?: number;
    startDate?: string;
    endDate?: string;
    excludeEpf?: boolean;
    excludeEtf?: boolean;
    status?: string | string[];
    employeeId?: string;
    policyIds?: string[];
}

export function SalariesSelectionTable({
    companyId,
    selectedIds,
    onSelectedIdsChange,
    month,
    year,
    startDate: propStartDate,
    endDate: propEndDate,
    excludeEpf,
    excludeEtf,
    status,
    employeeId,
    policyIds
}: SalariesSelectionTableProps) {
    const [search, setSearch] = React.useState("");

    const salariesQuery = useQuery({
        queryKey: ['salaries-selection', companyId, month, year, propStartDate, propEndDate, excludeEpf, excludeEtf, status, employeeId, policyIds],
        queryFn: async () => {
            let start = propStartDate;
            let end = propEndDate;

            if (year && month && !start && !end) {
                // Approximate month bounds if not provided
                start = new Date(year, month - 1, 1).toISOString();
                end = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
            }

            const params = {
                companyId,
                startDate: start,
                endDate: end,
                excludeEpf,
                excludeEtf,
                status: status as any,
                employeeId,
                policyIds: (policyIds?.includes(null as any) || policyIds?.includes('null' as any)) ? undefined : policyIds?.join(',')
            };

            console.log('[SalariesSelectionTable] Fetching with params:', params);
            const response = await SalaryService.getSalaries(params);

            if (response.error) throw new Error(response.error.message);
            const items = (response.data as any)?.data?.items || response.data?.items || [];
            return items;
        },
        enabled: !!companyId,
    });

    const salaries = (salariesQuery.data || []) as any[];
    
    const filteredSalaries = salaries.filter(s => 
        s.employee?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        s.employee?.employeeNo?.toLowerCase().includes(search.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredSalaries.length) {
            onSelectedIdsChange([]);
        } else {
            onSelectedIdsChange(filteredSalaries.map(s => s.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            onSelectedIdsChange(selectedIds.filter(i => i !== id));
        } else {
            onSelectedIdsChange([...selectedIds, id]);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-50/50 dark:bg-neutral-900/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <div className="relative w-full sm:w-72">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input 
                        placeholder="Search employee..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-10 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 font-bold text-xs"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                            <IconX className="h-3 w-3" />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <div className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mr-2">
                        {selectedIds.length} / {filteredSalaries.length} Selected
                    </div>
                    <Checkbox 
                        id="select-all"
                        checked={selectedIds.length === filteredSalaries.length && filteredSalaries.length > 0}
                        onCheckedChange={toggleSelectAll}
                        className="rounded-lg h-5 w-5 border-neutral-300 data-[state=checked]:bg-primary transition-all"
                    />
                    <label htmlFor="select-all" className="text-xs font-black uppercase tracking-tight cursor-pointer select-none">Select Visible</label>
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar min-h-[100px]">
                {salariesQuery.isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <IconRefresh className="h-8 w-8 animate-spin text-primary/20" />
                        <span className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Fetching Records...</span>
                    </div>
                ) : filteredSalaries.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center gap-2">
                        <div className="h-12 w-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <IconUser className="h-6 w-6 text-neutral-300" />
                        </div>
                        <p className="text-sm font-bold text-neutral-400 uppercase tracking-tight">No salaries found for this selection</p>
                    </div>
                ) : (
                    filteredSalaries.map((salary: any) => (
                        <div 
                            key={salary.id}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                                selectedIds.includes(salary.id) 
                                    ? "bg-primary/5 border-primary/30 shadow-sm" 
                                    : "bg-white dark:bg-neutral-950/20 border-neutral-100 dark:border-neutral-800 hover:border-primary/20 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                            )}
                            onClick={() => toggleSelect(salary.id)}
                        >
                            <div className="flex items-center gap-4">
                                <Checkbox 
                                    checked={selectedIds.includes(salary.id)}
                                    onCheckedChange={() => {}} // Handled by div click
                                    className="rounded-lg h-5 w-5 border-neutral-300 data-[state=checked]:bg-primary transition-all"
                                />
                                <div>
                                    <p className={cn(
                                        "text-sm font-black transition-colors",
                                        selectedIds.includes(salary.id) ? "text-primary" : "text-foreground group-hover:text-primary"
                                    )}>
                                        {salary.employee?.fullName}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex items-center gap-1">
                                            <IconCash className="h-3 w-3 text-neutral-400" />
                                            <span className="text-[10px] font-bold text-neutral-500">Net: <span className="text-foreground">{formatCurrency(salary.netSalary)}</span></span>
                                        </div>
                                        <span className="h-1 w-1 rounded-full bg-neutral-300" />
                                        <div className="flex items-center gap-1">
                                            <IconCalendarTime className="h-3 w-3 text-neutral-400" />
                                            <span className="text-[10px] font-bold text-neutral-500">
                                                {format(new Date(salary.periodStartDate), "MMM d")} - {format(new Date(salary.periodEndDate), "MMM d")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className={cn(
                                    "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                                    salary.status === 'PAID' ? "bg-emerald-100 text-emerald-600 border-emerald-200" :
                                    salary.status === 'APPROVED' ? "bg-blue-100 text-blue-600 border-blue-200" :
                                    "bg-neutral-100 text-neutral-400 border-neutral-200"
                                )}>
                                    {salary.status}
                                </span>
                                <div className="flex gap-1">
                                    {salary.epfRecords?.length > 0 && (
                                        <span className="text-[8px] font-black uppercase text-blue-500/60 tracking-tighter">EPF</span>
                                    )}
                                    {salary.etfRecords?.length > 0 && (
                                        <span className="text-[8px] font-black uppercase text-indigo-500/60 tracking-tighter">ETF</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
