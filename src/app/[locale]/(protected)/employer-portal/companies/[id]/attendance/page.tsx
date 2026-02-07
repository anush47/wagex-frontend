"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { IconPlus, IconClock, IconFileText } from "@tabler/icons-react";
import { AttendanceSessionsTab } from "./components/AttendanceSessionsTab";
import { AttendanceEventsTab } from "./components/AttendanceEventsTab";
import { CreateEventDialog } from "./components/CreateEventDialog";
import { SessionDetailsDialog } from "./components/SessionDetailsDialog";
import { useAttendanceSession } from "@/hooks/use-attendance";

export default function AttendancePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const companyId = params?.id as string;

    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "sessions");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Filters from URL
    const employeeId = searchParams.get("employeeId") || undefined;
    const date = searchParams.get("date") || undefined;
    const initialSessionId = searchParams.get("sessionId") || undefined;

    const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(initialSessionId);
    const [detailsOpen, setDetailsOpen] = useState(!!initialSessionId);

    // Fetch session data if ID is present
    const { data: sessionData, isLoading: loadingSession } = useAttendanceSession(selectedSessionId);

    // Sync tab state with URL parameter
    useEffect(() => {
        const tabFromUrl = searchParams.get("tab") || "sessions";
        setActiveTab(tabFromUrl);
    }, [searchParams]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

    const handleFilterChange = (filters: { employeeId?: string; date?: string; sessionId?: string; tab?: string }) => {
        const params = new URLSearchParams(searchParams.toString());
        if (filters.employeeId !== undefined) {
            if (filters.employeeId) params.set("employeeId", filters.employeeId);
            else params.delete("employeeId");
        }
        if (filters.date !== undefined) {
            if (filters.date) params.set("date", filters.date);
            else params.delete("date");
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
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="sessions" className="flex items-center gap-2">
                        <IconClock className="h-4 w-4" />
                        Sessions
                    </TabsTrigger>
                    <TabsTrigger value="events" className="flex items-center gap-2">
                        <IconFileText className="h-4 w-4" />
                        Raw Events
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sessions" className="mt-6">
                    <AttendanceSessionsTab
                        companyId={companyId}
                        initialEmployeeId={employeeId}
                        initialDate={date}
                        onFilterChange={handleFilterChange}
                        onOpenSession={handleOpenSession}
                    />
                </TabsContent>

                <TabsContent value="events" className="mt-6">
                    <AttendanceEventsTab
                        companyId={companyId}
                        initialEmployeeId={employeeId}
                        initialDate={date}
                        onFilterChange={handleFilterChange}
                        onOpenSession={handleOpenSession}
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
