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
import { IconRefresh, IconChevronLeft, IconChevronRight, IconClock, IconMapPin } from "@tabler/icons-react";
import { useAttendancePortalSessions } from "@/hooks/use-attendance";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AttendanceLogTabProps {
    employeeId: string;
    companyId: string;
}

export function AttendanceLogTab({ employeeId, companyId }: AttendanceLogTabProps) {
    const [page, setPage] = useState(1);

    const {
        data: sessionsData,
        isLoading: loading,
        refetch: fetchSessions
    } = useAttendancePortalSessions({
        page,
        limit: 15
    });

    const sessions = (sessionsData as any)?.items || [];
    const meta = (sessionsData as any)?.meta;

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            FULL: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20",
            HALF_FIRST: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20",
            HALF_LAST: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20",
            OFF: "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/10 dark:text-neutral-400 border-neutral-200 dark:border-neutral-500/20",
        };

        const labels: Record<string, string> = {
            FULL: "Full Working Day",
            HALF_FIRST: "Half Day (Morning)",
            HALF_LAST: "Half Day (Evening)",
            OFF: "Off Day / Holiday",
        };

        return (
            <Badge variant="outline" className={cn("font-bold text-[10px] uppercase", styles[status] || styles.OFF)}>
                {labels[status] || status}
            </Badge>
        );
    };

    const formatDuration = (mins: number | null) => {
        if (!mins) return "0h 0m";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    return (
        <Card className="border border-neutral-200 dark:border-white/10 shadow-sm bg-white dark:bg-neutral-900/50 rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <IconClock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold tracking-tight">Activity Log</CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">Your recent attendance sessions and durations.</p>
                    </div>
                </div>
                <Button variant="outline" size="icon" onClick={() => fetchSessions()} disabled={loading} className="rounded-xl h-10 w-10">
                    <IconRefresh className={cn("h-4 w-4 text-muted-foreground", loading && "animate-spin")} />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-2xl border border-neutral-100 dark:border-white/5 overflow-hidden bg-neutral-50/30 dark:bg-neutral-900/40">
                    <Table>
                        <TableHeader className="bg-neutral-100/50 dark:bg-neutral-800/50">
                            <TableRow className="hover:bg-transparent border-neutral-200 dark:border-white/5">
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Date</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-4">In</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Out</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-4 text-center">Work Time</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-4 text-center">Break</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && !sessions.length ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        {Array(6).fill(0).map((_, j) => (
                                            <TableCell key={j} className="py-6">
                                                <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : sessions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground font-medium italic">
                                        No attendance records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sessions.map((session: any) => (
                                    <TableRow key={session.id} className="group border-neutral-100 dark:border-white/5 hover:bg-neutral-100/30 dark:hover:bg-white/5 transition-colors">
                                        <TableCell className="py-4 font-bold text-sm text-foreground">
                                            {format(new Date(session.date), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {session.checkInTime ? (
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">{format(new Date(session.checkInTime), "hh:mm a")}</span>
                                                    {session.checkInLocation && <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{session.checkInLocation}</span>}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground/50 font-medium">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {session.checkOutTime ? (
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">{format(new Date(session.checkOutTime), "hh:mm a")}</span>
                                                    {session.checkOutLocation && <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{session.checkOutLocation}</span>}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground/50 font-medium">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            <span className="font-black text-sm text-primary">
                                                {formatDuration(session.workMinutes)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            <span className="font-medium text-xs text-muted-foreground">
                                                {formatDuration(session.breakMinutes)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {getStatusBadge(session.workDayStatus)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {meta && meta.lastPage > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1 || loading}
                            onClick={() => setPage(page - 1)}
                            className="rounded-xl h-10 px-4 font-bold gap-2"
                        >
                            <IconChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <span className="text-sm font-black bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-lg">
                            {page} / {meta.lastPage}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === meta.lastPage || loading}
                            onClick={() => setPage(page + 1)}
                            className="rounded-xl h-10 px-4 font-bold gap-2"
                        >
                            Next
                            <IconChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
