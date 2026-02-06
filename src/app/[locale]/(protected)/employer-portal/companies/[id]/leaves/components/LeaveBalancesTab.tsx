"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LeavesService } from "@/services/leaves.service";
import { EmployeeService } from "@/services/employee.service";
import type { LeaveBalance } from "@/types/leave";
import type { LeaveBalance } from "@/types/leave";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";

interface LeaveBalancesTabProps {
    companyId: string;
}

export function LeaveBalancesTab({ companyId }: LeaveBalancesTabProps) {
    // const [employees, setEmployees] = useState<Employee[]>([]); // Removed
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [loading, setLoading] = useState(false); // Changed to false initially as we wait for selection

    // Employee fetch useEffect removed


    useEffect(() => {
        const fetchBalances = async () => {
            if (!selectedEmployeeId) return;

            setLoading(true);
            try {
                const response = await LeavesService.getBalances(selectedEmployeeId);
                // Backend returns {statusCode, message, data: [], ...}
                setBalances(Array.isArray(response.data) ? response.data : (response.data?.data || []));
            } catch (error) {
                console.error("Failed to fetch balances:", error);
                setBalances([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBalances();
    }, [selectedEmployeeId]);

    return (
        <div className="space-y-6">
            {/* Employee Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Employee</CardTitle>
                </CardHeader>
                <CardContent>
                    <SearchableEmployeeSelect
                        companyId={companyId}
                        value={selectedEmployeeId || undefined}
                        onSelect={(id) => setSelectedEmployeeId(id)}
                    />
                </CardContent>
            </Card>

            {/* Balances */}
            {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading balances...</div>
            ) : balances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No leave types configured</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {balances.map((balance) => {
                        const percentage = balance.entitled > 0
                            ? (balance.available / balance.entitled) * 100
                            : 0;

                        return (
                            <Card key={balance.leaveTypeId}>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <span>{balance.leaveTypeName}</span>
                                        <span className="text-sm font-mono text-muted-foreground">
                                            {balance.leaveTypeCode}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Available</span>
                                            <span className="font-bold text-lg">
                                                {balance.available.toFixed(1)} / {balance.entitled.toFixed(1)}
                                            </span>
                                        </div>
                                        <Progress value={percentage} className="h-2" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-muted-foreground">Used</div>
                                            <div className="font-semibold">{balance.used.toFixed(1)}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Pending</div>
                                            <div className="font-semibold">{balance.pending.toFixed(1)}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
