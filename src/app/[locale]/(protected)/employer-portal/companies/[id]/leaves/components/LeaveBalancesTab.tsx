"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLeaveBalances } from "@/hooks/use-leaves";
import { useCompanyPolicy } from "@/hooks/use-policies";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";
import { LeaveBalance } from "@/types/leave";

interface LeaveBalancesTabProps {
    companyId: string;
    employeeId?: string | null;
    showSelector?: boolean;
}

export function LeaveBalancesTab({ companyId, employeeId: manualEmployeeId, showSelector = true }: LeaveBalancesTabProps) {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(manualEmployeeId || null);

    // Sync manualEmployeeId if it changes
    useEffect(() => {
        if (manualEmployeeId) {
            setSelectedEmployeeId(manualEmployeeId);
        }
    }, [manualEmployeeId]);

    // Use React Query for balances
    const {
        data: balances = [],
        isLoading: loading
    } = useLeaveBalances(selectedEmployeeId);

    // Fetch policy for colors
    const { data: policyData } = useCompanyPolicy(companyId);
    const leaveTypes = policyData?.settings?.leaves?.leaveTypes || [];

    return (
        <div className="space-y-6">
            {/* Employee Selector */}
            {showSelector && (
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-neutral-50 dark:bg-neutral-900/50 rounded-[2rem]">
                    <CardHeader>
                        <CardTitle className="text-xl font-black uppercase tracking-tight">Select Employee</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SearchableEmployeeSelect
                            companyId={companyId}
                            value={selectedEmployeeId || undefined}
                            onSelect={(id) => setSelectedEmployeeId(id)}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Balances */}
            {loading ? (
                <div className="text-center py-20 animate-pulse">
                    <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-800 rounded-full mx-auto mb-4" />
                    <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-full mx-auto" />
                </div>
            ) : !selectedEmployeeId ? (
                <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[3rem] bg-neutral-50/50 dark:bg-neutral-900/50">
                    <h3 className="text-xl font-bold text-neutral-400">Select an employee to view their leave balances</h3>
                </div>
            ) : balances.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground font-bold">No leave types configured or assigned to this employee</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {balances.map((balance: LeaveBalance) => {
                        const percentage = balance.entitled > 0
                            ? (balance.available / balance.entitled) * 100
                            : 0;

                        const leaveType = leaveTypes.find((lt: any) => lt.id === balance.leaveTypeId);
                        const color = leaveType?.color || '#3b82f6';

                        return (
                            <Card
                                key={balance.leaveTypeId}
                                className="border-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                                style={{ borderColor: `${color}40` }} // 40 is hex opacity ~25%
                            >
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl font-black flex items-center justify-between">
                                        <span className="tracking-tight" style={{ color: color }}>{balance.leaveTypeName}</span>
                                        <span
                                            className="text-xs font-mono px-2 py-1 rounded-lg transition-colors"
                                            style={{ backgroundColor: `${color}15`, color: color }}
                                        >
                                            {balance.leaveTypeCode}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Available</span>
                                            <span className="font-black text-2xl tracking-tighter" style={{ color: color }}>
                                                {balance.available.toFixed(1)} <span className="text-xs font-bold text-neutral-300">/ {balance.entitled.toFixed(1)}</span>
                                            </span>
                                        </div>
                                        <Progress
                                            value={percentage}
                                            className="h-3 bg-neutral-100 dark:bg-neutral-800"
                                            indicatorClassName="transition-all duration-500"
                                            style={{ backgroundColor: `${color}15` }}
                                            indicatorStyle={{ backgroundColor: color }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-2">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Used</div>
                                            <div className="font-black text-lg text-neutral-900 dark:text-white">{balance.used.toFixed(1)}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Pending</div>
                                            <div className="font-black text-lg text-neutral-600 dark:text-neutral-400">{balance.pending.toFixed(1)}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
