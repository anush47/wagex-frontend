"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconChecks, IconDeviceFloppy, IconChevronLeft, IconUsers, IconCalendarEvent, IconTable, IconCalculator, IconCheck, IconAlertCircle, IconShieldCheck, IconInfoCircle, IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { useSalaries } from "@/hooks/use-salaries";
import { useEmployees } from "@/hooks/use-employees";
import { useCompanyPolicies, useCompanyPolicy } from "@/hooks/use-policies";
import { format } from "date-fns";
import { toast } from "sonner";
import { SalaryPeriodQuickSelect } from "../../attendance/components/SalaryPeriodQuickSelect";
import { SalaryDetailsDialog } from "./SalaryDetailsDialog";
import { Salary, SalaryStatus } from "@/types/salary";
import { Policy } from "@/types/policy";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Step = "SELECTION" | "PERIOD" | "VALIDATION" | "PREVIEW";

export function GenerateSalaryDialog({
    open,
    onOpenChange,
    companyId
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    companyId: string;
}) {
    const [step, setStep] = useState<Step>("SELECTION");
    const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
    const [period, setPeriod] = useState<any | null>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [selectedPreview, setSelectedPreview] = useState<any | null>(null);

    const { data: allPolicies } = useCompanyPolicies(companyId);
    const { data: defaultPolicy } = useCompanyPolicy(companyId);
    const employeesQuery = useEmployees({ companyId, status: 'ACTIVE', limit: 100 });
    const employeesData = employeesQuery.data as any;
    const employees = Array.isArray(employeesData) ? employeesData : (employeesData?.data || []);
    const { generatePreviewsMutation, saveDraftsMutation } = useSalaries({});

    const payrollGroups = useMemo(() => {
        if (!employees || employees.length === 0) return [];

        const groupsMap = new Map<string, {
            config: any,
            policyIds: string[],
            employees: any[],
            name: string,
            policy: any
        }>();

        const policiesToProcess = allPolicies ? [...allPolicies] : [];
        const defaultPolicyId = defaultPolicy?.id;

        if (defaultPolicy && !policiesToProcess.find(p => p.id === defaultPolicyId)) {
            policiesToProcess.push(defaultPolicy);
        }

        const getDisplayFrequency = (f: string) => {
            const map: any = { 'MONTHLY': 'Monthly', 'WEEKLY': 'Weekly', 'BI_WEEKLY': 'Bi-Weekly', 'SEMI_MONTHLY': 'Semi-Monthly', 'DAILY': 'Daily' };
            return map[f] || f;
        };

        const getDisplayRunDay = (d: string) => {
            if (d === 'LAST') return 'Last Day of Month';
            return `Day ${d}`;
        };

        // 1. Identify and create groups from policies
        policiesToProcess.forEach(p => {
            let config = p.settings?.payrollConfiguration;

            // Even if config is missing, we use the policy as a basis for grouping
            const effectiveConfig = config || { frequency: 'MONTHLY', runDay: 'LAST', cutoffDaysBeforePayDay: 5 };
            const configKey = `${effectiveConfig.frequency}_${effectiveConfig.runDay}_${effectiveConfig.cutoffDaysBeforePayDay}`;

            if (!groupsMap.has(configKey)) {
                groupsMap.set(configKey, {
                    config: effectiveConfig,
                    policyIds: [p.id],
                    employees: [],
                    name: `${getDisplayFrequency(effectiveConfig.frequency)} (${getDisplayRunDay(effectiveConfig.runDay)})`,
                    policy: p
                });
            } else {
                groupsMap.get(configKey)!.policyIds.push(p.id);
            }
        });

        // 2. Fallback: Ensure at least one group if no policies found but employees exist
        if (groupsMap.size === 0) {
            groupsMap.set('default', {
                config: { frequency: 'MONTHLY', runDay: 'LAST', cutoffDaysBeforePayDay: 5 },
                policyIds: ['__none__'],
                employees: [],
                name: 'Standard Payroll (Monthly)',
                policy: defaultPolicy || null
            });
        }

        // 3. Assign employees to their respective groups
        employees.forEach((emp: any) => {
            const effPolicyId = emp.policyId || defaultPolicyId;
            let targetGroup = Array.from(groupsMap.values()).find(g => g.policyIds.includes(effPolicyId as string));

            // If still not found, put into the first available group or default
            if (!targetGroup) {
                targetGroup = Array.from(groupsMap.values())[0];
            }

            if (targetGroup) {
                targetGroup.employees.push(emp);
            }
        });

        return Array.from(groupsMap.entries())
            .map(([key, group]) => ({ key, ...group }))
            .filter(g => g.employees.length > 0);
    }, [allPolicies, defaultPolicy, employees]);

    const activeGroup = useMemo(() => {
        return payrollGroups.find(g => g.key === selectedGroupKey);
    }, [payrollGroups, selectedGroupKey]);

    useEffect(() => {
        if (payrollGroups.length > 0 && !selectedGroupKey) {
            const firstGroup = payrollGroups[0];
            setSelectedGroupKey(firstGroup.key);
            setSelectedEmployees(firstGroup.employees.map((e: any) => e.id));
        }
    }, [payrollGroups, selectedGroupKey]);

    const handleGeneratePreview = async () => {
        if (!period) return;
        try {
            const data = await generatePreviewsMutation.mutateAsync({
                companyId,
                periodStartDate: period.start,
                periodEndDate: period.end,
                employeeIds: selectedEmployees,
            });
            setPreviewData(data);
            setStep("VALIDATION");
        } catch (error) {
            toast.error("Failed to generate previews");
        }
    };

    const handleSaveDrafts = async () => {
        try {
            await saveDraftsMutation.mutateAsync({
                companyId,
                previews: previewData
            });
            onOpenChange(false);
            setStep("SELECTION");
            setPreviewData([]);
            setSelectedEmployees([]);
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleUpdatePreviewRow = (updatedRow: any) => {
        setPreviewData(prev => prev.map(group => ({
            ...group,
            employees: group.employees.map((row: any) =>
                row.employeeId === updatedRow.employeeId ? updatedRow : row
            )
        })));
    };

    const toggleEmployee = (id: string) => {
        setSelectedEmployees(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAllEmployees = () => {
        const groupEmployees = activeGroup?.employees || [];
        if (selectedEmployees.length === groupEmployees.length) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(groupEmployees.map((e: any) => e.id));
        }
    };

    const steps = [
        { id: "SELECTION", icon: IconUsers, label: "Staff" },
        { id: "PERIOD", icon: IconCalendarEvent, label: "Period" },
        { id: "VALIDATION", icon: IconShieldCheck, label: "Validate" },
        { id: "PREVIEW", icon: IconTable, label: "Preview" },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === step);

    return (
        <Dialog open={open} onOpenChange={(v) => {
            onOpenChange(v);
            if (!v) {
                setStep("SELECTION");
                setPreviewData([]);
            }
        }}>
            <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[90vh]">
                <DialogHeader className="p-6 pb-4 border-b shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                                <IconCalculator className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight">
                                    Generate Salaries
                                </DialogTitle>
                                <DialogDescription className="text-xs font-medium text-muted-foreground">
                                    Follow the steps to generate salary slips for your employees.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center justify-between px-4 sm:px-12 relative">
                        <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-0.5 bg-muted -z-10" />
                        {steps.map((s, idx) => {
                            const active = step === s.id;
                            const done = idx < currentStepIndex;
                            return (
                                <div key={s.id} className="flex flex-col items-center gap-2 bg-background px-2">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${active ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                                        done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        <s.icon className="h-4 w-4" />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/20">
                    {step === "SELECTION" && (
                        <div className="space-y-6">
                            <Card className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold">1. Select Payroll Group</h3>
                                        <p className="text-sm text-muted-foreground">Employees are grouped by their cycle frequency and pay day.</p>
                                    </div>

                                    {(employeesQuery.isLoading || !allPolicies) ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                            {[1, 2].map(i => (
                                                <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                                            {payrollGroups.map((group) => (
                                                <div
                                                    key={group.key}
                                                    onClick={() => {
                                                        setSelectedGroupKey(group.key);
                                                        setSelectedEmployees(group.employees.map((e: any) => e.id));
                                                    }}
                                                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-1 ${selectedGroupKey === group.key ? 'bg-primary/5 border-primary shadow-lg ring-1 ring-primary/10' : 'bg-background border-muted hover:border-primary/20'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-black text-sm uppercase tracking-tight text-neutral-800 dark:text-neutral-200">
                                                            {group.name}
                                                        </span>
                                                        {selectedGroupKey === group.key && <IconCheck className="h-5 w-5 text-primary" />}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <IconUsers className="h-4 w-4 text-primary/60" />
                                                        <span className="text-xs text-muted-foreground font-bold italic">
                                                            {group.employees.length} Staff Members
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {selectedGroupKey && activeGroup && (
                                <Card className="p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold">2. Select Staff Members</h3>
                                            <p className="text-xs text-muted-foreground">Only selected staff will be included in the salary run.</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-muted/50 px-4 py-2 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <Checkbox checked={selectedEmployees.length === (activeGroup?.employees?.length || 0)} onCheckedChange={selectAllEmployees} id="select-all" />
                                                <label htmlFor="select-all" className="text-xs font-black uppercase tracking-tight cursor-pointer">Select All</label>
                                            </div>
                                            <div className="h-4 w-px bg-border" />
                                            <span className="text-[10px] font-bold text-primary">{selectedEmployees.length} of {activeGroup.employees.length} Selected</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
                                        {activeGroup.employees.map((employee: any) => (
                                            <div
                                                key={employee.id}
                                                onClick={() => toggleEmployee(employee.id)}
                                                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${selectedEmployees.includes(employee.id) ? 'bg-primary/5 border-primary/40' : 'bg-background border-muted hover:border-primary/20'}`}
                                            >
                                                <Checkbox checked={selectedEmployees.includes(employee.id)} />
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="font-bold text-sm truncate">{employee.fullName}</span>
                                                    <span className="text-[9px] text-muted-foreground font-mono font-bold tracking-tighter uppercase opacity-70">EMP {employee.employeeNo}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}

                    {step === "PERIOD" && (
                        <div className="max-w-xl mx-auto py-12 space-y-8 text-center animate-in fade-in zoom-in-95 duration-300">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black tracking-tight">Select Payroll Period</h3>
                                <p className="text-muted-foreground italic">Choose the date range for your selected staff batch.</p>
                            </div>

                            <div className="flex justify-center">
                                <SalaryPeriodQuickSelect
                                    companyId={companyId}
                                    manualPolicy={activeGroup?.policy}
                                    onRangeSelect={(start, end, fullPeriod) => setPeriod(fullPeriod || { start, end })}
                                    currentStart={period?.start}
                                    currentEnd={period?.end}
                                />
                            </div>

                            {period && (
                                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-primary text-primary-foreground p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-2 mx-auto max-w-sm relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Payroll Cycle</span>
                                        <div className="text-2xl font-black">
                                            {format(new Date(period.start), "MMM d")} - {format(new Date(period.end), "MMM d, yyyy")}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                                        <div className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border-2 border-primary/10 shadow-sm flex flex-col items-center gap-1">
                                            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                <IconCalendarEvent className="h-3 w-3 text-primary" /> Attendance Period
                                            </span>
                                            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                                {period.attendanceStart ? `${format(new Date(period.attendanceStart), "MMM d")} - ${format(new Date(period.attendanceEnd), "MMM d")}` : "Derived from cycle"}
                                            </span>
                                        </div>
                                        <div className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border-2 border-primary/10 shadow-sm flex flex-col items-center gap-1">
                                            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                <IconCheck className="h-3 w-3 text-green-500" /> Pay Day (Target)
                                            </span>
                                            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                                {period.payDay ? format(new Date(period.payDay), "MMMM d, yyyy") : "Scheduled"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-bold italic pt-2">
                                        Using Policy: <span className="text-primary not-italic">{activeGroup?.policy?.name || 'Standard Payroll'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === "VALIDATION" && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-2xl mx-auto">
                            <div className="text-center space-y-2 mb-8 relative">
                                <h3 className="text-2xl font-black tracking-tight">Audit & Validation</h3>
                                <p className="text-sm text-muted-foreground italic">Checking staff records for conflicts, missing logs, or pending approvals.</p>
                                <div className="pt-2 flex justify-center">
                                    <Button
                                        variant="outline"
                                        size="xs"
                                        onClick={handleGeneratePreview}
                                        disabled={generatePreviewsMutation.isPending}
                                        className="h-7 text-[10px] font-black uppercase tracking-wider gap-1.5 border-neutral-200"
                                    >
                                        <IconRefresh className={`h-3 w-3 ${generatePreviewsMutation.isPending ? 'animate-spin' : ''}`} />
                                        {generatePreviewsMutation.isPending ? 'Re-auditing...' : 'Re-run Audit'}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card className="p-6 border-2 border-green-100 bg-green-50/10 flex flex-col items-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                        <IconCheck className="h-6 w-6" />
                                    </div>
                                    <span className="text-2xl font-black text-green-700">
                                        {previewData.reduce((s, g) => s + g.employees.filter((e: any) => !e.hasProblems).length, 0)}
                                    </span>
                                    <span className="text-[10px] font-black uppercase text-green-600 tracking-wider">Ready for Payroll</span>
                                </Card>
                                <Card className={`p-6 border-2 flex flex-col items-center gap-2 ${previewData.some(g => g.employees.some((e: any) => e.problems.some((p: any) => p.severity === 'ERROR'))) ? 'border-red-100 bg-red-50/10' : previewData.some(g => (g.problemCount || 0) > 0) ? 'border-amber-100 bg-amber-50/10' : 'border-neutral-100'}`}>
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${previewData.some(g => g.employees.some((e: any) => e.problems.some((p: any) => p.severity === 'ERROR'))) ? 'bg-red-100 text-red-600' : previewData.some(g => (g.problemCount || 0) > 0) ? 'bg-amber-100 text-amber-600' : 'bg-neutral-100 text-neutral-400'}`}>
                                        <IconAlertTriangle className="h-6 w-6" />
                                    </div>
                                    <span className={`text-2xl font-black ${previewData.some(g => g.employees.some((e: any) => e.problems.some((p: any) => p.severity === 'ERROR'))) ? 'text-red-700' : previewData.some(g => (g.problemCount || 0) > 0) ? 'text-amber-700' : 'text-neutral-400'}`}>
                                        {previewData.reduce((s, g) => s + (g.problemCount || 0), 0)}
                                    </span>
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${previewData.some(g => g.employees.some((e: any) => e.problems.some((p: any) => p.severity === 'ERROR'))) ? 'text-red-600' : previewData.some(g => (g.problemCount || 0) > 0) ? 'text-amber-600' : 'text-neutral-400'}`}>
                                        {previewData.some(g => g.employees.some((e: any) => e.problems.some((p: any) => p.severity === 'ERROR'))) ? 'Fix Errors' : (previewData.some(g => (g.problemCount || 0) > 0) ? 'Warnings Found' : 'Requires Attention')}
                                    </span>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Identified Issues By Staff</div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                    {previewData.flatMap(g => g.employees).filter((e: any) => e.hasProblems).map((employee: any, idx) => (
                                        <div key={idx} className={`bg-white border-2 rounded-2xl p-4 flex flex-col gap-3 shadow-sm ${employee.problems.some((p: any) => p.severity === 'ERROR') ? 'border-red-50' : 'border-amber-50'}`}>
                                            <div className={`flex justify-between items-center pb-2 border-b ${employee.problems.some((p: any) => p.severity === 'ERROR') ? 'border-red-50' : 'border-amber-50'}`}>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-neutral-800">{employee.employeeName}</span>
                                                    <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-tighter uppercase opacity-70">EMP {employee.employeeNo}</span>
                                                </div>
                                                <Badge
                                                    variant={employee.problems.some((p: any) => p.severity === 'ERROR') ? "destructive" : "outline"}
                                                    className={`font-bold px-2 py-0 text-[10px] ${employee.problems.some((p: any) => p.severity === 'ERROR') ? 'bg-red-500' : 'border-amber-400 text-amber-700 bg-amber-50'}`}
                                                >
                                                    {employee.problems.some((p: any) => p.severity === 'ERROR') ? 'FIX REQUIRED' : 'REVIEW NEEDED'}
                                                </Badge>
                                            </div>
                                            <div className="space-y-2">
                                                {employee.problems.map((prob: any, pIdx: number) => (
                                                    <div key={pIdx} className={`flex gap-2 text-xs font-medium ${prob.severity === 'ERROR' ? 'text-red-600/90' : 'text-amber-600/90'}`}>
                                                        <IconAlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                                        <span>{prob.message}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {previewData.reduce((s, g) => s + (g.problemCount || 0), 0) === 0 && (
                                        <div className="bg-green-50/30 border-2 border-dashed border-green-200 rounded-3xl p-12 flex flex-col items-center justify-center gap-4">
                                            <div className="h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                <IconShieldCheck className="h-10 w-10" />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-black text-green-700">All Clear!</div>
                                                <p className="text-sm text-green-600/70 italic font-medium">No unresolved sessions or pending leaves found for this period.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {previewData.some(g => g.employees.some((e: any) => e.problems.some((p: any) => p.severity === 'ERROR'))) ? (
                                <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex gap-3 items-start">
                                    <IconAlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-red-800 uppercase tracking-tighter block">Unresolved Errors</span>
                                        <p className="text-[11px] font-medium text-red-700/80 leading-relaxed italic">
                                            Salaries cannot be generated while sessions are missing clock-out times or attendance is pending approval. Please resolve these errors to proceed.
                                        </p>
                                    </div>
                                </div>
                            ) : previewData.some(g => (g.problemCount || 0) > 0) && (
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 items-start">
                                    <IconInfoCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-amber-800 uppercase tracking-tighter block">Data Warnings</span>
                                        <p className="text-[11px] font-medium text-amber-700/80 leading-relaxed italic">
                                            Some working days have no attendance or leave records. These will be treated as unpaid absences. You may proceed to preview or fix them in the Attendance tab.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === "PREVIEW" && (
                        <div className="space-y-6">
                            <Card className="overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Employee</TableHead>
                                                <TableHead>Basic</TableHead>
                                                <TableHead className="text-green-600">Additions</TableHead>
                                                <TableHead className="text-blue-600">OT</TableHead>
                                                <TableHead className="text-red-500">No Pay</TableHead>
                                                <TableHead className="text-red-500">Deductions</TableHead>
                                                <TableHead className="text-orange-500">Recovery</TableHead>
                                                <TableHead className="text-right">Net Salary</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {previewData.flatMap(group => group.employees).map((row, idx) => {
                                                const adds = (row.components as any[]).filter(c => c.category === 'ADDITION').reduce((s, c) => s + c.amount, 0);
                                                const deds = (row.components as any[]).filter(c => c.category === 'DEDUCTION').reduce((s, c) => s + c.amount, 0);
                                                return (
                                                    <TableRow
                                                        key={idx}
                                                        className="cursor-pointer hover:bg-muted/50"
                                                        onClick={() => setSelectedPreview(row)}
                                                    >
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-sm">{row.employeeName}</span>
                                                                <span className="text-[10px] text-muted-foreground font-mono">{row.employeeId.slice(0, 8)}...</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{row.basicSalary?.toLocaleString()}</TableCell>
                                                        <TableCell className="text-green-600">+{adds.toLocaleString()}</TableCell>
                                                        <TableCell className="text-blue-600">+{(row.otAmount + (row.otAdjustment || 0)).toLocaleString()}</TableCell>
                                                        <TableCell className="text-red-500">-{row.noPayAmount.toLocaleString()}</TableCell>
                                                        <TableCell className="text-red-500">-{deds.toLocaleString()}</TableCell>
                                                        <TableCell className="text-orange-500">-{row.advanceDeduction.toLocaleString()}</TableCell>
                                                        <TableCell className="text-right font-bold">
                                                            {row.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>

                            <div className="flex justify-end">
                                <div className="bg-primary text-primary-foreground p-4 rounded-xl shadow-lg flex items-center gap-6">
                                    <span className="text-xs font-bold uppercase opacity-80">Total Payable Amount</span>
                                    <span className="text-2xl font-black">
                                        LKR {previewData.reduce((s, g) => s + (g.totalNet || g.employees.reduce((sum: number, e: any) => sum + e.netSalary, 0)), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Details Dialog */}
                {selectedPreview && (
                    <SalaryDetailsDialog
                        open={!!selectedPreview}
                        onOpenChange={(open) => !open && setSelectedPreview(null)}
                        onSave={handleUpdatePreviewRow}
                        salary={{
                            ...selectedPreview,
                            id: 'PREVIEW-' + selectedPreview.employeeId,
                            status: SalaryStatus.DRAFT,
                            payDate: new Date().toISOString(),
                            employee: {
                                fullName: selectedPreview.employeeName,
                                employeeNo: (employees as any[]).find(e => e.id === selectedPreview.employeeId)?.employeeNo || 0
                            }
                        } as any}
                    />
                )}

                <DialogFooter className="p-6 border-t shrink-0 bg-background">
                    {step !== "SELECTION" && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (step === "PERIOD") setStep("SELECTION");
                                else if (step === "VALIDATION") setStep("PERIOD");
                                else if (step === "PREVIEW") setStep("VALIDATION");
                            }}
                            className="mr-auto"
                        >
                            <IconChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    )}

                    {step === "SELECTION" && (
                        <Button
                            disabled={selectedEmployees.length === 0}
                            onClick={() => setStep("PERIOD")}
                            className="w-full md:w-auto"
                        >
                            Next: Select Period <IconArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}

                    {step === "PERIOD" && (
                        <Button
                            disabled={!period || generatePreviewsMutation.isPending}
                            onClick={handleGeneratePreview}
                            className="w-full md:w-auto"
                        >
                            {generatePreviewsMutation.isPending ? "Calculating..." : "Run Audit & Validate"} <IconArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}

                    {step === "VALIDATION" && (
                        <Button
                            disabled={previewData.some(g => g.employees.some((e: any) => e.problems.some((p: any) => p.severity === 'ERROR')))}
                            onClick={() => setStep("PREVIEW")}
                            className="w-full md:w-auto"
                        >
                            Proceed to Preview <IconArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}

                    {step === "PREVIEW" && (
                        <Button
                            disabled={saveDraftsMutation.isPending}
                            onClick={handleSaveDrafts}
                            className="w-full md:w-auto shadow-lg shadow-primary/20"
                        >
                            <IconDeviceFloppy className="mr-2 h-4 w-4" />
                            {saveDraftsMutation.isPending ? "Saving..." : "Save Payroll Drafts"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
