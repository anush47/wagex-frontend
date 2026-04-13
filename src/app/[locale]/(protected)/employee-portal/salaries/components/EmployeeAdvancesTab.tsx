"use client";

import React from "react";
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    IconTrendingUp,
    IconCurrencyDollar,
    IconCalendar,
    IconInfoCircle,
    IconScale,
} from "@tabler/icons-react";
import { usePortalAdvances } from "@/hooks/use-portal-salaries";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeAdvancesTab() {
    const { advancesQuery } = usePortalAdvances();

    const advances = advancesQuery.data || [];

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            APPROVED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
            PAID: "bg-green-500/10 text-green-600 border-green-500/20",
            RECOVERED: "bg-neutral-500/10 text-neutral-600 border-neutral-500/20",
        };

        return (
            <Badge variant="outline" className={`font-bold ${styles[status] || styles.APPROVED}`}>
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Card className="border border-neutral-200 dark:border-white/10 shadow-sm bg-white dark:bg-neutral-900/50 rounded-3xl overflow-hidden p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-orange-600/10 text-orange-600 flex items-center justify-center shrink-0">
                        <IconScale className="w-6 h-6" />
                    </div>
                    <div>
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Outstanding</CardDescription>
                        <CardTitle className="text-2xl font-black">
                            LKR {formatCurrency(advances.reduce((s, a) => s + (a.remainingAmount || 0), 0))}
                        </CardTitle>
                    </div>
                </Card>
            </div>

            <Card className="border border-neutral-200 dark:border-white/20 shadow-sm bg-background dark:bg-neutral-900/50 overflow-hidden rounded-[2rem]">
                <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <IconTrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                                Salary Advances
                            </CardTitle>
                            <CardDescription className="text-xs font-medium text-muted-foreground">
                                View your active advances and repayment schedule
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8 pt-0">
                    {advancesQuery.isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : advances.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <IconCurrencyDollar className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-lg font-bold">No advances found</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                You don't have any recorded salary advances.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {advances.map((advance) => (
                                <div key={advance.id} className="rounded-3xl border border-neutral-100 dark:border-white/10 bg-neutral-50/30 dark:bg-neutral-900/40 overflow-hidden shadow-sm">
                                    <div className="p-6 bg-background/50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between gap-4 border-b border-neutral-100 dark:border-white/5">
                                        <div className="flex gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 outline outline-2 outline-muted-foreground/10 outline-offset-2">
                                                <IconCalendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-sm">{advance.reason || 'General Salary Advance'}</h4>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                                                    Issued on {format(new Date(advance.date), "MMMM d, yyyy")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-8 items-center">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">Total Amount</p>
                                                <p className="font-bold text-sm">LKR {formatCurrency(advance.totalAmount)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-orange-600 uppercase tracking-wider mb-0.5">Outstanding</p>
                                                <p className="font-black text-lg text-orange-600">LKR {formatCurrency(advance.remainingAmount)}</p>
                                            </div>
                                            <div className="flex items-center">
                                                {getStatusBadge(advance.status)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <IconInfoCircle className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Repayment Schedule</span>
                                        </div>
                                        <div className="bg-background rounded-2xl border overflow-hidden">
                                            <Table>
                                                <TableHeader className="bg-muted/30">
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableHead className="text-[9px] font-black py-3">Period</TableHead>
                                                        <TableHead className="text-[9px] font-black py-3 text-right">Amount</TableHead>
                                                        <TableHead className="text-[9px] font-black py-3 text-right pr-6">Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {(advance.deductionSchedule as any[] || []).map((step, idx) => (
                                                        <TableRow key={idx} className="group hover:bg-muted/20 transition-colors border-b last:border-0">
                                                            <TableCell className="py-3 text-xs font-medium">
                                                                {format(new Date(step.periodStartDate), "MMM yyyy")}
                                                            </TableCell>
                                                            <TableCell className="py-3 text-right text-xs font-black tabular-nums">
                                                                LKR {formatCurrency(step.amount)}
                                                            </TableCell>
                                                            <TableCell className="py-3 text-right pr-6">
                                                                {step.isDeducted ? (
                                                                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 py-0 h-5 font-bold">
                                                                        DEDUCTED
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="bg-muted text-muted-foreground py-0 h-5 font-bold">
                                                                        PENDING
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
