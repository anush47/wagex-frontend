"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconChecks, IconDeviceFloppy, IconChevronLeft, IconUsers, IconCalendarEvent, IconTable, IconCalculator, IconCheck } from "@tabler/icons-react";
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

    const steps = [
        { id: "PERIOD", icon: IconCalendarEvent, label: "Period" },
        { id: "EMPLOYEES", icon: IconUsers, label: "Employees" },
        { id: "PREVIEW", icon: IconTable, label: "Preview" },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === step);

    return (
        <Dialog open={open} onOpenChange={(v) => {
            onOpenChange(v);
            if (!v) {
                setStep("PERIOD");
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
                    {step === "PERIOD" && (
                        <div className="max-w-md mx-auto py-8">
                            <Card className="p-6 space-y-6">
                                <div className="space-y-2 text-center">
                                    <h3 className="text-lg font-bold">Select Payroll Period</h3>
                                    <p className="text-sm text-muted-foreground">Choose the date range for this salary batch.</p>
                                </div>
                                <SalaryPeriodQuickSelect
                                    companyId={companyId}
                                    onRangeSelect={(start, end) => setPeriod({ start, end })}
                                    currentStart={period?.start}
                                    currentEnd={period?.end}
                                />
                                {period && (
                                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-muted-foreground font-bold uppercase">Selected Range</div>
                                            <div className="font-bold text-lg text-primary">
                                                {format(new Date(period.start), "MMM d")} - {format(new Date(period.end), "MMM d, yyyy")}
                                            </div>
                                        </div>
                                        <IconCheck className="h-5 w-5 text-primary" />
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {step === "EMPLOYEES" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Select Employees</h3>
                                <div className="flex items-center gap-2">
                                    <Checkbox checked={selectedEmployees.length === employees.length} onCheckedChange={selectAllEmployees} id="select-all" />
                                    <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">Select All ({employees.length})</label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {employees.map((employee: any) => (
                                    <div
                                        key={employee.id}
                                        onClick={() => toggleEmployee(employee.id)}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${selectedEmployees.includes(employee.id) ? 'bg-primary/5 border-primary/50 shadow-sm' : 'bg-background border-border hover:border-primary/30'}`}
                                    >
                                        <Checkbox checked={selectedEmployees.includes(employee.id)} />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-bold text-sm truncate">{employee.fullName}</span>
                                            <span className="text-xs text-muted-foreground font-mono">EMP-{employee.employeeNo}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                            {previewData.map((row, idx) => {
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
                                                                <span className="text-xs text-muted-foreground font-mono">{row.employeeId.slice(0, 8)}...</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{row.basicSalary.toLocaleString()}</TableCell>
                                                        <TableCell className="text-green-600">+{adds.toLocaleString()}</TableCell>
                                                        <TableCell className="text-blue-600">+{row.otAmount.toLocaleString()}</TableCell>
                                                        <TableCell className="text-red-500">-{row.noPayAmount.toLocaleString()}</TableCell>
                                                        <TableCell className="text-red-500">-{deds.toLocaleString()}</TableCell>
                                                        <TableCell className="text-orange-500">-{row.advanceDeduction.toLocaleString()}</TableCell>
                                                        <TableCell className="text-right font-bold">
                                                            {row.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                                        LKR {previewData.reduce((s, r) => s + r.netSalary, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                    {step !== "PERIOD" && (
                        <Button
                            variant="outline"
                            onClick={() => setStep(step === "EMPLOYEES" ? "PERIOD" : "EMPLOYEES")}
                            className="mr-auto"
                        >
                            <IconChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    )}

                    {step === "PERIOD" && (
                        <Button
                            disabled={!period}
                            onClick={() => setStep("EMPLOYEES")}
                            className="w-full md:w-auto"
                        >
                            Next: Select Employees <IconArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}

                    {step === "EMPLOYEES" && (
                        <Button
                            disabled={selectedEmployees.length === 0 || generatePreviewsMutation.isPending}
                            onClick={handleGeneratePreview}
                            className="w-full md:w-auto"
                        >
                            {generatePreviewsMutation.isPending ? "Calculating..." : "Generate Preview"} <IconArrowRight className="ml-2 h-4 w-4" />
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
