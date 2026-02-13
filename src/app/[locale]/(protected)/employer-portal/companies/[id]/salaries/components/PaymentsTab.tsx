"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePayments } from "@/hooks/use-payments";
import { format } from "date-fns";
import { IconHistory, IconCash, IconCreditCard, IconReceipt } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

export function PaymentsTab({ companyId }: { companyId: string }) {
    const { paymentsQuery } = usePayments({ companyId });
    const data = paymentsQuery.data as any;
    const payments = Array.isArray(data) ? data : (data?.items || []);

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'CASH': return <IconCash className="h-3.5 w-3.5" />;
            case 'BANK_TRANSFER': return <IconCreditCard className="h-3.5 w-3.5" />;
            default: return <IconReceipt className="h-3.5 w-3.5" />;
        }
    };

    return (
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden min-h-[500px]">
            <CardHeader className="p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                    <IconHistory className="h-6 w-6 text-primary" />
                    Transaction History
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-neutral-50 font-black text-[10px] uppercase tracking-wider">
                            <TableRow className="border-neutral-100">
                                <TableHead className="px-8">Date</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Recipient</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead className="text-right px-8">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentsQuery.isLoading ? (
                                [1, 2, 3].map(i => <TableRow key={i} className="animate-pulse h-16" />)
                            ) : payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-neutral-400 font-medium italic">No payment history found.</TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment: any) => (
                                    <TableRow key={payment.id} className="border-neutral-50 hover:bg-neutral-50/50 transition-all">
                                        <TableCell className="px-8 font-bold text-xs uppercase text-neutral-600">
                                            {format(new Date(payment.date), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-tighter">
                                                {payment.referenceNo || payment.id.split("-")[0]}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-black text-xs uppercase tracking-tight">
                                            {payment.salary?.employee?.fullName || payment.advance?.employee?.fullName}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`font-black text-[10px] uppercase ${payment.salaryId ? 'bg-primary/5 text-primary border-primary/20' : 'bg-orange-500/5 text-orange-600 border-orange-200'}`}>
                                                {payment.salaryId ? 'Salary' : 'Advance'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase">
                                                {getMethodIcon(payment.paymentMethod)}
                                                {payment.paymentMethod.replace('_', ' ')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <span className="font-black text-sm text-neutral-900">
                                                {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
