"use client";

import { use, useEffect, useState } from "react";
import { EmployeeService } from "@/services/employee.service";
import { PoliciesService } from "@/services/policy.service";
import { Employee } from "@/types/employee";
import { PolicySettings } from "@/types/policy";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    IconDeviceFloppy,
    IconUser,
    IconSettings,
    IconFiles,
    IconLoader2,
    IconArrowLeft,
    IconChevronRight,
    IconUserBolt
} from "@tabler/icons-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter, Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// We will create these components or reuse existing ones
import { EmployeeGeneralTab } from "./components/EmployeeGeneralTab";
import { EmployeePoliciesTab } from "./components/EmployeePoliciesTab";
import { EmployeeAccountTab } from "./components/EmployeeAccountTab";
import { EmployeeFilesTab } from "./components/EmployeeFilesTab";
import { StorageService } from "@/services/storage.service";

export default function EmployeeDetailsPage({ params }: { params: Promise<{ id: string, employeeId: string }> }) {
    const { id: companyId, employeeId } = use(params);
    const t = useTranslations("Common");
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Employee Data
    const [originalEmployee, setOriginalEmployee] = useState<Employee | null>(null);
    const [employeeForm, setEmployeeForm] = useState<Employee | null>(null);

    // Policy Data
    const [effectivePolicy, setEffectivePolicy] = useState<PolicySettings>({});
    const [overridePolicy, setOverridePolicy] = useState<PolicySettings>({});
    const [originalOverride, setOriginalOverride] = useState<PolicySettings>({});
    const [policySource, setPolicySource] = useState<any>(null);

    // Tab State
    const initialTab = searchParams.get("tab") || "general";
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [empRes, policyRes] = await Promise.all([
                EmployeeService.getEmployee(employeeId),
                PoliciesService.getEffectivePolicy(employeeId)
            ]);

            // Handle Employee Data
            const empData = (empRes.data as any)?.data || empRes.data;
            if (empData) {
                setOriginalEmployee(empData);
                setEmployeeForm(JSON.parse(JSON.stringify(empData)));
            }

            // Handle Policy Data
            const policyData = (policyRes as any)?.data?.data || (policyRes as any)?.data;
            if (policyData) {
                setEffectivePolicy(policyData.effective || {});
                setPolicySource(policyData.source || {});

                const override = policyData.employeeOverride?.settings || {};
                setOverridePolicy(JSON.parse(JSON.stringify(override)));
                setOriginalOverride(JSON.parse(JSON.stringify(override)));
            }
        } catch (error) {
            console.error("Failed to fetch employee details", error);
            toast.error("Failed to load employee profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [employeeId]);

    const canonicalStringify = (obj: any): string => {
        if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
        if (Array.isArray(obj)) return '[' + obj.map(canonicalStringify).join(',') + ']';
        return '{' + Object.keys(obj).sort().map(key => JSON.stringify(key) + ':' + canonicalStringify(obj[key])).join(',') + '}';
    };

    const isEmployeeDirty = canonicalStringify(originalEmployee) !== canonicalStringify(employeeForm);
    const isPolicyDirty = canonicalStringify(originalOverride) !== canonicalStringify(overridePolicy);
    const isDirty = isEmployeeDirty || isPolicyDirty;

    const handleSave = async () => {
        setSaving(true);
        const toastId = toast.loading("Syncing personnel record...");
        try {
            const promises = [];

            if (isEmployeeDirty && employeeForm) {
                // Strip all relation and read-only fields before sending to backend
                const {
                    id: _id,
                    createdAt,
                    updatedAt,
                    company,
                    user,
                    userId,
                    ...payload
                } = employeeForm as any;

                promises.push(EmployeeService.updateEmployee(employeeId, payload));
            }

            if (isPolicyDirty) {
                // Save policy override
                // The backend endpoint for policy handles companyId + employeeId
                promises.push(PoliciesService.saveEmployeePolicy(companyId, employeeId, overridePolicy));
            }

            await Promise.all(promises);
            toast.success("Profile updated successfully", { id: toastId });
            fetchData(true); // Refresh to get new effective policy
        } catch (error) {
            console.error("Failed to save", error);
            toast.error("Update failed", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const handleResetPolicy = async () => {
        const toastId = toast.loading("Reverting to company defaults...");
        try {
            await PoliciesService.deleteEmployeePolicy(employeeId, companyId);
            toast.success("Policy reset successfully", { id: toastId });
            fetchData(true);
            setOverridePolicy({}); // Clear local overrides
            setOriginalOverride({});
        } catch (error) {
            console.error("Failed to reset policy", error);
            toast.error("Reset failed", { id: toastId });
        }
    };

    const handleResetTab = async (tabKey: string) => {
        const labels: Record<string, string> = {
            shifts: "Shifts",
            workingDays: "Working Days",
            salaryComponents: "Salary",
            payrollConfiguration: "Payroll",
            attendance: "Attendance",
            leaves: "Leaves"
        };
        const label = labels[tabKey] || "Module";

        const toastId = toast.loading(`Resetting ${label} to defaults...`);
        try {
            const newOverride = { ...overridePolicy };
            delete (newOverride as any)[tabKey];

            // Save the updated override object (with the module removed)
            await PoliciesService.saveEmployeePolicy(companyId, employeeId, newOverride);

            toast.success(`${label} reset to company defaults`, { id: toastId });

            // Refresh local state
            setOverridePolicy(newOverride);
            setOriginalOverride(JSON.parse(JSON.stringify(newOverride)));
            fetchData(true);
        } catch (error) {
            console.error(`Failed to reset ${label}`, error);
            toast.error(`Reset failed`, { id: toastId });
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        const params = new URLSearchParams(window.location.search);
        params.set("tab", value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto py-10 space-y-8 animate-pulse">
                <div className="h-12 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-xl mb-12" />
                <div className="h-64 w-full bg-neutral-100 dark:bg-neutral-900/50 rounded-[3rem]" />
                <div className="grid grid-cols-3 gap-6">
                    <div className="h-32 bg-neutral-50 dark:bg-neutral-900/30 rounded-[2rem]" />
                    <div className="h-32 bg-neutral-50 dark:bg-neutral-900/30 rounded-[2rem]" />
                    <div className="h-32 bg-neutral-50 dark:bg-neutral-900/30 rounded-[2rem]" />
                </div>
            </div>
        );
    }

    if (!employeeForm) return <div className="p-20 text-center font-bold">Personnel not found</div>;

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 relative pb-24">

            {/* Minimal Breadcrumb */}
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                <Link href={`/employer-portal/companies/${companyId}/employees`} className="hover:text-primary transition-colors">Employees</Link>
                <IconChevronRight className="h-3 w-3" />
                <span className="text-neutral-900 dark:text-white">{employeeForm.nameWithInitials}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <EmployeeAvatar photo={employeeForm.photo} name={employeeForm.nameWithInitials} />
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">{employeeForm.nameWithInitials}</h1>
                                <Badge className={cn(
                                    "h-6 rounded-lg text-[10px] uppercase tracking-tighter px-2 border-none font-bold",
                                    employeeForm.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600" : "bg-neutral-100 text-neutral-400"
                                )}>
                                    {employeeForm.status}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-neutral-500 font-bold text-xs uppercase tracking-widest">
                                <span className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                                    ID: <span className="text-primary font-black">{employeeForm.employeeNo}</span>
                                </span>
                                <span>{employeeForm.employmentType}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    {/* Secondary Actions Placeholder */}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-10">
                <TabsList className="w-full flex flex-wrap !h-auto gap-2 bg-transparent p-0 justify-start border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
                    <TabsTrigger
                        value="general"
                        className="rounded-xl px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 data-[state=active]:border-primary bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                    >
                        <IconUser className="w-4 h-4" />
                        Identity
                    </TabsTrigger>
                    <TabsTrigger
                        value="account"
                        className="rounded-xl px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 data-[state=active]:border-primary bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                    >
                        <IconUserBolt className="w-4 h-4" />
                        Account
                    </TabsTrigger>
                    <TabsTrigger
                        value="policies"
                        className="rounded-xl px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 data-[state=active]:border-primary bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                    >
                        <IconSettings className="w-4 h-4" />
                        Policy Rules
                        {(policySource?.isOverridden || isPolicyDirty) && (
                            <div className="ml-2 h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="files"
                        className="rounded-xl px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 data-[state=active]:border-primary bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                    >
                        <IconFiles className="w-4 h-4" />
                        Documents
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <EmployeeGeneralTab
                        formData={employeeForm}
                        onChange={(field, value) => setEmployeeForm(prev => prev ? ({ ...prev, [field]: value }) : null)}
                    />
                </TabsContent>

                <TabsContent value="account" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <EmployeeAccountTab
                        formData={employeeForm}
                        onChange={(field, value) => setEmployeeForm(prev => prev ? ({ ...prev, [field]: value }) : null)}
                        onSave={handleSave}
                        loading={saving}
                    />
                </TabsContent>

                <TabsContent value="policies" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <EmployeePoliciesTab
                        effective={effectivePolicy}
                        override={overridePolicy}
                        onOverrideChange={setOverridePolicy}
                        onResetTab={handleResetTab}
                        source={policySource}
                    />
                </TabsContent>

                <TabsContent value="files" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <EmployeeFilesTab
                        formData={employeeForm}
                        handleChange={(field, value) => setEmployeeForm(prev => prev ? ({ ...prev, [field]: value }) : null)}
                    />
                </TabsContent>
            </Tabs>

            {/* Save Button - Bottom Right */}
            <AnimatePresence>
                {isDirty && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 right-8 z-50"
                    >
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            size="lg"
                            className="rounded-full shadow-2xl px-8 h-14 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all text-base font-bold"
                        >
                            {saving ? (
                                <>
                                    <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <IconDeviceFloppy className="mr-2 h-5 w-5" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function EmployeeAvatar({ photo, name }: { photo?: string, name: string }) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (photo) {
            StorageService.getUrl(photo).then(res => {
                const data = (res.data as any)?.data || res.data;
                if (data?.url) setUrl(data.url);
            });
        } else {
            setUrl(null);
        }
    }, [photo]);

    return (
        <div className="h-16 w-16 md:h-20 md:w-20 rounded-[2rem] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-2xl font-black text-neutral-400 overflow-hidden shadow-inner border border-neutral-200 dark:border-neutral-700">
            {url ? (
                <img src={url} alt={name} className="h-full w-full object-cover" />
            ) : (
                name?.split(' ').map(n => n?.[0]).join('').slice(0, 2).toUpperCase()
            )}
        </div>
    );
}
