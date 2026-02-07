"use client";

import { useEffect, useState } from "react";
import { EmployeeService } from "@/services/employee.service";
import { Employee } from "@/types/employee";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    IconDeviceFloppy,
    IconUser,
    IconFiles,
    IconLoader2
} from "@tabler/icons-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";
import { EmployeeGeneralTab } from "../../employer-portal/companies/[id]/employees/[employeeId]/components/EmployeeGeneralTab";
import { EmployeeFilesTab } from "../../employer-portal/companies/[id]/employees/[employeeId]/components/EmployeeFilesTab";
import { useMe, useEmployeeMutations } from "@/hooks/use-employees";

export default function EmployeeProfilePage() {
    const t = useTranslations("Common");
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // React Query Hooks
    const { data: me, isLoading: loading, refetch } = useMe();
    const { updateEmployee } = useEmployeeMutations();

    // Employee Data
    const [employeeForm, setEmployeeForm] = useState<Employee | null>(null);

    // Tab State
    const initialTab = searchParams.get("tab") || "general";
    const [activeTab, setActiveTab] = useState(initialTab);

    // Sync form with data
    useEffect(() => {
        if (me) {
            setEmployeeForm(JSON.parse(JSON.stringify(me)));
        }
    }, [me]);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const canonicalStringify = (obj: any): string => {
        if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
        if (Array.isArray(obj)) return '[' + obj.map(canonicalStringify).join(',') + ']';
        return '{' + Object.keys(obj).sort().map(key => JSON.stringify(key) + ':' + canonicalStringify(obj[key])).join(',') + '}';
    };

    const isDirty = canonicalStringify(me) !== canonicalStringify(employeeForm);
    const canSelfEdit = employeeForm?.canSelfEdit ?? true;

    const handleSave = async () => {
        if (!canSelfEdit) {
            toast.error("You do not have permission to edit your details.");
            return;
        }

        if (employeeForm && me) {
            const {
                id: _id,
                createdAt,
                updatedAt,
                company,
                user,
                userId,
                employeeNo, // Read-only
                basicSalary, // Read-only for employee
                status, // Read-only for employee
                ...payload
            } = employeeForm as any;

            await updateEmployee.mutateAsync({ id: me.id, data: payload });
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
                <div className="h-20 w-full bg-neutral-100 dark:bg-neutral-900/50 rounded-[2.5rem]" />
                <div className="grid grid-cols-3 gap-6">
                    <div className="h-32 bg-neutral-50 dark:bg-neutral-900/30 rounded-[2rem]" />
                    <div className="h-32 bg-neutral-50 dark:bg-neutral-900/30 rounded-[2rem]" />
                    <div className="h-32 bg-neutral-50 dark:bg-neutral-900/30 rounded-[2rem]" />
                </div>
            </div>
        );
    }

    if (!employeeForm) return <div className="p-20 text-center font-bold">Profile not found</div>;

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 relative pb-24">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-sm">
                <div className="flex items-center gap-6">
                    <EmployeeAvatar
                        photo={employeeForm.photo}
                        name={employeeForm.nameWithInitials}
                        className="h-20 w-20 md:h-24 md:w-24 rounded-[2rem] text-3xl"
                    />
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black tracking-tighter uppercase">{employeeForm.nameWithInitials}</h1>
                            <Badge className={cn(
                                "h-6 rounded-lg text-[10px] uppercase tracking-tighter px-2 border-none font-bold",
                                employeeForm.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600 shadow-sm" : "bg-neutral-100 text-neutral-400"
                            )}>
                                {employeeForm.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-neutral-500 font-bold text-xs uppercase tracking-widest">
                            <span className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                                ID: <span className="text-primary font-black">{employeeForm.employeeNo}</span>
                            </span>
                            <span>{employeeForm.designation}</span>
                        </div>
                    </div>
                </div>

                {!canSelfEdit && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
                        <span className="text-xs font-black uppercase tracking-widest">Read Only Mode</span>
                    </div>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-10">
                <TabsList className="w-full flex flex-wrap !h-auto gap-2 bg-transparent p-0 justify-start border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
                    <TabsTrigger
                        value="general"
                        className="rounded-xl px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 data-[state=active]:border-primary bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                    >
                        <IconUser className="w-4 h-4" />
                        Personal Details
                    </TabsTrigger>
                    <TabsTrigger
                        value="files"
                        className="rounded-xl px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 data-[state=active]:border-primary bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                    >
                        <IconFiles className="w-4 h-4" />
                        My Documents
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Reusing the tab, but we should make sure it doesn't allow editing read-only fields if not employer */}
                    {/* For now, the component handles state, we just need to ensure the save button reflects permissions */}
                    <EmployeeGeneralTab
                        formData={employeeForm}
                        onChange={(field, value) => {
                            if (!canSelfEdit) return;
                            // Prevent self-editing of critical fields
                            if (['employeeNo', 'basicSalary', 'status', 'joinedDate', 'resignedDate'].includes(field as string)) return;
                            setEmployeeForm(prev => prev ? ({ ...prev, [field]: value }) : null);
                        }}
                        onDetailChange={(field, value) => {
                            if (!canSelfEdit) return;
                            setEmployeeForm(prev => prev ? ({
                                ...prev,
                                details: {
                                    ...(prev.details || {}),
                                    [field]: value
                                }
                            } as Employee) : null);
                        }}
                    />
                </TabsContent>

                <TabsContent value="files" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <EmployeeFilesTab
                        formData={employeeForm}
                        handleChange={(field, value) => {
                            if (!canSelfEdit) return;
                            setEmployeeForm(prev => prev ? ({ ...prev, [field]: value }) : null);
                        }}
                        disabled={!canSelfEdit}
                    />
                </TabsContent>
            </Tabs>

            {/* Save Button */}
            <AnimatePresence>
                {isDirty && canSelfEdit && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 right-8 z-50"
                    >
                        <Button
                            onClick={handleSave}
                            disabled={updateEmployee.isPending}
                            size="lg"
                            className="rounded-full shadow-2xl px-8 h-14 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all text-base font-bold"
                        >
                            {updateEmployee.isPending ? (
                                <>
                                    <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <IconDeviceFloppy className="mr-2 h-5 w-5" />
                                    Update Profile
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

