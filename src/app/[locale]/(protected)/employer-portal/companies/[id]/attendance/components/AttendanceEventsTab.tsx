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
import { IconRefresh, IconX, IconChevronLeft, IconChevronRight, IconArrowRight, IconArrowLeft, IconExternalLink, IconCalendarStats, IconFilter, IconEye } from "@tabler/icons-react";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";
import type { AttendanceEvent, AttendanceSession, EventType, EventSource, EventStatus } from "@/types/attendance";
import { useAttendanceEvents, useAttendanceSessions } from "@/hooks/use-attendance";
import { format, subDays, addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { SalaryPeriodQuickSelect } from "./SalaryPeriodQuickSelect";
import { SearchableSessionSelect } from "@/components/ui/searchable-session-select";
import { useAttendanceMutations } from "@/hooks/use-attendance";
import { EventDetailsDialog } from "./EventDetailsDialog";

interface AttendanceEventsTabProps {
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
    timezone?: string;
}

export function AttendanceEventsTab({
    companyId,
    initialEmployeeId,
    initialDate,
    startDate,
    endDate,
    onFilterChange,
    onOpenSession,
    timezone = "UTC"
}: AttendanceEventsTabProps) {
    const [employeeFilter, setEmployeeFilter] = useState<string | undefined>(initialEmployeeId);
    const [statusFilter, setStatusFilter] = useState<EventStatus | "ALL">("ALL");
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedEvent, setSelectedEvent] = useState<AttendanceEvent | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Sync with initial filters
    useEffect(() => {
        if (initialEmployeeId !== employeeFilter) {
            setEmployeeFilter(initialEmployeeId);
        }
    }, [initialEmployeeId]);

    // Fetch events with pagination
    const {
        data: eventsData,
        isLoading: loading,
        refetch: fetchEvents
    } = useAttendanceEvents({
        companyId,
        employeeId: employeeFilter,
        startDate: startDate || initialDate,
        endDate: endDate || initialDate,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page,
        limit: 20
    });

    const events = eventsData?.items || [];
    const meta = eventsData?.meta;

    // Prefetch all sessions for this period to avoid one-by-one calls in the table
    // Fetch a broader range (1-day buffer) to handle sessions that might span date boundaries
    const fetchStart = (startDate || initialDate) ? format(subDays(new Date(startDate || initialDate || ""), 1), "yyyy-MM-dd") : undefined;
    const fetchEnd = (endDate || initialDate) ? format(addDays(new Date(endDate || initialDate || ""), 1), "yyyy-MM-dd") : undefined;

    const { data: allSessionsData, isLoading: allSessionsLoading } = useAttendanceSessions({
        companyId,
        startDate: fetchStart,
        endDate: fetchEnd,
        limit: 1000 // Get all relevant sessions for the period
    }, {
        enabled: !!companyId && !!fetchStart,
    });

    const prefetchedSessions = (allSessionsData as any)?.items as AttendanceSession[] | undefined;

    const sessionsByEmployee = React.useMemo(() => {
        const map: Record<string, AttendanceSession[]> = {};
        if (!prefetchedSessions) return map;
        prefetchedSessions.forEach((s: AttendanceSession) => {
            if (!map[s.employeeId]) map[s.employeeId] = [];
            map[s.employeeId].push(s);
        });
        return map;
    }, [prefetchedSessions]);

    const { linkEventToSession, unlinkEventFromSession, updateEventType } = useAttendanceMutations();

    const getEventTypeBadge = (type: EventType, eventId?: string) => {
        const styles = {
            IN: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20",
            OUT: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
        };

        const icons = {
            IN: <IconArrowRight className="h-3 w-3 mr-1" />,
            OUT: <IconArrowLeft className="h-3 w-3 mr-1" />,
        };

        const isUpdating = updateEventType.isPending && updateEventType.variables?.id === eventId;

        return (
            <Badge
                variant="outline"
                className={`font-bold transition-all ${eventId ? "cursor-pointer" : ""} ${styles[type]} ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
                onClick={(e) => {
                    if (eventId) {
                        e.stopPropagation();
                        updateEventType.mutate({
                            id: eventId,
                            eventType: type === "IN" ? "OUT" : "IN"
                        });
                    }
                }}
                title={eventId ? "Click to toggle type" : undefined}
            >
                {isUpdating ? (
                    <IconRefresh className="h-3 w-3 animate-spin mr-1" />
                ) : (
                    icons[type]
                )}
                {type}
            </Badge>
        );
    };

    const getSourceBadge = (source: EventSource) => {
        const styles = {
            WEB: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
            API_KEY: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
            MANUAL: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
            PORTAL: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        };

        return (
            <Badge variant="outline" className={`text-[10px] ${styles[source]}`}>
                {source}
            </Badge>
        );
    };


    const handleSessionAssign = async (eventId: string, sessionId: string | null) => {
        try {
            if (sessionId) {
                await linkEventToSession.mutateAsync({ eventId, sessionId });
            } else {
                await unlinkEventFromSession.mutateAsync(eventId);
            }
        } catch (error) {
            console.error("Failed to assign session", error);
        }
    };

    const getStatusBadge = (status: EventStatus) => {
        const styles = {
            ACTIVE: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
            REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
            IGNORED: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
        };

        return (
            <Badge variant="outline" className={`font-bold text-[10px] ${styles[status]}`}>
                {status}
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader className="space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <CardTitle>Raw Event Logs</CardTitle>
                    <div className="flex items-center gap-2">
                        <SalaryPeriodQuickSelect
                            companyId={companyId}
                            timezone={timezone}
                            onRangeSelect={(start, end) => onFilterChange?.({ startDate: start, endDate: end })}
                            currentStart={startDate}
                            currentEnd={endDate}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="h-9 px-3 rounded-xl shadow-sm"
                        >
                            <IconFilter className="h-3.5 w-3.5 mr-1.5" />
                            Filters
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => fetchEvents()}
                            disabled={loading}
                            className="h-9 w-9 rounded-xl shadow-sm"
                        >
                            <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {showFilters && (
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 pt-2 border-t border-border">
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

                        <Select value={statusFilter} onValueChange={(v) => {
                            setStatusFilter(v as EventStatus | "ALL");
                            setPage(1);
                        }}>
                            <SelectTrigger className="w-full md:w-[140px] rounded-xl">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="IGNORED">Ignored</SelectItem>
                            </SelectContent>
                        </Select>

                        {(employeeFilter || startDate || endDate || initialDate || statusFilter !== "ALL") && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setEmployeeFilter(undefined);
                                    setStatusFilter("ALL");
                                    onFilterChange?.({
                                        employeeId: "",
                                        date: "",
                                        startDate: "",
                                        endDate: ""
                                    });
                                }}
                                className="h-9 px-3 rounded-xl text-muted-foreground hover:text-foreground"
                            >
                                <IconX className="h-3.5 w-3.5 mr-1.5" />
                                Clear all
                            </Button>
                        )}
                    </div>
                )}
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
                                    <TableHead>Session</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Device</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Remark</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell>
                                            <div className="h-4 w-48 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                                        </TableCell>
                                        <TableCell><div className="h-4 w-28 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                        <TableCell><div className="h-6 w-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg" /></TableCell>
                                        <TableCell><div className="h-8 w-32 bg-neutral-100 dark:bg-neutral-800 rounded-lg" /></TableCell>
                                        <TableCell><div className="h-5 w-16 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                        <TableCell><div className="h-5 w-16 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                        <TableCell className="text-right">
                                            <div className="h-8 w-8 bg-neutral-100 dark:bg-neutral-800 rounded ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : events.length === 0 ? (
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
                                        <TableHead>Session</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Device</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Remark</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {events.map((event: AttendanceEvent) => (
                                        <TableRow
                                            key={event.id}
                                            className={event.sessionId ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
                                            onClick={() => {
                                                if (event.sessionId) {
                                                    onOpenSession(event.sessionId);
                                                }
                                            }}
                                        >
                                            <TableCell>
                                                <div className="font-bold text-[13px] uppercase tracking-tight">
                                                    {event.employee?.nameWithInitials}{" "}
                                                    {event.employee?.employeeNo && (
                                                        <span className="text-muted-foreground font-mono text-[10px] opacity-60">
                                                            ({event.employee.employeeNo})
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">
                                                        {formatInTimeZone(new Date(event.eventTime), timezone, "MMM d, yyyy")}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatInTimeZone(new Date(event.eventTime), timezone, "h:mm:ss a")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getEventTypeBadge(event.eventType, event.id)}</TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <SearchableSessionSelect
                                                    companyId={companyId}
                                                    employeeId={event.employeeId}
                                                    eventDate={new Date(event.eventTime)}
                                                    value={event.sessionId}
                                                    onSelect={(sessionId) => handleSessionAssign(event.id, sessionId)}
                                                    prefetchedSessions={sessionsByEmployee[event.employeeId]}
                                                    loading={allSessionsLoading}
                                                />
                                            </TableCell>
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
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5"
                                                    onClick={() => {
                                                        setSelectedEvent(event);
                                                        setDetailsOpen(true);
                                                    }}
                                                    title="View Details"
                                                >
                                                    <IconEye className="h-4 w-4" />
                                                </Button>
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

            <EventDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                event={selectedEvent}
            />
        </Card>
    );
}
