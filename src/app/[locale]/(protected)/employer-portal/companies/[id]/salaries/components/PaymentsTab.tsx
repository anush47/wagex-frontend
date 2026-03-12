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
    const { paymentsQuery } = usePayments({ companyId });
    const { salariesQuery } = useSalaries({ companyId, limit: 1000 }); // Large limit to calculate totals
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const data = paymentsQuery.data as any;
    const payments = Array.isArray(data) ? data : (data?.items || []);

    const salaries = (salariesQuery.data as any)?.items || [];
    const pendingAmount = salaries
        .filter((s: any) => s.status === 'APPROVED' || s.status === 'PARTIALLY_PAID')
        .reduce((sum: number, s: any) => {
            const paid = (s.payments || []).reduce((pSum: number, p: any) => pSum + p.amount, 0);
            return sum + (s.netSalary - paid);
        }, 0);

    const totalPaidThisMonth = payments
        .filter((p: any) => new Date(p.date).getMonth() === new Date().getMonth())
        .reduce((sum: number, p: any) => sum + p.amount, 0);

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
                <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-primary">
                            <IconWallet className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">To Be Paid</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-foreground">
                                {pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Pending Approval/Payment</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-green-500/5 to-green-500/10">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-green-600">
                            <IconCash className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Paid This Month</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-foreground">
                                {totalPaidThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">{format(new Date(), "MMMM yyyy")}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-blue-600">
                            <IconHistory className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Last Transaction</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground truncate">
                                {payments[0] ? (payments[0].salary?.employee?.fullName || payments[0].advance?.employee?.fullName) : 'None'}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                                {payments[0] ? format(new Date(payments[0].date), "MMM d, HH:mm") : 'No records'}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-lg shadow-neutral-200/50">
                <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between bg-white rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconHistory className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-black uppercase tracking-widest">Transaction History</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-muted">
                        <IconInfoCircle className="h-3 w-3" />
                        Click a row to view details
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="pl-6 py-3 font-black text-[10px] uppercase tracking-wider">Date</TableHead>
                                    <TableHead className="py-3 font-black text-[10px] uppercase tracking-wider">Reference</TableHead>
                                    <TableHead className="py-3 font-black text-[10px] uppercase tracking-wider">Recipient</TableHead>
                                    <TableHead className="py-3 font-black text-[10px] uppercase tracking-wider">Type</TableHead>
                                    <TableHead className="py-3 font-black text-[10px] uppercase tracking-wider">Method</TableHead>
                                    <TableHead className="pr-6 py-3 text-right font-black text-[10px] uppercase tracking-wider">Amount</TableHead>
                                    <TableHead className="w-10 opacity-0"></TableHead>
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
                                            <TableCell className="pr-6"><div className="h-4 w-16 bg-muted rounded ml-auto" /></TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    ))
                                ) : payments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground font-medium">No payment history found.</TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((payment: any) => (
                                        <TableRow 
                                            key={payment.id} 
                                            className="hover:bg-primary/[0.02] cursor-pointer group border-b border-neutral-100/50"
                                            onClick={() => {
                                                setSelectedPayment(payment);
                                                setIsDetailsOpen(true);
                                            }}
                                        >
                                            <TableCell className="pl-6 py-4 font-bold text-neutral-800 text-xs">
                                                {format(new Date(payment.date), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell className="font-mono text-[10px] text-neutral-400 font-black">
                                                {payment.referenceNo || payment.id.split("-")[0].toUpperCase()}
                                            </TableCell>
                                            <TableCell className="font-bold text-foreground text-xs">
                                                {payment.salary?.employee?.fullName || payment.advance?.employee?.fullName}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase ${payment.salaryId ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                                    {payment.salaryId ? 'Salary' : 'Advance'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-500 capitalize bg-neutral-50 w-fit px-2 py-1 rounded-lg border border-neutral-100">
                                                    {getMethodIcon(payment.paymentMethod)}
                                                    {payment.paymentMethod.toLowerCase().replace('_', ' ')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-6 text-right font-black text-sm text-neutral-900">
                                                {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="pr-4">
                                                <IconArrowRight className="h-4 w-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
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
            />
        </div>
    );
}
