"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePayments } from "@/hooks/use-payments";
import { useSalaries } from "@/hooks/use-salaries";
import { format } from "date-fns";
import { IconHistory, IconCash, IconCreditCard, IconReceipt, IconWallet, IconCalendarTime, IconArrowRight, IconInfoCircle } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { PaymentDetailsDialog } from "./PaymentDetailsDialog";

export function PaymentsTab({ companyId }: { companyId: string }) {
    const { paymentsQuery, deletePaymentMutation } = usePayments({ companyId });
    const { salariesQuery } = useSalaries({ companyId, limit: 1000 }); // Large limit to calculate totals
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-blue-500/5 border border-blue-500/20">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-blue-500">
                            <IconCash className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Disbursed This Month</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-foreground tabular-nums">
                                {totalDisbursedThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">{format(new Date(), "MMMM yyyy")}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-amber-500/5 border border-amber-500/20">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-amber-500">
                            <IconWallet className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Settlement</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-foreground tabular-nums">
                                {pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                                {pendingSalaries.length} Salaries Pending
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-red-500/5 border border-red-500/20">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-red-500">
                            <IconCalendarTime className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Overdue Liability</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-red-500 tabular-nums">
                                {overdueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                                {overdueSalaries.length} Delayed Payments
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="px-6 py-5 flex flex-row items-center justify-between border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                            <IconHistory className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <CardTitle className="text-sm font-black uppercase tracking-widest">Payment Logs</CardTitle>
                            <span className="text-[10px] text-muted-foreground font-bold font-mono">Real-time settlement history</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-b">
                                    <TableHead className="pl-6 py-4 font-black text-[10px] uppercase tracking-widest">Date</TableHead>
                                    <TableHead className="py-4 font-black text-[10px] uppercase tracking-widest">Reference</TableHead>
                                    <TableHead className="py-4 font-black text-[10px] uppercase tracking-widest">Recipient</TableHead>
                                    <TableHead className="py-4 font-black text-[10px] uppercase tracking-widest text-center">Type</TableHead>
                                    <TableHead className="py-4 font-black text-[10px] uppercase tracking-widest">Method</TableHead>
                                    <TableHead className="py-4 font-black text-[10px] uppercase tracking-widest text-center">Status</TableHead>
                                    <TableHead className="pr-6 py-4 text-right font-black text-[10px] uppercase tracking-widest">Amount</TableHead>
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
                                            <TableCell className="pl-6 py-4 font-bold text-xs tabular-nums">
                                                {format(new Date(payment.date), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell className="font-mono text-[10px] text-muted-foreground font-bold uppercase">
                                                {payment.referenceNo || payment.id.split("-")[0]}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col text-xs">
                                                    <span className="font-bold">{payment.salary?.employee?.fullName || payment.advance?.employee?.fullName}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium font-mono">
                                                        {(payment.salary?.employee?.employeeNo || payment.advance?.employee?.employeeNo) && `#${payment.salary?.employee?.employeeNo || payment.advance?.employee?.employeeNo}`}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase ${payment.salaryId ? 'bg-primary/5 text-primary border-primary/10' : 'bg-orange-500/5 text-orange-500 border-orange-500/10'}`}>
                                                    {payment.salaryId ? 'Salary' : 'Advance'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground capitalize bg-muted/40 w-fit px-2 py-1.5 rounded-xl border border-border shadow-sm">
                                                    {getMethodIcon(payment.paymentMethod)}
                                                    {payment.paymentMethod.toLowerCase().replace('_', ' ')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className={`rounded-xl px-2 py-0.5 font-black uppercase text-[9px] ${payment.status === 'ACKNOWLEDGED' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'}`}>
                                                    {payment.status === 'PENDING_ACKNOWLEDGEMENT' ? 'Pending' : payment.status?.replace('_', ' ') || 'PENDING'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="pr-6 text-right font-black text-sm tabular-nums">
                                                {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
        </div>
    );
}
