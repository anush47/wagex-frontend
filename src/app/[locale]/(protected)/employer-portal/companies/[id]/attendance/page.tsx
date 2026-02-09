"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { IconPlus, IconClock, IconFileText, IconChartBar, IconCalendarStats } from "@tabler/icons-react";
import { AttendanceOverviewTab } from "./components/AttendanceOverviewTab";
import { AttendanceSessionsTab } from "./components/AttendanceSessionsTab";
import { AttendanceEventsTab } from "./components/AttendanceEventsTab";
import { AttendanceStatsTab } from "./components/AttendanceStatsTab";
import { CreateEventDialog } from "./components/CreateEventDialog";
import { SessionDetailsDialog } from "./components/SessionDetailsDialog";
import { useAttendanceSession, useAttendanceSessions } from "@/hooks/use-attendance";

export default function AttendancePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const companyId = params?.id as string;

    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Filters from URL
    const employeeId = searchParams.get("employeeId") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const date = searchParams.get("date") || undefined; // Fallback for single date
    const initialSessionId = searchParams.get("sessionId") || undefined;

    const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(initialSessionId);
    const [detailsOpen, setDetailsOpen] = useState(!!initialSessionId);

    // Fetch session data if ID is present
    const { data: sessionData, isLoading: loadingSession } = useAttendanceSession(selectedSessionId);

    // Fetch pending sessions for notification dot
    const { data: pendingSessions } = useAttendanceSessions({
        companyId,
        isPending: true,
        limit: 1
    });
    const hasPending = (pendingSessions?.meta?.total || 0) > 0;

    // Sync tab state with URL parameter
    useEffect(() => {
        const tabFromUrl = searchParams.get("tab") || "overview";
        setActiveTab(tabFromUrl);
    }, [searchParams]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

    const handleFilterChange = (filters: {
        employeeId?: string;
        date?: string;
        startDate?: string;
        endDate?: string;
        sessionId?: string;
        tab?: string
    }) => {
        const params = new URLSearchParams(searchParams.toString());

        if (filters.employeeId !== undefined) {
            if (filters.employeeId) params.set("employeeId", filters.employeeId);
            else params.delete("employeeId");
        }

        if (filters.startDate !== undefined) {
            if (filters.startDate) params.set("startDate", filters.startDate);
            else params.delete("startDate");
            // If we set range, remove single date
            params.delete("date");
        }

        if (filters.endDate !== undefined) {
            if (filters.endDate) params.set("endDate", filters.endDate);
            else params.delete("endDate");
            // If we set range, remove single date
            params.delete("date");
        }

        if (filters.date !== undefined) {
            if (filters.date) {
                params.set("date", filters.date);
                // If we set single date, remove range
                params.delete("startDate");
                params.delete("endDate");
            } else {
                params.delete("date");
            }
        }

        if (filters.sessionId !== undefined) {
            if (filters.sessionId) params.set("sessionId", filters.sessionId);
            else params.delete("sessionId");
        }
        if (filters.tab) params.set("tab", filters.tab);

        router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

    const handleOpenSession = (id: string) => {
        setSelectedSessionId(id);
        setDetailsOpen(true);
        const params = new URLSearchParams(searchParams.toString());
        params.set("sessionId", id);
        router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

    const handleCloseSession = () => {
        setDetailsOpen(false);
        setSelectedSessionId(undefined);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("sessionId");
        router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 md:space-y-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconClock className="h-5 w-5" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            Attendance Management
                        </h1>
                    </div>
                    <p className="text-neutral-500 font-medium text-sm">
                        Track employee attendance sessions and raw event logs.
                    </p>
                </div>

                <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <IconPlus className="mr-2 h-5 w-5" />
                    Manual Event
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto no-scrollbar pb-2">
                    <TabsList className="w-full h-11 h-auto p-1 bg-muted/50 rounded-2xl md:grid md:grid-cols-4 md:max-w-2xl flex whitespace-nowrap min-w-max md:min-w-0">
                        <TabsTrigger value="overview" className="flex items-center gap-2 px-4 py-2 rounded-xl data-[state=active]:shadow-sm">
                            <IconChartBar className="h-4 w-4" />
                            <span className="text-[11px] md:text-sm">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="sessions" className="flex items-center gap-2 px-4 py-2 rounded-xl relative data-[state=active]:shadow-sm">
                            <IconClock className="h-4 w-4" />
                            <span className="text-[11px] md:text-sm">Sessions</span>
                            {hasPending && (
                                <span className="absolute top-1 right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="events" className="flex items-center gap-2 px-4 py-2 rounded-xl data-[state=active]:shadow-sm">
                            <IconFileText className="h-4 w-4" />
                            <span className="text-[11px] md:text-sm">Raw Events</span>
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="flex items-center gap-2 px-4 py-2 rounded-xl data-[state=active]:shadow-sm">
                            <IconCalendarStats className="h-4 w-4" />
                            <span className="text-[11px] md:text-sm">Statistics</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="mt-6">
                    <AttendanceOverviewTab
                        companyId={companyId}
                        onOpenSession={handleOpenSession}
                    />
                </TabsContent>

                <TabsContent value="sessions" className="mt-6">
                    <AttendanceSessionsTab
                        companyId={companyId}
                        initialEmployeeId={employeeId}
                        initialDate={date}
                        startDate={startDate}
                        endDate={endDate}
                        onFilterChange={handleFilterChange}
                        onOpenSession={handleOpenSession}
                    />
                </TabsContent>

                <TabsContent value="events" className="mt-6">
                    <AttendanceEventsTab
                        companyId={companyId}
                        initialEmployeeId={employeeId}
                        initialDate={date}
                        startDate={startDate}
                        endDate={endDate}
                        onFilterChange={handleFilterChange}
                        onOpenSession={handleOpenSession}
                    />
                </TabsContent>

                <TabsContent value="stats" className="mt-6">
                    <AttendanceStatsTab
                        companyId={companyId}
                        startDate={startDate}
                        endDate={endDate}
                        initialDate={date}
                        employeeId={employeeId}
                        onFilterChange={handleFilterChange}
                    />
                </TabsContent>
            </Tabs>

            {/* Session Details Dialog */}
            <SessionDetailsDialog
                open={detailsOpen}
                onOpenChange={(v) => {
                    if (!v) handleCloseSession();
                    else setDetailsOpen(true);
                }}
                session={sessionData || null}
                isLoading={loadingSession}
            />

            {/* Create Dialog */}
            <CreateEventDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                companyId={companyId}
            />
        </div>
    );
}
