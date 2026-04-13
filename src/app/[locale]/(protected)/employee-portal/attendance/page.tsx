"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IconCalendarStats, IconFingerprint } from "@tabler/icons-react";
import { useMe } from "@/hooks/use-employees";
import { AttendanceLogTab } from "./components/AttendanceLogTab";
import { MarkAttendanceTab } from "./components/MarkAttendanceTab";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeAttendancePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: employee, isLoading } = useMe();
    
    const tabFromUrl = searchParams.get("tab") || "log";
    const [activeTab, setActiveTab] = useState(tabFromUrl);

    // Sync state with URL
    useEffect(() => {
        const currentTab = searchParams.get("tab") || "log";
        setActiveTab(currentTab);
    }, [searchParams]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        const newUrl = `${window.location.pathname}?tab=${value}`;
        router.push(newUrl, { scroll: false });
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto py-6 space-y-8 animate-pulse">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48 rounded-xl" />
                    <Skeleton className="h-4 w-64 rounded-lg" />
                </div>
                <Skeleton className="h-[400px] w-full rounded-[2rem]" />
            </div>
        );
    }

    if (!employee) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h2 className="text-2xl font-bold text-neutral-400">Employee profile not found</h2>
            <p className="text-neutral-500">Please contact your administrator if you believe this is an error.</p>
        </div>
    );

    const companyId = employee.companyId;
    const employeeId = employee.id;

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 md:space-y-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconCalendarStats className="h-5 w-5" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            Attendance
                        </h1>
                    </div>
                    <p className="text-neutral-500 font-medium text-sm">
                        Log your work hours and track your attendance history.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto no-scrollbar pb-2">
                    <TabsList className="w-full h-12 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl md:grid md:grid-cols-2 md:max-w-md flex whitespace-nowrap min-w-max md:min-w-0">
                        <TabsTrigger 
                            value="log"
                            className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all"
                        >
                            <IconCalendarStats className="h-4 w-4" />
                            <span>Attendance Log</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="mark"
                            className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all"
                        >
                            <IconFingerprint className="h-4 w-4" />
                            <span>Mark Attendance</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="log" className="mt-6 animate-in slide-in-from-bottom-2 duration-300">
                    <AttendanceLogTab employeeId={employeeId} companyId={companyId} />
                </TabsContent>

                <TabsContent value="mark" className="mt-6 animate-in slide-in-from-bottom-2 duration-300">
                    <MarkAttendanceTab employeeId={employeeId} companyId={companyId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
