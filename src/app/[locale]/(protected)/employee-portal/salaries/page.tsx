"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    IconReceipt,
    IconCreditCard,
    IconTrendingUp,
    IconWallet,
} from "@tabler/icons-react";
import EmployeeSalariesTab from "./components/EmployeeSalariesTab";
import EmployeePaymentsTab from "./components/EmployeePaymentsTab";
import EmployeeAdvancesTab from "./components/EmployeeAdvancesTab";
import { useSearchParams, useRouter, useParams } from "next/navigation";

export default function EmployeeSalariesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get("tab") || "salaries";

    const handleTabChange = (value: string) => {
        const newUrl = `${window.location.pathname}?tab=${value}`;
        router.push(newUrl, { scroll: false });
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
                            My Payroll
                        </h1>
                    </div>
                    <p className="text-neutral-500 font-medium text-sm">
                        Manage your salary records, track payments, and monitor your advances.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto no-scrollbar pb-2">
                    <TabsList className="w-full h-12 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl md:grid md:grid-cols-3 md:max-w-xl flex whitespace-nowrap min-w-max md:min-w-0">
                        <TabsTrigger 
                            value="salaries" 
                            className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all"
                        >
                            <IconReceipt className="h-4 w-4" />
                            <span>Salaries</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="payments" 
                            className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all"
                        >
                            <IconCreditCard className="h-4 w-4" />
                            <span>Payments</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="advances" 
                            className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all"
                        >
                            <IconTrendingUp className="h-4 w-4" />
                            <span>Advances</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="salaries" className="mt-6 animate-in slide-in-from-bottom-2 duration-300">
                    <EmployeeSalariesTab />
                </TabsContent>
                <TabsContent value="payments" className="mt-6 animate-in slide-in-from-bottom-2 duration-300">
                    <EmployeePaymentsTab />
                </TabsContent>
                <TabsContent value="advances" className="mt-6 animate-in slide-in-from-bottom-2 duration-300">
                    <EmployeeAdvancesTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
