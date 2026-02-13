"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { IconPlus, IconWallet, IconCalendarTime, IconHistory, IconCash } from "@tabler/icons-react";
import { SalariesTab } from "./components/SalariesTab";
import { PaymentsTab } from "./components/PaymentsTab";
import { AdvancesTab } from "./components/AdvancesTab";
import { GenerateSalaryDialog } from "./components/GenerateSalaryDialog";

export default function SalariesPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const companyId = params?.id as string;

    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "salaries");
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

    // Sync tab state with URL parameter
    useEffect(() => {
        const tabFromUrl = searchParams.get("tab") || "salaries";
        setActiveTab(tabFromUrl);
    }, [searchParams]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

    const handleFilterChange = (filters: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 md:space-y-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconWallet className="h-5 w-5" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            Salary Management
                        </h1>
                    </div>
                    <p className="text-neutral-500 font-medium text-sm">
                        Generate and manage employee salaries, advances, and payments.
                    </p>
                </div>

                <Button
                    onClick={() => setGenerateDialogOpen(true)}
                    className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <IconPlus className="mr-2 h-5 w-5" />
                    Generate Salaries
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto no-scrollbar pb-2">
                    <TabsList className="w-full h-12 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl md:grid md:grid-cols-3 md:max-w-2xl flex whitespace-nowrap min-w-max md:min-w-0">
                        <TabsTrigger value="salaries" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all">
                            <IconCalendarTime className="h-4 w-4" />
                            <span>Salaries</span>
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="flex items-center justify-center gap-2 h-full rounded-xl relative data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all">
                            <IconHistory className="h-4 w-4" />
                            <span>Payments History</span>
                        </TabsTrigger>
                        <TabsTrigger value="advances" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all">
                            <IconCash className="h-4 w-4" />
                            <span>Salary Advances</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="salaries" className="mt-6">
                    <SalariesTab
                        companyId={companyId}
                        filters={{
                            employeeId: searchParams.get('employeeId'),
                            startDate: searchParams.get('startDate'),
                            endDate: searchParams.get('endDate'),
                            status: searchParams.get('status'),
                        }}
                        onFilterChange={handleFilterChange}
                    />
                </TabsContent>

                <TabsContent value="payments" className="mt-6">
                    <PaymentsTab companyId={companyId} />
                </TabsContent>

                <TabsContent value="advances" className="mt-6">
                    <AdvancesTab companyId={companyId} />
                </TabsContent>
            </Tabs>

            {/* Generation Dialog */}
            <GenerateSalaryDialog
                open={generateDialogOpen}
                onOpenChange={setGenerateDialogOpen}
                companyId={companyId}
            />
        </div>
    );
}
