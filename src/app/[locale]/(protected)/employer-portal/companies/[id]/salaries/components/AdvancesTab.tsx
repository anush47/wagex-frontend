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
            <Card>
                <CardHeader>
                    <CardTitle>Active Advances</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Recovery Progress</TableHead>
                                    <TableHead className="text-right">Remaining</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {advancesQuery.isLoading ? (
                                    [1, 2].map(i => <TableRow key={i} className="animate-pulse h-16" />)
                                ) : advances.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No active advances found.</TableCell>
                                    </TableRow>
                                ) : (
                                    advances.map((advance: any) => {
                                        const recovered = advance.totalAmount - advance.remainingAmount;
                                        const progress = (recovered / advance.totalAmount) * 100;
                                        return (
                                            <TableRow key={advance.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">
                                                    {format(new Date(advance.date), "MMM d, yyyy")}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{advance.employee?.fullName}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">EMP-{advance.employee?.employeeNo}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {advance.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="w-[200px]">
                                                    <div className="flex flex-col gap-2">
                                                        <Progress value={progress} className="h-1.5" />
                                                        <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold">
                                                            <span>{progress.toFixed(0)}% Recovered</span>
                                                            <span>{recovered.toLocaleString()} LKR</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {advance.remainingAmount > 0 ? (
                                                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-200">
                                                            {advance.remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            Settled
                                                        </Badge>
                                                    )}
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
                <Card className="bg-primary text-primary-foreground border-none shadow-md">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <IconCalendarRepeat className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg">Next Cycle Recovery</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-primary-foreground/80 text-sm mb-4">
                            Estimated recovery for the upcoming pay cycle based on all active deduction schedules.
                        </p>
                        <div className="text-3xl font-black mb-2">
                            LKR {advances.reduce((sum: number, adv: any) => {
                                const nextDeduction = adv.deductionSchedule.find((s: any) => !s.isDeducted);
                                return sum + (nextDeduction?.amount || 0);
                            }, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs font-bold uppercase opacity-80">
                            From {advances.filter((adv: any) => adv.remainingAmount > 0).length} active advances
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-start gap-4 pb-2">
                        <IconAlertCircle className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                            <CardTitle className="text-lg">Recovery Policy</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Advances are recovered automatically during salary generation based on the custom schedule defined at creation. Any remaining balance is displayed on the Salary record.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
