"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconHistory, IconChevronRight, IconFingerprint } from "@tabler/icons-react";
import { useAttendancePortalSessions } from "@/hooks/use-attendance";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function RecentSessionsCard() {
    const router = useRouter();
    const { data: sessionsData, isLoading } = useAttendancePortalSessions({
        page: 1,
        limit: 5
    });

    const sessions = (sessionsData as any)?.items || [];

    const formatDuration = (mins: number | null) => {
        if (!mins) return "0h 0m";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    if (isLoading) return null;

    return (
        <Card className="rounded-[2.5rem] border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                        <IconHistory className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black tracking-tight">Recent Activity</CardTitle>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest italic">Last 5 Work Sessions</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {sessions.map((session: any) => (
                        <div key={session.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-neutral-100 dark:hover:border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="text-center min-w-[45px]">
                                    <p className="text-[10px] font-black uppercase text-neutral-400 leading-none mb-0.5">
                                        {format(new Date(session.date), "MMM")}
                                    </p>
                                    <p className="text-lg font-black leading-none tracking-tighter">
                                        {format(new Date(session.date), "dd")}
                                    </p>
                                </div>
                                <div className="h-4 w-[1px] bg-neutral-100 dark:bg-neutral-800" />
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-black italic">
                                            {session.checkInTime ? format(new Date(session.checkInTime), "hh:mm a") : "--:--"}
                                        </p>
                                        {session.checkInTime && <IconFingerprint className="w-3 h-3 text-green-500 opacity-50" />}
                                    </div>
                                    <p className="text-[10px] font-medium text-neutral-400 flex items-center gap-1">
                                        {formatDuration(session.workMinutes)} Work Time
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider",
                                    session.workDayStatus === "FULL" 
                                        ? "bg-green-100/50 text-green-700 dark:bg-green-500/10 dark:text-green-400" 
                                        : "bg-orange-100/50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                                )}>
                                    {session.workDayStatus}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <Button 
                    variant="ghost" 
                    onClick={() => router.push("./attendance")}
                    className="w-full text-[10px] font-black uppercase text-green-600 hover:text-green-700 hover:bg-green-100/30 rounded-xl py-4 mt-2"
                >
                    Full Activity Log
                    <IconChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
            </CardContent>
        </Card>
    );
}

