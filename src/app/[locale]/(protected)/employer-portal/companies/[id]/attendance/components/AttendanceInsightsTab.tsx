"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    IconUsers,
    IconClock,
    IconCalendarOff,
    IconUserCheck
} from "@tabler/icons-react";

interface AttendanceInsightsTabProps {
    companyId: string;
}

export function AttendanceInsightsTab({ companyId }: AttendanceInsightsTabProps) {
    // This could be expanded to fetch real daily aggregates
    const stats = [
        {
            label: "Present Today",
            value: "0",
            icon: <IconUserCheck className="h-6 w-6 text-emerald-500" />,
            description: "Employees currently clocked in",
            color: "emerald"
        },
        {
            label: "Late Arrivals",
            value: "0",
            icon: <IconClock className="h-6 w-6 text-amber-500" />,
            description: "Employees arrived after grace period",
            color: "amber"
        },
        {
            label: "On Leave",
            value: "0",
            icon: <IconCalendarOff className="h-6 w-6 text-blue-500" />,
            description: "Approved leaves for today",
            color: "blue"
        },
        {
            label: "Absent",
            value: "0",
            icon: <IconUsers className="h-6 w-6 text-rose-500" />,
            description: "No activity recorded for today",
            color: "rose"
        }
    ];

    const colorMap: Record<string, string> = {
        emerald: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800",
        amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800",
        blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800",
        rose: "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800",
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {stats.map((stat, i) => (
                <Card key={i} className="border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all">
                    <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${colorMap[stat.color]}`}>
                            {stat.icon}
                        </div>

                        <span className="text-4xl font-black tracking-tighter text-neutral-800 dark:text-neutral-100 italic">{stat.value}</span>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-1">{stat.label}</h3>
                        <p className="text-[10px] font-medium text-neutral-400 leading-tight">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}

            {/* Placeholder for a chart */}
            <Card className="md:col-span-2 lg:col-span-4 border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-primary/5 rounded-[2rem] p-10 flex flex-col items-center justify-center space-y-4 bg-neutral-50/50 dark:bg-neutral-900/50 border-dashed">
                <div className="h-20 w-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <IconClock className="h-10 w-10 text-neutral-300" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-black uppercase tracking-tight text-neutral-400">Attendance Trends</h3>
                    <p className="text-sm font-medium text-neutral-400">Visual analytics of workforce participation will appear here.</p>
                </div>
            </Card>
        </div>
    );
}
