"use client";

import React, { useState, useEffect } from "react";
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
import { IconRefresh, IconX, IconEdit, IconTrash, IconChevronLeft, IconChevronRight, IconCalendarStats, IconCheck, IconFilter } from "@tabler/icons-react";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";
import type { AttendanceSession, ApprovalStatus } from "@/types/attendance";
import { useAttendanceSessions, useAttendanceMutations } from "@/hooks/use-attendance";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { SalaryPeriodQuickSelect } from "./SalaryPeriodQuickSelect";
interface AttendanceSessionsTabProps {
    companyId: string;
    initialEmployeeId?: string;
    initialDate?: string;
    startDate?: string;
    endDate?: string;
    onFilterChange?: (filters: {
        employeeId?: string;
        date?: string;
        startDate?: string;
        endDate?: string;
        sessionId?: string;
        tab?: string
    }) => void;
    onOpenSession: (id: string) => void;
}

export function AttendanceSessionsTab({
    companyId,
    initialEmployeeId,
    initialDate,
    startDate,
    endDate,
    onFilterChange,
    onOpenSession
}: AttendanceSessionsTabProps) {
    const [employeeFilter, setEmployeeFilter] = useState<string | undefined>(initialEmployeeId);
    const [approvalFilter, setApprovalFilter] = useState<string>("ALL");
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

    // Sync with initial filters
    useEffect(() => {
        if (initialEmployeeId !== employeeFilter) {
            setEmployeeFilter(initialEmployeeId);
        }
    }, [initialEmployeeId]);

    // Fetch sessions with pagination
    const {
        data: sessionsData,
        isLoading: loading,
        refetch: fetchSessions
    } = useAttendanceSessions({
        companyId,
        employeeId: employeeFilter,
        startDate: startDate || initialDate,
        endDate: endDate || initialDate,
        page,
        limit: 20,
        isPending: approvalFilter === 'PENDING' ? true : undefined
    });

    const sessions = sessionsData?.items || [];
    const meta = sessionsData?.meta;

    const { deleteSession, updateSession } = useAttendanceMutations();

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
            PENDING: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
            APPROVED: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
            REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        };

        return (
            <Badge variant="outline" className={`font-bold text-[10px] ${styles[status]}`}>
                {status}
            </Badge>
        );
    };

    const formatTime = (time?: string) => {
        if (!time) return "-";

        // Handle ISO strings by checking for 'T' or if it can be parsed as a full date
        if (time.includes('T') || time.length > 10) {
            try {
                return format(new Date(time), "h:mm a");
            } catch (e) {
                return time;
            }
        }

        // If it's already a time string like "08:00" or "08:00:00"
        // Just return it or trim the seconds
        if (time.split(':').length >= 2) {
            const parts = time.split(':');
            const hh = parseInt(parts[0]);
            const mm = parts[1];
            const ampm = hh >= 12 ? 'PM' : 'AM';
            const h12 = hh % 12 || 12;
            return `${h12}:${mm} ${ampm}`;
        }

        return time;
    };

    const formatMinutes = (minutes?: number) => {
        if (!minutes) return "0h 0m";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const handleRowClick = (session: AttendanceSession) => {
        onOpenSession(session.id);
    };

    const handleQuickApprove = async (session: AttendanceSession, e: React.MouseEvent) => {
        e.stopPropagation();
        const updates: any = {};
        const approvedItems: string[] = [];

        if (session.inApprovalStatus === 'PENDING') {
            updates.inApprovalStatus = 'APPROVED';
            approvedItems.push('check-in');
        }
        if (session.outApprovalStatus === 'PENDING') {
            updates.outApprovalStatus = 'APPROVED';
            approvedItems.push('check-out');
        }

        if (Object.keys(updates).length === 0) {
            toast.info('No pending approvals for this session');
            return;
        }

        try {
            await updateSession.mutateAsync({ id: session.id, dto: updates });
        } catch (err) {
            console.error('Failed to approve session:', err);
        }
    };

    const hasPendingApproval = (session: AttendanceSession) => {
        return session.inApprovalStatus === 'PENDING' || session.outApprovalStatus === 'PENDING';
    };

    return (
        <>
            <Card>
                <CardHeader className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <CardTitle>Attendance Sessions</CardTitle>
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
                            <Button variant="outline" size="icon" onClick={() => fetchSessions()} disabled={loading} className="rounded-xl shadow-sm h-9 w-9">
                                <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 pt-2 border-t border-border">
                            <SalaryPeriodQuickSelect
                                companyId={companyId}
                                onRangeSelect={(start, end) => onFilterChange?.({ startDate: start, endDate: end })}
                                currentStart={startDate || initialDate}
                                currentEnd={endDate || initialDate}
                            />

                            <div className="flex items-center gap-2 p-1 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-inner">
                                <div className="flex items-center gap-1.5 px-2">
                                    <span className="text-[10px] font-black uppercase text-neutral-400">From</span>
                                    <input
                                        type="date"
                                        value={startDate || initialDate || ""}
                                        onChange={(e) => onFilterChange?.({ startDate: e.target.value })}
                                        className="bg-transparent border-none text-xs font-bold focus:ring-0 p-0 text-neutral-600 dark:text-neutral-300 w-[110px]"
                                    />
                                </div>
                                <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-700" />
                                <div className="flex items-center gap-1.5 px-2">
                                    <span className="text-[10px] font-black uppercase text-neutral-400">To</span>
                                    <input
                                        type="date"
                                        value={endDate || initialDate || ""}
                                        onChange={(e) => onFilterChange?.({ endDate: e.target.value })}
                                        className="bg-transparent border-none text-xs font-bold focus:ring-0 p-0 text-neutral-600 dark:text-neutral-300 w-[110px]"
                                    />
                                </div>
                            </div>

                            <div className="w-full md:w-[180px]">
                                <SearchableEmployeeSelect
                                    companyId={companyId}
                                    value={employeeFilter || undefined}
                                    onSelect={(id) => {
                                        setEmployeeFilter(id);
                                        onFilterChange?.({ employeeId: id || "" });
                                    }}
                                    placeholder="Employee"
                                />
                            </div>

                            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                                <SelectTrigger className="w-full md:w-[140px] rounded-xl h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                </SelectContent>
                            </Select>

                            {(employeeFilter || startDate || endDate || initialDate || approvalFilter !== "ALL") && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setEmployeeFilter(undefined);
                                        setApprovalFilter("ALL");
                                        onFilterChange?.({
                                            employeeId: "",
                                            date: "",
                                            startDate: "",
                                            endDate: ""
                                        });
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
                                                <div className="h-4 w-48 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
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
                                        {sessions
                                            .filter((session: AttendanceSession) => {
                                                if (approvalFilter === "ALL") return true;
                                                if (approvalFilter === "PENDING") {
                                                    return session.inApprovalStatus === 'PENDING' || session.outApprovalStatus === 'PENDING';
                                                }
                                                if (approvalFilter === "APPROVED") {
                                                    return session.inApprovalStatus === 'APPROVED' && session.outApprovalStatus === 'APPROVED';
                                                }
                                                return true;
                                            })
                                            .map((session: AttendanceSession) => (
                                                <TableRow
                                                    key={session.id}
                                                    className="cursor-pointer hover:bg-muted/50 transition-colors group"
                                                    onClick={() => handleRowClick(session)}
                                                >
                                                    <TableCell className="py-3">
                                                        <div className="font-bold text-[13px] uppercase tracking-tight">
                                                            {session.employee?.nameWithInitials}{" "}
                                                            {session.employee?.employeeNo && (
                                                                <span className="text-muted-foreground font-mono text-[10px] opacity-60">
                                                                    ({session.employee.employeeNo})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3 whitespace-nowrap font-medium text-sm">
                                                        {format(new Date(session.date), "MMM d, yyyy")}
                                                    </TableCell>
                                                    <TableCell className="py-3 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">
                                                                {session.shiftName || "No Shift"}
                                                            </span>
                                                            {(session.shiftStartTime || session.shiftEndTime) && (
                                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                                    {formatTime(session.shiftStartTime)} - {formatTime(session.shiftEndTime)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">
                                                                {formatTime(session.checkInTime)}
                                                            </span>
                                                            {session.inApprovalStatus !== 'APPROVED' && (
                                                                <div className="mt-1">
                                                                    {getApprovalBadge(session.inApprovalStatus)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">
                                                                {formatTime(session.checkOutTime)}
                                                            </span>
                                                            {session.outApprovalStatus !== 'APPROVED' && (
                                                                <div className="mt-1">
                                                                    {getApprovalBadge(session.outApprovalStatus)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3 font-bold text-sm">
                                                        {formatMinutes(session.workMinutes)}
                                                    </TableCell>
                                                    <TableCell className="py-3 font-bold text-sm text-primary">
                                                        {formatMinutes(session.overtimeMinutes)}
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {session.isLate && (
                                                                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 text-[10px] py-0 px-1.5 h-4 font-bold">
                                                                    LATE
                                                                </Badge>
                                                            )}
                                                            {session.isEarlyLeave && (
                                                                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] py-0 px-1.5 h-4 font-bold">
                                                                    EARLY
                                                                </Badge>
                                                            )}
                                                            {session.isOnLeave && (
                                                                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] py-0 px-1.5 h-4 font-bold">
                                                                    LEAVE
                                                                </Badge>
                                                            )}
                                                            {session.isHalfDay && (
                                                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 text-[10px] py-0 px-1.5 h-4 font-bold">
                                                                    HALF
                                                                </Badge>
                                                            )}
                                                            {session.manuallyEdited && (
                                                                <Badge variant="outline" className="bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20 text-[10px] py-0 px-1.5 h-4 font-bold">
                                                                    EDITED
                                                                </Badge>
                                                            )}
                                                            {/* Joint Holiday Badge */}
                                                            {session.workHoliday && session.payrollHoliday && session.workHoliday.id === session.payrollHoliday.id && (
                                                                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] py-0 px-1.5 h-4 font-bold" title={`Work & Payroll Holiday: ${session.workHoliday.name}`}>
                                                                    HOL (WP)
                                                                </Badge>
                                                            )}

                                                            {/* Separate Holiday Badges */}
                                                            {session.workHoliday && (session.workHoliday.id !== session.payrollHoliday?.id) && (
                                                                <Badge variant="outline" className="bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20 text-[10px] py-0 px-1.5 h-4 font-bold" title={`Work Holiday: ${session.workHoliday.name}`}>
                                                                    HOL (W)
                                                                </Badge>
                                                            )}
                                                            {session.payrollHoliday && (session.payrollHoliday.id !== session.workHoliday?.id) && (
                                                                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[10px] py-0 px-1.5 h-4 font-bold" title={`Payroll Holiday: ${session.payrollHoliday.name}`}>
                                                                    HOL (P)
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center gap-1">
                                                            {hasPendingApproval(session) && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    onClick={(e) => handleQuickApprove(session, e)}
                                                                    className="h-8 px-3 rounded-lg shadow-md shadow-primary/20 hover:scale-105 transition-all"
                                                                    title="Quick approve pending items"
                                                                >
                                                                    <IconCheck className="h-3.5 w-3.5 mr-1.5" />
                                                                    <span className="text-xs font-black uppercase tracking-tighter">Approve</span>
                                                                </Button>
                                                            )}
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
