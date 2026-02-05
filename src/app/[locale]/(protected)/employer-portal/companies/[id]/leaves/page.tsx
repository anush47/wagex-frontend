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
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const fetchRequests = async () => {
        try {
            const response = await LeavesService.getCompanyRequests(companyId);
            // Backend returns {statusCode, message, data: [], ...}
            // API client wraps it in {data: backendResponse}
            setRequests(Array.isArray(response.data) ? response.data : (response.data?.data || []));
        } catch (error) {
            console.error("Failed to fetch leave requests:", error);
            setRequests([]);
        }
    };

    // Sync tab state with URL parameter
    useEffect(() => {
        const tabFromUrl = searchParams.get("tab") || "requests";
        setActiveTab(tabFromUrl);
    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchRequests();
            setLoading(false);
        };

        if (companyId) {
            fetchData();
        }
    }, [companyId]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        // Update URL without page reload
        const newUrl = `${window.location.pathname}?tab=${value}`;
        router.push(newUrl, { scroll: false });
    };

    const handleRequestCreated = () => {
        setCreateDialogOpen(false);
        fetchRequests();
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage leave requests and track employee leave balances
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <IconPlus className="h-4 w-4 mr-2" />
                    New Request
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="requests" className="flex items-center gap-2">
                        <IconCalendarTime className="h-4 w-4" />
                        Requests
                    </TabsTrigger>
                    <TabsTrigger value="balances" className="flex items-center gap-2">
                        <IconChartBar className="h-4 w-4" />
                        Balances
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="requests" className="mt-6">
                    <LeaveRequestsTab
                        requests={requests}
                        loading={loading}
                        onRefresh={fetchRequests}
                    />
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
                onSuccess={handleRequestCreated}
            />
        </div>
    );
}
