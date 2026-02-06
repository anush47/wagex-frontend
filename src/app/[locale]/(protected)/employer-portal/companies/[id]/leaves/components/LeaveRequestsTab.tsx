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
import { toast } from "sonner";

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

    const executeDelete = async (id: string) => {
        setProcessingId(id);
        try {
            await LeavesService.deleteRequest(id);
            toast.success("Leave request deleted");
            fetchRequests();
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to delete request";
            toast.error(message);
            throw error;
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteClick = (id: string) => {
        setRequestToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!requestToDelete) return;
        try {
            await executeDelete(requestToDelete);
            setDeleteConfirmOpen(false);
        } catch (error) {
            // Error handling already done in executeDelete
        } finally {
            setRequestToDelete(null);
        }
    };

    const getStatusBadge = (status: LeaveStatus) => {
        const styles: Record<string, string> = {
            PENDING: "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200",
            APPROVED: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
            REJECTED: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
            CANCELLED: "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200",
        };

        return (
            <Badge variant="outline" className={`font-bold ${styles[status]}`}>
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
                    await executeDelete(id);
                    setDetailsOpen(false);
                }}
            />
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle>Leave Requests</CardTitle>
                        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
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
                        <div className="overflow-x-auto">
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
                                            <TableCell className="whitespace-nowrap">{request.leaveTypeName || request.leaveTypeId}</TableCell>
                                            <TableCell className="whitespace-nowrap">{getTypeBadge(request.type)}</TableCell>
                                            <TableCell className="whitespace-nowrap">
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
                                                            className="rounded-lg shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90"
                                                            onClick={() => handleApprove(request.id)}
                                                            disabled={processingId === request.id}
                                                        >
                                                            <IconCheck className="h-4 w-4 mr-2" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleReject(request.id)}
                                                            disabled={processingId === request.id}
                                                        >
                                                            <IconX className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card >

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
