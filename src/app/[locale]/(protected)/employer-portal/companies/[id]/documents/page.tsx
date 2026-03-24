"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { useSearchParams, useParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/routing";
import { 
    IconFileInvoice, 
    IconCalendarStats, 
    IconGraph, 
    IconReceiptTax, 
    IconCash, 
    IconFiles, 
    IconLayoutGrid,
    IconTableExport
} from "@tabler/icons-react";

import { SalaryDocumentsTab } from "./components/SalaryDocumentsTab";
import { PayslipsDocumentsTab } from "./components/PayslipsDocumentsTab";
import { EpfDocumentsTab } from "./components/EpfDocumentsTab";
import { EtfDocumentsTab } from "./components/EtfDocumentsTab";
import { AttendanceDocumentsTab } from "./components/AttendanceDocumentsTab";
import { TaxDocumentsTab } from "./components/TaxDocumentsTab";
import { Button } from "@/components/ui/button";

export default function DocumentsPage() {
    const t = useTranslations("Common");
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();

    const currentTab = searchParams.get("tab") || "salary";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 md:space-y-10 pb-24 antialiased animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconFiles className="h-5 w-5" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            Documents Hub
                        </h1>
                    </div>
                    <p className="text-neutral-500 font-medium text-sm pl-0.5">
                        Access and generate payroll reports, payslips, and compliance forms.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href={`/employer-portal/companies/${params.id}/documents/templates`}>
                        <Button variant="outline" className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white dark:bg-neutral-950/20 shadow-xl hover:bg-white/10 transition-all border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                            <IconLayoutGrid className="h-4 w-4 text-primary" />
                            Manage Templates
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto no-scrollbar pb-2">
                    <TabsList className="w-full h-12 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl md:grid md:grid-cols-6 md:max-w-4xl flex whitespace-nowrap min-w-max md:min-w-0">
                        <TabsTrigger value="salary" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all">
                            <IconCash className="h-4 w-4" />
                            <span>Salary Sheets</span>
                        </TabsTrigger>
                        <TabsTrigger value="payslips" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all">
                            <IconFileInvoice className="h-4 w-4" />
                            <span>Payslips</span>
                        </TabsTrigger>
                        <TabsTrigger value="epf" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all">
                            <IconReceiptTax className="h-4 w-4" />
                            <span>EPF Forms</span>
                        </TabsTrigger>
                        <TabsTrigger value="etf" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all">
                            <IconTableExport className="h-4 w-4" />
                            <span>ETF Forms</span>
                        </TabsTrigger>
                        <TabsTrigger value="attendance" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all">
                            <IconCalendarStats className="h-4 w-4" />
                            <span>Attendance</span>
                        </TabsTrigger>
                        <TabsTrigger value="tax" className="flex items-center justify-center gap-2 h-full rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wide transition-all">
                            <IconGraph className="h-4 w-4" />
                            <span>Income Tax</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="salary" className="mt-6 animate-in fade-in duration-500">
                    <SalaryDocumentsTab />
                </TabsContent>
                <TabsContent value="payslips" className="mt-6 animate-in fade-in duration-500">
                    <PayslipsDocumentsTab />
                </TabsContent>
                <TabsContent value="epf" className="mt-6 animate-in fade-in duration-500">
                    <EpfDocumentsTab />
                </TabsContent>
                <TabsContent value="etf" className="mt-6 animate-in fade-in duration-500">
                    <EtfDocumentsTab />
                </TabsContent>
                <TabsContent value="attendance" className="mt-6 animate-in fade-in duration-500">
                    <AttendanceDocumentsTab />
                </TabsContent>
                <TabsContent value="tax" className="mt-6 animate-in fade-in duration-500">
                    <TaxDocumentsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
