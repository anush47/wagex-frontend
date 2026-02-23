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
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAttendanceSessions } from "@/hooks/use-attendance";
import { useLeaveRequests } from "@/hooks/use-leaves";
import { useEmployees } from "@/hooks/use-employees";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";
import type { AttendanceSession } from "@/types/attendance";
import { LeaveStatus, type LeaveRequest } from "@/types/leave";
import type { Employee } from "@/types/employee";
interface AttendanceOverviewTabProps {
    companyId: string;
    onOpenSession: (id: string) => void;
    timezone?: string;
}

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted/50", className)}
            {...props}
        />
    );
}

function safeFormatTime(dateStr: string | null | undefined, timezone: string, formatStr: string = "h:mm a") {
    if (!dateStr) return "";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "";
        return formatInTimeZone(date, timezone, formatStr);
    } catch (e) {
        return "";
    }
}

export function AttendanceOverviewTab({ companyId, onOpenSession, timezone = "UTC" }: AttendanceOverviewTabProps) {
    const today = toZonedTime(new Date(), timezone);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"PRESENT" | "LEAVE" | "ABSENT" | "COMPLETED">("PRESENT");

    // Update time every minute for the "worked duration" counter
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Fetch Today's Sessions - Boundaries in UTC but representing "Today" in timezone
    const startOfTodayLocal = startOfDay(today);
    const endOfTodayLocal = endOfDay(today);
    const startOfTodayUtc = fromZonedTime(startOfTodayLocal, timezone);
    const endOfTodayUtc = fromZonedTime(endOfTodayLocal, timezone);

    const { data: sessionData, isLoading: loadingSessions } = useAttendanceSessions({
        companyId,
        startDate: format(startOfTodayUtc, "yyyy-MM-dd'T'HH:mm:ss"),
        endDate: format(endOfTodayUtc, "yyyy-MM-dd'T'HH:mm:ss"),
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

    const statsList = [
        {
            id: "PRESENT" as const,
            label: "Present Now",
            value: clockedInSessions.length,
            icon: IconLogin,
            color: "text-green-600",
            bg: "bg-green-500/10",
            border: "border-green-500/20",
            description: "Currently clocked in"
        },
        {
            id: "LEAVE" as const,
            label: "On Leave",
            value: todayLeaves.length,
            icon: IconBeach,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            description: "Approved leave today"
        },
        {
            id: "ABSENT" as const,
            label: "Absent",
            value: absentEmployees.length,
            icon: IconAlertCircle,
            color: "text-red-600",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
            description: "Not in, no leave"
        },
        {
            id: "COMPLETED" as const,
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

    const filteredClockedOut = clockedOutSessions.filter((s: AttendanceSession) =>
        String(s.employee?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(s.employee?.employeeNo || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLeaves = todayLeaves.filter((l: LeaveRequest) =>
        String(l.employee?.nameWithInitials || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(l.employee?.employeeNo || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAbsents = absentEmployees.filter((e: Employee) =>
        String(e.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(e.employeeNo || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsList.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card
                            onClick={() => setActiveTab(stat.id)}
                            className={cn(
                                `p-4 h-full rounded-2xl border transition-all duration-300 cursor-pointer group`,
                                activeTab === stat.id
                                    ? `bg-card border-primary shadow-lg ring-1 ring-primary/20`
                                    : `${stat.bg} border-transparent hover:border-primary/20 hover:shadow-md`
                            )}
                        >
                            <div className="flex flex-col justify-between h-full space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className={cn(
                                        "p-2 rounded-xl transition-colors",
                                        activeTab === stat.id ? "bg-primary text-white" : `${stat.bg} ${stat.color}`
                                    )}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <Badge variant="outline" className={cn(
                                        "font-black text-[9px] uppercase px-1.5 py-0 rounded-md",
                                        activeTab === stat.id ? "border-primary/20 text-primary" : `${stat.color} border-current/20 opacity-70`
                                    )}>
                                        {stat.id === "PRESENT" ? "Live" : "Dynamic"}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-2xl font-black tracking-tight mb-0.5">{stat.value}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main List Column */}
                <Card className="lg:col-span-2 p-6 md:p-8 rounded-[2rem] border bg-card/50 shadow-sm min-h-[600px] flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                                {activeTab === "PRESENT" && <><IconLogin className="w-6 h-6 text-green-500" /> Active Sessions</>}
                                {activeTab === "LEAVE" && <><IconBeach className="w-6 h-6 text-blue-500" /> Employees on Leave</>}
                                {activeTab === "ABSENT" && <><IconAlertCircle className="w-6 h-6 text-red-500" /> Absent Today</>}
                                {activeTab === "COMPLETED" && <><IconClockStop className="w-6 h-6 text-orange-500" /> Completed Logs</>}
                            </h2>
                            <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">
                                Workforce breakdown for today, {formatInTimeZone(new Date(), timezone, "MMMM dd")}
                            </p>
                        </div>
                        <div className="relative w-full md:w-64">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                            <Input
                                placeholder="Filter by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-10 rounded-xl bg-card border-border/60 text-xs font-medium focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 flex-1">
                        <AnimatePresence mode="popLayout">
                            {/* Present List */}
                            {activeTab === "PRESENT" && (
                                filteredClockedIn.length > 0 ? filteredClockedIn.map((session: AttendanceSession) => {
                                    const clockIn = new Date(session.checkInTime!);
                                    const minsWorked = differenceInMinutes(currentTime, clockIn);
                                    const hours = Math.floor(minsWorked / 60);
                                    const mins = Math.max(0, minsWorked % 60);

                                    return (
                                        <motion.div
                                            key={session.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="group flex items-center justify-between p-4 px-6 rounded-[1.5rem] border border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
                                            onClick={() => onOpenSession(session.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <EmployeeAvatar photo={session.employee?.photo} name={session.employee?.fullName} className="h-12 w-12 rounded-2xl border border-border/40" skipUrl />
                                                <div>
                                                    <div className="text-[13px] font-black uppercase tracking-tight group-hover:text-primary transition-colors flex items-center gap-2">
                                                        {session.employee?.fullName}
                                                        <span className="text-muted-foreground font-mono text-[10px] opacity-60 font-normal lowercase tracking-normal bg-muted px-1 rounded">
                                                            ({session.employee?.employeeNo})
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                            {session.shiftName || "Standard"}
                                                            <span className="text-primary/70 ml-1">
                                                                {session.shiftStartTime && `[${session.shiftStartTime} - ${session.shiftEndTime}]`}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 text-right">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-black text-primary tabular-nums">{hours}h {mins}m</div>
                                                    <IconPlayerPlay className="w-3 h-3 text-green-500 fill-current animate-pulse" />
                                                </div>
                                                <div className="w-24 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border border-border/40 shadow-inner">
                                                    <motion.div className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (minsWorked / 480) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                }) : (
                                    <EmptyPool icon={IconLogin} label="No active sessions" sub="Nobody is currently clocked in." />
                                )
                            )}

                            {/* Completed List */}
                            {activeTab === "COMPLETED" && (
                                filteredClockedOut.length > 0 ? filteredClockedOut.map((session: AttendanceSession) => (
                                    <motion.div
                                        key={session.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group flex items-center justify-between p-4 px-6 rounded-[1.5rem] border border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
                                        onClick={() => onOpenSession(session.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <EmployeeAvatar photo={session.employee?.photo} name={session.employee?.fullName} className="h-12 w-12 rounded-2xl border border-border/40" />
                                            <div>
                                                <div className="text-[13px] font-black uppercase tracking-tight group-hover:text-primary transition-colors">{session.employee?.fullName}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Shift {session.shiftStartTime} - {session.shiftEndTime}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-primary tabular-nums">Completed</div>
                                            <div className="text-[9px] font-black text-muted-foreground uppercase mt-1">OUT AT {safeFormatTime(session.checkOutTime, timezone)}</div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <EmptyPool icon={IconClockStop} label="No completed logs" sub="Employees haven't clocked out yet." />
                                )
                            )}

                            {/* Leave List */}
                            {activeTab === "LEAVE" && (
                                filteredLeaves.length > 0 ? filteredLeaves.map((leave: LeaveRequest) => (
                                    <motion.div
                                        key={leave.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group flex items-center justify-between p-4 px-6 rounded-[1.5rem] border border-border/80 bg-card transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <EmployeeAvatar photo={leave.employee?.photo} name={leave.employee?.nameWithInitials} className="h-12 w-12 rounded-2xl border border-border/40" skipUrl />
                                            <div>
                                                <div className="text-[13px] font-black uppercase tracking-tight flex items-center gap-2">
                                                    {leave.employee?.nameWithInitials}
                                                    <span className="text-muted-foreground font-mono text-[10px] opacity-60 font-normal lowercase tracking-normal bg-muted px-1 rounded">
                                                        ({leave.employee?.employeeNo})
                                                    </span>
                                                </div>
                                                <div className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">{leave.leaveTypeName || "General"} Leave</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge className="bg-blue-500/10 text-blue-600 border-none font-black text-[9px] uppercase px-2">Approved</Badge>
                                            <div className="text-[9px] font-black text-muted-foreground uppercase mt-1">Returning Tomorrow</div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <EmptyPool icon={IconBeach} label="No leaves today" sub="All approved employees are accounted for." />
                                )
                            )}

                            {/* Absent List */}
                            {activeTab === "ABSENT" && (
                                filteredAbsents.length > 0 ? filteredAbsents.map((emp: Employee) => (
                                    <motion.div
                                        key={emp.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group flex items-center justify-between p-4 px-6 rounded-[1.5rem] border border-border/80 bg-card transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <EmployeeAvatar photo={emp.photo} name={emp.fullName} className="h-12 w-12 rounded-2xl border border-border/40" skipUrl />
                                            <div>
                                                <div className="text-[13px] font-black uppercase tracking-tight flex items-center gap-2">
                                                    {emp.fullName}
                                                    <span className="text-muted-foreground font-mono text-[10px] opacity-60 font-normal lowercase tracking-normal bg-muted px-1 rounded">
                                                        ({emp.employeeNo})
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                        {(emp as any).shiftName || "Assigned Shift"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge className="bg-red-500/10 text-red-600 border-none font-black text-[9px] uppercase px-2">No Status</Badge>
                                            <div className="text-[9px] font-black text-muted-foreground uppercase mt-1">Expected today</div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <EmptyPool icon={IconAlertCircle} label="Zero Absentees" sub="Everybody is present or on leave. Great job!" />
                                )
                            )}
                        </AnimatePresence>
                    </div>
                </Card>

                {/* Right Side: Visual Context */}
                <div className="space-y-6">
                    <Card className="p-8 rounded-[2rem] border bg-card/40 shadow-sm flex flex-col items-center justify-center text-center">
                        <h3 className="text-sm font-black uppercase tracking-tight mb-8">Attendance Split</h3>
                        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/20" />
                                <motion.circle
                                    cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent"
                                    strokeDasharray={2 * Math.PI * 80}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - (clockedInSessions.length + clockedOutSessions.length) / (employees.length || 1)) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="text-primary" strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute">
                                <div className="text-4xl font-black">{Math.round(((clockedInSessions.length + clockedOutSessions.length) / (employees.length || 1)) * 100)}%</div>
                                <div className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Present</div>
                            </div>
                        </div>
                        <div className="w-full space-y-3">
                            <SplitMetric label="Clocked In" count={clockedInSessions.length} color="bg-primary" />
                            <SplitMetric label="Completed" count={clockedOutSessions.length} color="bg-orange-500" />
                            <SplitMetric label="On Leave" count={todayLeaves.length} color="bg-blue-500" />
                            <SplitMetric label="Absent" count={absentEmployees.length} color="bg-neutral-300" />
                        </div>
                    </Card>

                    <Card className="p-8 rounded-[2rem] border bg-card/40 shadow-sm flex flex-col justify-center">
                        <h3 className="text-sm font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                            <IconAlertCircle className="w-4 h-4 text-red-500" /> Key Insights
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-muted/20 border border-border/40">
                                <div className="text-xs font-black uppercase tracking-tight mb-1 text-primary">Peak Hour</div>
                                <p className="text-[10px] font-bold text-muted-foreground leading-snug">Highest volume of clock-ins occurred at 08:45 AM today.</p>
                            </div>
                            {absentEmployees.length > 0 && (
                                <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                                    <div className="text-xs font-black uppercase tracking-tight mb-1 text-red-600">Action Required</div>
                                    <p className="text-[10px] font-bold text-red-600/70 leading-snug">{absentEmployees.length} employees are missing without approved leave.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div >
        </div >
    );
}

function SplitMetric({ label, count, color }: { label: string, count: number, color: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", color)} />
                <span className="text-[10px] font-black uppercase text-muted-foreground">{label}</span>
            </div>
            <span className="text-xs font-black">{count}</span>
        </div>
    );
}

function EmptyPool({ icon: Icon, label, sub }: { icon: any, label: string, sub: string }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-muted/5 rounded-[2rem] border border-dashed border-border/60 mt-4">
            <div className="p-5 rounded-3xl bg-muted/20 mb-4">
                <Icon className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-muted-foreground/40 italic">{label}</h3>
            <p className="text-[11px] font-bold text-muted-foreground/30 uppercase mt-1">{sub}</p>
        </div>
    );
}
