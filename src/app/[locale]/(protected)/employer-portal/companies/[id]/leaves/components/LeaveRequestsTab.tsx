"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IconCheck, IconX, IconRefresh } from "@tabler/icons-react";
import type { LeaveRequest, LeaveStatus } from "@/types/leave";
import { LeavesService } from "@/services/leaves.service";
import { format } from "date-fns";

interface LeaveRequestsTabProps {
    requests: LeaveRequest[];
    loading: boolean;
    onRefresh: () => void;
}

export function LeaveRequestsTab({ requests, loading, onRefresh }: LeaveRequestsTabProps) {
    const [statusFilter, setStatusFilter] = useState<LeaveStatus | "ALL">("ALL");
    const [processingId, setProcessingId] = useState<string | null>(null);

    const filteredRequests = statusFilter === "ALL"
        ? requests
        : requests.filter(r => r.status === statusFilter);

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try {
            const response = await LeavesService.approveRequest(id, "current-user-id", "Approved");
            if (response.data) {
                onRefresh();
            }
        } catch (error) {
            console.error("Failed to approve request:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        setProcessingId(id);
        try {
            const response = await LeavesService.rejectRequest(id, "current-user-id", "Rejected");
            if (response.data) {
                onRefresh();
            }
        } catch (error) {
            console.error("Failed to reject request:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: LeaveStatus) => {
        const variants = {
            PENDING: "warning",
            APPROVED: "success",
            REJECTED: "destructive",
            CANCELLED: "secondary",
        } as const;

        return (
            <Badge variant={variants[status] || "default"}>
                {status}
            </Badge>
        );
    };

    const getTypeBadge = (type: string) => {
        const labels = {
            FULL_DAY: "Full Day",
            HALF_DAY_FIRST: "Half Day (First)",
            HALF_DAY_LAST: "Half Day (Last)",
            SHORT_LEAVE: "Short Leave",
        } as const;

        return labels[type as keyof typeof labels] || type;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Leave Requests</CardTitle>
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeaveStatus | "ALL")}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading}>
                            <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No leave requests found</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Leave Type</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Days</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {request.employee?.photo ? (
                                                <img
                                                    src={request.employee.photo}
                                                    alt={request.employee.nameWithInitials}
                                                    className="h-8 w-8 rounded-full"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold">
                                                    {request.employee?.nameWithInitials?.[0] || "?"}
                                                </div>
                                            )}
                                            <span className="font-medium">{request.employee?.nameWithInitials}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{request.leaveTypeName || request.leaveTypeId}</TableCell>
                                    <TableCell>{getTypeBadge(request.type)}</TableCell>
                                    <TableCell>
                                        {format(new Date(request.startDate), "MMM d, yyyy")} -{" "}
                                        {format(new Date(request.endDate), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>{request.days}</TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                    <TableCell>
                                        {request.status === "PENDING" && (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleApprove(request.id)}
                                                    disabled={processingId === request.id}
                                                >
                                                    <IconCheck className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleReject(request.id)}
                                                    disabled={processingId === request.id}
                                                >
                                                    <IconX className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
