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
import { Input } from "@/components/ui/input";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";
import { AttendanceStatus, AttendanceApprovalStatus } from "@/types/attendance";
import { format } from "date-fns";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { IconRefresh, IconX, IconClock, IconMapPin, IconCalendarCheck, IconCheck, IconTrash, IconChevronRight } from "@tabler/icons-react";
import { useAttendance } from "@/hooks/use-attendance";
import { AttendanceSessionDetailDialog } from "./AttendanceSessionDetailDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";





interface AttendanceSessionsTabProps {
    companyId: string;
}

export function AttendanceSessionsTab({ companyId }: AttendanceSessionsTabProps) {
    const [page, setPage] = useState(1);
    const [employeeId, setEmployeeId] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<AttendanceStatus | "ALL">("ALL");
    const [startDate, setStartDate] = useState<string>(format(new Date(), "yyyy-MM-01"));
    const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [selectedSession, setSelectedSession] = useState<any | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);


    const { useSessions, approve, isApproving, update, isUpdating, remove, isDeleting } = useAttendance(companyId);




    const { data, isLoading, refetch } = useSessions({
        page,
        limit: 15,
        employeeId,
        status: status === "ALL" ? undefined : status,
        startDate,
        endDate,
    } as any);


    const sessions = data?.items || [];
    const meta = data?.meta || { total: 0, page: 1, lastPage: 1 };

    const getApprovalBadge = (status: AttendanceApprovalStatus) => {
        const styles: Record<AttendanceApprovalStatus, string> = {
            [AttendanceApprovalStatus.APPROVED]: "bg-green-100 text-green-700 border-green-200",
            [AttendanceApprovalStatus.REJECTED]: "bg-red-100 text-red-700 border-red-200",
            [AttendanceApprovalStatus.PENDING]: "bg-orange-100 text-orange-700 border-orange-200",
        };

        return (
            <Badge variant="outline" className={`font-bold ${styles[status]}`}>
                {status}
            </Badge>
        );
    };

    const getStatusBadge = (status: AttendanceStatus) => {
        const styles: Record<AttendanceStatus, string> = {
            [AttendanceStatus.PRESENT]: "bg-green-100 text-green-700 border-green-200",
            [AttendanceStatus.LATE]: "bg-amber-100 text-amber-700 border-amber-200",
            [AttendanceStatus.EARLY_LEAVE]: "bg-orange-100 text-orange-700 border-orange-200",
            [AttendanceStatus.ABSENT]: "bg-red-100 text-red-700 border-red-200",
            [AttendanceStatus.ON_LEAVE]: "bg-blue-100 text-blue-700 border-blue-200",
            [AttendanceStatus.HALF_DAY]: "bg-purple-100 text-purple-700 border-purple-200",
        };

        return (
            <Badge variant="outline" className={`font-bold ${styles[status]}`}>
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    // Compute combined approval status from In/Out statuses
    const getCombinedApprovalStatus = (session: any): AttendanceApprovalStatus => {
        if (session.inApprovalStatus === AttendanceApprovalStatus.APPROVED && session.outApprovalStatus === AttendanceApprovalStatus.APPROVED) {
            return AttendanceApprovalStatus.APPROVED;
        }
        if (session.inApprovalStatus === AttendanceApprovalStatus.REJECTED || session.outApprovalStatus === AttendanceApprovalStatus.REJECTED) {
            return AttendanceApprovalStatus.REJECTED;
        }
        return AttendanceApprovalStatus.PENDING;
    };



    return (
        <Card>

            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle>Attendance Activity</CardTitle>
                    <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                        <div className="w-[200px]">
                            <SearchableEmployeeSelect
                                companyId={companyId}
                                value={employeeId}
                                onSelect={(id) => setEmployeeId(id)}
                                placeholder="Filter by employee"
                            />
                        </div>
                        {employeeId && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEmployeeId(undefined)}
                                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                                title="Clear employee filter"
                            >
                                <IconX className="h-4 w-4" />
                            </Button>
                        )}

                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                className="h-9 w-[130px] rounded-md border-input text-xs"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-muted-foreground text-xs font-medium">to</span>
                            <Input
                                type="date"
                                className="h-9 w-[130px] rounded-md border-input text-xs"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>

                            <SelectContent className="rounded-xl">
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                {Object.values(AttendanceStatus).map(s => (
                                    <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>


                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl h-10 w-10 border-neutral-200"
                            onClick={() => refetch()}
                            disabled={isLoading}
                        >
                            <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Date (Shift)</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Check Out</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Approval</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>



                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell className="py-6">
                                            <div className="space-y-2">
                                                <div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-800 rounded" />
                                                <div className="h-3 w-16 bg-neutral-50 dark:bg-neutral-800/50 rounded" />
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-6"><div className="h-10 w-32 bg-neutral-100 dark:bg-neutral-800 rounded-xl" /></TableCell>
                                        <TableCell className="py-6"><div className="h-6 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg" /></TableCell>
                                        <TableCell className="py-6"><div className="h-6 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg" /></TableCell>
                                        <TableCell className="py-6"><div className="h-6 w-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg" /></TableCell>
                                        <TableCell className="py-6 text-center"><div className="h-6 w-24 bg-neutral-100 dark:bg-neutral-800 rounded-full mx-auto" /></TableCell>
                                        <TableCell className="py-6 text-center"><div className="h-6 w-16 bg-neutral-100 dark:bg-neutral-800 rounded-full mx-auto" /></TableCell>
                                        <TableCell className="py-6 pr-8 text-right"><div className="h-8 w-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg ml-auto" /></TableCell>

                                    </TableRow>
                                ))
                            ) : sessions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-64 text-center">

                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="h-16 w-16 rounded-3xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
                                                <IconCalendarCheck className="h-8 w-8 text-neutral-300" />
                                            </div>
                                            <p className="text-neutral-400 font-bold text-sm uppercase tracking-widest">No attendance sessions found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sessions.map((session: any) => (
                                    <TableRow
                                        key={session.id}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => {
                                            setSelectedSession(session);
                                            setIsDetailOpen(true);
                                        }}
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


                                        <TableCell className="py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-neutral-700 dark:text-neutral-300">
                                                    {format(new Date(session.date), "MMM d, yyyy")}
                                                    <span className="ml-1.5 text-[10px] font-black text-primary/60 uppercase tracking-tighter">
                                                        ({session.shiftName || "Std"})
                                                    </span>
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            {session.checkInTime ? (
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <IconClock className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span className="font-mono text-sm">{format(new Date(session.checkInTime), "HH:mm")}</span>
                                                </div>
                                            ) : <span className="text-muted-foreground/30">-</span>}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {session.checkOutTime ? (
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <IconClock className="h-3.5 w-3.5 text-rose-500" />
                                                    <span className="font-mono text-sm">{format(new Date(session.checkOutTime), "HH:mm")}</span>
                                                </div>
                                            ) : <span className="text-muted-foreground/30">-</span>}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {session.totalMinutes ? (
                                                <span className="text-xs font-bold text-muted-foreground">
                                                    {Math.floor(session.totalMinutes / 60)}h {session.totalMinutes % 60}m
                                                </span>
                                            ) : <span className="text-muted-foreground/30">-</span>}
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            {getStatusBadge(session.status)}
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            {getApprovalBadge(getCombinedApprovalStatus(session))}
                                        </TableCell>
                                        <TableCell className="py-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                                            {getCombinedApprovalStatus(session) === AttendanceApprovalStatus.PENDING ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                                        onClick={() => approve({ sessionId: session.id, status: AttendanceApprovalStatus.REJECTED })}
                                                        disabled={isApproving}
                                                        title="Reject"
                                                    >
                                                        <IconX className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        onClick={() => approve({ sessionId: session.id, status: AttendanceApprovalStatus.APPROVED })}
                                                        disabled={isApproving}
                                                        title="Approve"
                                                    >
                                                        <IconCheck className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedSession(session);
                                                        setIsDetailOpen(true);
                                                    }}
                                                >
                                                    <IconChevronRight className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>

                                    </TableRow>
                                ))
                            )}

                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {meta.lastPage > 1 && (
                    <div className="p-4 md:p-6 border-t border-border flex items-center justify-between bg-muted/20">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Showing {sessions.length} of {meta.total} records
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg px-3 font-bold text-[10px] uppercase tracking-wider"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Prev
                            </Button>
                            <div className="h-8 min-w-[32px] rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground px-2">
                                {page} / {meta.lastPage}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg px-3 font-bold text-[10px] uppercase tracking-wider"
                                disabled={page === meta.lastPage}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

            </CardContent>

            <AttendanceSessionDetailDialog
                session={selectedSession}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                onUpdate={(id, data) => {
                    update({ sessionId: id, data });
                }}
                isUpdating={isUpdating}
                onDelete={(id) => {
                    remove(id);
                    setIsDetailOpen(false);
                }}
                isDeleting={isDeleting}
                onApprove={(id, status) => {
                    approve({ sessionId: id, status });
                    setIsDetailOpen(false);
                }}
                isApproving={isApproving}
            />

            <ConfirmationDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Delete Attendance Record"
                description="Are you sure you want to delete this attendance record? This action cannot be undone."
                icon={<IconTrash className="h-8 w-8" />}
                actionLabel="Delete"
                cancelLabel="Cancel"
                onAction={() => {
                    if (sessionToDelete) {
                        remove(sessionToDelete);
                        setDeleteConfirmOpen(false);
                        setSessionToDelete(null);
                        setIsDetailOpen(false);
                    }
                }}
                onCancel={() => {
                    setDeleteConfirmOpen(false);
                    setSessionToDelete(null);
                }}
                loading={isDeleting}
                variant="destructive"
            />
        </Card>
    );
}

