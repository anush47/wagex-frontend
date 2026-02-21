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
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";
import { IconCheck, IconX, IconRefresh, IconTrash, IconFileText, IconPaperclip, IconFilter } from "@tabler/icons-react";
import type { LeaveRequest, LeaveStatus } from "@/types/leave";
import type { Employee } from "@/types/employee";
import { useLeaveRequests, useLeaveMutations } from "@/hooks/use-leaves";
import { useCompanyPolicy } from "@/hooks/use-policies";
import { useAuth } from "@/hooks/useAuth";
import { LeaveRequestDetailsDialog } from "./LeaveRequestDetailsDialog";
import { SalaryPeriodQuickSelect } from "../../attendance/components/SalaryPeriodQuickSelect";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { format, isSameDay } from "date-fns";
import { toast } from "sonner";

interface LeaveRequestsTabProps {
    companyId: string;
    refreshTrigger?: number;
}

export function LeaveRequestsTab({ companyId, refreshTrigger = 0 }: LeaveRequestsTabProps) {
    const { user } = useAuth();
    const [statusFilter, setStatusFilter] = useState<LeaveStatus | "ALL">("ALL");
    const [employeeFilter, setEmployeeFilter] = useState<string | undefined>(undefined);
    const [startDate, setStartDate] = useState<string | undefined>(undefined);
    const [endDate, setEndDate] = useState<string | undefined>(undefined);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
    // Use React Query for requests
    const {
        data: requests = [],
        isLoading: loading,
        refetch: fetchRequests
    } = useLeaveRequests(companyId, {
        status: statusFilter === "ALL" ? undefined : statusFilter,
        employeeId: employeeFilter,
        startDate,
        endDate
    });

    const { approveRequest, rejectRequest, deleteRequest } = useLeaveMutations();

    // Fetch company policy to get leave type colors and codes
    const { data: policyData } = useCompanyPolicy(companyId);
    const leaveTypes = policyData?.settings?.leaves?.leaveTypes || [];

    const handleApprove = async (id: string, reason?: string) => {
        if (!user) return;
        await approveRequest.mutateAsync({ id, managerId: user.id, reason: reason || "Approved" });
    };

    const handleReject = async (id: string, reason?: string) => {
        if (!user) return;
        await rejectRequest.mutateAsync({ id, managerId: user.id, reason: reason || "Rejected" });
    };

    const executeDelete = async (id: string) => {
        try {
            await deleteRequest.mutateAsync(id);
        } catch (error) {
            console.error("Failed to delete request", error);
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
                leaveTypes={leaveTypes}
                onApprove={async (id, reason) => {
                    await handleApprove(id, reason);
                    setDetailsOpen(false);
                }}
                onReject={async (id, reason) => {
                    await handleReject(id, reason);
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
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="rounded-xl h-9"
                            >
                                <IconFilter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => fetchRequests()} disabled={loading} className="rounded-xl shadow-sm h-9 w-9">
                                <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 pt-2 border-t border-border mt-2">
                            <SalaryPeriodQuickSelect
                                companyId={companyId}
                                onRangeSelect={(start, end) => {
                                    setStartDate(start);
                                    setEndDate(end);
                                }}
                                currentStart={startDate}
                                currentEnd={endDate}
                            />
                            <div className="flex items-center gap-2 p-1 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-inner">
                                <div className="flex items-center gap-1.5 px-2">
                                    <span className="text-[10px] font-black uppercase text-neutral-400">From</span>
                                    <input
                                        type="date"
                                        value={startDate || ""}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-transparent border-none text-xs font-bold focus:ring-0 p-0 text-neutral-600 dark:text-neutral-300 w-[110px]"
                                    />
                                </div>
                                <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-700" />
                                <div className="flex items-center gap-1.5 px-2">
                                    <span className="text-[10px] font-black uppercase text-neutral-400">To</span>
                                    <input
                                        type="date"
                                        value={endDate || ""}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-transparent border-none text-xs font-bold focus:ring-0 p-0 text-neutral-600 dark:text-neutral-300 w-[110px]"
                                    />
                                </div>
                            </div>

                            <div className="w-full md:w-[200px]">
                                <SearchableEmployeeSelect
                                    companyId={companyId}
                                    value={employeeFilter || undefined} // Pass undefined for "All"
                                    onSelect={(id) => setEmployeeFilter(id)}
                                    placeholder="Filter by employee"
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeaveStatus | "ALL")}>
                                <SelectTrigger className="w-[180px] rounded-xl h-9">
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

                            {(employeeFilter || statusFilter !== "ALL" || startDate || endDate) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setEmployeeFilter(undefined);
                                        setStatusFilter("ALL");
                                        setStartDate(undefined);
                                        setEndDate(undefined);
                                    }}
                                    className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0"
                                    title="Clear all filters"
                                >
                                    <IconX className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {loading && requests.length === 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-800 rounded" />
                                                    <div className="h-3 w-16 bg-neutral-50 dark:bg-neutral-800/50 rounded" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-neutral-100 dark:bg-neutral-800" />
                                                    <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800 rounded" />
                                                </div>
                                            </TableCell>
                                            <TableCell><div className="h-4 w-28 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="h-4 w-12 bg-neutral-100 dark:bg-neutral-800 rounded" />
                                                    <div className="h-3 w-16 bg-neutral-50 dark:bg-neutral-800/50 rounded" />
                                                </div>
                                            </TableCell>
                                            <TableCell><div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                            <TableCell><div className="h-6 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg" /></TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <div className="h-8 w-24 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                                                    <div className="h-8 w-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No leave requests found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead className="w-[200px]">Reason</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((request: LeaveRequest) => (
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
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const lt = leaveTypes.find((t: any) => t.id === request.leaveTypeId);
                                                        return (
                                                            <>
                                                                <div
                                                                    className="h-2 w-2 rounded-full shrink-0"
                                                                    style={{ backgroundColor: lt?.color || '#cbd5e1' }}
                                                                />
                                                                <span className="font-medium">
                                                                    {lt?.code ? (
                                                                        <span className="text-[10px] font-bold text-muted-foreground mr-1.5 px-1 rounded bg-muted">
                                                                            {lt.code}
                                                                        </span>
                                                                    ) : null}
                                                                    {request.leaveTypeName || request.leaveTypeId}
                                                                </span>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {isSameDay(new Date(request.startDate), new Date(request.endDate)) ? (
                                                    format(new Date(request.startDate), "MMM d, yyyy")
                                                ) : (
                                                    <div className="text-xs">
                                                        {format(new Date(request.startDate), "MMM d")} - {format(new Date(request.endDate), "MMM d, yyyy")}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">
                                                        {request.type === "SHORT_LEAVE" ? (
                                                            "Short"
                                                        ) : (
                                                            `${request.days} ${request.days === 1 ? 'Day' : 'Days'}`
                                                        )}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                                        {request.type === "SHORT_LEAVE" ? (
                                                            format(new Date(request.startDate), "h:mm a") + " - " + format(new Date(request.endDate), "h:mm a")
                                                        ) : (
                                                            getTypeBadge(request.type)
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px]">
                                                <div className="flex items-center gap-2">
                                                    {request.documents && request.documents.length > 0 && (
                                                        <IconPaperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                    )}
                                                    <span className="truncate block text-sm text-muted-foreground" title={request.reason}>
                                                        {request.reason || "-"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                {format(new Date(request.createdAt), "MMM d, HH:mm")}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                {request.status === "PENDING" && (
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="rounded-lg shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90"
                                                            onClick={() => handleApprove(request.id)}
                                                            disabled={approveRequest.isPending && approveRequest.variables?.id === request.id}
                                                        >
                                                            {approveRequest.isPending && approveRequest.variables?.id === request.id ? (
                                                                <IconRefresh className="h-4 w-4 mr-2 animate-spin" />
                                                            ) : (
                                                                <IconCheck className="h-4 w-4 mr-2" />
                                                            )}
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleReject(request.id)}
                                                            disabled={rejectRequest.isPending && rejectRequest.variables?.id === request.id}
                                                        >
                                                            {rejectRequest.isPending && rejectRequest.variables?.id === request.id ? (
                                                                <IconRefresh className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <IconX className="h-4 w-4" />
                                                            )}
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
                loading={false}
                variant="destructive"
            />
        </>
    );
}
