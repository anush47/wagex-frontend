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
import { IconRefresh, IconX, IconChevronLeft, IconChevronRight, IconArrowRight, IconArrowLeft } from "@tabler/icons-react";
import type { AttendanceEvent, EventType, EventSource, EventStatus } from "@/types/attendance";
import { useAttendanceEvents } from "@/hooks/use-attendance";
import { format } from "date-fns";

interface AttendanceEventsTabProps {
    companyId: string;
}

export function AttendanceEventsTab({ companyId }: AttendanceEventsTabProps) {
    const [employeeFilter, setEmployeeFilter] = useState<string | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<EventStatus | "ALL">("ALL");
    const [page, setPage] = useState(1);

    // Fetch events with pagination
    const {
        data: eventsData,
        isLoading: loading,
        refetch: fetchEvents
    } = useAttendanceEvents({
        companyId,
        employeeId: employeeFilter,
        page,
        limit: 20
    });

    const events = eventsData?.items || [];
    const meta = eventsData?.meta;

    // Filter by status on client side (or add to backend if needed)
    const filteredEvents = statusFilter === "ALL"
        ? events
        : events.filter(e => e.status === statusFilter);

    const getEventTypeBadge = (type: EventType) => {
        const styles = {
            IN: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
            OUT: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200",
        };

        const icons = {
            IN: <IconArrowRight className="h-3 w-3 mr-1" />,
            OUT: <IconArrowLeft className="h-3 w-3 mr-1" />,
        };

        return (
            <Badge variant="outline" className={`font-bold ${styles[type]}`}>
                {icons[type]}
                {type}
            </Badge>
        );
    };

    const getSourceBadge = (source: EventSource) => {
        const styles = {
            WEB: "bg-purple-50 text-purple-700 border-purple-200",
            API_KEY: "bg-cyan-50 text-cyan-700 border-cyan-200",
            MANUAL: "bg-orange-50 text-orange-700 border-orange-200",
        };

        return (
            <Badge variant="outline" className={`text-[10px] ${styles[source]}`}>
                {source}
            </Badge>
        );
    };

    const getStatusBadge = (status: EventStatus) => {
        const styles = {
            ACTIVE: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
            REJECTED: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
            IGNORED: "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200",
        };

        return (
            <Badge variant="outline" className={`font-bold text-[10px] ${styles[status]}`}>
                {status}
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle>Raw Event Logs</CardTitle>
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
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EventStatus | "ALL")}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="IGNORED">Ignored</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" onClick={() => fetchEvents()} disabled={loading}>
                            <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading && events.length === 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Event Time</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Device</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Remark</TableHead>
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
                                        <TableCell><div className="h-4 w-28 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                        <TableCell><div className="h-6 w-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg" /></TableCell>
                                        <TableCell><div className="h-5 w-16 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                        <TableCell><div className="h-5 w-16 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No attendance events found</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Event Time</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Device</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Remark</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEvents.map((event: AttendanceEvent) => (
                                        <TableRow
                                            key={event.id}
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            <TableCell>
                                                <div className="font-medium">
                                                    {event.employee?.nameWithInitials}{" "}
                                                    {event.employee?.employeeNo && (
                                                        <span className="text-muted-foreground font-mono text-xs">
                                                            ({event.employee.employeeNo})
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">
                                                        {format(new Date(event.eventTime), "MMM d, yyyy")}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(event.eventTime), "h:mm:ss a")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getEventTypeBadge(event.eventType)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {getSourceBadge(event.source)}
                                                    {event.apiKeyName && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {event.apiKeyName}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {event.device || "-"}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate" title={event.location}>
                                                {event.location || "-"}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(event.status)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate" title={event.remark}>
                                                {event.remark || "-"}
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
    );
}
