"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconChartBar, IconInfoCircle } from "@tabler/icons-react";
import { useLeaveBalances } from "@/hooks/use-leaves";
import { useMe } from "@/hooks/use-employees";

export function LeaveBalanceSummaryCard() {
    const { data: employee } = useMe();
    const { data: balances, isLoading } = useLeaveBalances(employee?.id || null);

    if (isLoading) return null;
    if (!balances || balances.length === 0) return null;

    // Filter for some common leave types to show in summary
    const summaryBalances = balances.slice(0, 3);

    return (
        <Card className="rounded-[2.5rem] border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                        <IconChartBar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black tracking-tight">Leave Balance</CardTitle>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest italic">Summary</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4">
                    {summaryBalances.map((balance: any) => {
                        const used = balance.used || 0;
                        const total = balance.entitled || 0;
                        const available = balance.available || 0;
                        const percent = total > 0 ? (used / total) * 100 : 0;

                        return (
                            <div key={balance.leaveTypeId} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">{balance.leaveTypeName}</span>
                                    <span className="text-xs font-black italic">
                                        {available} / {total}
                                        <span className="text-[9px] font-medium text-neutral-400 not-italic uppercase tracking-tighter ml-1">Days</span>
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-purple-500 transition-all duration-500" 
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
