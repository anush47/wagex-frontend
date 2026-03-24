"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { EpfService } from "@/services/epf.service";
import { EtfService } from "@/services/etf.service";
import { Checkbox } from "@/components/ui/checkbox";
import { IconRefresh, IconReceiptTax, IconTableExport, IconSearch, IconX, IconBuildingBank, IconStack2 } from "@tabler/icons-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface StatutorySelectionTableProps {
    type: 'EPF' | 'ETF';
    companyId: string;
    selectedIds: string[];
    onSelectedIdsChange: (ids: string[]) => void;
    month?: number;
    year?: number;
}

export function StatutorySelectionTable({
    type,
    companyId,
    selectedIds,
    onSelectedIdsChange,
    month,
    year
}: StatutorySelectionTableProps) {
    const [search, setSearch] = React.useState("");

    const statutoryQuery = useQuery({
        queryKey: ['statutory-selection', type, companyId, month, year],
        queryFn: async () => {
            const service = type === 'EPF' ? EpfService : EtfService;
            const response = await (service as any).getRecords({
                companyId,
                month,
                year
            });

            if (response.error) throw new Error(response.error.message);
            const items = (response.data as any)?.data?.items || response.data?.items || [];
            return items;
        },
        enabled: !!companyId,
    });

    const records = (statutoryQuery.data || []) as any[];
    
    const filteredRecords = records.filter(r => 
        r.referenceNo?.toLowerCase().includes(search.toLowerCase()) ||
        r.paymentMethod?.toLowerCase().includes(search.toLowerCase()) ||
        r.remarks?.toLowerCase().includes(search.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredRecords.length) {
            onSelectedIdsChange([]);
        } else {
            onSelectedIdsChange(filteredRecords.map(r => r.id));
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
                        placeholder="Search reference, remarks..."
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
                        {selectedIds.length} / {filteredRecords.length} Selected
                    </div>
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar min-h-[100px]">
                {statutoryQuery.isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <IconRefresh className="h-8 w-8 animate-spin text-primary/20" />
                        <span className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Fetching {type} Records...</span>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center gap-2">
                        <div className="h-12 w-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            {type === 'EPF' ? <IconReceiptTax className="h-6 w-6 text-neutral-300" /> : <IconTableExport className="h-6 w-6 text-neutral-300" />}
                        </div>
                        <p className="text-sm font-bold text-neutral-400 uppercase tracking-tight">No {type} records found for this period</p>
                    </div>
                ) : (
                    filteredRecords.map((record: any) => (
                        <div 
                            key={record.id}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                                selectedIds.includes(record.id) 
                                    ? "bg-primary/5 border-primary/30 shadow-sm" 
                                    : "bg-white dark:bg-neutral-950/20 border-neutral-100 dark:border-neutral-800 hover:border-primary/20 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                            )}
                            onClick={() => toggleSelect(record.id)}
                        >
                            <div className="flex items-center gap-4">
                                <Checkbox 
                                    checked={selectedIds.includes(record.id)}
                                    onCheckedChange={() => {}} // Handled by div click
                                    className="rounded-lg h-5 w-5 border-neutral-300 data-[state=checked]:bg-primary transition-all"
                                />
                                <div>
                                    <p className={cn(
                                        "text-sm font-black transition-colors",
                                        selectedIds.includes(record.id) ? "text-primary" : "text-foreground group-hover:text-primary"
                                    )}>
                                        {record.referenceNo || 'UNREFERENCED BATCH'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex items-center gap-1">
                                            <IconStack2 className="h-3 w-3 text-neutral-400" />
                                            <span className="text-[10px] font-black italic uppercase text-neutral-400 tracking-tight leading-none">
                                                {record.salaries?.length || 0} Salaries Linked
                                            </span>
                                        </div>
                                        <span className="h-1 w-1 rounded-full bg-neutral-300" />
                                        <div className="flex items-center gap-1">
                                            <IconBuildingBank className="h-3 w-3 text-neutral-400" />
                                            <span className="text-[10px] font-bold text-neutral-500">
                                                {record.paymentMethod}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className={cn(
                                    "text-[10px] font-black italic tracking-tighter text-foreground"
                                )}>
                                    {formatCurrency(record.totalContribution)}
                                </span>
                                <span className="text-[8px] font-black uppercase text-neutral-400">
                                    {format(new Date(record.createdAt), "MMM d, yyyy")}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
