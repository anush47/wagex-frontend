"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconCash, IconUser, IconCalendar, IconCheck, IconChevronRight, IconArrowRight, IconTrash, IconPlus, IconSettings, IconLayoutList } from "@tabler/icons-react";
import { format, addMonths, startOfMonth, endOfMonth, addDays } from "date-fns";
import { useEffectivePolicy } from "@/hooks/use-policies";
import { cn } from "@/lib/utils";
import { PayCycleFrequency } from "@/types/policy";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";
import { SalaryPeriodQuickSelect } from "../../attendance/components/SalaryPeriodQuickSelect";
import { AdvanceStatus } from "@/types/salary";

interface IssueAdvanceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    onSubmit: (dto: any) => Promise<void>;
    isSubmitting: boolean;
}

export function IssueAdvanceDialog({
    open,
    onOpenChange,
    companyId,
    onSubmit,
    isSubmitting
}: IssueAdvanceDialogProps) {
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [amount, setAmount] = useState<string>("");
    const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [reason, setReason] = useState<string>("");
    const [remarks, setRemarks] = useState<string>("");
    const [installments, setInstallments] = useState<number>(1);
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [deductionSchedule, setDeductionSchedule] = useState<any[]>([]);

    const { data: effectivePolicy } = useEffectivePolicy(selectedEmployee?.id || null);
    const payrollConfig = useMemo(() => {
        return effectivePolicy?.effective?.payrollConfiguration || { frequency: PayCycleFrequency.MONTHLY, runDay: "LAST" };
    }, [effectivePolicy]);

    // Update schedule when in simple mode
    useEffect(() => {
        if (isAdvancedMode) return;

        if (!amount || Number(amount) <= 0 || !selectedEmployee) {
            setDeductionSchedule([]);
            return;
        }

        const total = Number(amount);
        const installmentAmount = Math.floor(total / installments);
        const remainder = total % installments;
        
        const schedule = [];
        const disbursementDate = new Date(date);
        const frequency = payrollConfig.frequency || PayCycleFrequency.MONTHLY;

        // Determine if we start with the current period or the next
        let offset = 1;
        if (frequency === PayCycleFrequency.MONTHLY) {
            const runDay = payrollConfig.runDay || "LAST";
            let payday: Date;
            if (runDay === "LAST") {
                payday = endOfMonth(disbursementDate);
            } else {
                payday = new Date(disbursementDate.getFullYear(), disbursementDate.getMonth(), Number(runDay));
            }
            if (disbursementDate <= payday) {
                offset = 0;
            }
        } else {
            // For weekly/bi-weekly, we start with the current cycle
            offset = 0;
        }

        for (let i = 0; i < installments; i++) {
            let periodStart: Date;
            let periodEnd: Date;
            const periodIdx = i + offset;

            if (frequency === PayCycleFrequency.MONTHLY) {
                const targetMonth = addMonths(disbursementDate, periodIdx);
                periodStart = startOfMonth(targetMonth);
                periodEnd = endOfMonth(targetMonth);
            } else if (frequency === PayCycleFrequency.BI_WEEKLY) {
                const targetEnd = addDays(disbursementDate, periodIdx * 14);
                periodStart = addDays(targetEnd, -13);
                periodEnd = targetEnd;
            } else if (frequency === PayCycleFrequency.WEEKLY) {
                const targetEnd = addDays(disbursementDate, periodIdx * 7);
                periodStart = addDays(targetEnd, -6);
                periodEnd = targetEnd;
            } else {
                const target = addDays(disbursementDate, periodIdx);
                periodStart = target;
                periodEnd = target;
            }

            schedule.push({
                periodStartDate: format(periodStart, "yyyy-MM-dd"),
                periodEndDate: format(periodEnd, "yyyy-MM-dd"),
                amount: i === installments - 1 ? installmentAmount + remainder : installmentAmount
            });
        }
        setDeductionSchedule(schedule);
    }, [amount, installments, date, payrollConfig, selectedEmployee, isAdvancedMode]);

    const handleAddInstallment = () => {
        const lastPeriod = deductionSchedule[deductionSchedule.length - 1];
        let nextStart: Date;
        let nextEnd: Date;

        if (lastPeriod) {
            const lastEnd = new Date(lastPeriod.periodEndDate);
            nextStart = addDays(lastEnd, 1);
            if (payrollConfig.frequency === PayCycleFrequency.MONTHLY) {
                nextStart = startOfMonth(addMonths(lastEnd, 1));
                nextEnd = endOfMonth(nextStart);
            } else {
                nextEnd = addDays(nextStart, payrollConfig.frequency === PayCycleFrequency.BI_WEEKLY ? 13 : 6);
            }
        } else {
            const disbursementDate = new Date(date);
            const frequency = payrollConfig.frequency || PayCycleFrequency.MONTHLY;
            let offset = 1;
            
            if (frequency === PayCycleFrequency.MONTHLY) {
                const runDay = payrollConfig.runDay || "LAST";
                const payday = runDay === "LAST" 
                    ? endOfMonth(disbursementDate) 
                    : new Date(disbursementDate.getFullYear(), disbursementDate.getMonth(), Number(runDay));
                if (disbursementDate <= payday) offset = 0;
                
                nextStart = startOfMonth(addMonths(disbursementDate, offset));
                nextEnd = endOfMonth(nextStart);
            } else {
                nextEnd = disbursementDate;
                nextStart = addDays(nextEnd, frequency === PayCycleFrequency.BI_WEEKLY ? -13 : -6);
            }
        }

        setDeductionSchedule([...deductionSchedule, {
            periodStartDate: format(nextStart, "yyyy-MM-dd"),
            periodEndDate: format(nextEnd, "yyyy-MM-dd"),
            amount: 0
        }]);
    };

    const handleRemoveInstallment = (index: number) => {
        setDeductionSchedule(deductionSchedule.filter((_, i) => i !== index));
    };

    const handleUpdateInstallment = (index: number, updates: any) => {
        const newSchedule = [...deductionSchedule];
        newSchedule[index] = { ...newSchedule[index], ...updates };
        setDeductionSchedule(newSchedule);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee || !amount) return;

        await onSubmit({
            companyId,
            employeeId: selectedEmployee.id,
            totalAmount: Number(amount),
            date: new Date(date).toISOString(),
            reason,
            remarks,
            status: AdvanceStatus.APPROVED,
            deductionSchedule: deductionSchedule.map(item => ({
                ...item,
                amount: Number(item.amount)
            }))
        });
        
        // Reset form
        setSelectedEmployee(null);
        setAmount("");
        setReason("");
        setRemarks("");
        setInstallments(1);
        setIsAdvancedMode(false);
    };

    const totalScheduled = deductionSchedule.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const amountNum = Number(amount) || 0;
    const isScheduleMatching = Math.abs(totalScheduled - amountNum) < 0.01;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-5xl lg:max-w-6xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-background flex flex-col max-h-[90vh]">
                <div className="bg-primary/5 p-6 border-b border-primary/10 shrink-0">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                                    <IconCash className="h-5 w-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground">Issue Advance</DialogTitle>
                                    <DialogDescription className="text-xs font-medium text-muted-foreground">
                                        Disburse a salary advance and set up a recovery schedule.
                                    </DialogDescription>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                                className={cn(
                                    "rounded-xl font-bold text-[10px] uppercase tracking-wider h-9 transition-all",
                                    isAdvancedMode ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/50"
                                )}
                            >
                                {isAdvancedMode ? <IconLayoutList className="h-4 w-4 mr-2" /> : <IconSettings className="h-4 w-4 mr-2" />}
                                {isAdvancedMode ? "Switch to Simple Mode" : "Customize Schedule"}
                            </Button>
                        </div>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column: Form Details (5 columns) */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Recipient Employee</Label>
                                    <SearchableEmployeeSelect 
                                        companyId={companyId}
                                        value={selectedEmployee?.id}
                                        onSelect={(id, emp) => setSelectedEmployee(emp)}
                                        className="h-14 font-bold border-border/50 bg-muted/20"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Total Amount</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-xs">LKR</span>
                                            <Input
                                                id="amount"
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="h-14 pl-14 rounded-2xl font-black text-xl bg-muted/20 border-border/50 focus:bg-background transition-all"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Disbursement Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="h-14 rounded-2xl font-bold bg-muted/20 border-border/50 focus:bg-background transition-all px-4"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reason for Advance</Label>
                                    <Input
                                        id="reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="e.g. Personal loan, medical, etc."
                                        className="h-14 rounded-2xl font-bold bg-muted/20 border-border/50 focus:bg-background transition-all px-4"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="remarks" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Internal Remarks</Label>
                                    <Textarea
                                        id="remarks"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Private notes for HR..."
                                        className="rounded-3xl resize-none min-h-[120px] bg-muted/20 border-border/50 focus:bg-background transition-all p-4"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Recovery Schedule (7 columns) */}
                        <div className="lg:col-span-7 flex flex-col h-full space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex flex-col">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Recovery Plan</Label>
                                    <span className="text-[10px] font-medium text-muted-foreground">Setup how this advance will be recovered</span>
                                </div>
                                
                                {!isAdvancedMode && (
                                    <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-2xl border border-border/50">
                                        <span className="text-[10px] font-bold text-muted-foreground ml-2">Installments</span>
                                        <div className="flex items-center gap-1 bg-background rounded-xl p-0.5 border border-border/50 shadow-sm">
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setInstallments(prev => Math.max(1, prev - 1)); }}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/5 text-sm font-bold transition-colors"
                                            >-</button>
                                            <span className="w-10 text-center text-xs font-black">{installments}</span>
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setInstallments(prev => prev + 1); }}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/5 text-sm font-bold transition-colors"
                                            >+</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 bg-muted/10 border border-border/50 rounded-[2.5rem] p-6 overflow-y-auto max-h-[500px] custom-scrollbar space-y-4">
                                {deductionSchedule.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-3 py-20 bg-background/50 rounded-[2rem] border-2 border-dashed border-border/50">
                                        <IconCalendar className="h-10 w-10" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Awaiting Generator</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {deductionSchedule.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                className="bg-background p-4 rounded-3xl border border-border/30 shadow-sm flex items-center gap-4 group animate-in slide-in-from-bottom-2 duration-300 transition-all hover:border-primary/20" 
                                                style={{ animationDelay: `${idx * 40}ms` }}
                                            >
                                                <div className="h-10 w-10 rounded-2xl bg-muted/50 flex items-center justify-center text-[10px] font-black text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                                                    {idx + 1}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    {isAdvancedMode ? (
                                                        <SalaryPeriodQuickSelect 
                                                            companyId={companyId}
                                                            employeeId={selectedEmployee?.id}
                                                            currentStart={item.periodStartDate}
                                                            currentEnd={item.periodEndDate}
                                                            onRangeSelect={(start, end) => handleUpdateInstallment(idx, { periodStartDate: start, periodEndDate: end })}
                                                            className="h-11 border-none bg-muted/30 w-full hover:bg-muted/50"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col px-1">
                                                            <span className="text-[10px] font-black uppercase text-primary/70 tracking-tight">Recovery Month</span>
                                                            <span className="text-sm font-bold text-foreground">
                                                                {format(new Date(item.periodEndDate), "MMMM yyyy")}
                                                            </span>
                                                            <span className="text-[9px] text-muted-foreground font-medium italic">
                                                                {format(new Date(item.periodStartDate), "MMM d")} - {format(new Date(item.periodEndDate), "MMM d")}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col items-end">
                                                        {isAdvancedMode ? (
                                                            <div className="relative w-32">
                                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-muted-foreground">LKR</span>
                                                                <Input 
                                                                    type="number"
                                                                    value={item.amount}
                                                                    onChange={(e) => handleUpdateInstallment(idx, { amount: e.target.value })}
                                                                    className="h-11 pl-9 rounded-xl font-bold bg-muted/30 border-none text-right focus:bg-muted/50 transition-all"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="text-sm font-black tabular-nums">{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Amount</span>
                                                            </>
                                                        )}
                                                    </div>

                                                    {isAdvancedMode && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveInstallment(idx)}
                                                            className="h-9 w-9 text-red-500/50 hover:text-red-500 hover:bg-red-50 rounded-xl"
                                                        >
                                                            <IconTrash className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {isAdvancedMode && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleAddInstallment}
                                                className="w-full h-14 rounded-3xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest gap-2"
                                            >
                                                <IconPlus className="h-4 w-4" />
                                                Add Another Period
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {deductionSchedule.length > 0 && (
                                <div className={cn(
                                    "px-6 py-4 rounded-[1.5rem] flex items-center justify-between transition-all border-2",
                                    isAdvancedMode 
                                        ? (isScheduleMatching ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20")
                                        : "bg-primary/5 border-primary/10"
                                )}>
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            isAdvancedMode 
                                                ? (isScheduleMatching ? "text-green-600" : "text-red-600")
                                                : "text-primary"
                                        )}>
                                            {isAdvancedMode ? "Total Scheduled Distribution" : "Total Recovery Amount"}
                                        </span>
                                        {isAdvancedMode && !isScheduleMatching && (
                                            <span className="text-[10px] font-bold text-red-500/70 italic">
                                                Must match total advance amount (LKR {amountNum.toLocaleString()})
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={cn(
                                            "text-xl font-black tabular-nums",
                                            isAdvancedMode 
                                                ? (isScheduleMatching ? "text-green-600" : "text-red-600")
                                                : "text-primary"
                                        )}>
                                            {totalScheduled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-8 pb-8 pt-4">
                        <DialogFooter className="pt-6 border-t border-border/50 flex flex-col md:flex-row gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="h-12 px-8 font-bold rounded-2xl hover:bg-muted"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !selectedEmployee || !amount || Number(amount) <= 0 || (isAdvancedMode && !isScheduleMatching)}
                                className="h-12 px-10 font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-all flex items-center gap-2 flex-1 md:flex-none"
                            >
                                {isSubmitting ? "Processing..." : (
                                    <>
                                        Issue Advance
                                        <IconCheck className="h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
