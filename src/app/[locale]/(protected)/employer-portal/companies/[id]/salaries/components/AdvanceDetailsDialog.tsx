"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { IconCash, IconCalendar, IconUser, IconReceipt, IconClock, IconCheck, IconAlertCircle, IconArrowRight, IconMessageCircle2, IconTrash } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AdvanceDetailsDialogProps {
    advance: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPay?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export function AdvanceDetailsDialog({
    advance,
    open,
    onOpenChange,
    onPay,
    onDelete
}: AdvanceDetailsDialogProps) {
    if (!advance) return null;

    const recovered = (advance.totalAmount || 0) - (advance.remainingAmount || 0);
    const progress = advance.totalAmount > 0 ? (recovered / advance.totalAmount) * 100 : 0;
    const isSettled = advance.remainingAmount <= 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-background flex flex-col max-h-[90vh]">
                <div className="bg-primary/5 p-6 border-b border-primary/10 shrink-0">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                                    <IconCash className="h-5 w-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
                                        Advance Details
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "rounded-lg px-2 py-0.5 font-black uppercase text-[8px] tracking-wider",
                                                advance.status === 'RECOVERED' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                    advance.status === 'PAID' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                                        'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                            )}
                                        >
                                            {advance.status?.replace('_', ' ') || 'PENDING'}
                                        </Badge>
                                    </DialogTitle>
                                    <DialogDescription className="text-xs font-medium text-muted-foreground font-mono">
                                        REF: ADV-{advance.id.slice(0, 8).toUpperCase()} • Issued {format(new Date(advance.date), "PPP")}
                                    </DialogDescription>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Summary Column */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="space-y-6">
                                {/* Employee Card */}
                                <div className="p-4 rounded-[2rem] bg-muted/20 border border-border/50 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shadow-sm">
                                        <IconUser className="h-6 w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-foreground">{advance.employee?.fullName}</span>
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
                                            {advance.employee?.designation} • #{advance.employee?.employeeNo}
                                        </span>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-5 rounded-[2rem] bg-primary/5 border border-primary/10 flex justify-between items-center group transition-all hover:bg-primary/[0.08]">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-primary/70 tracking-widest">Total Advance</span>
                                            <span className="text-2xl font-black text-primary tabular-nums">
                                                {advance.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <IconReceipt className="h-8 w-8 text-primary/20 group-hover:scale-110 transition-transform" />
                                    </div>

                                    <div className="p-5 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex justify-between items-center group transition-all hover:bg-amber-500/[0.08]">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-amber-600/70 tracking-widest">Remaining Balance</span>
                                            <span className="text-2xl font-black text-amber-600 tabular-nums">
                                                {advance.remainingAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <IconClock className="h-8 w-8 text-amber-500/20 group-hover:rotate-12 transition-transform" />
                                    </div>
                                </div>

                                {/* Recovery Progress */}
                                <div className="p-6 rounded-[2.5rem] bg-muted/5 border-2 border-border shadow-sm space-y-5">
                                    <div className="flex justify-between items-center px-1">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Recovery Progress</span>
                                            <span className="text-xl font-black text-foreground tabular-nums">{progress.toFixed(0)}%</span>
                                        </div>
                                        <div className={cn(
                                            "h-10 w-10 rounded-2xl flex items-center justify-center",
                                            isSettled ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary"
                                        )}>
                                            {isSettled ? <IconCheck className="h-5 w-5" /> : <IconClock className="h-5 w-5" />}
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="h-4 w-full bg-muted/50 rounded-full border border-border/80 shadow-inner overflow-hidden p-[3px] relative">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000 ease-out",
                                                    isSettled ? "bg-green-500 shadow-sm" : "bg-primary shadow-sm"
                                                )}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Recovered</span>
                                            <span className="text-[11px] font-bold tabular-nums">{recovered.toLocaleString()} <span className="text-[9px] opacity-30">LKR</span></span>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">To Recover</span>
                                            <span className="text-[11px] font-bold tabular-nums text-amber-600">{advance.remainingAmount?.toLocaleString()} <span className="text-[9px] opacity-30">LKR</span></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Reasons & Remarks */}
                                <div className="space-y-4">
                                    {advance.reason && (
                                        <div className="space-y-1 px-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                <IconAlertCircle className="h-3 w-3" />
                                                Reason
                                            </div>
                                            <p className="text-sm font-bold text-foreground bg-muted/20 p-4 rounded-2xl border border-border/50">
                                                {advance.reason}
                                            </p>
                                        </div>
                                    )}

                                    {advance.remarks && (
                                        <div className="space-y-1 px-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                <IconMessageCircle2 className="h-3 w-3" />
                                                Internal Remarks
                                            </div>
                                            <p className="text-xs font-medium text-muted-foreground italic bg-muted/20 p-4 rounded-2xl border border-border/10">
                                                {advance.remarks}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recovery Schedule Column */}
                        <div className="lg:col-span-7 space-y-4 flex flex-col h-full">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Recovery Schedule</Label>
                                    <Badge variant="outline" className="rounded-full text-[9px] font-black border-primary/20 text-primary bg-primary/5">
                                        {advance.deductionSchedule?.length || 0} Installments
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex-1 bg-muted/10 border border-border/50 rounded-[2.5rem] p-6 overflow-y-auto max-h-[500px] custom-scrollbar space-y-3">
                                {advance.deductionSchedule?.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-3 py-20">
                                        <IconCalendar className="h-10 w-10" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No schedule defined</p>
                                    </div>
                                ) : (
                                    advance.deductionSchedule.map((item: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "p-4 rounded-3xl border shadow-sm flex items-center justify-between transition-all animate-in slide-in-from-right-2 duration-300",
                                                item.isDeducted
                                                    ? "bg-green-500/5 border-green-500/10 opacity-70"
                                                    : "bg-background border-border/30 hover:border-primary/20 shadow-sm"
                                            )}
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-2xl flex items-center justify-center font-black text-[10px] transition-colors",
                                                    item.isDeducted
                                                        ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                                                        : "bg-muted/50 text-muted-foreground"
                                                )}>
                                                    {item.isDeducted ? <IconCheck className="h-5 w-5" /> : idx + 1}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-tight",
                                                        item.isDeducted ? "text-green-600" : "text-primary/70"
                                                    )}>
                                                        {item.isDeducted ? "Recovered" : "Upcoming Recovery"}
                                                    </span>
                                                    <span className="text-sm font-bold text-foreground">
                                                        {format(new Date(item.periodEndDate), "MMMM yyyy")}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-end">
                                                    <span className={cn(
                                                        "text-sm font-black tabular-nums",
                                                        item.isDeducted ? "text-green-700" : "text-foreground"
                                                    )}>
                                                        {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Amount</span>
                                                </div>
                                                <div className="h-8 w-8 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                                                    <IconArrowRight className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-muted/20 flex items-center justify-between shrink-0">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1 opacity-50">Remaining Balance</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black tabular-nums text-foreground">
                                {advance.remainingAmount?.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">LKR</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {onDelete && (advance.status === 'PENDING' || (advance.status === 'APPROVED' && (!advance.payments || advance.payments.length === 0) && advance.deductionSchedule?.every((s: any) => !s.isDeducted))) && (
                            <Button
                                variant="ghost"
                                className="h-12 w-12 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl shrink-0 border border-transparent hover:border-red-100"
                                onClick={() => onDelete(advance.id)}
                                title="Delete Advance"
                            >
                                <IconTrash className="h-5 w-5" />
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-muted/10 border-muted-foreground/10"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                        {advance.status === 'APPROVED' && onPay && (
                            <Button
                                className="h-12 px-10 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-green-500/20 bg-green-600 hover:bg-green-700 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                onClick={() => {
                                    onPay(advance.id);
                                    onOpenChange(false);
                                }}
                            >
                                <IconCash className="h-4 w-4 mr-2" />
                                Pay Advance
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
