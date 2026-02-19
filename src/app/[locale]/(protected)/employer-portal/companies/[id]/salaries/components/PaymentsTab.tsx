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
            case 'CASH': return <IconCash className="h-4 w-4" />;
            case 'BANK_TRANSFER': return <IconCreditCard className="h-4 w-4" />;
            default: return <IconReceipt className="h-4 w-4" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Recipient</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentsQuery.isLoading ? (
                                [1, 2, 3].map(i => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-32 bg-muted rounded" /></TableCell>
                                        <TableCell><div className="h-6 w-16 bg-muted rounded-full" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-16 bg-muted rounded ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No payment history found.</TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment: any) => (
                                    <TableRow key={payment.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            {format(new Date(payment.date), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {payment.referenceNo || payment.id.split("-")[0].toUpperCase()}
                                        </TableCell>
                                        <TableCell>
                                            {payment.salary?.employee?.fullName || payment.advance?.employee?.fullName}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={payment.salaryId ? 'bg-primary/5 text-primary border-primary/20' : 'bg-orange-500/5 text-orange-600 border-orange-200'}>
                                                {payment.salaryId ? 'Salary' : 'Advance'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                {getMethodIcon(payment.paymentMethod)}
                                                <span className="capitalize">{payment.paymentMethod.toLowerCase().replace('_', ' ')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
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
    );
}
