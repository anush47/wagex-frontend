"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Policy, PolicySettings } from "@/types/policy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    IconClock, IconCalendarStats, IconCoin, IconSettings,
    IconCalendarTime, IconCalendarStar, IconPlus, IconTrash,
    IconSearch, IconCheck, IconAlertCircle, IconDeviceFloppy,
    IconLayoutGrid, IconAlertTriangle, IconLoader2
} from "@tabler/icons-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ShiftsSection } from "./policy/ShiftsSection";
import { PayrollSection } from "./policy/PayrollSection";
import { PayrollSettingsTab } from "./policy/PayrollSettingsTab";
import { WorkingDaysTab } from "./policy/WorkingDaysTab";
import { AttendanceTab } from "./policy/AttendanceTab";
import { LeavesTab } from "./policy/LeavesTab";
import { useCompanyPolicies, usePolicyMutations } from "@/hooks/use-policies";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PoliciesManagementProps {
    companyId: string;
}

export function PoliciesManagement({ companyId }: PoliciesManagementProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Data fetching
    const { data: policies = [], isLoading } = useCompanyPolicies(companyId);
    const { savePolicy, updatePolicy, deletePolicy } = usePolicyMutations();

    // Local state
    const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [newPolicyName, setNewPolicyName] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Editing state for the selected policy
    const [editingSettings, setEditingSettings] = useState<PolicySettings | null>(null);
    const [editingMeta, setEditingMeta] = useState({ name: "", description: "", isDefault: false });

    const currentTab = searchParams.get("policyTab") || "shifts";

    // Find the currently selected policy object
    const selectedPolicy = useMemo(() =>
        policies.find(p => p.id === selectedPolicyId) || policies.find(p => p.isDefault) || policies[0]
        , [policies, selectedPolicyId]);

    const defaultPolicy = useMemo(() => policies.find(p => p.isDefault), [policies]);

    const overriddenTabs = useMemo(() => {
        if (!selectedPolicy || !defaultPolicy || selectedPolicy.id === defaultPolicy.id || !editingSettings) {
            return new Set<string>();
        }

        const tabs = new Set<string>();
        const df = defaultPolicy.settings;
        const cur = editingSettings;

        // Helper to check if section is effectively different
        const isDifferent = (a: any, b: any) => JSON.stringify(a) !== JSON.stringify(b);

        if (isDifferent(cur.shifts, df.shifts)) tabs.add('shifts');
        if (isDifferent(cur.workingDays, df.workingDays)) tabs.add('working-days');
        if (isDifferent(cur.salaryComponents, df.salaryComponents)) tabs.add('salary-components');
        if (isDifferent(cur.payrollConfiguration, df.payrollConfiguration)) tabs.add('payroll-settings');
        if (isDifferent(cur.attendance, df.attendance)) tabs.add('attendance');
        if (isDifferent(cur.leaves, df.leaves)) tabs.add('leaves');

        return tabs;
    }, [selectedPolicy, defaultPolicy, editingSettings]);

    const handleResetSection = (tab: string) => {
        if (!defaultPolicy || !editingSettings) return;
        const df = defaultPolicy.settings;

        // Map tab value to PolicySettings key
        const tabToKey: Record<string, keyof PolicySettings> = {
            'shifts': 'shifts',
            'working-days': 'workingDays',
            'salary-components': 'salaryComponents',
            'payroll-settings': 'payrollConfiguration',
            'attendance': 'attendance',
            'leaves': 'leaves'
        };

        const key = tabToKey[tab];
        if (key) {
            setEditingSettings({ ...editingSettings, [key]: df[key] });
            toast.success(`Reset section to company default`);
        }
    };

    // Initialize editing state when selection changes
    useEffect(() => {
        if (selectedPolicy) {
            setSelectedPolicyId(selectedPolicy.id);
            setEditingSettings(JSON.parse(JSON.stringify(selectedPolicy.settings)));
            setEditingMeta({
                name: selectedPolicy.name,
                description: selectedPolicy.description || "",
                isDefault: selectedPolicy.isDefault
            });
        }
    }, [selectedPolicy]);

    const handleTabChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("policyTab", val);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleSave = async () => {
        if (!selectedPolicyId || !editingSettings) return;

        await updatePolicy.mutateAsync({
            id: selectedPolicyId,
            companyId,
            data: {
                name: editingMeta.name,
                description: editingMeta.description,
                isDefault: editingMeta.isDefault,
                settings: editingSettings
            }
        });
    };

    const handleCreate = async () => {
        if (!newPolicyName.trim()) return;

        await savePolicy.mutateAsync({
            companyId,
            name: newPolicyName,
            isDefault: policies.length === 0, // Mark as default if it's the first one
            settings: {} // Empty settings to start
        });

        setNewPolicyName("");
        setIsAdding(false);
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        await deletePolicy.mutateAsync({ id: deletingId, companyId });
        setDeletingId(null);
    };

    const isDirty = useMemo(() => {
        if (!selectedPolicy || !editingSettings) return false;
        return JSON.stringify(selectedPolicy.settings) !== JSON.stringify(editingSettings) ||
            selectedPolicy.name !== editingMeta.name ||
            (selectedPolicy.description || "") !== editingMeta.description ||
            selectedPolicy.isDefault !== editingMeta.isDefault;
    }, [selectedPolicy, editingSettings, editingMeta]);

    const filteredPolicies = policies.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                {/* Header Selector Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-6 flex-1">
                        <div className="h-14 w-14 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                        <div className="flex-1 max-w-md space-y-2">
                            <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
                            <div className="h-12 w-full bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
                        </div>
                    </div>
                    <div className="h-12 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
                </div>

                {/* Tabs Skeleton */}
                <div className="space-y-6">
                    <div className="flex gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-10 w-24 bg-neutral-100 dark:bg-neutral-900 rounded-lg" />
                        ))}
                    </div>

                    {/* Content Skeleton */}
                    <div className="space-y-8">
                        <div className="h-64 w-full bg-neutral-100 dark:bg-neutral-900 rounded-[2.5rem]" />
                        <div className="h-48 w-full bg-neutral-100 dark:bg-neutral-900 rounded-[2.5rem]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header / Selector Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-6 flex-1">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                        <IconLayoutGrid className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0 max-w-md">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2 ml-1">Active Template</p>
                        <Select
                            value={selectedPolicyId || ""}
                            onValueChange={(val) => setSelectedPolicyId(val)}
                        >
                            <SelectTrigger className="h-12 w-full rounded-2xl font-bold bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 shadow-sm focus:ring-primary/20">
                                <SelectValue placeholder="Select a template..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl shadow-2xl border-neutral-100 dark:border-neutral-800">
                                {policies.map(p => (
                                    <SelectItem key={p.id} value={p.id} className="rounded-xl py-3 font-medium">
                                        <div className="flex items-center gap-2">
                                            {p.name}
                                            {p.isDefault && <Badge variant="secondary" className="scale-75 font-black uppercase tracking-tighter bg-neutral-100 text-neutral-500">Default</Badge>}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        className="rounded-2xl h-12 px-6 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 border-2 border-dashed border-neutral-200 dark:border-neutral-800"
                        onClick={() => setIsAdding(true)}
                    >
                        <IconPlus className="mr-2 h-4 w-4" /> Add Template
                    </Button>
                </div>
            </div>

            {isAdding && (
                <div className="bg-primary/5 p-6 rounded-[2.5rem] border-2 border-dashed border-primary/30 flex flex-col md:flex-row items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex-1 w-full">
                        <Input
                            autoFocus
                            placeholder="Template name (e.g. Morning Shift Only)..."
                            className="h-14 rounded-2xl bg-white dark:bg-neutral-950 border-primary/20 text-lg font-bold"
                            value={newPolicyName}
                            onChange={(e) => setNewPolicyName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button className="flex-1 md:w-32 h-14 rounded-2xl font-black bg-primary text-primary-foreground" onClick={handleCreate}>Create</Button>
                        <Button variant="ghost" className="h-14 rounded-2xl px-6 font-bold" onClick={() => setIsAdding(false)}>Cancel</Button>
                    </div>
                </div>
            )}

            {/* Editor Area */}
            {!selectedPolicy ? (
                <div className="h-96 flex flex-col items-center justify-center text-center p-12 bg-neutral-50 dark:bg-neutral-900/30 rounded-[3rem] border border-dashed border-neutral-200 dark:border-neutral-800">
                    <IconAlertCircle className="h-12 w-12 text-neutral-300 mb-4" />
                    <h4 className="font-bold text-neutral-400">No Template Selected</h4>
                    <p className="text-sm text-neutral-500">Pick an automation template at the top to configure its rules.</p>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 px-4">
                        <div className="space-y-1 group">
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-black tracking-tight uppercase">{editingMeta.name}</h3>
                                {editingMeta.isDefault && (
                                    <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-wider py-0.5 rounded-md">Default RuleSet</Badge>
                                )}
                            </div>
                            <Input
                                value={editingMeta.description}
                                onChange={(e) => setEditingMeta({ ...editingMeta, description: e.target.value })}
                                placeholder="Add a description for this template..."
                                className="border-none bg-transparent p-0 h-auto text-sm text-neutral-500 focus-visible:ring-0 italic font-medium w-full max-w-xl group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setDeletingId(selectedPolicy.id)}
                            disabled={selectedPolicy.isDefault}
                            className="rounded-2xl h-12 w-12 p-0 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-destructive hover:border-destructive/20 hover:bg-destructive/5 transition-all"
                        >
                            <IconTrash className="h-5 w-5" />
                        </Button>
                    </div>

                    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="w-full flex flex-wrap !h-auto gap-2 bg-transparent p-1 justify-start border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-8">
                            <TabTrigger value="shifts" icon={<IconClock className="h-4 w-4" />} label="Shifts" isOverridden={overriddenTabs.has('shifts')} />
                            <TabTrigger value="working-days" icon={<IconCalendarStats className="h-4 w-4" />} label="Calendar" isOverridden={overriddenTabs.has('working-days')} />
                            <TabTrigger value="salary-components" icon={<IconCoin className="h-4 w-4" />} label="Pay Items" isOverridden={overriddenTabs.has('salary-components')} />
                            <TabTrigger value="payroll-settings" icon={<IconCalendarTime className="h-4 w-4" />} label="Payroll" isOverridden={overriddenTabs.has('payroll-settings')} />
                            <TabTrigger value="attendance" icon={<IconCalendarStats className="h-4 w-4" />} label="Attendance" isOverridden={overriddenTabs.has('attendance')} />
                            <TabTrigger value="leaves" icon={<IconCalendarStar className="h-4 w-4" />} label="Leaves" isOverridden={overriddenTabs.has('leaves')} />
                        </TabsList>

                        {editingSettings && (
                            <div className="min-h-[400px] pb-32">
                                {overriddenTabs.has(currentTab) && (
                                    <div className="mb-8 bg-orange-500/5 border border-orange-500/10 p-4 rounded-[1.5rem] flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                                            <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                                <IconAlertTriangle className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-wider">Custom Override</p>
                                                <p className="text-xs opacity-70">This section has settings that differ from the Company Default.</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleResetSection(currentTab)}
                                            className="h-9 px-4 rounded-xl text-orange-600 hover:bg-orange-500/10 font-bold text-[10px] uppercase tracking-widest gap-2"
                                        >
                                            Reset to Default
                                        </Button>
                                    </div>
                                )}

                                <TabsContent value="shifts" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <ShiftsSection
                                        value={editingSettings.shifts || { list: [] }}
                                        onChange={(val) => setEditingSettings({ ...editingSettings, shifts: val })}
                                    />
                                </TabsContent>

                                <TabsContent value="salary-components" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <PayrollSection
                                        value={editingSettings.salaryComponents || { components: [] }}
                                        onChange={(val) => setEditingSettings({ ...editingSettings, salaryComponents: val })}
                                    />
                                </TabsContent>

                                <TabsContent value="payroll-settings" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <PayrollSettingsTab
                                        value={editingSettings.payrollConfiguration}
                                        onChange={(val) => setEditingSettings({ ...editingSettings, payrollConfiguration: val })}
                                    />
                                </TabsContent>

                                <TabsContent value="working-days" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <WorkingDaysTab
                                        value={editingSettings.workingDays}
                                        onChange={(val) => setEditingSettings({ ...editingSettings, workingDays: val })}
                                    />
                                </TabsContent>
                                <TabsContent value="attendance" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <AttendanceTab
                                        value={editingSettings.attendance}
                                        onChange={(val) => setEditingSettings({ ...editingSettings, attendance: val })}
                                    />
                                </TabsContent>
                                <TabsContent value="leaves" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <LeavesTab
                                        value={editingSettings.leaves}
                                        onChange={(val) => setEditingSettings({ ...editingSettings, leaves: val })}
                                    />
                                </TabsContent>
                            </div>
                        )}
                    </Tabs>
                </div>
            )}

            <AnimatePresence>
                {isDirty && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 right-8 z-50 transition-all duration-300"
                    >
                        <Button
                            onClick={handleSave}
                            disabled={updatePolicy.isPending}
                            size="lg"
                            className="h-14 px-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-base shadow-2xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-3 border border-white/10 dark:border-black/5"
                        >
                            {updatePolicy.isPending ? (
                                <>
                                    <IconLoader2 className="h-5 w-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <IconDeviceFloppy className="h-5 w-5" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmationDialog
                open={!!deletingId}
                onOpenChange={(open) => !open && setDeletingId(null)}
                title="Delete Template?"
                description="Are you sure you want to delete this policy template? This action cannot be undone and may affect employees assigned to this policy."
                icon={<IconTrash className="h-8 w-8 text-red-600" />}
                actionLabel="Delete Template"
                cancelLabel="Cancel"
                onAction={handleDelete}
                loading={deletePolicy.isPending}
                variant="destructive"
            />
        </div >
    );
}

function TabTrigger({ value, icon, label, isOverridden }: { value: string, icon: React.ReactNode, label: string, isOverridden?: boolean }) {
    return (
        <TabsTrigger
            value={value}
            className="rounded-lg px-3 py-2 text-xs font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary bg-transparent text-muted-foreground whitespace-nowrap relative"
        >
            {isOverridden && (
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-orange-500 shadow-sm animate-pulse" />
            )}
            <span className="mr-2 opacity-70 scale-90">{icon}</span>
            {label}
        </TabsTrigger>
    );
}
