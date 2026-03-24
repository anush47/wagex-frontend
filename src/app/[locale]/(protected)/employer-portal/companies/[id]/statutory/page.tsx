"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { IconReceiptTax, IconPercentage, IconActivity, IconReceipt2, IconSettings } from "@tabler/icons-react";
import { EpfTab } from "./components/EpfTab";
import { EtfTab } from "./components/EtfTab";
import { TaxTab } from "./components/TaxTab";

export default function StatutoryPage() {
    const t = useTranslations("Common");
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const currentTab = searchParams.get("tab") || "epf";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 md:space-y-10 pb-24 antialiased">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconReceiptTax className="h-5 w-5" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            Statutory Management
                        </h1>
                    </div>
                    <p className="text-neutral-500 font-medium text-sm pl-0.5">
                        Manage EPF, ETF and Tax contributions for your employees.
                    </p>
                </div>
            </div>

            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto no-scrollbar pb-2">
                    <TabsList className="w-full h-12 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl md:grid md:grid-cols-3 md:max-w-2xl flex whitespace-nowrap min-w-max md:min-w-0">
                        <TabsTrigger 
                            value="epf" 
                            className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all"
                        >
                            <IconPercentage className="h-4 w-4" />
                            <span>EPF Management</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="etf" 
                            className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all"
                        >
                            <IconActivity className="h-4 w-4" />
                            <span>ETF Management</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="tax" 
                            className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all"
                        >
                            <IconReceipt2 className="h-4 w-4" />
                            <span>Income Tax</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="epf" className="mt-6 animate-in fade-in duration-500">
                    <EpfTab />
                </TabsContent>
                <TabsContent value="etf" className="mt-6 animate-in fade-in duration-500">
                    <EtfTab />
                </TabsContent>
                <TabsContent value="tax" className="mt-6 animate-in fade-in duration-500">
                    <TaxTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
