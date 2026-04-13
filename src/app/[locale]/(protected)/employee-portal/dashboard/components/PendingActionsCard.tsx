"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconAlertCircle, IconCheck, IconReceipt2, IconChevronRight } from "@tabler/icons-react";
import { usePortalPayments } from "@/hooks/use-portal-salaries";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function PendingActionsCard() {
    const router = useRouter();
    const { paymentsQuery, acknowledgeMutation } = usePortalPayments();
    
    const pendingPayments = paymentsQuery.data?.filter(p => p.status === "PENDING_ACKNOWLEDGEMENT") || [];

    if (paymentsQuery.isLoading) return null;
    if (pendingPayments.length === 0) return null;

    return (
        <Card className="rounded-[2.5rem] border-orange-200 dark:border-orange-500/20 bg-orange-50/50 dark:bg-orange-500/5 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                        <IconAlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black tracking-tight text-orange-900 dark:text-orange-400">Action Required</CardTitle>
                        <p className="text-[10px] text-orange-700/60 dark:text-orange-500/60 font-medium uppercase tracking-widest">Acknowledge Now</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {pendingPayments.map((payment) => (
                    <div key={payment.id} className="p-4 rounded-[2rem] bg-white dark:bg-neutral-900/50 border border-orange-100 dark:border-orange-500/10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-orange-50 dark:bg-orange-500/5 flex items-center justify-center">
                                <IconReceipt2 className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-neutral-900 dark:text-white">
                                    LKR {payment.amount.toLocaleString()}
                                </p>
                                <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">
                                    {format(new Date(payment.date), "MMM d, yyyy")}
                                </p>
                            </div>
                        </div>
                        <Button 
                            size="sm"
                            disabled={acknowledgeMutation.isPending}
                            onClick={() => acknowledgeMutation.mutate(payment.id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-[10px] uppercase h-8 px-4"
                        >
                            {acknowledgeMutation.isPending ? "..." : "Acknowledge"}
                        </Button>
                    </div>
                ))}
                
                <Button 
                    variant="ghost" 
                    onClick={() => router.push("./salaries")}
                    className="w-full text-[10px] font-black uppercase text-orange-600 hover:text-orange-700 hover:bg-orange-100/30 rounded-xl py-4"
                >
                    Show All
                    <IconChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
            </CardContent>
        </Card>
    );
}
