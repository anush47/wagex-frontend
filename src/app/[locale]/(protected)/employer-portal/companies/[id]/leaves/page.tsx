"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { IconPlus, IconCalendarTime, IconChartBar } from "@tabler/icons-react";
import { LeavesService } from "@/services/leaves.service";
import type { LeaveRequest, LeaveBalance } from "@/types/leave";
import { LeaveRequestsTab } from "./components/LeaveRequestsTab";
import { LeaveBalancesTab } from "./components/LeaveBalancesTab";
import { CreateLeaveRequestDialog } from "./components/CreateLeaveRequestDialog";

export default function LeavesPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const companyId = params?.id as string;

    const tabFromUrl = searchParams.get("tab") || "requests";
    const [activeTab, setActiveTab] = useState(tabFromUrl);
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Sync tab state with URL parameter
    useEffect(() => {
        const tabFromUrl = searchParams.get("tab") || "requests";
        setActiveTab(tabFromUrl);
    }, [searchParams]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        // Update URL without page reload
        const newUrl = `${window.location.pathname}?tab=${value}`;
        router.push(newUrl, { scroll: false });
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 md:space-y-10">
            {/* Header */}
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconCalendarTime className="h-5 w-5" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            Leave Management
                        </h1>
                    </div>
                    <p className="text-neutral-500 font-medium text-sm">
                        Manage leave requests and track employee leave balances.
                    </p>
                </div>

                <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <IconPlus className="mr-2 h-5 w-5" />
                    New Request
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto no-scrollbar pb-2">
                    <TabsList className="w-full h-12 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl md:grid md:grid-cols-2 md:max-w-md flex whitespace-nowrap min-w-max md:min-w-0">
                        <TabsTrigger value="requests" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all">
                            <IconCalendarTime className="h-4 w-4" />
                            <span>Requests</span>
                        </TabsTrigger>
                        <TabsTrigger value="balances" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all">
                            <IconChartBar className="h-4 w-4" />
                            <span>Balances</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="requests" className="mt-6">
                    <LeaveRequestsTab companyId={companyId} />
                </TabsContent>

                <TabsContent value="balances" className="mt-6">
                    <LeaveBalancesTab companyId={companyId} />
                </TabsContent>
            </Tabs>

            {/* Create Dialog */}
            <CreateLeaveRequestDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                companyId={companyId}
            />
        </div>
    );
}
