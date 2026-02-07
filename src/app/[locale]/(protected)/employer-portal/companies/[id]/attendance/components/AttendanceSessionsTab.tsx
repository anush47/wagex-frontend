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
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";
import { IconRefresh, IconX, IconEdit, IconTrash, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { AttendanceSession, ApprovalStatus } from "@/types/attendance";
import { useAttendanceSessions, useAttendanceMutations } from "@/hooks/use-attendance";
import { SessionDetailsDialog } from "./SessionDetailsDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { format } from "date-fns";
import { toast } from "sonner";

interface AttendanceSessionsTabProps {
    companyId: string;
}

export function AttendanceSessionsTab({ companyId }: AttendanceSessionsTabProps) {
    const [employeeFilter, setEmployeeFilter] = useState<string | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

    // Fetch sessions with pagination
    const {
        data: sessionsData,
        isLoading: loading,
        refetch: fetchSessions
    } = useAttendanceSessions({
        companyId,
        employeeId: employeeFilter,
        page,
        limit: 20
    });

    const sessions = sessionsData?.items || [];
    const meta = sessionsData?.meta;

    const { deleteSession } = useAttendanceMutations();

    const executeDelete = async (id: string) => {
        try {
            await deleteSession.mutateAsync(id);
        } catch (error) {
            console.error("Failed to delete session", error);
        }
    };

    const handleDeleteClick = (id: string) => {
        setSessionToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!sessionToDelete) return;
        try {
            await executeDelete(sessionToDelete);
            setDeleteConfirmOpen(false);
        } catch (error) {
            // Error handling already done in executeDelete
        } finally {
            setSessionToDelete(null);
        }
    };

    const getApprovalBadge = (status: ApprovalStatus) => {
        const styles: Record<string, string> = {
            PENDING: "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200",
            APPROVED: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
            REJECTED: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
        };

        return (
            <Badge variant="outline" className={`font-bold text-[10px] ${styles[status]}`}>
                {status}
            </Badge>
        );
    };

    const formatTime = (time?: string) => {
        if (!time) return "-";
        return format(new Date(time), "h:mm a");
    };

    const formatMinutes = (minutes?: number) => {
        if (!minutes) return "0h 0m";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const handleRowClick = (session: AttendanceSession) => {
        setSelectedSession(session);
        setDetailsOpen(true);
    };

    return (
        <>
            <SessionDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                session={selectedSession}
                onDelete={async (id) => {
                    await executeDelete(id);
                    setDetailsOpen(false);
                }}
            />
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle>Attendance Sessions</CardTitle>
                        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                            <div className="w-[200px]">
                                <SearchableEmployeeSelect
                                    companyId={companyId}
                                    value={employeeFilter || undefined}
                                    onSelect={(id) => setEmployeeFilter(id)}
                                    placeholder="Filter by employee"
                                />
                            </div>
                            {employeeFilter && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEmployeeFilter(undefined)}
                                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                                    title="Clear employee filter"
                                >
                                    <IconX className="h-4 w-4" />
                                </Button>
                            )}
                            <Button variant="outline" size="icon" onClick={() => fetchSessions()} disabled={loading}>
                                <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading && sessions.length === 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Shift</TableHead>
                                        <TableHead>Check In</TableHead>
                                        <TableHead>Check Out</TableHead>
                                        <TableHead>Work Time</TableHead>
                                        <TableHead>OT</TableHead>
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
                                            <TableCell><div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-20 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-16 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-16 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-16 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-12 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <div className="h-5 w-12 bg-neutral-100 dark:bg-neutral-800 rounded" />
                                                    <div className="h-5 w-12 bg-neutral-100 dark:bg-neutral-800 rounded" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <div className="h-8 w-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No attendance sessions found</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Shift</TableHead>
                                            <TableHead>Check In</TableHead>
                                            <TableHead>Check Out</TableHead>
                                            <TableHead>Work Time</TableHead>
                                            <TableHead>OT</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sessions.map((session: AttendanceSession) => (
                                            <TableRow
                                                key={session.id}
                                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => handleRowClick(session)}
                                            >
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {session.employee?.nameWithInitials}{" "}
                                                        {session.employee?.employeeNo && (
                                                            <span className="text-muted-foreground font-mono text-xs">
                                                                ({session.employee.employeeNo})
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {format(new Date(session.date), "MMM d, yyyy")}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {session.shiftName || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">
                                                            {formatTime(session.checkInTime)}
                                                        </span>
                                                        {session.inApprovalStatus !== 'APPROVED' && (
                                                            <span className="text-[10px]">
                                                                {getApprovalBadge(session.inApprovalStatus)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">
                                                            {formatTime(session.checkOutTime)}
                                                        </span>
                                                        {session.outApprovalStatus !== 'APPROVED' && (
                                                            <span className="text-[10px]">
                                                                {getApprovalBadge(session.outApprovalStatus)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {formatMinutes(session.workMinutes)}
                                                </TableCell>
                                                <TableCell className="font-medium text-primary">
                                                    {formatMinutes(session.overtimeMinutes)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {session.isLate && (
                                                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px]">
                                                                Late
                                                            </Badge>
                                                        )}
                                                        {session.isEarlyLeave && (
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                                                                Early
                                                            </Badge>
                                                        )}
                                                        {session.isOnLeave && (
                                                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                                                                Leave
                                                            </Badge>
                                                        )}
                                                        {session.isHalfDay && (
                                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px]">
                                                                Half
                                                            </Badge>
                                                        )}
                                                        {session.manuallyEdited && (
                                                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-[10px]">
                                                                Edited
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleRowClick(session)}
                                                        >
                                                            <IconEdit className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Pagination */}
                            {meta && meta.lastPage > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Page {meta.page} of {meta.lastPage} ({meta.total} total)
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            <IconChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(meta.lastPage, p + 1))}
                                            disabled={page === meta.lastPage}
                                        >
                                            <IconChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <ConfirmationDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Delete Attendance Session"
                description="Are you sure you want to delete this attendance session? This action cannot be undone."
                icon={<IconTrash className="h-8 w-8" />}
                actionLabel="Delete"
                cancelLabel="Cancel"
                onAction={confirmDelete}
                onCancel={() => {
                    setDeleteConfirmOpen(false);
                    setSessionToDelete(null);
                }}
                loading={false}
                variant="destructive"
            />
        </>
    );
}
