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
    IconAlertCircle,
    IconTrash
} from "@tabler/icons-react";
import { ShiftsSection } from "../../../details/components/policy/ShiftsSection";
import { PayrollSection } from "../../../details/components/policy/PayrollSection";
import { PayrollSettingsTab } from "../../../details/components/policy/PayrollSettingsTab";
import { WorkingDaysTab } from "../../../details/components/policy/WorkingDaysTab";
import { AttendanceTab } from "../../../details/components/policy/AttendanceTab";
import { LeavesTab } from "../../../details/components/policy/LeavesTab";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useState } from "react";

interface EmployeePoliciesTabProps {
    effective: PolicySettings;
    override: PolicySettings;
    onOverrideChange: (settings: PolicySettings) => void;
    onResetTab: (key: string) => void;
    source: any; // { shifts: 'COMPANY' | 'EMPLOYEE', ... }
}

export function EmployeePoliciesTab({ effective, override, onOverrideChange, onResetTab, source }: EmployeePoliciesTabProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [resetTabKey, setResetTabKey] = useState<string | null>(null);
    const [showResetDialog, setShowResetDialog] = useState(false);

    const currentTab = searchParams.get("policyTab") || "shifts";

    // Helper to merge effective policy with local overrides for display
    const mergeConfig = (key: string) => {
        const eff = effective[key as keyof PolicySettings] || {};
        const ovr = override[key as keyof PolicySettings];

        if (ovr === undefined) return eff;

        // Handle specific deep merges for complex policy objects
        if (key === 'workingDays' && typeof eff === 'object' && typeof ovr === 'object') {
            return {
                ...eff,
                ...ovr,
                defaultPattern: {
                    ...(eff as any).defaultPattern,
                    ...(ovr as any).defaultPattern,
                }
            };
        }

        // Default shallow merge for other objects
        if (typeof eff === 'object' && typeof ovr === 'object' && !Array.isArray(ovr)) {
            return { ...eff, ...ovr };
        }

        return ovr;
    };

    const handleTabChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("policyTab", val);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const isOverridden = (key: string) => {
        const isLocallyChanged = override && override[key as keyof PolicySettings] !== undefined;
        const isServerOverridden = source?.overriddenFields?.includes(key);
        return isLocallyChanged || isServerOverridden;
    };

    const getOverrideWarning = (key: string) => {
        const field = key === 'salaryComponents' ? 'salaryComponents' :
            key === 'payrollConfiguration' ? 'payrollConfiguration' : key;

        if (isOverridden(field)) {
            return (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 mb-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <IconAlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div className="text-xs font-bold leading-tight">
                            <span className="uppercase block text-[10px] opacity-70 mb-0.5">Custom Configuration</span>
                            This module is overridden for this employee.
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setResetTabKey(field);
                            setShowResetDialog(true);
                        }}
                        className="rounded-xl font-bold h-8 px-3 text-[10px] uppercase tracking-widest bg-orange-500/10 text-orange-600 hover:bg-orange-500 hover:text-white transition-all"
                    >
                        <IconTrash className="w-3.5 h-3.5 mr-1.5" />
                        Reset Module
                    </Button>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2 p-4 mb-6 bg-muted/50 border border-muted rounded-2xl text-muted-foreground opacity-60">
                <IconCircleCheckFilled className="w-5 h-5 flex-shrink-0" />
                <div className="text-xs font-bold leading-tight">
                    <span className="uppercase block text-[10px] opacity-70 mb-0.5">Inherited from Company</span>
                    Using global organization settings.
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

    const handleConfirmReset = () => {
        if (resetTabKey) {
            onResetTab(resetTabKey);
            setResetTabKey(null);
            setShowResetDialog(false);
        }
    };

    return (
        <div className="space-y-10">
            <ConfirmationDialog
                open={showResetDialog}
                onOpenChange={setShowResetDialog}
                variant="warning"
                title="Reset Policy Module?"
                description="Are you sure you want to reset this module to company defaults? All custom changes for this employee in this section will be permanently lost."
                icon={<IconTrash className="h-8 w-8" />}
                actionLabel="Reset to Defaults"
                cancelLabel="Cancel"
                onAction={handleConfirmReset}
            />
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

                <div className="flex items-center gap-2 px-5 py-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 h-10">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Current Scope: </span>
                    <Badge variant="secondary" className="bg-white dark:bg-neutral-800 text-[10px] font-black uppercase tracking-tighter">
                        {source?.isOverridden ? "Hybrid Override" : "Master Inheritance"}
                    </Badge>
                </div>
            </div>

            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full flex flex-col gap-10">
                <TabsList className="w-full flex flex-wrap !h-auto gap-2 bg-transparent p-0 justify-start border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
                    {[
                        { id: 'shifts', icon: IconClock, label: 'Shifts', field: 'shifts' },
                        { id: 'working-days', icon: IconCalendarStats, label: 'Work Days', field: 'workingDays' },
                        { id: 'salary-components', icon: IconCoin, label: 'Salary', field: 'salaryComponents' },
                        { id: 'payroll-settings', icon: IconCalendarTime, label: 'Payroll', field: 'payrollConfiguration' },
                        { id: 'attendance', icon: IconCalendarStats, label: 'Attendance', field: 'attendance' },
                        { id: 'leaves', icon: IconCalendarStar, label: 'Leaves', field: 'leaves' },
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className={cn(
                                "rounded-xl px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 border border-neutral-200 dark:border-neutral-800",
                                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 data-[state=active]:border-primary",
                                "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {isOverridden(tab.field) && <div className="ml-2 h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="min-h-[500px]">
                    <TabsContent value="shifts" className="m-0 focus-visible:ring-0">
                        {getOverrideWarning('shifts')}
                        <ShiftsSection
                            value={mergeConfig('shifts') as any || { list: [] }}
                            onChange={(val) => updateOverride('shifts', val)}
                        />
                    </TabsContent>

                    <TabsContent value="working-days" className="m-0 focus-visible:ring-0">
                        {getOverrideWarning('workingDays')}
                        <WorkingDaysTab
                            value={mergeConfig('workingDays') as any}
                            onChange={(val) => updateOverride('workingDays', val)}
                        />
                    </TabsContent>

                    <TabsContent value="salary-components" className="m-0 focus-visible:ring-0">
                        {getOverrideWarning('salaryComponents')}
                        <PayrollSection
                            value={mergeConfig('salaryComponents') as any || { components: [] }}
                            onChange={(val) => updateOverride('salaryComponents', val)}
                        />
                    </TabsContent>

                    <TabsContent value="payroll-settings" className="m-0 focus-visible:ring-0">
                        {getOverrideWarning('payrollConfiguration')}
                        <PayrollSettingsTab
                            value={mergeConfig('payrollConfiguration') as any}
                            onChange={(val) => updateOverride('payrollConfiguration', val)}
                        />
                    </TabsContent>

                    <TabsContent value="attendance" className="m-0 focus-visible:ring-0">
                        {getOverrideWarning('attendance')}
                        <AttendanceTab
                            value={mergeConfig('attendance') as any}
                            onChange={(val) => updateOverride('attendance', val)}
                        />
                    </TabsContent>

                    <TabsContent value="leaves" className="m-0 focus-visible:ring-0">
                        {getOverrideWarning('leaves')}
                        <LeavesTab
                            value={mergeConfig('leaves') as any}
                            onChange={(val) => updateOverride('leaves', val)}
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
