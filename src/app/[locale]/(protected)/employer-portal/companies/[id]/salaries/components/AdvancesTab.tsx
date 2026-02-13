"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdvances } from "@/hooks/use-advances";
import { format } from "date-fns";
import { IconCash, IconCalendarRepeat, IconAlertCircle } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function AdvancesTab({ companyId }: { companyId: string }) {
    const { advancesQuery } = useAdvances({ companyId });
    const data = advancesQuery.data as any;
    const advances = Array.isArray(data) ? data : (data?.items || []);

    return (
        <div className="space-y-6">
            <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                <CardHeader className="p-8">
                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                        <IconCash className="h-6 w-6 text-orange-500" />
                        Active Advances
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-neutral-50 font-black text-[10px] uppercase tracking-wider">
                                <TableRow className="border-neutral-100">
                                    <TableHead className="px-8">Date</TableHead>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Recovery Progress</TableHead>
                                    <TableHead className="text-right px-8">Remaining</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {advancesQuery.isLoading ? (
                                    [1, 2].map(i => <TableRow key={i} className="animate-pulse h-20" />)
                                ) : advances.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-neutral-400 font-medium italic">No active advances found.</TableCell>
                                    </TableRow>
                                ) : (
                                    advances.map((advance) => {
                                        const recovered = advance.totalAmount - advance.remainingAmount;
                                        const progress = (recovered / advance.totalAmount) * 100;
                                        return (
                                            <TableRow key={advance.id} className="border-neutral-50 group hover:bg-neutral-50/50 transition-all">
                                                <TableCell className="px-8 font-bold text-xs uppercase text-neutral-600">
                                                    {format(new Date(advance.date), "MMM d, yyyy")}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-xs uppercase tracking-tight text-neutral-900">{advance.employee?.fullName}</span>
                                                        <span className="text-[10px] font-mono text-neutral-400">EMP-{advance.employee?.employeeNo}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-xs">
                                                    {advance.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="w-[200px]">
                                                    <div className="flex flex-col gap-2">
                                                        <Progress value={progress} className="h-1.5 bg-neutral-100" />
                                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter text-neutral-400">
                                                            <span>{progress.toFixed(0)}% Recovered</span>
                                                            <span>{recovered.toLocaleString()} LKR</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right px-8">
                                                    <span className="px-3 py-1 bg-orange-500 text-white rounded-lg font-black text-xs">
                                                        {advance.remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions / Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-3xl border-none shadow-sm p-8 bg-neutral-900 text-white">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/20">
                            <IconCalendarRepeat className="h-6 w-6 text-orange-500" />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tighter">Next Cycle Recovery</h3>
                    </div>
                    <p className="text-neutral-400 text-sm font-medium mb-6">
                        Estimated recovery for the upcoming pay cycle based on all active deduction schedules.
                    </p>
                    <div className="text-4xl font-black tracking-tighter mb-2">
                        LKR {advances.reduce((sum, adv) => {
                            const nextDeduction = adv.deductionSchedule.find(s => !s.isDeducted);
                            return sum + (nextDeduction?.amount || 0);
                        }, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-500 border-none font-bold uppercase text-[9px]">
                        Calculated from {advances.filter(adv => adv.remainingAmount > 0).length} active advances
                    </Badge>
                </Card>

                <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 flex flex-col justify-center">
                    <div className="flex items-start gap-4">
                        <IconAlertCircle className="h-6 w-6 text-neutral-400 shrink-0 mt-1" />
                        <div>
                            <h3 className="font-black uppercase tracking-tight text-neutral-900 mb-2">Recovery Policy</h3>
                            <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                                Advances are recovered automatically during salary generation based on the custom schedule defined at creation. Any remaining balance is displayed on the Salary record.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
