"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { IconFileInvoice, IconUsers, IconCalendarStats, IconGraph, IconReceiptTax, IconCash, IconFiles } from "@tabler/icons-react";

// For now, these are placeholder components that we will create soon
import { SalaryDocumentsTab } from "./components/SalaryDocumentsTab";
import { PayslipsDocumentsTab } from "./components/PayslipsDocumentsTab";
import { EpfDocumentsTab } from "./components/EpfDocumentsTab";
import { EtfDocumentsTab } from "./components/EtfDocumentsTab";
import { AttendanceDocumentsTab } from "./components/AttendanceDocumentsTab";
import { TaxDocumentsTab } from "./components/TaxDocumentsTab";

export default function DocumentsPage() {
    const t = useTranslations("Common");
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const currentTab = searchParams.get("tab") || "salary";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 md:space-y-10 pb-24">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconFiles className="h-5 w-5" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            Documents Hub
                        </h1>
                    </div>
                    <p className="text-neutral-500 font-medium text-sm">
                        Generate and download various reports, sheets, and certificates.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto no-scrollbar pb-2">
                    <TabsList className="w-full h-12 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl md:flex md:w-max flex whitespace-nowrap min-w-max md:min-w-0">
                        <TabsTrigger value="salary" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all px-6">
                            <IconCash className="h-4 w-4" />
                            <span>Salary Sheets</span>
                        </TabsTrigger>
                        <TabsTrigger value="payslips" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all px-6">
                            <IconFileInvoice className="h-4 w-4" />
                            <span>Payslips</span>
                        </TabsTrigger>
                        <TabsTrigger value="epf" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all px-6">
                            <IconReceiptTax className="h-4 w-4" />
                            <span>EPF Forms</span>
                        </TabsTrigger>
                        <TabsTrigger value="etf" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all px-6">
                            <IconReceiptTax className="h-4 w-4" />
                            <span>ETF Forms</span>
                        </TabsTrigger>
                        <TabsTrigger value="attendance" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all px-6">
                            <IconCalendarStats className="h-4 w-4" />
                            <span>Attendance Reports</span>
                        </TabsTrigger>
                        <TabsTrigger value="tax" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all px-6">
                            <IconGraph className="h-4 w-4" />
                            <span>Tax Reports</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="mt-8">
                    <TabsContent value="salary">
                        <SalaryDocumentsTab />
                    </TabsContent>
                    <TabsContent value="payslips">
                        <PayslipsDocumentsTab />
                    </TabsContent>
                    <TabsContent value="epf">
                        <EpfDocumentsTab />
                    </TabsContent>
                    <TabsContent value="etf">
                        <EtfDocumentsTab />
                    </TabsContent>
                    <TabsContent value="attendance">
                        <AttendanceDocumentsTab />
                    </TabsContent>
                    <TabsContent value="tax">
                        <TaxDocumentsTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
