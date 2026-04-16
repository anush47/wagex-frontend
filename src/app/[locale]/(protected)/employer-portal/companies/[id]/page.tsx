"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    IconBuildingSkyscraper,
    IconMapPin,
    IconId,
    IconUsers,
    IconChartBar,
    IconClock,
    IconCalendarCheck,
    IconAlertCircle,
    IconArrowRight,
    IconActivity,
    IconCheck,
    IconClipboardList,
    IconLogin,
    IconBeach,
    IconChevronRight,
    IconCalendarEvent,
    IconHash,
    IconWorld,
    IconMail,
    IconPhone,
    IconPlayerPlay,
    IconClockStop
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useCompany } from "@/hooks/use-companies";
import { useAttendanceSessions } from "@/hooks/use-attendance";
import { useLeaveRequests } from "@/hooks/use-leaves";
import { useEmployees } from "@/hooks/use-employees";
import { Link } from "@/i18n/routing";
import { LeaveRequest, LeaveStatus } from "@/types/leave";
import { AttendanceSession } from "@/types/attendance";
import { startOfDay, endOfDay, format, differenceInMinutes, isSameDay } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { motion, AnimatePresence } from "framer-motion";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";
import { StorageImage } from "@/components/ui/storage-image";

export default function CompanyOverviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [currentTime, setCurrentTime] = useState(new Date());

    const { data: company, isLoading: loadingCompany } = useCompany(id);
    const timezone = company?.timezone || 'UTC';
    const today = toZonedTime(new Date(), timezone);

    // Sync time for duration counters
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Statistics Boundaries
    const startOfTodayUtc = fromZonedTime(startOfDay(today), timezone);
    const endOfTodayUtc = fromZonedTime(endOfDay(today), timezone);

    // Data Hooks
    const { data: sessionData, isLoading: loadingSessions } = useAttendanceSessions({
        companyId: id,
        startDate: startOfTodayUtc.toISOString(),
        endDate: endOfTodayUtc.toISOString(),
        limit: 100,
        includeActive: true,
    } as any);

    const { data: pendingLeavesData, isLoading: loadingPendingLeaves } = useLeaveRequests(id, {
        status: LeaveStatus.PENDING,
    });

    const { data: approvedLeavesData, isLoading: loadingApprovedLeaves } = useLeaveRequests(id, {
        status: LeaveStatus.APPROVED,
    });

    const { data: employeesData, isLoading: loadingEmployees } = useEmployees({
        companyId: id,
        limit: 100,
    });

    // Derived Statistics (Mirroring AttendanceOverviewTab logic)
    const stats = useMemo(() => {
        const employees = (employeesData as any)?.data || [];
        const sessions = (sessionData as any)?.items || [];
        const approvedLeaves = (approvedLeavesData as any) || [];
        const pendingLeaves = (pendingLeavesData as any) || [];

        const todayApprovedLeaves = approvedLeaves.filter((l: LeaveRequest) => {
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            return today >= startOfDay(start) && today <= endOfDay(end);
        });

        const clockedIn = sessions.filter((s: AttendanceSession) => !s.checkOutTime);
        const completed = sessions.filter((s: AttendanceSession) => 
            !!s.checkOutTime && isSameDay(new Date(s.date), today)
        );
        const presentTodayIds = new Set(
            sessions
                .filter((s: AttendanceSession) => !s.checkOutTime || isSameDay(new Date(s.date), today))
                .map((s: AttendanceSession) => s.employeeId)
        );
        const leaveIds = new Set(todayApprovedLeaves.map((l: LeaveRequest) => l.employeeId));
        const totalCount = (employeesData as any)?.meta?.total || employees.length;

        const absentCount = Math.max(0, totalCount - presentTodayIds.size - leaveIds.size);

        const pendingAttendance = sessions.filter((s: AttendanceSession) =>
            s.inApprovalStatus === 'PENDING' || s.outApprovalStatus === 'PENDING'
        ).length;

        return {
            total: totalCount,
            presentNow: clockedIn.length,
            completed: completed.length,
            onLeave: todayApprovedLeaves.length,
            absent: absentCount,
            pendingLeaves: pendingLeaves.length,
            pendingAttendance,
            clockedInRecords: clockedIn,
            presenceRate: Math.round((presentTodayIds.size / (totalCount || 1)) * 100)
        };
    }, [employeesData, sessionData, approvedLeavesData, pendingLeavesData, today]);

    if (loadingCompany || loadingSessions || loadingEmployees) {
        return <div className="p-10 space-y-4 animate-pulse">
            <div className="h-40 w-full bg-neutral-100 dark:bg-neutral-800 rounded-2xl" />
            <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded-2xl" />)}
            </div>
        </div>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-4 space-y-8 animate-in fade-in duration-500 pb-20">

            {/* COMPANY IDENTITY HEADER (MAINTAINING ALL INFO) */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="p-8 px-10 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/[0.02] via-transparent to-blue-500/[0.02] pointer-events-none" />

                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 relative z-10">
                        <div className="flex items-start md:items-center gap-10">
                            <div className="h-24 w-24 md:h-32 md:w-32 rounded-[2rem] bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-4 flex items-center justify-center shrink-0 shadow-2xl shadow-neutral-200/50 dark:shadow-none overflow-hidden">
                                <StorageImage storageKey={company?.logo} alt={company?.name} className="h-full w-full object-contain" fallback={<IconBuildingSkyscraper className="h-12 w-12 text-neutral-200" />} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">{company?.name}</h1>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg">Operational</Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
                                    <InfoLabel icon={<IconMapPin className="text-primary" />} label="Address" value={company?.address || 'N/A'} />
                                    <InfoLabel icon={<IconId className="text-blue-500" />} label="Employer No" value={company?.employerNumber || 'N/A'} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 border-t xl:border-t-0 pt-6 xl:pt-0">
                            <Link href={`/employer-portal/companies/${id}/attendance`}>
                                <Button className="rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest gap-3 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all">
                                    <IconClock className="h-5 w-5" /> Manage Attendance
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ATTENDANCE PAGE INSPIRED STATS SECTION */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatusCard
                    label="Present Now"
                    value={stats.presentNow}
                    icon={IconLogin}
                    color="text-emerald-600"
                    bg="bg-emerald-500/10"
                    border="border-emerald-500/20"
                    isLive
                />
                <StatusCard
                    label="On Leave"
                    value={stats.onLeave}
                    icon={IconBeach}
                    color="text-blue-600"
                    bg="bg-blue-500/10"
                    border="border-blue-500/20"
                />
                <StatusCard
                    label="Absent Today"
                    value={stats.absent}
                    icon={IconAlertCircle}
                    color="text-rose-600"
                    bg="bg-rose-500/10"
                    border="border-rose-500/20"
                />
                <StatusCard
                    label="Completed"
                    value={stats.completed}
                    icon={IconClockStop}
                    color="text-orange-600"
                    bg="bg-orange-500/10"
                    border="border-orange-500/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ACTIVE LIST (MIRRORING LIST STYLE FROM ATTENDANCE STATS) */}
                <Card className="lg:col-span-8 p-6 md:p-8 rounded-[2rem] border bg-card/50 shadow-sm flex flex-col min-h-[500px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                                <IconLogin className="w-6 h-6 text-emerald-500" /> Active Sessions
                            </h2>
                            <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">
                                Workforce breakdown for today
                            </p>
                        </div>
                        <Badge variant="outline" className="font-black text-[10px] uppercase border-emerald-500/20 text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded-md">Live Stream</Badge>
                    </div>

                    <div className="space-y-3 flex-1">
                        {stats.clockedInRecords.length > 0 ? (
                            stats.clockedInRecords.map((session: AttendanceSession) => {
                                const clockIn = new Date(session.checkInTime!);
                                const minsWorked = differenceInMinutes(currentTime, clockIn);
                                const hours = Math.floor(minsWorked / 60);
                                const mins = Math.max(0, minsWorked % 60);

                                return (
                                    <div key={session.id} className="group flex items-center justify-between p-4 px-6 rounded-[1.5rem] border border-border/80 bg-card hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <EmployeeAvatar photo={session.employee?.photo} name={session.employee?.fullName} className="h-12 w-12 rounded-2xl border border-border/40" skipUrl />
                                            <div>
                                                <div className="text-[13px] font-black uppercase tracking-tight group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                                                    {session.employee?.fullName}
                                                    <span className="text-muted-foreground font-mono text-[10px] opacity-60 font-normal lowercase tracking-normal bg-muted px-1 rounded">
                                                        ({session.employee?.employeeNo})
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                        {session.shiftName || "Standard Shift"}
                                                        <span className="text-emerald-500/70 ml-2 italic">Arrived {format(clockIn, "h:mm a")}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-sm font-black text-emerald-600 tabular-nums flex items-center justify-end gap-1.5">
                                                    {hours}h {mins}m <IconPlayerPlay className="w-3 h-3 text-emerald-500 fill-current animate-pulse" />
                                                </div>
                                                <div className="w-24 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mt-1.5 overflow-hidden border border-border/40 shadow-inner">
                                                    <motion.div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (minsWorked / 480) * 100)}%` }} />
                                                </div>
                                            </div>
                                            <IconChevronRight className="h-4 w-4 text-neutral-300 dark:text-neutral-700 opacity-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-muted/5 rounded-[2rem] border border-dashed border-border/60">
                                <IconActivity className="w-12 h-12 text-muted-foreground/20 mb-4" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40 italic">System Idle</h3>
                            </div>
                        )}
                    </div>
                </Card>

                {/* VISUAL ANALYTICS (MIRRORING CIRCULAR CHART FROM ATTENDANCE STATS) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* ATTENDANCE SPLIT CHART */}
                    <Card className="p-8 rounded-[2.5rem] border bg-card/40 shadow-sm flex flex-col items-center justify-center text-center">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-8">Workforce Split</h3>
                        <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-muted/20" />
                                <motion.circle
                                    cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent"
                                    strokeDasharray={2 * Math.PI * 72}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 72 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 72 * (1 - (stats.presenceRate / 100)) }}
                                    transition={{ duration: 1.5 }}
                                    className="text-primary" strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute">
                                <div className="text-3xl font-black italic">{stats.presenceRate}%</div>
                                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Engagement</div>
                            </div>
                        </div>
                        <div className="w-full space-y-3 px-2">
                            <StatusRow label="Clocked In" count={stats.presentNow} color="bg-emerald-500" />
                            <StatusRow label="Completed" count={stats.completed} color="bg-orange-500" />
                            <StatusRow label="On Leave" count={stats.onLeave} color="bg-blue-500" />
                            <StatusRow label="Expected" count={stats.absent} color="bg-neutral-300" />
                        </div>
                    </Card>

                    {/* ACTION ITEMS (MERGED LOOK) */}
                    <Card className="rounded-[2.5rem] border-rose-100 dark:border-rose-900/20 p-8 space-y-6 bg-white dark:bg-neutral-900 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Action Center</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-[10px] font-black text-rose-600 uppercase">Attention</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {stats.pendingAttendance > 0 && (
                                <Link href={`/employer-portal/companies/${id}/attendance`}>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 hover:shadow-md transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <IconClock className="h-5 w-5 text-orange-600" />
                                            <span className="text-xs font-black uppercase">{stats.pendingAttendance} Logs to Verify</span>
                                        </div>
                                        <IconArrowRight className="h-4 w-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            )}
                            {stats.pendingLeaves > 0 && (
                                <Link href={`/employer-portal/companies/${id}/leaves`}>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 hover:shadow-md transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <IconClipboardList className="h-5 w-5 text-rose-600" />
                                            <span className="text-xs font-black uppercase">{stats.pendingLeaves} New Leave Req.</span>
                                        </div>
                                        <IconArrowRight className="h-4 w-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            )}
                            {stats.pendingAttendance === 0 && stats.pendingLeaves === 0 && (
                                <div className="py-2 flex items-center gap-3 text-emerald-600/60 font-black italic text-[11px] uppercase tracking-widest justify-center">
                                    <IconCheck className="h-4 w-4" /> All Caught Up
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function StatusCard({ label, value, icon: Icon, color, bg, border, isLive }: { label: string, value: number, icon: any, color: string, bg: string, border: string, isLive?: boolean }) {
    return (
        <Card className={cn(
            "p-5 px-6 rounded-[1.5rem] border bg-card transition-all duration-300 hover:shadow-lg border-transparent hover:border-primary/40 flex flex-col justify-between h-40",
            bg,
            "dark:bg-neutral-900"
        )}>
            <div className="flex items-center justify-between">
                <div className={cn("p-2.5 rounded-xl border shadow-sm", border, color, "bg-white dark:bg-black")}>
                    <Icon className="w-5 h-5" />
                </div>
                {isLive && (
                    <Badge variant="outline" className="font-black text-[9px] uppercase border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-black rounded-md">Live</Badge>
                )}
            </div>
            <div>
                <div className="text-3xl font-black tracking-tight mb-0.5 text-neutral-900 dark:text-white uppercase">{value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">{label}</div>
            </div>
        </Card>
    );
}

function StatusRow({ label, count, color }: { label: string, count: number, color: string }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2.5">
                <div className={cn("h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-150", color)} />
                <span className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-widest">{label}</span>
            </div>
            <span className="text-xs font-black italic">{count}</span>
        </div>
    );
}

function InfoLabel({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="h-8 w-8 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                {icon}
            </div>
            <div className="space-y-0.5 overflow-hidden">
                <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">{label}</p>
                <p className="text-xs font-bold text-foreground truncate max-w-[180px] leading-tight">{value}</p>
            </div>
        </div>
    );
}
