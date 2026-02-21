"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Policy, PolicySettings } from "@/types/policy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    IconClock,
    IconCalendarStats,
    IconCoin,
    IconSettings,
    IconCalendarTime,
    IconCalendarStar,
    IconCircleCheckFilled,
    IconAlertCircle,
    IconTemplate
} from "@tabler/icons-react";
import { ShiftsSection } from "../../../policies/components/policy/ShiftsSection";
import { PayrollSection } from "../../../policies/components/policy/PayrollSection";
import { PayrollSettingsTab } from "../../../policies/components/policy/PayrollSettingsTab";
import { WorkingDaysTab } from "../../../policies/components/policy/WorkingDaysTab";
import { AttendanceTab } from "../../../policies/components/policy/AttendanceTab";
import { LeavesTab } from "../../../policies/components/policy/LeavesTab";
import { cn } from "@/lib/utils";
import { useCompanyPolicies } from "@/hooks/use-policies";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface EmployeePoliciesTabProps {
    companyId: string;
    selectedPolicyId: string | null;
    onPolicySelect: (policyId: string | null) => void;
    effective: PolicySettings;
    source: any;
    companyDefault?: PolicySettings;
    assignedTemplate?: PolicySettings;
}

export function EmployeePoliciesTab({
    companyId,
    selectedPolicyId,
    onPolicySelect,
    effective,
    source,
    companyDefault,
    assignedTemplate
}: EmployeePoliciesTabProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { data: policies = [], isLoading: policiesLoading } = useCompanyPolicies(companyId);

    const currentTab = searchParams.get("policyTab") || "shifts";

    const handleTabChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("policyTab", val);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const selectedPolicy = useMemo(() =>
        policies.find(p => p.id === selectedPolicyId)
        , [policies, selectedPolicyId]);

    const activeSourceName = useMemo(() => {
        const s = source as any;
        if (s?.hasAssignedPolicy) return s.assignedPolicyName || "Assigned Template";
        return "Company Default";
    }, [source]);

    const previewEffective = useMemo(() => {
        const df = policies.find(p => p.isDefault);
        const dfSettings = (df?.settings as unknown as PolicySettings) || ({} as PolicySettings);

        if (!selectedPolicyId || selectedPolicyId === 'default' || !selectedPolicy) {
            return dfSettings;
        }

        const assignedSettings = (selectedPolicy.settings as unknown as PolicySettings) || ({} as PolicySettings);

        // Simple merge (shallow is enough for top level keys, but shifts.list needs replace)
        const combined = {
            ...dfSettings,
            ...assignedSettings,
            // Deep merge some specific sections if needed, but for now we follow the backend logic:
            // Assigned replaces default sections.
        };

        // Special handling for shifts.list to match backend
        if (assignedSettings.shifts?.list) {
            combined.shifts = {
                ...(combined.shifts || {}),
                list: assignedSettings.shifts.list
            };
        }

        return combined as PolicySettings;
    }, [policies, selectedPolicyId, selectedPolicy]);

    const overriddenTabs = useMemo(() => {
        if (!selectedPolicyId || selectedPolicyId === 'default' || !selectedPolicy) return new Set<string>();

        const df = policies.find(p => p.isDefault);
        const dfSettings = (df?.settings as unknown as PolicySettings) || ({} as PolicySettings);
        const cur = (selectedPolicy.settings as unknown as PolicySettings) || ({} as PolicySettings);

        const tabs = new Set<string>();
        const isDifferent = (a: any, b: any) => JSON.stringify(a) !== JSON.stringify(b);

        if (isDifferent(cur.shifts, dfSettings.shifts)) tabs.add('shifts');
        if (isDifferent(cur.workingDays, dfSettings.workingDays)) tabs.add('working-days');
        if (isDifferent(cur.salaryComponents, dfSettings.salaryComponents)) tabs.add('salary-components');
        if (isDifferent(cur.payrollConfiguration, dfSettings.payrollConfiguration)) tabs.add('payroll-settings');
        if (isDifferent(cur.attendance, dfSettings.attendance)) tabs.add('attendance');
        if (isDifferent(cur.leaves, dfSettings.leaves)) tabs.add('leaves');

        return tabs;
    }, [policies, selectedPolicyId, selectedPolicy]);

    if (policiesLoading) {
        return (
            <div className="space-y-10 animate-pulse">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[1.5rem] bg-neutral-200 dark:bg-neutral-800" />
                        <div className="space-y-2">
                            <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-800 rounded" />
                            <div className="h-3 w-32 bg-neutral-100 dark:bg-neutral-900 rounded" />
                        </div>
                    </div>
                    <div className="h-12 w-[240px] bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                </div>

                <div className="h-24 w-full bg-neutral-50 dark:bg-neutral-900/50 rounded-[2rem] border border-neutral-100 dark:border-neutral-800" />

                <div className="space-y-10">
                    <div className="flex gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-10 w-24 bg-neutral-100 dark:bg-neutral-900 rounded-lg" />
                        ))}
                    </div>
                    <div className="h-[500px] w-full bg-neutral-50/50 dark:bg-neutral-950/20 rounded-[2rem]" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <IconTemplate className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter uppercase">Policy Assignment</h3>
                        <p className="text-sm text-neutral-500 font-medium">Assign a policy template to this employee.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Current Policy</span>
                        <Badge variant="outline" className="text-[10px] font-black uppercase py-0 px-2 rounded-md">
                            {activeSourceName}
                        </Badge>
                    </div>

                    <Select
                        value={selectedPolicyId || "default"}
                        onValueChange={(val) => onPolicySelect(val === "default" ? null : val)}
                    >
                        <SelectTrigger className="w-[240px] rounded-xl h-12 font-bold shadow-sm">
                            <SelectValue placeholder="Select Policy Template" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="default" className="font-medium">Company Default</SelectItem>
                            {policies.filter(p => !p.isDefault).map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-inner">
                    <IconAlertCircle className="h-7 w-7" />
                </div>
                <div className="flex-1">
                    <h5 className="font-black text-blue-900 dark:text-blue-100 uppercase text-xs tracking-widest mb-1">Information</h5>
                    <p className="text-sm text-blue-800/70 dark:text-blue-200/70 leading-relaxed">
                        To adjust policy settings for this employee, please select a different template or manage templates in the <span className="font-bold underline cursor-pointer" onClick={() => router.push(`/employer-portal/companies/${companyId}/policies`)}>Company Policies</span> page.
                    </p>
                </div>
            </div>

            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full flex flex-col gap-10">
                <TabsList className="w-full flex flex-wrap !h-auto gap-2 bg-transparent p-0 justify-start border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
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
                                "rounded-xl px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 border border-neutral-200 dark:border-neutral-800",
                                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 data-[state=active]:border-primary",
                                "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 relative"
                            )}
                        >
                            {overriddenTabs.has(tab.id) && (
                                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-orange-500 shadow-sm animate-pulse" />
                            )}
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="min-h-[500px]">
                    <div className="pointer-events-none opacity-80 cursor-not-allowed">
                        <TabsContent value="shifts" className="m-0 focus-visible:ring-0">
                            <ShiftsSection
                                value={previewEffective.shifts || { list: [] }}
                                onChange={() => { }}
                            />
                        </TabsContent>

                        <TabsContent value="working-days" className="m-0 focus-visible:ring-0">
                            <WorkingDaysTab
                                value={previewEffective.workingDays}
                                onChange={() => { }}
                            />
                        </TabsContent>

                        <TabsContent value="salary-components" className="m-0 focus-visible:ring-0">
                            <PayrollSection
                                value={previewEffective.salaryComponents || { components: [] }}
                                onChange={() => { }}
                            />
                        </TabsContent>

                        <TabsContent value="payroll-settings" className="m-0 focus-visible:ring-0">
                            <PayrollSettingsTab
                                value={previewEffective.payrollConfiguration}
                                onChange={() => { }}
                            />
                        </TabsContent>

                        <TabsContent value="attendance" className="m-0 focus-visible:ring-0">
                            <AttendanceTab
                                value={previewEffective.attendance}
                                onChange={() => { }}
                            />
                        </TabsContent>

                        <TabsContent value="leaves" className="m-0 focus-visible:ring-0">
                            <LeavesTab
                                value={previewEffective.leaves}
                                onChange={() => { }}
                            />
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
