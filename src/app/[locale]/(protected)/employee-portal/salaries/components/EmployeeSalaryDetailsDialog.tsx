"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    IconTrendingDown,
    IconCash,
    IconNotes,
    IconListDetails,
    IconX,
    IconWallet,
    IconCalendarEvent,
    IconReceipt,
    IconTable,
    IconTrendingUp,
} from "@tabler/icons-react";
import { Salary, SalaryStatus } from "@/types/salary";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { computeSalaryTotals } from "@/lib/salary-calculations";

interface EmployeeSalaryDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    salary: Salary | null;
}

export function EmployeeSalaryDetailsDialog({
    open,
    onOpenChange,
    salary,
}: EmployeeSalaryDetailsDialogProps) {
    if (!salary) return null;

    // Use the centralized utility — mirrors backend salary-engine.service.ts exactly.
    // noPayAmount is intentionally excluded from the employee view (hidden per requirements);
    // the stored salary.netSalary (backend-calculated) is used as the authoritative net figure.
    const { grossEarnings, totalDeductions, totalRecoveries, additions, deductions } = computeSalaryTotals({
        basicSalary: salary.basicSalary || 0,
        components: salary.components || [],
        noPayAmount: 0, // hidden from employee view
        taxAmount: salary.taxAmount || 0,
        advanceDeduction: salary.advanceDeduction || 0,
        otAdjustment: salary.otAdjustment || 0,
        holidayPayAdjustment: salary.holidayPayAdjustment || 0,
        lateAdjustment: salary.lateAdjustment || 0,
        recoveryAdjustment: salary.recoveryAdjustment || 0,
    });
    // Use the backend-stored netSalary as the authoritative value (not a frontend re-derivation)
    const currentNetSalary = salary.netSalary;

    const getStatusBadge = (status: SalaryStatus) => {
        const styles: Record<string, string> = {
            DRAFT: "bg-muted text-muted-foreground",
            APPROVED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
            PARTIALLY_PAID: "bg-orange-500/10 text-orange-600 border-orange-500/20",
            PAID: "bg-green-500/10 text-green-600 border-green-500/20",
        };

        return (
            <Badge variant="outline" className={`font-bold ${styles[status]}`}>
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl flex flex-col max-h-[90vh] p-0 gap-0 border-none shadow-2xl overflow-hidden rounded-[2rem]">
                <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-background z-10 relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 rounded-full h-8 w-8 text-muted-foreground hover:bg-muted"
                        onClick={() => onOpenChange(false)}
                    >
                        <IconX className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/20">
                            <IconWallet className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <DialogTitle className="text-xl font-bold tracking-tight">
                                    Salary Details
                                </DialogTitle>
                                {getStatusBadge(salary.status)}
                            </div>
                            <DialogDescription className="text-xs font-medium text-muted-foreground flex items-center gap-2 mt-1">
                                <IconCalendarEvent className="h-3.5 w-3.5" />
                                {format(new Date(salary.periodStartDate), "MMMM d")} - {format(new Date(salary.periodEndDate), "MMMM d, yyyy")}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/20">
                    {/* Summary Header */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 bg-background p-5 rounded-2xl border shadow-sm flex flex-col justify-center">
                            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Net Payable Amount</Label>
                            <div className="text-3xl font-black text-foreground">
                                LKR {formatCurrency(currentNetSalary)}
                            </div>
                        </div>

                        <div className="md:w-[240px] bg-primary/5 p-5 rounded-2xl border border-primary/20 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                           <div className="absolute right-[-10px] top-[-10px] opacity-[0.03]">
                                <IconReceipt className="h-20 w-20" />
                            </div>
                            <Label className="text-[10px] font-black text-primary/60 uppercase tracking-wider mb-1">Basic Salary</Label>
                            <div className="text-2xl font-black text-primary tabular-nums">
                                {formatCurrency(salary.basicSalary || 0)}
                            </div>
                        </div>
                    </div>

                    {/* Pay Components Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Earnings Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <div className="h-6 w-6 rounded-md bg-green-500/10 text-green-600 flex items-center justify-center">
                                    <IconTrendingUp className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground">Earnings</h3>
                            </div>

                            <div className="bg-background rounded-xl border shadow-sm overflow-hidden divide-y">
                                <div className="p-3 px-4 flex justify-between items-center text-sm">
                                    <span className="font-medium text-muted-foreground flex items-center gap-2">
                                        <IconReceipt className="h-3.5 w-3.5" /> Basic Salary
                                    </span>
                                    <span className="font-bold">{formatCurrency(salary.basicSalary || 0)}</span>
                                </div>

                                {salary.otAdjustment !== 0 && (
                                    <div className="p-3 px-4 flex justify-between items-center text-sm bg-blue-50/10">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-blue-600 flex items-center gap-2">
                                                OT Adjustment
                                            </span>
                                            {salary.otAdjustmentReason && (
                                                <span className="text-[10px] text-muted-foreground italic">{salary.otAdjustmentReason}</span>
                                            )}
                                        </div>
                                        <span className="font-bold text-blue-600">+{formatCurrency(salary.otAdjustment || 0)}</span>
                                    </div>
                                )}

                                {salary.holidayPayAdjustment !== 0 && (
                                    <div className="p-3 px-4 flex justify-between items-center text-sm bg-amber-50/10">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-amber-600 flex items-center gap-2">
                                                Holiday Pay Adjustment
                                            </span>
                                            {salary.holidayPayAdjustmentReason && (
                                                <span className="text-[10px] text-muted-foreground italic">{salary.holidayPayAdjustmentReason}</span>
                                            )}
                                        </div>
                                        <span className="font-bold text-amber-600">+{formatCurrency(salary.holidayPayAdjustment || 0)}</span>
                                    </div>
                                )}

                                {additions.map((comp, idx) => (
                                    <div key={idx} className="p-3 px-4 flex justify-between items-center text-sm">
                                        <span className="font-medium text-muted-foreground">{comp.name}</span>
                                        <span className="font-bold text-green-600">+{formatCurrency(comp.amount)}</span>
                                    </div>
                                ))}

                                <div className="p-3 px-4 bg-muted/50 flex justify-between items-center border-t">
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Gross Earnings</span>
                                    <span className="font-bold text-green-600 tabular-nums">{formatCurrency(grossEarnings)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deductions Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <div className="h-6 w-6 rounded-md bg-red-500/10 text-red-600 flex items-center justify-center">
                                    <IconTrendingDown className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground">Deductions</h3>
                            </div>

                            <div className="bg-background rounded-xl border shadow-sm overflow-hidden divide-y">
                                {((salary.lateDeduction || 0) + (salary.lateAdjustment || 0)) !== 0 && (
                                    <div className="p-3 px-4 flex justify-between items-center text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-muted-foreground">Late Marks Deduction</span>
                                            {salary.lateAdjustmentReason && (
                                                <span className="text-[10px] text-muted-foreground italic">{salary.lateAdjustmentReason}</span>
                                            )}
                                        </div>
                                        <span className="font-bold text-red-600">-{formatCurrency((salary.lateDeduction || 0) + (salary.lateAdjustment || 0))}</span>
                                    </div>
                                )}

                                {salary.advanceDeduction > 0 && (
                                    <div className="p-3 px-4 flex justify-between items-center text-sm">
                                        <span className="font-medium text-muted-foreground flex items-center gap-2">
                                            <IconCash className="h-3.5 w-3.5" /> Advance Recovery
                                        </span>
                                        <span className="font-bold text-orange-600">-{formatCurrency(salary.advanceDeduction)}</span>
                                    </div>
                                )}

                                {salary.taxAmount > 0 && (
                                    <div className="p-3 px-4 flex justify-between items-center text-sm">
                                        <span className="font-medium text-muted-foreground">Tax Payee</span>
                                        <span className="font-bold text-red-600">-{formatCurrency(salary.taxAmount)}</span>
                                    </div>
                                )}

                                {deductions.filter(c => c.systemType !== 'LATE_DEDUCTION').map((comp, idx) => (
                                    <div key={idx} className="p-3 px-4 flex justify-between items-center text-sm">
                                        <span className="font-medium text-muted-foreground">{comp.name}</span>
                                        <span className="font-bold text-red-600">-{formatCurrency(comp.amount)}</span>
                                    </div>
                                ))}

                                {salary.recoveryAdjustment !== 0 && (
                                    <div className="p-3 px-4 flex justify-between items-center text-sm bg-red-50/10">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-red-600">Recovery Adjustment</span>
                                            {salary.recoveryAdjustmentReason && (
                                                <span className="text-[10px] text-muted-foreground italic">{salary.recoveryAdjustmentReason}</span>
                                            )}
                                        </div>
                                        <span className="font-bold text-red-600">-{formatCurrency(salary.recoveryAdjustment || 0)}</span>
                                    </div>
                                )}

                                <div className="p-3 px-4 bg-muted/50 flex justify-between items-center border-t">
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Total Deductions</span>
                                    <span className="font-bold text-red-600 tabular-nums">{formatCurrency(totalRecoveries)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calculation Factors (Breakdowns) */}
                    {(salary.otBreakdown?.length > 0 || salary.holidayPayBreakdown?.length > 0 || (salary as any).advanceAdjustments?.length > 0) && (
                        <div className="bg-background p-5 rounded-2xl border shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <IconTable className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Calculation Factors</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {salary.otBreakdown?.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground block border-b pb-1">OT Breakdown</span>
                                        {salary.otBreakdown.map((ot, idx) => (
                                            <div key={idx} className="flex justify-between text-xs py-1 border-b border-border/50 last:border-0">
                                                <span className="text-muted-foreground">{ot.type} ({ot.hours.toFixed(2)}h)</span>
                                                <span className="font-medium text-blue-600">+{formatCurrency(ot.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {salary.holidayPayBreakdown?.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground block border-b pb-1">Holiday Pay</span>
                                        {salary.holidayPayBreakdown.map((hp, idx) => (
                                            <div key={idx} className="flex justify-between text-xs py-1 border-b border-border/50 last:border-0">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{hp.holidayName}</span>
                                                    <span className="text-[10px] text-muted-foreground">{hp.hours.toFixed(2)}h</span>
                                                </div>
                                                <span className="font-medium text-emerald-600">+{formatCurrency(hp.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {(salary as any).advanceAdjustments?.length > 0 && (
                                    <div className="space-y-2 lg:col-span-1">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground block border-b pb-1">Advance Recovery</span>
                                        {(salary as any).advanceAdjustments.map((adj: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-xs py-1 border-b border-border/50 last:border-0">
                                                <span className="text-muted-foreground">{adj.reason || 'Salary Advance'}</span>
                                                <span className="font-medium text-orange-600">-{formatCurrency(adj.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Attendance Sessions */}
                    {salary.sessions && salary.sessions.length > 0 && (
                        <div className="bg-background p-5 rounded-2xl border shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <IconListDetails className="w-4 h-4" />
                                <span className="text-xs font-black uppercase tracking-wider">Attendance Logs</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b text-muted-foreground uppercase text-[9px] font-black">
                                            <th className="pb-2">Date</th>
                                            <th className="pb-2">In</th>
                                            <th className="pb-2">Out</th>
                                            <th className="pb-2 text-center">Work</th>
                                            <th className="pb-2 text-center">Break</th>
                                            <th className="pb-2 text-right">OT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {salary.sessions.map((session: any, sIdx: number) => {
                                            const sessionDate = session.date ? new Date(session.date) : null;
                                            const formatDuration = (mins: number | null) => {
                                                if (!mins) return "0h 0m";
                                                const h = Math.floor(mins / 60);
                                                const m = mins % 60;
                                                return `${h}h ${m}m`;
                                            };

                                            return (
                                                <tr key={sIdx} className="hover:bg-muted/30 transition-colors">
                                                    <td className="py-2.5 font-bold">
                                                        {sessionDate ? format(sessionDate, "MMM d (EEE)") : 'N/A'}
                                                    </td>
                                                    <td className="py-2.5 text-muted-foreground">
                                                        {session.checkInTime ? format(new Date(session.checkInTime), "HH:mm") : '--:--'}
                                                    </td>
                                                    <td className="py-2.5 text-muted-foreground">
                                                        {session.checkOutTime ? format(new Date(session.checkOutTime), "HH:mm") : '--:--'}
                                                    </td>
                                                    <td className="py-2.5 text-center font-bold text-primary">
                                                        {formatDuration(session.workMinutes)}
                                                    </td>
                                                    <td className="py-2.5 text-center text-muted-foreground font-medium">
                                                        {formatDuration(session.breakMinutes)}
                                                    </td>
                                                    <td className="py-2.5 text-right font-bold text-blue-600">
                                                        {formatDuration(session.overtimeMinutes)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Internal Remarks - Optional for employee */}
                    {salary.remarks && (
                        <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 space-y-2">
                             <div className="flex items-center gap-2 text-muted-foreground">
                                <IconNotes className="h-4 w-4" />
                                <span className="text-xs font-black uppercase tracking-widest">Notes</span>
                            </div>
                            <p className="text-sm italic text-muted-foreground">{salary.remarks}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
