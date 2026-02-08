"use client";

import React, { useState, useMemo } from "react";
import {
    IconClock,
    IconAlertCircle,
    IconBeach,
    IconTrendingUp,
    IconBriefcase,
    IconChartBar,
    IconRefresh,
    IconLogout,
    IconUser,
    IconChevronRight,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAttendanceSessions } from "@/hooks/use-attendance";
import { useLeaveRequests } from "@/hooks/use-leaves";
import { cn } from "@/lib/utils";
import type { AttendanceSession } from "@/types/attendance";
import type { LeaveRequest } from "@/types/leave";
import { LeaveRequestType } from "@/types/leave";
import { SalaryPeriodQuickSelect } from "./SalaryPeriodQuickSelect";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";
import { motion, AnimatePresence } from "framer-motion";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";

interface AttendanceStatsTabProps {
    companyId: string;
    startDate?: string;
    endDate?: string;
    initialDate?: string;
    employeeId?: string;
    onFilterChange?: (filters: any) => void;
}

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("animate-pulse rounded-md bg-muted/50", className)} {...props} />;
}

export function AttendanceStatsTab({
    companyId,
    startDate,
    endDate,
    initialDate,
    employeeId,
    onFilterChange,
}: AttendanceStatsTabProps) {
    const [activeSection, setActiveSection] = useState<string | null>("all");

    // Fetch Sessions for the selected period & employee
    const {
        data: sessionsData,
        isLoading: sessionsLoading,
        refetch: refetchSessions,
    } = useAttendanceSessions({
        companyId,
        employeeId,
        startDate: startDate || initialDate,
        endDate: endDate || initialDate,
        limit: 1000,
    });

    // Fetch Leaves for the same period & employee (Note: In a real app we'd fetch for many employees if employeeId is null)
    const {
        data: leavesData,
        isLoading: leavesLoading,
        refetch: refetchLeaves,
    } = useLeaveRequests(companyId, {
        employeeId,
    });

    const sessions = (sessionsData as any)?.items || [];
    const leaves = (leavesData as any) || [];

    // Filter leaves to only include those within the date range
    const filteredLeaves = useMemo(() => {
        if (!startDate && !endDate && !initialDate) return leaves;
        const start = new Date(startDate || initialDate || "");
        const end = new Date(endDate || initialDate || "");

        return leaves.filter((l: LeaveRequest) => {
            if (l.status !== "APPROVED") return false;
            const leaveStart = new Date(l.startDate);
            const leaveEnd = new Date(l.endDate);
            return (leaveStart >= start && leaveStart <= end) || (leaveEnd >= start && leaveEnd <= end);
        });
    }, [leaves, startDate, endDate, initialDate]);

    // Aggregation Logic
    const stats = useMemo(() => {
        if (sessions.length === 0 && filteredLeaves.length === 0) return null;

        let totalWorkMinutes = 0;
        let totalOvertimeMinutes = 0;
        let totalSessions = sessions.length;

        const employeeStats: Record<string, any> = {};
        const lateEmployees = new Map<string, any>();
        const earlyLeaveEmployees = new Map<string, any>();
        const overtimeEmployees = new Map<string, any>();
        const leaveEmployees = new Map<string, any>();

        // Process Sessions
        sessions.forEach((s: AttendanceSession) => {
            totalWorkMinutes += s.workMinutes || 0;
            totalOvertimeMinutes += s.overtimeMinutes || 0;

            if (s.employeeId) {
                if (!employeeStats[s.employeeId]) {
                    employeeStats[s.employeeId] = {
                        id: s.employeeId,
                        fullName: s.employee?.fullName || "Unknown",
                        employeeNo: s.employee?.employeeNo,
                        workMinutes: 0,
                        overtimeMinutes: 0,
                        sessions: 0,
                        lateCount: 0,
                        earlyLeaveCount: 0,
                    };
                }

                const est = employeeStats[s.employeeId];
                est.workMinutes += s.workMinutes || 0;
                est.overtimeMinutes += s.overtimeMinutes || 0;
                est.sessions += 1;

                if (s.isLate) {
                    est.lateCount += 1;
                    lateEmployees.set(s.employeeId, est);
                }
                if (s.isEarlyLeave) {
                    est.earlyLeaveCount += 1;
                    earlyLeaveEmployees.set(s.employeeId, est);
                }
                if ((s.overtimeMinutes || 0) > 0) {
                    overtimeEmployees.set(s.employeeId, est);
                }
            }
        });

        // Process Leaves
        let fullDaysCount = 0;
        let halfDaysCount = 0;
        let shortLeavesCount = 0;

        filteredLeaves.forEach((l: LeaveRequest) => {
            if (l.type === LeaveRequestType.FULL_DAY) fullDaysCount += l.days;
            else if (l.type === LeaveRequestType.HALF_DAY_FIRST || l.type === LeaveRequestType.HALF_DAY_LAST)
                halfDaysCount += 0.5;
            else if (l.type === LeaveRequestType.SHORT_LEAVE) shortLeavesCount += 1;

            if (l.employeeId) {
                if (!leaveEmployees.has(l.employeeId)) {
                    leaveEmployees.set(l.employeeId, {
                        id: l.employeeId,
                        fullName: l.employee?.fullName || "Unknown",
                        employeeNo: l.employee?.employeeNo,
                        fullDays: 0,
                        halfDays: 0,
                        shortLeaves: 0,
                    });
                }
                const le = leaveEmployees.get(l.employeeId);
                if (l.type === LeaveRequestType.FULL_DAY) le.fullDays += l.days;
                else if (l.type === LeaveRequestType.HALF_DAY_FIRST || l.type === LeaveRequestType.HALF_DAY_LAST)
                    le.halfDays += 0.5;
                else if (l.type === LeaveRequestType.SHORT_LEAVE) le.shortLeaves += 1;
            }
        });

        const avgWorkMinutes = totalSessions > 0 ? totalWorkMinutes / totalSessions : 0;

        return {
            totalSessions,
            totalWorkMinutes,
            totalOvertimeMinutes,
            avgWorkMinutes,
            leaves: {
                totalApproved: fullDaysCount + halfDaysCount,
                fullDays: fullDaysCount,
                halfDays: halfDaysCount,
                shortLeaves: shortLeavesCount,
            },
            lateEmployees: Array.from(lateEmployees.values()).sort((a, b) => b.lateCount - a.lateCount),
            earlyLeaveEmployees: Array.from(earlyLeaveEmployees.values()).sort((a, b) => b.earlyLeaveCount - a.earlyLeaveCount),
            overtimeEmployees: Array.from(overtimeEmployees.values()).sort((a, b) => b.overtimeMinutes - a.overtimeMinutes),
            leaveEmployees: Array.from(leaveEmployees.values()).sort((a, b) => (b.fullDays + b.halfDays) - (a.fullDays + a.halfDays)),
        };
    }, [sessions, filteredLeaves, employeeId]);

    const formatMins = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = Math.round(mins % 60);
        return `${h}h ${m}m`;
    };

    const handleRefresh = () => {
        refetchSessions();
        refetchLeaves();
    };

    const isLoading = sessionsLoading || leavesLoading;

    if (isLoading && sessions.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-[200px] rounded-xl" />
                    <Skeleton className="h-10 w-[200px] rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Filters Header */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SalaryPeriodQuickSelect
                        companyId={companyId}
                        onRangeSelect={(start, end) => onFilterChange?.({ startDate: start, endDate: end })}
                        currentStart={startDate || initialDate}
                        currentEnd={endDate || initialDate}
                    />

                    <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl border border-border/50">
                        <div className="flex items-center gap-1.5 px-3">
                            <span className="text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">From</span>
                            <input
                                type="date"
                                value={startDate || initialDate || ""}
                                onChange={(e) => onFilterChange?.({ startDate: e.target.value })}
                                className="bg-transparent border-none text-xs font-bold focus:ring-0 p-0 w-[110px] text-foreground"
                            />
                        </div>
                        <div className="h-4 w-[1px] bg-border" />
                        <div className="flex items-center gap-1.5 px-3">
                            <span className="text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">To</span>
                            <input
                                type="date"
                                value={endDate || initialDate || ""}
                                onChange={(e) => onFilterChange?.({ endDate: e.target.value })}
                                className="bg-transparent border-none text-xs font-bold focus:ring-0 p-0 w-[110px] text-foreground"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-[220px]">
                        <SearchableEmployeeSelect
                            companyId={companyId}
                            value={employeeId || undefined}
                            onSelect={(id) => onFilterChange?.({ employeeId: id })}
                            placeholder="All Employees"
                        />
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="rounded-xl h-10 px-4 font-bold text-xs uppercase tracking-wider gap-2 shrink-0 shadow-sm"
                >
                    <IconRefresh className={cn("h-4 w-4", isLoading && "animate-spin text-primary")} />
                    Refresh
                </Button>
            </div>

            {!stats ? (
                <Card className="p-12 text-center md:p-20 border-dashed border-2 flex flex-col items-center justify-center bg-muted/5">
                    <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                        <IconChartBar className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2 italic">No data found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto text-sm font-medium">
                        We couldn't find any attendance logs or leaves for the selected period.
                    </p>
                </Card>
            ) : (
                <>
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card
                            className={cn(
                                "p-5 rounded-2xl border transition-all cursor-pointer bg-card shadow-sm hover:shadow-md",
                                activeSection === "workload" ? "border-primary ring-1 ring-primary/20" : "border-border/80"
                            )}
                            onClick={() => setActiveSection("workload")}
                        >
                            <div className="flex gap-4 items-start">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                    <IconBriefcase className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black tracking-tight">{formatMins(stats.totalWorkMinutes)}</div>
                                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mt-0.5 whitespace-nowrap">
                                        Work Volume
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card
                            className={cn(
                                "p-5 rounded-2xl border transition-all cursor-pointer bg-card shadow-sm hover:shadow-md",
                                activeSection === "overtime" ? "border-blue-500 ring-1 ring-blue-500/20" : "border-border/80"
                            )}
                            onClick={() => setActiveSection("overtime")}
                        >
                            <div className="flex gap-4 items-start">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                    <IconClock className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black tracking-tight">{formatMins(stats.totalOvertimeMinutes)}</div>
                                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mt-0.5 whitespace-nowrap">
                                        Overtime
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card
                            className={cn(
                                "p-5 rounded-2xl border transition-all cursor-pointer bg-card shadow-sm hover:shadow-md",
                                activeSection === "punctuality" ? "border-orange-500 ring-1 ring-orange-500/20" : "border-border/80"
                            )}
                            onClick={() => setActiveSection("punctuality")}
                        >
                            <div className="flex gap-4 items-start">
                                <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                                    <IconAlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black tracking-tight">{stats.lateEmployees.length}</div>
                                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mt-0.5 whitespace-nowrap">
                                        Late Comers
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card
                            className={cn(
                                "p-5 rounded-2xl border transition-all cursor-pointer bg-card shadow-sm hover:shadow-md",
                                activeSection === "leaves" ? "border-emerald-500 ring-1 ring-emerald-500/20" : "border-border/80"
                            )}
                            onClick={() => setActiveSection("leaves")}
                        >
                            <div className="flex gap-4 items-start">
                                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                                    <IconBeach className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black tracking-tight">{stats.leaves.totalApproved}d</div>
                                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mt-0.5 whitespace-nowrap">
                                        Leaves Approved
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Efficiency Section - ALWAYS VISIBLE */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="p-6 md:p-8 rounded-2xl border bg-card shadow-sm h-full">
                                <div className="mb-8">
                                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                        <IconTrendingUp className="w-5 h-5 text-emerald-500" />
                                        Workforce Split
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-semibold">Overall capacity insights</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/30 transition-all cursor-pointer shadow-sm group" onClick={() => setActiveSection("workload")}>
                                        <div className="flex items-center justify-between mb-3">
                                            <Badge variant="outline" className="text-[10px] font-black uppercase bg-primary/10 text-primary border-primary/20">Sessions</Badge>
                                            <span className="text-sm font-black text-primary group-hover:underline">{stats.totalSessions} Total</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-muted-foreground/80 leading-snug">
                                            Avg daily capacity was <strong className="text-foreground">{formatMins(stats.avgWorkMinutes)}</strong> per session across {stats.totalSessions} logs.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl border border-border/80 bg-card hover:border-orange-500/30 transition-all cursor-pointer shadow-sm group" onClick={() => setActiveSection("punctuality")}>
                                        <div className="flex items-center justify-between mb-3">
                                            <Badge variant="outline" className="text-[10px] font-black uppercase bg-orange-500/10 text-orange-600 border-orange-500/20">Punctuality</Badge>
                                            <span className="text-sm font-black text-orange-600 group-hover:underline">{stats.lateEmployees.length + stats.earlyLeaveEmployees.length} People</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-0.5">
                                                <div className="text-sm font-black">{stats.lateEmployees.length}</div>
                                                <div className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest truncate">Late Clock-ins</div>
                                            </div>
                                            <div className="space-y-0.5 border-l pl-4 border-border/50">
                                                <div className="text-sm font-black">{stats.earlyLeaveEmployees.length}</div>
                                                <div className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest truncate">Early Leaves</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl border border-border/80 bg-card hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm group" onClick={() => setActiveSection("leaves")}>
                                        <div className="flex items-center justify-between mb-3">
                                            <Badge variant="outline" className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Leave Usage</Badge>
                                            <span className="text-sm font-black text-emerald-600 group-hover:underline">{stats.leaves.totalApproved} Days</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <div className="text-center">
                                                <div className="text-xs font-black">{stats.leaves.fullDays}</div>
                                                <div className="text-[8px] font-black uppercase text-muted-foreground/60">Full</div>
                                            </div>
                                            <div className="text-center border-l pl-2 border-border/50">
                                                <div className="text-xs font-black">{stats.leaves.halfDays}</div>
                                                <div className="text-[8px] font-black uppercase text-muted-foreground/60">Half</div>
                                            </div>
                                            <div className="text-center border-l pl-2 border-border/50">
                                                <div className="text-xs font-black">{stats.leaves.shortLeaves}</div>
                                                <div className="text-[8px] font-black uppercase text-muted-foreground/60">Short</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Right Side: Dynamic Lists based on clicked summary */}
                        <Card className="lg:col-span-2 p-6 md:p-8 rounded-2xl border bg-card shadow-sm min-h-[500px]">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                        {activeSection === "workload" && <><IconBriefcase className="w-5 h-5 text-primary" /> Workload Details</>}
                                        {activeSection === "overtime" && <><IconClock className="w-5 h-5 text-blue-500" /> Overtime Details</>}
                                        {activeSection === "punctuality" && <><IconAlertCircle className="w-5 h-5 text-orange-500" /> Punctuality Records</>}
                                        {activeSection === "leaves" && <><IconBeach className="w-5 h-5 text-emerald-500" /> Leave Records</>}
                                        {(activeSection === "all" || !activeSection) && <><IconUser className="w-5 h-5 text-primary" /> Top Performers</>}
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-semibold">
                                        Listing employees associated with this metric
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {/* Workload / Top Performers List */}
                                    {(activeSection === "workload" || activeSection === "all") && stats.overtimeEmployees.map((e) => (
                                        <EmployeeListRow key={e.id} employee={e} metric={`${formatMins(e.workMinutes)} Total`} subMetric={`${e.sessions} sessions`} />
                                    ))}

                                    {/* Overtime List */}
                                    {activeSection === "overtime" && stats.overtimeEmployees.map((e) => (
                                        <EmployeeListRow key={e.id} employee={e} metric={`${formatMins(e.overtimeMinutes)} OT`} subMetric={`${e.sessions} sessions`} color="text-blue-600" />
                                    ))}

                                    {/* Punctuality List */}
                                    {activeSection === "punctuality" && stats.lateEmployees.concat(stats.earlyLeaveEmployees).filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i).map((e) => (
                                        <EmployeeListRow
                                            key={e.id}
                                            employee={e}
                                            metric={`${e.lateCount} Late`}
                                            subMetric={`${e.earlyLeaveCount} Early Logout`}
                                            color="text-orange-600"
                                        />
                                    ))}

                                    {/* Leaves List */}
                                    {activeSection === "leaves" && stats.leaveEmployees.map((e) => (
                                        <EmployeeListRow
                                            key={e.id}
                                            employee={e}
                                            metric={`${e.fullDays + e.halfDays} Days`}
                                            subMetric={`${e.shortLeaves} short leaves`}
                                            color="text-emerald-600"
                                        />
                                    ))}
                                </AnimatePresence>

                                {((activeSection === "workload" && stats.overtimeEmployees.length === 0) ||
                                    (activeSection === "overtime" && stats.overtimeEmployees.length === 0) ||
                                    (activeSection === "punctuality" && stats.lateEmployees.length === 0 && stats.earlyLeaveEmployees.length === 0) ||
                                    (activeSection === "leaves" && stats.leaveEmployees.length === 0)) && (
                                        <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-border/60">
                                            <p className="text-sm text-neutral-400 font-black uppercase tracking-widest">No entries found for this category</p>
                                        </div>
                                    )}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}

function EmployeeListRow({ employee, metric, subMetric, color = "text-primary" }: { employee: any, metric: string, subMetric: string, color?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group flex items-center justify-between p-4 px-5 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
        >
            <div className="flex items-center gap-4">
                <EmployeeAvatar
                    photo={employee.photo}
                    name={employee.fullName}
                    className="h-11 w-11 rounded-xl shadow-sm border border-border/40"
                />
                <div>
                    <div className="text-[13px] font-black uppercase tracking-tight group-hover:text-primary transition-colors">{employee.fullName}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">#{employee.employeeNo}</div>
                </div>
            </div>
            <div className="text-right">
                <div className={cn("text-sm font-black tracking-tight", color)}>{metric}</div>
                <div className="text-[9px] font-black text-muted-foreground uppercase">{subMetric}</div>
            </div>
        </motion.div>
    );
}
