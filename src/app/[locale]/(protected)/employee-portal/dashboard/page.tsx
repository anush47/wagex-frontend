"use client";

import { useAuthStore } from "@/stores/auth.store";
import { IconLayoutDashboard } from "@tabler/icons-react";
import { DashboardQuickActions } from "./components/DashboardQuickActions";
import { AttendanceStatusCard } from "./components/AttendanceStatusCard";
import { RecentSessionsCard } from "./components/RecentSessionsCard";
import { PendingActionsCard } from "./components/PendingActionsCard";
import { UpcomingLeavesCard } from "./components/UpcomingLeavesCard";
import { LeaveBalanceSummaryCard } from "./components/LeaveBalanceSummaryCard";

export default function EmployeeDashboard() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 text-primary">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <IconLayoutDashboard className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight italic">Dashboard</h1>
                    </div>
                    <p className="text-neutral-500 font-medium text-lg max-w-xl leading-relaxed">
                        Welcome back, <span className="text-foreground font-black underline decoration-primary/30 underline-offset-4">{user?.nameWithInitials || user?.fullName || "User"}</span>.
                    </p>
                </div>
                <DashboardQuickActions />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content (Left) */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <AttendanceStatusCard />
                    <RecentSessionsCard />
                </div>

                {/* Sidebar (Right) */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <PendingActionsCard />
                    <UpcomingLeavesCard />
                    <LeaveBalanceSummaryCard />
                </div>
            </div>
        </div>
    );
}
