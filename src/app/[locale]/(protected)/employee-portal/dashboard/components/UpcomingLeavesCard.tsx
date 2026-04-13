"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconCalendarEvent, IconPlaneDeparture, IconChevronRight } from "@tabler/icons-react";
import { useLeaveRequests } from "@/hooks/use-leaves";
import { useMe } from "@/hooks/use-employees";
import { format, isAfter, startOfToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LeaveRequest } from "@/types/leave";

export function UpcomingLeavesCard() {
    const router = useRouter();
    const { data: employee } = useMe();
    const { data: leaves, isLoading } = useLeaveRequests(employee?.companyId || "", {
        employeeId: employee?.id,
        status: "APPROVED" as any
    });

    const upcomingLeaves = (leaves as LeaveRequest[] || [])
        ?.filter((l: LeaveRequest) => isAfter(new Date(l.startDate), startOfToday()))
        .sort((a: LeaveRequest, b: LeaveRequest) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 3) || [];

    if (isLoading) return null;

    return (
        <Card className="rounded-[2.5rem] border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                        <IconCalendarEvent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black tracking-tight">Upcoming Leaves</CardTitle>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest italic">Future Leaves</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {upcomingLeaves.length === 0 ? (
                    <div className="py-6 flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 rounded-full border-2 border-dashed border-neutral-200 dark:border-neutral-700 flex items-center justify-center mb-4">
                            <IconPlaneDeparture className="w-5 h-5 text-neutral-300" />
                        </div>
                        <p className="text-xs text-neutral-400 font-medium italic">No upcoming leaves scheduled</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {upcomingLeaves.map((leave) => (
                            <div key={leave.id} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5">
                                <div>
                                    <p className="text-sm font-black">{leave.leaveTypeName || "Leave"}</p>
                                    <p className="text-[10px] text-neutral-500 font-medium">
                                        {format(new Date(leave.startDate), "MMM d")} - {format(new Date(leave.endDate), "MMM d")}
                                    </p>
                                </div>
                                <div className="text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg">
                                    {leave.days} Days
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <Button 
                    variant="ghost" 
                    onClick={() => router.push("./leaves")}
                    className="w-full text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-100/30 rounded-xl py-4"
                >
                    All Leaves
                    <IconChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
            </CardContent>
        </Card>
    );
}
