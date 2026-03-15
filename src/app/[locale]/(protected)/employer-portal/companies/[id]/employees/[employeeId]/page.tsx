"use client";

import { use, useEffect, useState } from "react";
import { CompanyService } from "@/services/company.service";
import { EmployeeService } from "@/services/employee.service";
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
    IconUserBolt,
    IconAlertTriangle
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
import { EmployeeDangerZone } from "./components/EmployeeDangerZone";
import { useEmployee, useEmployeeMutations, useEmployees } from "@/hooks/use-employees";
import { useEffectivePolicy, usePolicyMutations, useCompanyPolicy } from "@/hooks/use-policies";
import { useDepartments } from "@/hooks/use-departments";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";

export default function EmployeeDetailsPage({ params }: { params: Promise<{ id: string, employeeId: string }> }) {
    const { id: companyId, employeeId } = use(params);
    const t = useTranslations("Common");
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // Simplified Hook-based Data
    const { data: employeeData, isLoading: empLoading } = useEmployee(employeeId);
    const { data: policyData, isLoading: policyLoading } = useEffectivePolicy(employeeId);
    const { data: deptsResp, isLoading: deptsLoading } = useDepartments(companyId);
    const { data: empsResp, isLoading: empsLoading } = useEmployees({ companyId });

    const departments = deptsResp || [];
    const { updateEmployee, deleteEmployee } = useEmployeeMutations();
    const { savePolicy, deletePolicy } = usePolicyMutations();

    // Local State for Forms
    const [employeeForm, setEmployeeForm] = useState<Employee | null>(null);

    const initialTab = searchParams.get("tab") || "general";
    const [activeTab, setActiveTab] = useState(initialTab);

    // Sync activeTab with URL search params
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Sync with React Query data
    useEffect(() => {
        if (employeeData) {
            setEmployeeForm(JSON.parse(JSON.stringify(employeeData)));
        }
    }, [employeeData]);

    // No longer using individual override sync

    const loading = empLoading || policyLoading || deptsLoading || empsLoading;

    // Derived values from policyData
    const effectivePolicy = policyData?.effective || ({} as PolicySettings);
    const policySource = policyData?.source || {};
    const originalEmployee = employeeData;

    const canonicalStringify = (obj: any): string => {
        if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
        if (Array.isArray(obj)) return '[' + obj.map(canonicalStringify).join(',') + ']';
        return '{' + Object.keys(obj).sort().map(key => JSON.stringify(key) + ':' + canonicalStringify(obj[key])).join(',') + '}';
    };

    const isEmployeeDirty = canonicalStringify(originalEmployee) !== canonicalStringify(employeeForm);
    const isDirty = isEmployeeDirty;


    const handleResetPolicy = async () => {
        setEmployeeForm(prev => prev ? ({ ...prev, policyId: null }) : null);
    };

    const handleSave = async () => {
        if (!employeeForm) return;
        try {
            const { id: _id, createdAt, updatedAt, company, user, userId, details: _details, ...payload } = employeeForm as any;

            // Handle details flattening if needed by API
            const flattenedPayload = {
                ...payload,
                ...(employeeForm.details || {})
            };

            // Strip database internal fields from flattened payload
            delete (flattenedPayload as any).id;
            delete (flattenedPayload as any).employeeId;
            delete (flattenedPayload as any).createdAt;
            delete (flattenedPayload as any).updatedAt;

            await updateEmployee.mutateAsync({ id: employeeId, data: flattenedPayload });
            toast.success("Changes saved successfully");
        } catch (error) {
            console.error("Failed to save changes", error);
            toast.error("Failed to save changes");
        }
    };

    const handleDeleteEmployee = async () => {
        await deleteEmployee.mutateAsync({ id: employeeId, companyId });
        // The EmployeeDangerZone component handles its own navigation
    };

    const saving = updateEmployee.isPending;

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
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 md:space-y-10 relative pb-24">

            {/* Minimal Breadcrumb */}
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                <Link href={`/employer-portal/companies/${companyId}/employees`} className="hover:text-primary transition-colors">Employees</Link>
                <IconChevronRight className="h-3 w-3" />
                <span className="text-neutral-900 dark:text-white">{employeeForm.nameWithInitials}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <EmployeeAvatar photo={employeeForm.photo} name={employeeForm.nameWithInitials} className="h-10 w-10 rounded-xl overflow-hidden" />
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            {employeeForm.nameWithInitials}
                        </h1>
                        <Badge className={cn(
                            "h-6 rounded-lg text-[10px] uppercase tracking-tighter px-2 border-none font-bold ml-2",
                            employeeForm.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600" : "bg-neutral-100 text-neutral-400"
                        )}>
                            {employeeForm.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-neutral-500 font-bold text-xs uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                            Member No: <span className="text-primary font-black">{employeeForm.employeeNo}</span>
                        </span>
                        <span>{employeeForm.employmentType}</span>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
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
                        {policySource?.isAssigned && (
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
                    <TabsTrigger
                        value="danger-zone"
                        className="rounded-xl px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 border border-red-200 dark:border-red-900/50 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-red-500/20 data-[state=active]:border-red-600 bg-transparent hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400"
                    >
                        <IconAlertTriangle className="w-4 h-4" />
                        Danger Zone
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-0">
                    <EmployeeGeneralTab
                        formData={employeeForm}
                        onChange={(field, value) => setEmployeeForm(prev => prev ? ({ ...prev, [field]: value }) : null)}
                        onDetailChange={(field, value) => {
                            setEmployeeForm(prev => {
                                if (!prev) return null;
                                return {
                                    ...prev,
                                    details: {
                                        ...(prev.details || {}),
                                        [field]: value
                                    } as any
                                };
                            });
                        }}
                        departments={departments}
                    />
                </TabsContent>

                <TabsContent value="account" className="mt-0">
                    <EmployeeAccountTab
                        formData={employeeForm}
                        onChange={(field, value) => setEmployeeForm(prev => prev ? ({ ...prev, [field]: value }) : null)}
                        onSave={handleSave}
                        loading={saving}
                    />
                </TabsContent>

                <TabsContent value="policies" className="mt-0">
                    <EmployeePoliciesTab
                        companyId={companyId}
                        selectedPolicyId={employeeForm?.policyId || null}
                        onPolicySelect={(policyId) => setEmployeeForm(prev => prev ? ({ ...prev, policyId }) : null)}
                        effective={effectivePolicy}
                        source={policySource}
                        companyDefault={policyData?.companyDefault}
                        assignedTemplate={policyData?.assignedTemplate}
                    />
                </TabsContent>

                <TabsContent value="files" className="mt-0">
                    <EmployeeFilesTab
                        formData={employeeForm}
                        handleChange={(field, value) => setEmployeeForm(prev => prev ? ({ ...prev, [field]: value }) : null)}
                    />
                </TabsContent>

                <TabsContent value="danger-zone" className="mt-0">
                    <EmployeeDangerZone
                        employee={employeeForm}
                        onEmployeeDeleted={() => {
                            router.push(`/employer-portal/companies/${companyId}/employees`);
                        }}
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

