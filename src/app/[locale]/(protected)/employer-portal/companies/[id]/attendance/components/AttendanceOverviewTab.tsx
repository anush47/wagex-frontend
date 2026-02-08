"use client";

import React, { useState, useEffect } from "react";
import {
    IconUsers,
    IconLogout,
    IconLogin,
    IconClockStop,
    IconAlertCircle,
    IconBeach,
    IconClock,
    IconExternalLink,
    IconSearch,
    IconFilter,
    IconPlayerPlay
} from "@tabler/icons-react";
import { format, isSameDay, startOfDay, endOfDay, differenceInMinutes } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAttendanceSessions } from "@/hooks/use-attendance";
import { useLeaveRequests } from "@/hooks/use-leaves";
import { useEmployees } from "@/hooks/use-employees";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { AttendanceSession } from "@/types/attendance";
import { LeaveStatus, type LeaveRequest } from "@/types/leave";
import type { Employee } from "@/types/employee";

interface AttendanceOverviewTabProps {
    companyId: string;
    onOpenSession: (id: string) => void;
}

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted/50", className)}
            {...props}
        />
    );
}

function safeFormatTime(dateStr?: string | null, formatStr: string = "h:mm a") {
    if (!dateStr) return "";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "";
        return format(date, formatStr);
    } catch (e) {
        return "";
    }
}

export function AttendanceOverviewTab({ companyId, onOpenSession }: AttendanceOverviewTabProps) {
    const today = new Date();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState("");

    // Update time every minute for the "worked duration" counter
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Fetch Today's Sessions
    const { data: sessionData, isLoading: loadingSessions } = useAttendanceSessions({
        companyId,
        startDate: format(startOfDay(today), "yyyy-MM-dd'T'HH:mm:ss"),
        endDate: format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ss"),
        limit: 100,
    });

    // Fetch Today's Approved Leaves
    const { data: leaveData, isLoading: loadingLeaves } = useLeaveRequests(companyId, {
        status: LeaveStatus.APPROVED,
    });

    // Fetch All Employees
    const { data: employeesData, isLoading: loadingEmployees } = useEmployees({
        companyId,
        limit: 100,
    });

    const sessions = (sessionData as any)?.items || [];
    const employees = (employeesData as any)?.data || [];
    const leaves = (leaveData as any) || [];

    // Filter leaves for today
    const todayLeaves = leaves.filter((leave: LeaveRequest) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        return today >= startOfDay(start) && today <= endOfDay(end);
    });

    // Categorize Employees
    const clockedInSessions = sessions.filter((s: AttendanceSession) => !s.checkOutTime);
    const clockedOutSessions = sessions.filter((s: AttendanceSession) => !!s.checkOutTime);

    const presentIds = new Set(clockedInSessions.map((s: AttendanceSession) => s.employeeId));
    const finishedIds = new Set(clockedOutSessions.map((s: AttendanceSession) => s.employeeId));
    const leaveIds = new Set(todayLeaves.map((l: LeaveRequest) => l.employeeId));

    const absentEmployees = employees.filter((emp: Employee) =>
        !presentIds.has(emp.id) && !finishedIds.has(emp.id) && !leaveIds.has(emp.id)
    );

    const stats = [
        {
            label: "Present Now",
            value: clockedInSessions.length,
            icon: IconLogin,
            color: "text-green-600",
            bg: "bg-green-500/10",
            border: "border-green-500/20",
            description: "Currently clocked in"
        },
        {
            label: "On Leave",
            value: todayLeaves.length,
            icon: IconBeach,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            description: "Approved leave today"
        },
        {
            label: "Absent",
            value: absentEmployees.length,
            icon: IconAlertCircle,
            color: "text-red-600",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
            description: "Not in, no leave"
        },
        {
            label: "Total Completed",
            value: clockedOutSessions.length,
            icon: IconClockStop,
            color: "text-orange-600",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
            description: "Finished for the day"
        }
    ];

    const isLoading = loadingSessions || loadingLeaves || loadingEmployees;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-[400px] rounded-xl" />
            </div>
        );
    }

    const filteredClockedIn = clockedInSessions.filter((s: AttendanceSession) =>
        String(s.employee?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(s.employee?.employeeNo || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className={`p-4 rounded-xl border relative group hover:shadow-md transition-all duration-500 ${stat.bg}`}>
                            <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <Badge variant="outline" className={`${stat.color} border-current/20 font-black text-[9px] uppercase px-1.5 py-0 rounded-md opacity-70`}>
                                        Live
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-2xl font-black tracking-tight mb-0.5">{stat.value}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</div>
                                </div>
                            </div>
                            {/* Decorative background element */}
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${stat.color.replace('text-', 'bg-')}`} />
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Live Activity */}
                <Card className="lg:col-span-2 p-6 md:p-8 rounded-xl border shadow-sm overflow-hidden relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                Present Now
                            </h2>
                            <p className="text-sm text-neutral-500 font-medium">Real-time presence tracking</p>
                        </div>

                        <div className="relative group min-w-[240px]">
                            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search active employees..."
                                className="pl-11 h-11 rounded-2xl border-border/60 bg-muted/30 focus-visible:ring-primary/20 transition-all font-medium text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredClockedIn.length > 0 ? (
                                filteredClockedIn.map((session: AttendanceSession, idx) => {
                                    const clockIn = new Date(session.checkInTime!);
                                    const minsWorked = differenceInMinutes(currentTime, clockIn);
                                    const hours = Math.floor(minsWorked / 60);
                                    const mins = Math.max(0, minsWorked % 60);

                                    return (
                                        <motion.div
                                            key={session.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            layout
                                            className="group relative p-4 rounded-[1.5rem] bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/60 transition-all cursor-pointer overflow-hidden"
                                            onClick={() => onOpenSession(session.id)}
                                        >
                                            <div className="flex items-center justify-between gap-4 relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-lg overflow-hidden border-2 border-primary/20">
                                                            {session.employee?.avatarUrl ? (
                                                                <img src={session.employee.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                session.employee?.fullName?.charAt(0) || "E"
                                                            )}
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-green-500 shadow-sm" />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors">
                                                            {session.employee?.fullName}
                                                        </div>
                                                        <div className="flex flex-col gap-1 mt-1">
                                                            <div className="flex items-center gap-2">
                                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{session.employee?.employeeNo || "EMP-000"}</div>
                                                                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                                                <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 leading-none">
                                                                    <IconClock className="w-3 h-3" />
                                                                    In at {safeFormatTime(session.checkInTime)}
                                                                </div>
                                                            </div>
                                                            {session.shiftName && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Badge variant="outline" className="text-[9px] font-black uppercase px-1.5 py-0 border-primary/20 bg-primary/5 text-primary rounded-md h-4 flex items-center">
                                                                        {session.shiftName}
                                                                    </Badge>
                                                                    <div className="text-[9px] font-bold text-muted-foreground tabular-nums">
                                                                        ({session.shiftStartTime} - {session.shiftEndTime})
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2 text-right">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-sm font-black text-primary tabular-nums">
                                                            {hours}h {mins}m
                                                        </div>
                                                        <IconPlayerPlay className="w-3 h-3 text-green-500 fill-current" />
                                                    </div>
                                                    <div className="w-32 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-primary"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, (minsWorked / 480) * 100)}%` }} // 8h target
                                                            transition={{ duration: 1 }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-20 bg-muted/10 rounded-[2rem] border border-dashed border-border/60">
                                    <div className="inline-flex p-4 rounded-3xl bg-muted/30 text-muted-foreground mb-4">
                                        <IconLogin className="w-8 h-8" />
                                    </div>
                                    <div className="font-black uppercase tracking-tight text-neutral-400">No active sessions</div>
                                    <p className="text-sm text-neutral-500 max-w-[250px] mx-auto mt-2 font-medium">Employees haven't clocked in yet for the day.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>

                {/* Right Side: Charts & Lists */}
                <div className="space-y-6">
                    {/* Attendance Visualization */}
                    <Card className="p-8 rounded-xl border shadow-sm overflow-hidden bg-card text-card-foreground relative">
                        <h3 className="text-lg font-black uppercase tracking-tight mb-8">Workforce Split</h3>

                        <div className="flex items-center justify-center py-4 relative">
                            {/* Custom CSS Circular segments */}
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    {/* Total / Absent Segment (Background) */}
                                    <circle
                                        cx="96" cy="96" r="88"
                                        stroke="currentColor" strokeWidth="16" fill="transparent"
                                        className="text-muted/30"
                                    />

                                    {/* Present Segment */}
                                    <motion.circle
                                        cx="96" cy="96" r="88"
                                        stroke="currentColor" strokeWidth="16" fill="transparent"
                                        strokeDasharray={2 * Math.PI * 88}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - clockedInSessions.length / (employees.length || 1)) }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="text-primary"
                                        strokeLinecap="round"
                                    />

                                    {/* Leave Segment */}
                                    {todayLeaves.length > 0 && (
                                        <motion.circle
                                            cx="96" cy="96" r="88"
                                            stroke="currentColor" strokeWidth="16" fill="transparent"
                                            strokeDasharray={2 * Math.PI * 88}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                                            animate={{
                                                strokeDashoffset: 2 * Math.PI * 88 * (1 - todayLeaves.length / (employees.length || 1))
                                            }}
                                            style={{
                                                rotate: `${(clockedInSessions.length / (employees.length || 1)) * 360}deg`,
                                                transformOrigin: '96px 96px'
                                            }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                            className="text-blue-500"
                                            strokeLinecap="round"
                                        />
                                    )}
                                </svg>
                                <div className="absolute text-center">
                                    <div className="text-4xl font-black">
                                        {employees.length > 0 ? Math.round((clockedInSessions.length / employees.length) * 100) : 0}%
                                    </div>
                                    <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Attendance</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Clocked In</span>
                                </div>
                                <span className="font-black text-sm">{clockedInSessions.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                                    <span className="text-xs font-bold uppercase text-muted-foreground">On Leave</span>
                                </div>
                                <span className="font-black text-sm">{todayLeaves.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Absent</span>
                                </div>
                                <span className="font-black text-sm">{absentEmployees.length}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Absentees List (Critical Feedback) */}
                    <Card className="p-6 rounded-xl border shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <IconAlertCircle className="w-4 h-4 text-destructive" />
                                Critical Absents
                            </h3>
                            <Badge variant="outline" className="text-[10px] font-black rounded-lg bg-destructive/10 text-destructive border-destructive/20" >
                                {absentEmployees.length}
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {absentEmployees.slice(0, 5).map((emp: Employee) => (
                                <div key={emp.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center font-black text-[10px]">
                                            {emp.fullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black uppercase leading-none">{emp.fullName}</div>
                                            <div className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">{emp.employeeNo}</div>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary">
                                        <IconExternalLink className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                            {absentEmployees.length > 5 && (
                                <Button variant="link" className="w-full text-xs font-black uppercase text-primary tracking-widest hover:no-underline">
                                    View All {absentEmployees.length}
                                </Button>
                            )}
                            {absentEmployees.length === 0 && (
                                <div className="text-center py-6 text-muted-foreground text-[10px] font-black uppercase italic">
                                    Everybody is accounted for! 👏
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
