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
import { Button } from "@/components/ui/button";
import {
    IconCreditCard,
    IconCheck,
    IconClock,
    IconCash,
} from "@tabler/icons-react";
import { usePortalPayments } from "@/hooks/use-portal-salaries";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeePaymentsTab() {
    const { paymentsQuery, acknowledgeMutation } = usePortalPayments();

    const payments = paymentsQuery.data || [];

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING_ACKNOWLEDGEMENT: "bg-orange-500/10 text-orange-600 border-orange-500/20",
            ACKNOWLEDGED: "bg-green-500/10 text-green-600 border-green-500/20",
        };

        return (
            <Badge variant="outline" className={`font-bold ${styles[status] || styles.PENDING_ACKNOWLEDGEMENT}`}>
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <Card className="border border-neutral-200 dark:border-white/20 shadow-sm bg-background dark:bg-neutral-900/50 overflow-hidden rounded-[2rem]">
                <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <IconCreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                                Payment Transactions
                            </CardTitle>
                            <CardDescription className="text-xs font-medium text-muted-foreground">
                                Track your salary and advance payments and acknowledge receipt
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8 pt-0">
                    {paymentsQuery.isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <IconCash className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-lg font-bold">No payments found</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                You don't have any payment records on file yet.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-neutral-100 dark:border-white/5 overflow-hidden bg-neutral-50/30 dark:bg-neutral-900/40">
                            <Table>
                                <TableHeader className="bg-neutral-100/50 dark:bg-neutral-800/50">
                                    <TableRow className="hover:bg-transparent border-neutral-200 dark:border-white/5">
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4 px-6">Payment Date</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Reference</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4 text-right">Amount</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Status</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4 text-right pr-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id} className="group hover:bg-muted/30 transition-colors border-b last:border-0">
                                            <TableCell className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">
                                                        {format(new Date(payment.date), "MMMM d, yyyy")}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                        {payment.paymentMethod}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-xs">
                                                        {payment.salary 
                                                            ? `Salary for ${format(new Date(payment.salary.periodStartDate), "MMM yyyy")}`
                                                            : payment.advance 
                                                                ? `Advance: ${payment.advance.reason || 'General'}`
                                                                : 'Payment'}
                                                    </span>
                                                    {payment.referenceNo && (
                                                        <span className="text-[10px] text-muted-foreground font-mono">Ref: {payment.referenceNo}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-right">
                                                <span className="font-black text-sm text-emerald-600">
                                                    LKR {formatCurrency(payment.amount)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getStatusBadge(payment.status)}
                                            </TableCell>
                                            <TableCell className="py-4 text-right pr-6">
                                                {payment.status === 'PENDING_ACKNOWLEDGEMENT' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-xl h-9 hover:bg-green-600 hover:text-white border-green-600/20 text-green-600 font-bold group/btn"
                                                        disabled={acknowledgeMutation.isPending}
                                                        onClick={() => acknowledgeMutation.mutate(payment.id)}
                                                    >
                                                        <IconCheck className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                                                        Acknowledge
                                                    </Button>
                                                ) : (
                                                    <div className="flex flex-col items-end pr-4 text-muted-foreground opacity-60">
                                                        <div className="flex items-center gap-1.5">
                                                            <IconCheck className="w-3.5 h-3.5" />
                                                            <span className="text-[10px] font-black uppercase tracking-wider">Confirmed</span>
                                                        </div>
                                                        {payment.acknowledgedAt && (
                                                            <span className="text-[9px] font-medium italic">
                                                                {format(new Date(payment.acknowledgedAt), "MMM d, HH:mm")}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
