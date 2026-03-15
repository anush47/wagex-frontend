"use client";

import React, { useState } from "react";
import { SettlePaymentsDialog } from "./SettlePaymentsDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePayments } from "@/hooks/use-payments";
import { useSalaries } from "@/hooks/use-salaries";
import { format } from "date-fns";
import { IconHistory, IconCash, IconCreditCard, IconReceipt, IconWallet, IconCalendarTime, IconArrowRight, IconInfoCircle, IconPlus } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentDetailsDialog } from "./PaymentDetailsDialog";
import { cn, formatCurrency } from "@/lib/utils";

export function PaymentsTab({ companyId }: { companyId: string }) {
    const { paymentsQuery, deletePaymentMutation } = usePayments({ companyId });
    const { salariesQuery } = useSalaries({ companyId, limit: 1000 }); // Large limit to calculate totals
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isBatchPaymentOpen, setIsBatchPaymentOpen] = useState(false);

    const data = paymentsQuery.data as any;
    const payments = Array.isArray(data) ? data : (data?.items || []);

    const salaries = (salariesQuery.data as any)?.items || [];
    const totalDisbursedThisMonth = payments
        .filter((p: any) => new Date(p.date).getMonth() === new Date().getMonth())
        .reduce((sum: number, p: any) => sum + p.amount, 0);

    const pendingSalaries = salaries.filter((s: any) => s.status === 'APPROVED' || s.status === 'PARTIALLY_PAID');
    const pendingAmount = pendingSalaries.reduce((sum: number, s: any) => {
        const paid = (s.payments || []).reduce((pSum: number, p: any) => pSum + p.amount, 0);
        return sum + (s.netSalary - paid);
    }, 0);

    const overdueSalaries = pendingSalaries.filter((s: any) => new Date(s.payDate) < new Date());
    const overdueAmount = overdueSalaries.reduce((sum: number, s: any) => {
        const paid = (s.payments || []).reduce((pSum: number, p: any) => pSum + p.amount, 0);
        return sum + (s.netSalary - paid);
    }, 0);

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'CASH': return <IconCash className="h-4 w-4" />;
            case 'BANK_TRANSFER': return <IconCreditCard className="h-4 w-4" />;
            default: return <IconReceipt className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight uppercase text-foreground/90">Payment History</h3>
                    <p className="text-neutral-500 font-medium text-xs">Track salary disbursements and settlement status</p>
                </div>
                <Button
                    onClick={() => setIsBatchPaymentOpen(true)}
                    className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <IconPlus className="mr-2 h-5 w-5" />
                    Do Payment
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm bg-blue-500/5 border border-blue-500/30 rounded-[2rem]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-blue-500">
                            <IconCash className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Disbursed This Month</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-foreground tabular-nums">
                                {formatCurrency(totalDisbursedThisMonth)}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">{format(new Date(), "MMMM yyyy")}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm bg-amber-500/5 border border-amber-500/30 rounded-[2rem]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-amber-500">
                            <IconWallet className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Settlement</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-foreground tabular-nums">
                                {formatCurrency(pendingAmount)}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                                {pendingSalaries.length} Salaries Pending
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm bg-red-500/5 border border-red-500/30 rounded-[2rem]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-red-500">
                            <IconCalendarTime className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Overdue Liability</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-red-500 tabular-nums">
                                {formatCurrency(overdueAmount)}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                                {overdueSalaries.length} Delayed Payments
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border border-neutral-200 dark:border-white/20 shadow-sm bg-background dark:bg-neutral-900/50 overflow-hidden rounded-[2rem]">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <IconHistory className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight text-foreground">Payment Logs</CardTitle>
                                <p className="text-xs font-medium text-muted-foreground">Real-time history of salary disbursements and advances.</p>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead className="text-center">Type</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentsQuery.isLoading ? (
                                    [1, 2, 3].map(i => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell className="pl-6"><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-32 bg-muted rounded" /></TableCell>
                                            <TableCell><div className="h-6 w-16 bg-muted rounded-full" /></TableCell>
                                            <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                                            <TableCell><div className="h-6 w-20 bg-muted rounded-full" /></TableCell>
                                            <TableCell className="pr-6"><div className="h-4 w-16 bg-muted rounded ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : payments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground font-medium">No payment history found.</TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((payment: any) => (
                                        <TableRow 
                                            key={payment.id} 
                                            className="hover:bg-muted/50 cursor-pointer group border-b transition-colors"
                                            onClick={() => {
                                                setSelectedPayment(payment);
                                                setIsDetailsOpen(true);
                                            }}
                                        >
                                            <TableCell className="py-4 font-medium text-sm">
                                                {format(new Date(payment.date), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {payment.referenceNo || payment.id.split("-")[0]}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{payment.salary?.employee?.fullName || payment.advance?.employee?.fullName}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {(payment.salary?.employee?.employeeNo || payment.advance?.employee?.employeeNo) && `(${payment.salary?.employee?.employeeNo || payment.advance?.employee?.employeeNo})`}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge 
                                                    variant="outline" 
                                                    className={cn(
                                                        "font-black uppercase text-[9px] px-2 py-0.5 rounded-lg",
                                                        payment.salaryId 
                                                            ? 'bg-primary/5 text-primary border-primary/20' 
                                                            : 'bg-amber-500/5 text-amber-600 border-amber-500/20'
                                                    )}
                                                >
                                                    {payment.salaryId ? 'Salary' : 'Advance'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-xs font-medium capitalize">
                                                    {getMethodIcon(payment.paymentMethod)}
                                                    {payment.paymentMethod.toLowerCase().replace('_', ' ')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className={`font-bold ${payment.status === 'ACKNOWLEDGED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                                                    {payment.status === 'PENDING_ACKNOWLEDGEMENT' ? 'Pending' : payment.status?.replace('_', ' ') || 'PENDING'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-sm text-foreground tabular-nums">
                                                        {formatCurrency(payment.amount)}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-medium">LKR</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <PaymentDetailsDialog 
                open={isDetailsOpen} 
                onOpenChange={setIsDetailsOpen} 
                payment={selectedPayment} 
                onDelete={(id) => deletePaymentMutation.mutate(id)}
                isDeleting={deletePaymentMutation.isPending}
            />

            <SettlePaymentsDialog
                open={isBatchPaymentOpen}
                onOpenChange={setIsBatchPaymentOpen}
                companyId={companyId}
            />
        </div>
    );
}
