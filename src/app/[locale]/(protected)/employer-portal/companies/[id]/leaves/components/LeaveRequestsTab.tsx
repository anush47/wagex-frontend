"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { IconCheck, IconX, IconRefresh, IconTrash } from "@tabler/icons-react";
import type { LeaveRequest, LeaveStatus } from "@/types/leave";
import type { Employee } from "@/types/employee";
import { LeavesService } from "@/services/leaves.service";
import { EmployeeService } from "@/services/employee.service";
import { LeaveRequestDetailsDialog } from "./LeaveRequestDetailsDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { format } from "date-fns";

interface LeaveRequestsTabProps {
    companyId: string;
    refreshTrigger?: number;
}

export function LeaveRequestsTab({ companyId, refreshTrigger = 0 }: LeaveRequestsTabProps) {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<LeaveStatus | "ALL">("ALL");
    const [employeeFilter, setEmployeeFilter] = useState<string>("ALL");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

    // Fetch employees for filter
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await EmployeeService.getEmployees({ companyId });
                setEmployees(response.data?.data?.data || []);
            } catch (error) {
                console.error("Failed to fetch employees:", error);
            }
        };

        if (companyId) {
            fetchEmployees();
        }
    }, [companyId]);

    // Fetch requests with backend filtering
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const filters: { status?: LeaveStatus; employeeId?: string } = {};
            if (statusFilter !== "ALL") {
                filters.status = statusFilter;
            }
            if (employeeFilter !== "ALL") {
                filters.employeeId = employeeFilter;
            }

            const response = await LeavesService.getCompanyRequests(companyId, filters);
            setRequests(Array.isArray(response.data) ? response.data : (response.data?.data || []));
        } catch (error) {
            console.error("Failed to fetch leave requests:", error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch requests when filters change
    useEffect(() => {
        if (companyId) {
            fetchRequests();
        }
    }, [companyId, statusFilter, employeeFilter, refreshTrigger]);

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try {
            const response = await LeavesService.approveRequest(id, "current-user-id", "Approved");
            if (response.data) {
                toast.success("Leave request approved");
                fetchRequests();
            }
        } catch (error) {
            console.error("Failed to approve request:", error);
            toast.error("Failed to approve request");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        setProcessingId(id);
        try {
            await LeavesService.rejectRequest(id, "manager-id", "Rejected by manager");
            toast.success("Leave request rejected");
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reject request");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = (id: string) => {
        setRequestToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!requestToDelete) return;
        setProcessingId(requestToDelete);
        try {
            await LeavesService.deleteRequest(requestToDelete);
            toast.success("Leave request deleted");
            fetchRequests();
            setDeleteConfirmOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete request");
        } finally {
            setProcessingId(null);
            setRequestToDelete(null);
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

    const handleRowClick = (request: LeaveRequest) => {
        setSelectedRequest(request);
        setDetailsOpen(true);
    };

    return (
        <>
            <LeaveRequestDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                request={selectedRequest}
                onApprove={async (id) => {
                    await handleApprove(id);
                    setDetailsOpen(false);
                }}
                onReject={async (id) => {
                    await handleReject(id);
                    setDetailsOpen(false);
                }}
                onDelete={async (id) => {
                    await handleDelete(id);
                    setDetailsOpen(false);
                }}
            />
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Leave Requests</CardTitle>
                        <div className="flex items-center gap-2">
                            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter by employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Employees</SelectItem>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            {emp.nameWithInitials} ({emp.employeeNo})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            <Button variant="outline" size="icon" onClick={fetchRequests} disabled={loading}>
                                <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : requests.length === 0 ? (
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
                                {requests.map((request) => (
                                    <TableRow
                                        key={request.id}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => handleRowClick(request)}
                                    >
                                        <TableCell>
                                            <div className="font-medium">
                                                {request.employee?.nameWithInitials}{" "}
                                                {request.employee?.employeeNo && (
                                                    <span className="text-muted-foreground font-mono text-xs">
                                                        ({request.employee.employeeNo})
                                                    </span>
                                                )}
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
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            {request.status === "PENDING" && (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleApprove(request.id)}
                                                        disabled={processingId === request.id}
                                                    >
                                                        <IconCheck className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleReject(request.id)}
                                                        disabled={processingId === request.id}
                                                    >
                                                        <IconX className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                        onClick={() => handleDelete(request.id)}
                                                        disabled={processingId === request.id}
                                                    >
                                                        <IconTrash className="h-4 w-4" />
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

            <ConfirmationDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Delete Leave Request"
                description="Are you sure you want to delete this leave request? This action cannot be undone."
                icon={<IconTrash className="h-8 w-8" />}
                actionLabel="Delete"
                cancelLabel="Cancel"
                onAction={confirmDelete}
                onCancel={() => {
                    setDeleteConfirmOpen(false);
                    setRequestToDelete(null);
                }}
                loading={processingId === requestToDelete}
                variant="destructive"
            />
        </>
    );
}
