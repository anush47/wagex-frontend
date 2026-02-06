import React from "react";
import { LeaveBalance } from "@/types/leave";

interface LeaveBalanceDisplayProps {
    balances: LeaveBalance[];
    leaveTypes: any[];
}

export function LeaveBalanceDisplay({ balances, leaveTypes }: LeaveBalanceDisplayProps) {
    if (balances.length === 0) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-2xl border border-border/50">
            {balances.map((balance) => {
                const leaveType = leaveTypes.find(lt => lt.id === balance.leaveTypeId);
                return (
                    <div key={balance.leaveTypeId} className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: leaveType?.color || '#3b82f6' }}
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                                {balance.leaveTypeCode || balance.leaveTypeName}
                            </span>
                        </div>
                        <div className="text-xl font-bold tracking-tight">
                            {Number(balance.available).toFixed(1).replace(/\.0$/, '')}
                            <span className="text-[10px] font-medium text-muted-foreground ml-1">
                                / {Number(balance.entitled).toFixed(1).replace(/\.0$/, '')}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
