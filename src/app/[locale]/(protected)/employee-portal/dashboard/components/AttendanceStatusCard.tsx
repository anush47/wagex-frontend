"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconClock, IconMapPin, IconCalendarCheck } from "@tabler/icons-react";
import { usePortalAttendanceStatus } from "@/hooks/use-attendance";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function AttendanceStatusCard() {
    const { data: status, isLoading } = usePortalAttendanceStatus();

    const isClockedIn = status?.nextExpectedEvent === "OUT";

    if (isLoading) {
        return (
            <Card className="rounded-[2.5rem] border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 shadow-sm animate-pulse">
                <div className="h-40" />
            </Card>
        );
    }

    return (
        <Card className="rounded-[2.5rem] border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <IconClock className="h-5 w-5 text-primary" />
                    </div>
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        isClockedIn 
                            ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" 
                            : "bg-neutral-100 text-neutral-500 dark:bg-white/5 dark:text-neutral-400"
                    )}>
                        {isClockedIn ? "Live Session" : "Offline"}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-3xl font-black italic tracking-tight">
                        {isClockedIn ? "You are Clocked In" : "You are Clocked Out"}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                        {isClockedIn 
                            ? `In at ${format(new Date(status.lastEvent.time), "hh:mm a")}` 
                            : "Ready to start?"}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-3xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-neutral-400">
                            <IconCalendarCheck className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Shift</span>
                        </div>
                        <p className="text-sm font-black">{status?.activeShift?.name || "No Shift Assigned"}</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-neutral-400">
                            <IconMapPin className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Zone</span>
                        </div>
                        <p className="text-sm font-black truncate">{status?.config?.zones?.[0]?.name || "Anywhere"}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
