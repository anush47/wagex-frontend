"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { PolicySettings } from "@/types/policy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { IconClock, IconCalendarStats, IconCoin, IconSettings, IconCalendarTime } from "@tabler/icons-react";
import { ShiftsSection } from "./policy/ShiftsSection";
import { PayrollSection } from "./policy/PayrollSection";
import { PayrollSettingsTab } from "./policy/PayrollSettingsTab";

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

    const updatePayrollConfiguration = (payrollConfiguration: any) => {
        onChange({ ...settings, payrollConfiguration });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <IconSettings className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-black tracking-tight">Policy Configuration</h3>
                    <p className="text-sm text-muted-foreground">Manage automation rules for attendance and payroll.</p>
                </div>
            </div>

            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full flex flex-col">
                <TabsList className="w-full flex flex-wrap !h-auto gap-2 bg-transparent p-0 justify-start pb-2">
                    <TabsTrigger
                        value="shifts"
                        className="rounded-xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-background border border-border"
                    >
                        <IconClock className="w-4 h-4 mr-2" />
                        Shifts & Hours
                    </TabsTrigger>

                    <TabsTrigger
                        value="salary-components"
                        className="rounded-xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-background border border-border"
                    >
                        <IconCoin className="w-4 h-4 mr-2" />
                        Salary Components
                    </TabsTrigger>

                    <TabsTrigger
                        value="payroll-settings"
                        className="rounded-xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-background border border-border"
                    >
                        <IconCalendarTime className="w-4 h-4 mr-2" />
                        Payroll Settings
                    </TabsTrigger>

                    <TabsTrigger
                        value="attendance"
                        disabled
                        className="rounded-xl px-6 py-3 opacity-50 cursor-not-allowed bg-card border border-border"
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
                    <PayrollSettingsTab
                        value={settings.payrollConfiguration}
                        onChange={updatePayrollConfiguration}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
