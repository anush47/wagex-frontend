"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { PolicySettings } from "@/types/policy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { IconClock, IconCalendarStats, IconCoin, IconSettings, IconCalendarTime } from "@tabler/icons-react";
import { ShiftsSection } from "./policy/ShiftsSection";
import { PayrollSection } from "./policy/PayrollSection";

interface PoliciesTabProps {
    settings: PolicySettings;
    onChange: (settings: PolicySettings) => void;
}

export function PoliciesTab({ settings, onChange }: PoliciesTabProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentTab = searchParams.get("policyTab") || "shifts";

    const handleTabChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("policyTab", val);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Helper to update specific section
    const updateShifts = (shifts: any) => {
        onChange({ ...settings, shifts });
    };

    const updateSalaryComponents = (salaryComponents: any) => {
        onChange({ ...settings, salaryComponents });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-600 shadow-inner">
                    <IconSettings className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-black tracking-tight">Policy Configuration</h3>
                    <p className="text-sm text-neutral-500">Manage automation rules for attendance and payroll.</p>
                </div>
            </div>

            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full flex flex-col">
                <TabsList className="w-full flex flex-wrap !h-auto gap-2 bg-transparent p-0 justify-start pb-2">
                    <TabsTrigger
                        value="shifts"
                        className="rounded-xl px-6 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                    >
                        <IconClock className="w-4 h-4 mr-2" />
                        Shifts & Hours
                    </TabsTrigger>

                    <TabsTrigger
                        value="salary-components"
                        className="rounded-xl px-6 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                    >
                        <IconCoin className="w-4 h-4 mr-2" />
                        Salary Components
                    </TabsTrigger>

                    <TabsTrigger
                        value="payroll-settings"
                        className="rounded-xl px-6 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                    >
                        <IconCalendarTime className="w-4 h-4 mr-2" />
                        Payroll Settings
                    </TabsTrigger>

                    <TabsTrigger
                        value="attendance"
                        disabled
                        className="rounded-xl px-6 py-3 opacity-50 cursor-not-allowed bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                    >
                        <IconCalendarStats className="w-4 h-4 mr-2" />
                        Attendance Rules
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="shifts" className="mt-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <ShiftsSection
                        value={settings.shifts || { list: [] }}
                        onChange={updateShifts}
                    />
                </TabsContent>

                <TabsContent value="salary-components" className="mt-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <PayrollSection
                        value={settings.salaryComponents || { components: [] }}
                        onChange={updateSalaryComponents}
                    />
                </TabsContent>

                <TabsContent value="payroll-settings" className="mt-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="p-12 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl text-center">
                        <div className="h-16 w-16 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 mb-4">
                            <IconCalendarTime className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">Payroll Settings</h3>
                        <p className="text-neutral-500 max-w-md mx-auto">Configure pay cycles, cut-off dates, and other global payroll processing rules.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
