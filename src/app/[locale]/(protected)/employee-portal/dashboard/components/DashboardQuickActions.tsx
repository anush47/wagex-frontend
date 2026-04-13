"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
    IconFingerprint, 
    IconCalendarPlus, 
    IconReceipt,
    IconLoader2
} from "@tabler/icons-react";
import { usePortalAttendanceStatus } from "@/hooks/use-attendance";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function DashboardQuickActions() {
    const router = useRouter();
    const { data: status, isLoading } = usePortalAttendanceStatus();

    const isClockedIn = status?.nextExpectedEvent === "OUT";

    const handleAttendance = () => {
        router.push("./attendance?tab=mark");
    };

    return (
        <div className="flex flex-wrap items-center gap-4">
            <Button 
                onClick={handleAttendance}
                disabled={isLoading}
                className={cn(
                    "h-14 px-8 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-lg",
                    isClockedIn 
                        ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" 
                        : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                )}
            >
                <IconFingerprint className="w-5 h-5 mr-2" />
                {isClockedIn ? "Clock Out Now" : "Clock In Now"}
            </Button>

            <Button 
                variant="outline"
                onClick={() => router.push("./leaves?action=request")}
                className="h-14 px-6 rounded-2xl font-black text-sm uppercase tracking-wider border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all text-neutral-600 dark:text-neutral-400"
            >
                <IconCalendarPlus className="w-5 h-5 mr-2" />
                Apply Leave
            </Button>

            <Button 
                variant="outline"
                onClick={() => router.push("./salaries")}
                className="h-14 px-6 rounded-2xl font-black text-sm uppercase tracking-wider border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all text-neutral-600 dark:text-neutral-400"
            >
                <IconReceipt className="w-5 h-5 mr-2" />
                My Salaries
            </Button>
        </div>
    );
}
