"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    IconReceipt,
    IconCreditCard,
    IconTrendingUp,
} from "@tabler/icons-react";
import EmployeeSalariesTab from "./components/EmployeeSalariesTab";
import EmployeePaymentsTab from "./components/EmployeePaymentsTab";
import EmployeeAdvancesTab from "./components/EmployeeAdvancesTab";
import { useSearchParams, useRouter, useParams } from "next/navigation";

export default function EmployeeSalariesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const activeTab = searchParams.get("tab") || "salaries";

    const handleTabChange = (value: string) => {
        const locale = params.locale as string;
        router.push(`/${locale}/employee-portal/salaries?tab=${value}`);
    };

    return (
        <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-neutral-900 mb-2">
                    My Payroll
                </h1>
                <p className="text-neutral-500 font-medium">
                    Manage your salary records, track payments, and monitor your advances.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
                <TabsList className="bg-white/50 backdrop-blur-md p-1.5 rounded-[2rem] border border-neutral-200/50 shadow-sm inline-flex h-auto w-full md:w-auto overflow-x-auto no-scrollbar justify-start">
                    <TabsTrigger
                        value="salaries"
                        className="rounded-full px-6 py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-600/20 font-bold transition-all flex items-center gap-2"
                    >
                        <IconReceipt className="w-4 h-4" />
                        Salaries
                    </TabsTrigger>
                    <TabsTrigger
                        value="payments"
                        className="rounded-full px-6 py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/20 font-bold transition-all flex items-center gap-2"
                    >
                        <IconCreditCard className="w-4 h-4" />
                        Payments
                    </TabsTrigger>
                    <TabsTrigger
                        value="advances"
                        className="rounded-full px-6 py-2.5 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-600/20 font-bold transition-all flex items-center gap-2"
                    >
                        <IconTrendingUp className="w-4 h-4" />
                        Advances
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="salaries" className="focus-visible:outline-none">
                    <EmployeeSalariesTab />
                </TabsContent>
                <TabsContent value="payments" className="focus-visible:outline-none">
                    <EmployeePaymentsTab />
                </TabsContent>
                <TabsContent value="advances" className="focus-visible:outline-none">
                    <EmployeeAdvancesTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
