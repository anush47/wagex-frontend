"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { PolicySettings } from "@/types/policy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    IconClock,
    IconCalendarStats,
    IconCoin,
    IconSettings,
    IconCalendarTime,
    IconCalendarStar,
    IconCircleCheckFilled,
    IconCircleXFilled,
    IconAlertCircle
} from "@tabler/icons-react";
import { ShiftsSection } from "../../details/components/policy/ShiftsSection";
import { PayrollSection } from "../../details/components/policy/PayrollSection";
import { PayrollSettingsTab } from "../../details/components/policy/PayrollSettingsTab";
import { WorkingDaysTab } from "../../details/components/policy/WorkingDaysTab";
import { AttendanceTab } from "../../details/components/policy/AttendanceTab";
import { LeavesTab } from "../../details/components/policy/LeavesTab";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmployeePoliciesTabProps {
    effective: PolicySettings;
    override: PolicySettings;
    onOverrideChange: (settings: PolicySettings) => void;
    source: any; // { shifts: 'COMPANY' | 'EMPLOYEE', ... }
}

export function EmployeePoliciesTab({ effective, override, onOverrideChange, source }: EmployeePoliciesTabProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentTab = searchParams.get("policyTab") || "shifts";

    const handleTabChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("policyTab", val);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const isOverridden = (key: string) => source?.[key] === 'EMPLOYEE';

    const getOverrideWarning = (key: string) => {
        if (isOverridden(key)) {
            return (
                <div className="flex items-center gap-2 p-4 mb-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-600 dark:text-orange-400">
                    <IconAlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div className="text-xs font-bold leading-tight">
                        <span className="uppercase block text-[10px] opacity-70 mb-0.5">Custom Configuration</span>
                        This specific module is overridden for this employee. Changes here won't affect company defaults.
                    </div>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2 p-4 mb-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 opacity-60">
                <IconCircleCheckFilled className="w-5 h-5 flex-shrink-0" />
                <div className="text-xs font-bold leading-tight">
                    <span className="uppercase block text-[10px] opacity-70 mb-0.5">Inherited from Company</span>
                    Using global organization settings. To customize, start making changes below.
                </div>
            </div>
        );
    };

    // Helper to merge changes into override state
    const updateOverride = (key: string, value: any) => {
        onOverrideChange({
            ...override,
            [key]: value
        });
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <IconSettings className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter uppercase">Policy Orchestration</h3>
                        <p className="text-sm text-neutral-500 font-medium">Configure custom rules or inherit from company defaults.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-5 py-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Current Scope: </span>
                    <Badge variant="secondary" className="bg-white dark:bg-neutral-800 text-[10px] font-black uppercase tracking-tighter">
                        {source?.isOverridden ? "Hybrid Override" : "Master Inheritance"}
                    </Badge>
                </div>
            </div>

            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full flex flex-col gap-10">
                <TabsList className="w-full flex flex-wrap !h-auto gap-2 bg-transparent p-0 justify-start border-b border-neutral-100 dark:border-neutral-800 pb-4">
                    {[
                        { id: 'shifts', icon: IconClock, label: 'Shifts' },
                        { id: 'working-days', icon: IconCalendarStats, label: 'Work Days' },
                        { id: 'salary-components', icon: IconCoin, label: 'Salary' },
                        { id: 'payroll-settings', icon: IconCalendarTime, label: 'Payroll' },
                        { id: 'attendance', icon: IconCalendarStats, label: 'Attendance' },
                        { id: 'leaves', icon: IconCalendarStar, label: 'Leaves' },
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className={cn(
                                "rounded-xl px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 border border-transparent",
                                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20",
                                "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500",
                                isOverridden(tab.id) && "border-orange-500/30 text-orange-600 dark:text-orange-400"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {isOverridden(tab.id) && <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="min-h-[500px]">
                    <TabsContent value="shifts" className="m-0 focus-visible:ring-0">
                        {getOverrideWarning('shifts')}
                        <ShiftsSection
                            value={effective.shifts || { list: [] }}
                            onChange={(val) => updateOverride('shifts', val)}
                        />
                    </TabsContent>

                    <TabsContent value="working-days" className="m-0 focus-visible:ring-0">
                        {getOverrideWarning('workingDays')}
                        <WorkingDaysTab
                            value={effective.workingDays}
                            onChange={(val) => updateOverride('workingDays', val)}
                        />
                    </TabsContent>

                    <TabsContent value="salary-components" className="m-0 focus-visible:ring-0">
                        {getOverrideWarning('salaryComponents')}
                        <PayrollSection
                            value={effective.salaryComponents}
                            onChange={(val) => updateOverride('salaryComponents', val)}
                        />
                    </TabsContent>

                    <TabsContent value="payroll-settings" className="m-0 focus-visible:ring-0">
                        {getOverrideWarning('payrollConfiguration')}
                        <PayrollSettingsTab
                            value={effective.payrollConfiguration}
                            onChange={(val) => updateOverride('payrollConfiguration', val)}
                        />
                    </TabsContent>

                    <TabsContent value="attendance" className="m-0 focus-visible:ring-0">
                        {getOverrideWarning('attendance')}
                        <AttendanceTab
                            value={effective.attendance}
                            onChange={(val) => updateOverride('attendance', val)}
                        />
                    </TabsContent>

                    <TabsContent value="leaves" className="m-0 focus-visible:ring-0">
                        {getOverrideWarning('leaves')}
                        <LeavesTab
                            value={effective.leaves}
                            onChange={(val) => updateOverride('leaves', val)}
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
