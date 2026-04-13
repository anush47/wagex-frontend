"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    IconBuildingSkyscraper, 
    IconUsers, 
    IconCalendarStats, 
    IconArrowUpRight,
    IconClockBolt,
    IconClipboardList,
    IconPlus,
    IconFileText,
    IconActivity,
    IconChevronRight,
    IconLoader2
} from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useEmployerDashboard } from "@/hooks/use-dashboard";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
    const t = useTranslations("Common");
    const { user } = useAuthStore();
    const { data: stats, isLoading } = useEmployerDashboard();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    if (isLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                <IconLoader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-xs font-black text-neutral-400 uppercase tracking-widest animate-pulse">
                    Updating dashboard...
                </p>
            </div>
        );
    }

    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-8 pb-12"
        >
            {/* Greeting */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Employer Portal</p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
                        Hi, {user?.email?.split('@')[0]}
                    </h1>
                    <p className="text-neutral-500 font-bold">
                        Workplace status for today.
                    </p>
                </div>
                
                <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-5 py-3 rounded-2xl">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Current Date</p>
                        <p className="text-sm font-black text-neutral-900 dark:text-white">
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Functional Actions */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickActionButton 
                    label="Run Payroll" 
                    icon={IconCalendarStats} 
                    href="/employer-portal/companies"
                    description="Monthly salaries"
                    variant="primary"
                />
                <QuickActionButton 
                    label="Add Company" 
                    icon={IconPlus} 
                    href="/employer-portal/companies/new"
                    description="New workspace"
                    variant="outline"
                />
                <QuickActionButton 
                    label="Add Employee" 
                    icon={IconPlus} 
                    href="/employer-portal/companies"
                    description="Onboard member"
                    variant="outline"
                />
            </motion.div>

            {/* Key Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Companies" 
                    value={stats?.companiesCount || 0}
                    icon={IconBuildingSkyscraper}
                    color="blue"
                    index={0}
                />
                <StatCard 
                    title="Employees" 
                    value={stats?.employeesCount || 0}
                    icon={IconUsers}
                    color="emerald"
                    index={1}
                />
                <StatCard 
                    title="Leave Requests" 
                    value={stats?.pendingLeavesCount || 0}
                    icon={IconClipboardList}
                    color="orange"
                    index={2}
                    badge={stats?.pendingLeavesCount ? `${stats.pendingLeavesCount} pending` : undefined}
                />
                <StatCard 
                    title="Attendance" 
                    value={stats?.attendance?.present || 0}
                    subValue={`/ ${stats?.attendance?.total || 0}`}
                    icon={IconClockBolt}
                    color="indigo"
                    index={3}
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-7 lg:items-start">
                {/* Attendance Summary */}
                <motion.div variants={item} className="lg:col-span-4 space-y-6">
                    <Card className="rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2 uppercase">
                                        Today's Attendance
                                    </CardTitle>
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Real-time breakdown</p>
                                </div>
                                <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5">
                                    Reports <IconChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="grid grid-cols-3 gap-6">
                                <AttendanceMetric 
                                    label="On Time" 
                                    value={stats?.attendance?.present ? stats.attendance.present - (stats.attendance.late || 0) : 0} 
                                    color="emerald" 
                                />
                                <AttendanceMetric 
                                    label="Late" 
                                    value={stats?.attendance?.late || 0} 
                                    color="orange" 
                                />
                                <AttendanceMetric 
                                    label="Absent" 
                                    value={stats?.attendance?.absent || 0} 
                                    color="rose" 
                                />
                            </div>

                            <div className="mt-8 flex h-4 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 shadow-inner">
                                <AttendanceBar 
                                    percentage={stats?.attendance?.total ? ((stats.attendance.present - (stats.attendance.late || 0)) / stats.attendance.total) * 100 : 0} 
                                    color="bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                                />
                                <AttendanceBar 
                                    percentage={stats?.attendance?.total ? ((stats.attendance.late || 0) / stats.attendance.total) * 100 : 0} 
                                    color="bg-orange-500 dark:bg-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]" 
                                />
                                <AttendanceBar 
                                    percentage={stats?.attendance?.total ? (stats.attendance.absent / stats.attendance.total) * 100 : 0} 
                                    color="bg-rose-500 dark:bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]" 
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid sm:grid-cols-2 gap-4">
                       <ResourceCard 
                            title="Forms" 
                            desc="EPF/ETF and Taxes" 
                            icon={IconFileText} 
                            href="/employer-portal/companies"
                        />
                       <ResourceCard 
                            title="Policies" 
                            desc="Rules & Settings" 
                            icon={IconClipboardList} 
                            href="/employer-portal/companies"
                        />
                    </div>
                </motion.div>

                {/* Activity */}
                <motion.div variants={item} className="lg:col-span-3">
                    <Card className="rounded-[3rem] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-2 overflow-hidden h-full">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3 uppercase">
                                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <IconActivity className="h-4 w-4" />
                                </div>
                                Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="space-y-6">
                                {stats?.recentActivity?.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                                        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">No activity yet.</p>
                                    </div>
                                ) : (
                                    stats?.recentActivity.map((act) => (
                                        <div key={act.id} className="flex items-start gap-4 group">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-neutral-100 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900",
                                                act.type === 'COMPANY' ? "text-blue-600" :
                                                act.type === 'EMPLOYEE' ? "text-emerald-600" :
                                                act.type === 'LEAVE' ? "text-orange-600" : "text-indigo-600"
                                            )}>
                                                {act.type === 'COMPANY' ? <IconBuildingSkyscraper className="h-5 w-5" /> :
                                                 act.type === 'EMPLOYEE' ? <IconUsers className="h-5 w-5" /> :
                                                 act.type === 'LEAVE' ? <IconClipboardList className="h-5 w-5" /> :
                                                 <IconCalendarStats className="h-5 w-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                                    <p className="text-[11px] font-black text-neutral-900 dark:text-white truncate uppercase tracking-tight">
                                                        {act.details}
                                                    </p>
                                                    <span className="text-[9px] font-bold text-neutral-400 uppercase">
                                                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest line-clamp-1">
                                                    {act.action}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <Button variant="outline" className="w-full mt-10 rounded-2xl h-12 font-black text-[10px] uppercase tracking-[0.2em] border-neutral-200 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-800 transition-all group shadow-sm bg-white dark:bg-neutral-900">
                                Full Log <IconArrowUpRight className="h-4 w-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}

function StatCard({ 
    title, 
    value, 
    subValue,
    icon: Icon, 
    color, 
    index,
    badge
}: { 
    title: string; 
    value: number | string; 
    subValue?: string;
    icon: any; 
    color: 'blue' | 'emerald' | 'orange' | 'indigo' | 'rose';
    index: number;
    badge?: string;
}) {
    const iconColors = {
        blue: "text-blue-600 bg-blue-500/10 border-blue-500/20",
        emerald: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
        orange: "text-orange-600 bg-orange-500/10 border-orange-500/20",
        indigo: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
        rose: "text-rose-600 bg-rose-500/10 border-rose-500/20"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
        >
            <Card className="rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden p-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border", iconColors[color])}>
                        <Icon className="h-6 w-6" />
                    </div>
                    {badge && (
                        <Badge className="rounded-md font-black text-[9px] uppercase tracking-widest bg-orange-500 text-white border-none">
                            {badge}
                        </Badge>
                    )}
                </div>
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white leading-none">{value}</span>
                        {subValue && <span className="text-lg font-bold text-neutral-400">{subValue}</span>}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mt-2">{title}</p>
                </div>
            </Card>
        </motion.div>
    );
}

function QuickActionButton({ 
    label, 
    icon: Icon, 
    href, 
    description,
    variant 
}: { 
    label: string, 
    icon: any, 
    href: string, 
    description: string,
    variant: 'primary' | 'outline'
}) {
    return (
        <Link href={href} className="flex-1">
            <Button 
                variant={variant === 'primary' ? 'default' : 'outline'}
                className={cn(
                    "w-full h-24 rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all p-0 border-none relative overflow-hidden group",
                    variant === 'primary' 
                        ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] dark:text-neutral-950" 
                        : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm"
                )}
            >
                <div className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center transition-all",
                    variant === 'primary' ? "bg-primary-foreground/20 dark:bg-black/10" : "bg-neutral-100 dark:bg-neutral-800 text-primary group-hover:bg-primary group-hover:text-white"
                )}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                    <p className="text-[11px] font-black uppercase tracking-widest">{label}</p>
                    <p className={cn("text-[8px] font-black opacity-60 uppercase", variant === 'primary' ? "text-primary-foreground/80 dark:text-neutral-950/70" : "text-neutral-400")}>{description}</p>
                </div>
            </Button>
        </Link>
    );
}

function AttendanceMetric({ label, value, color }: { label: string, value: number, color: 'emerald' | 'orange' | 'rose' }) {
    const textColors = {
        emerald: "text-emerald-600 dark:text-emerald-400",
        orange: "text-orange-600 dark:text-orange-400",
        rose: "text-rose-600 dark:text-rose-400"
    };

    return (
        <div className="flex flex-col items-center gap-1.5">
            <span className={cn("text-3xl font-black", textColors[color])}>{value}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{label}</span>
        </div>
    );
}

function AttendanceBar({ percentage, color }: { percentage: number, color: string }) {
    if (percentage === 0) return null;
    return (
        <div 
            className={cn("h-full transition-all duration-700", color)} 
            style={{ width: `${percentage}%` }} 
        />
    );
}

function ResourceCard({ title, desc, icon: Icon, href }: { title: string, desc: string, icon: any, href: string }) {
    return (
        <Link href={href}>
            <div className="flex items-center gap-4 p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 hover:border-primary/20 transition-all group shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-primary shadow-sm">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-[11px] font-black text-neutral-900 dark:text-white uppercase tracking-tight">{title}</p>
                   <p className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter uppercase">{desc}</p>
                </div>
            </div>
        </Link>
    );
}
