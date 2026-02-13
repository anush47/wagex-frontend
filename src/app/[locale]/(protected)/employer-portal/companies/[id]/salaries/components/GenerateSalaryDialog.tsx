"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconChecks, IconDeviceFloppy, IconChevronLeft, IconUsers, IconCalendarEvent, IconTable } from "@tabler/icons-react";
import { useSalaries } from "@/hooks/use-salaries";
import { useEmployees } from "@/hooks/use-employees";
import { format } from "date-fns";
import { toast } from "sonner";
import { SalaryPeriodQuickSelect } from "../../attendance/components/SalaryPeriodQuickSelect";
import { SalaryDetailsDialog } from "./SalaryDetailsDialog";
import { Salary, SalaryStatus } from "@/types/salary";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Step = "PERIOD" | "EMPLOYEES" | "PREVIEW";

export function GenerateSalaryDialog({
    open,
    onOpenChange,
    companyId
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    companyId: string;
}) {
    const [step, setStep] = useState<Step>("PERIOD");
    const [period, setPeriod] = useState<{ start: string; end: string } | null>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [selectedPreview, setSelectedPreview] = useState<any | null>(null);

    const employeesQuery = useEmployees({ companyId, status: 'ACTIVE' });
    const employeesData = employeesQuery.data as any;
    const employees = Array.isArray(employeesData) ? employeesData : (employeesData?.data || []);
    const { generatePreviewsMutation, saveDraftsMutation } = useSalaries({});

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
            setStep("PREVIEW");
        } catch (error) {
            toast.error("Failed to generate previews");
        }
    };

    const handleSaveDrafts = async () => {
        try {
            await saveDraftsMutation.mutateAsync(previewData);
            onOpenChange(false);
            setStep("PERIOD");
            setPreviewData([]);
            setSelectedEmployees([]);
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleUpdatePreviewRow = (updatedRow: any) => {
        setPreviewData(prev => prev.map(row =>
            row.employeeId === updatedRow.employeeId ? updatedRow : row
        ));
    };

    const toggleEmployee = (id: string) => {
        setSelectedEmployees(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAllEmployees = () => {
        if (selectedEmployees.length === employees.length) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(employees.map((e: any) => e.id));
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => {
            onOpenChange(v);
            if (!v) {
                setStep("PERIOD");
                setPreviewData([]);
            }
        }}>
            <DialogContent className="sm:max-w-[90vw] lg:max-w-6xl w-full rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="flex flex-col md:flex-row min-h-[60vh] max-h-[90vh]">
                    {/* Sidebar Steps */}
                    <div className="md:w-80 w-full bg-neutral-900 p-10 flex flex-col gap-10 shrink-0">
                        <div className="flex items-center gap-3 text-white mb-4">
                            <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
                                <IconChecks className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="font-black uppercase tracking-tighter text-xl leading-none">Payroll<br />Wizard</h2>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: "PERIOD", icon: IconCalendarEvent, label: "Period" },
                                { id: "EMPLOYEES", icon: IconUsers, label: "Employees" },
                                { id: "PREVIEW", icon: IconTable, label: "Preview" },
                            ].map((s, idx) => {
                                const active = step === s.id;
                                const done = idx < ["PERIOD", "EMPLOYEES", "PREVIEW"].indexOf(step);
                                return (
                                    <div key={s.id} className="flex items-center gap-4 group">
                                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-primary shadow-2xl shadow-primary/60 scale-110' : done ? 'bg-green-500/20 text-green-500' : 'bg-neutral-800/50 text-neutral-600'}`}>
                                            <s.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${active ? 'text-primary' : 'text-neutral-600'}`}>Step {idx + 1}</span>
                                            <span className={`text-xs font-black uppercase tracking-widest ${active ? 'text-white' : 'text-neutral-500'}`}>{s.label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
                        <DialogHeader className="p-10 pb-4 shrink-0">
                            <div className="flex flex-col gap-1">
                                <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-neutral-900 leading-none">
                                    {step === "PERIOD" && "Payroll Period"}
                                    {step === "EMPLOYEES" && "Staff Selection"}
                                    {step === "PREVIEW" && "Review Calculations"}
                                </DialogTitle>
                                <DialogDescription className="text-[11px] font-black uppercase tracking-[0.15em] text-neutral-400">
                                    {step === "PERIOD" && "Configure the time range for this payroll batch"}
                                    {step === "EMPLOYEES" && `Choose which employees to include in this cycle`}
                                    {step === "PREVIEW" && "Review the calculated net payouts for the selected staff"}
                                </DialogDescription>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                            {step === "PERIOD" && (
                                <div className="max-w-md mx-auto py-8 space-y-8">
                                    <div className="p-8 bg-neutral-50 rounded-[2.5rem] border border-neutral-100 shadow-inner space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">Quick Select</label>
                                        <SalaryPeriodQuickSelect
                                            companyId={companyId}
                                            onRangeSelect={(start, end) => setPeriod({ start, end })}
                                            currentStart={period?.start}
                                            currentEnd={period?.end}
                                        />
                                    </div>
                                    {period && (
                                        <div className="bg-primary p-8 rounded-[2.5rem] shadow-2xl shadow-primary/20 flex items-center justify-between text-white">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/60 mb-1">Involved Period</span>
                                                <span className="font-black text-2xl tracking-tighter leading-none">
                                                    {format(new Date(period.start), "MMM d")} - {format(new Date(period.end), "MMM d, yyyy")}
                                                </span>
                                            </div>
                                            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                                                <IconCalendarEvent className="text-white h-7 w-7" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === "EMPLOYEES" && (
                                <Card className="border-none shadow-none">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <div className="flex items-center gap-3">
                                            <Checkbox checked={selectedEmployees.length === employees.length} onCheckedChange={selectAllEmployees} />
                                            <span className="text-xs font-black uppercase tracking-tight">Select All ({employees.length})</span>
                                        </div>
                                        <Badge variant="outline" className="font-bold">{selectedEmployees.length} Selected</Badge>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {employees.map((employee: any) => (
                                            <div
                                                key={employee.id}
                                                onClick={() => toggleEmployee(employee.id)}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${selectedEmployees.includes(employee.id) ? 'bg-primary/5 border-primary/20' : 'bg-neutral-50 border-neutral-100 hover:border-neutral-200'}`}
                                            >
                                                <Checkbox checked={selectedEmployees.includes(employee.id)} />
                                                <div className="flex flex-col">
                                                    <span className="font-black text-xs uppercase text-neutral-900 leading-tight">{employee.fullName}</span>
                                                    <span className="text-[10px] font-mono text-neutral-400">EMP-{employee.employeeNo}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {step === "PREVIEW" && (
                                <div className="space-y-6">
                                    <div className="overflow-x-auto rounded-3xl border border-neutral-100 shadow-sm">
                                        <Table>
                                            <TableHeader className="bg-neutral-50 font-black text-[10px] uppercase tracking-wider">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="px-6">Employee</TableHead>
                                                    <TableHead>Basic</TableHead>
                                                    <TableHead>Additions</TableHead>
                                                    <TableHead>OT</TableHead>
                                                    <TableHead>No Pay</TableHead>
                                                    <TableHead>Deductions</TableHead>
                                                    <TableHead>Recovery</TableHead>
                                                    <TableHead className="text-right whitespace-nowrap">Net Salary</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {previewData.map((row, idx) => {
                                                    const adds = (row.components as any[]).filter(c => c.category === 'ADDITION').reduce((s, c) => s + c.amount, 0);
                                                    const deds = (row.components as any[]).filter(c => c.category === 'DEDUCTION').reduce((s, c) => s + c.amount, 0);
                                                    return (
                                                        <TableRow
                                                            key={idx}
                                                            className="border-neutral-50 group hover:bg-neutral-50/50 cursor-pointer"
                                                            onClick={() => setSelectedPreview(row)}
                                                        >
                                                            <TableCell className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="font-black text-xs uppercase text-neutral-800 leading-tight">{row.employeeName}</span>
                                                                    <span className="text-[9px] font-mono font-bold text-neutral-400 mt-0.5">{row.employeeId.slice(0, 13).toUpperCase()}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-bold text-xs">{row.basicSalary.toLocaleString()}</TableCell>
                                                            <TableCell className="font-bold text-xs text-green-600">+{adds.toLocaleString()}</TableCell>
                                                            <TableCell className="font-bold text-xs text-blue-600">+{row.otAmount.toLocaleString()}</TableCell>
                                                            <TableCell className="font-bold text-xs text-red-600">-{row.noPayAmount.toLocaleString()}</TableCell>
                                                            <TableCell className="font-bold text-xs text-red-600">-{deds.toLocaleString()}</TableCell>
                                                            <TableCell className="font-bold text-xs text-orange-600">-{row.advanceDeduction.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right">
                                                                <span className="px-3 py-1 bg-neutral-900 text-white rounded-lg font-black text-xs">
                                                                    {row.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div className="p-6 bg-neutral-900 rounded-[2rem] flex items-center justify-between shadow-xl shadow-neutral-900/20">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-neutral-500 mb-1">Batch Total (Net)</span>
                                            <span className="text-3xl font-black text-white tracking-tighter">
                                                LKR {previewData.reduce((s, r) => s + r.netSalary, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <IconTable className="h-10 w-10 text-neutral-800" />
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
                                    payDate: new Date().toISOString(), // Mock
                                    employee: {
                                        fullName: selectedPreview.employeeName,
                                        employeeNo: (employees as any[]).find(e => e.id === selectedPreview.employeeId)?.employeeNo || 0
                                    }
                                } as any}
                            />
                        )}

                        <DialogFooter className="p-10 border-t border-neutral-100 gap-4 shrink-0 bg-neutral-50/50">
                            {step !== "PERIOD" && (
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(step === "EMPLOYEES" ? "PERIOD" : "EMPLOYEES")}
                                    className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-wider"
                                >
                                    <IconChevronLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            )}
                            <div className="flex-1" />
                            {step === "PERIOD" && (
                                <Button
                                    disabled={!period}
                                    onClick={() => setStep("EMPLOYEES")}
                                    className="rounded-2xl h-12 px-10 font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
                                >
                                    Select Employees <IconArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {step === "EMPLOYEES" && (
                                <Button
                                    disabled={selectedEmployees.length === 0 || generatePreviewsMutation.isPending}
                                    onClick={handleGeneratePreview}
                                    className="rounded-2xl h-12 px-10 font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
                                >
                                    {generatePreviewsMutation.isPending ? "Calculating..." : "Generate Preview"} <IconArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {step === "PREVIEW" && (
                                <Button
                                    disabled={saveDraftsMutation.isPending}
                                    onClick={handleSaveDrafts}
                                    className="rounded-2xl h-14 bg-primary px-12 font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-105 active:scale-[0.98] transition-all"
                                >
                                    <IconDeviceFloppy className="mr-3 h-5 w-5" />
                                    {saveDraftsMutation.isPending ? "Saving..." : "Save Drafts"}
                                </Button>
                            )}
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
