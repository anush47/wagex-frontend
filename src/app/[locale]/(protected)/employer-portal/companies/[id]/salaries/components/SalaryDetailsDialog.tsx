"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    IconWallet,
    IconUser,
    IconCalendarEvent,
    IconClock,
    IconReceipt,
    IconX,
    IconCheck,
    IconTable,
    IconTrendingUp,
    IconTrendingDown,
    IconCash,
    IconNotes,
    IconDeviceFloppy,
    IconPlus,
    IconTrash
} from "@tabler/icons-react";
import { Salary, SalaryStatus } from "@/types/salary";
import { format } from "date-fns";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";

interface SalaryDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    salary: Salary | null;
    onSave?: (updatedSalary: any) => void;
}

export function SalaryDetailsDialog({
    open,
    onOpenChange,
    salary,
    onSave,
}: SalaryDetailsDialogProps) {
    const [editableComponents, setEditableComponents] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (salary?.components) {
            setEditableComponents(salary.components);
        }
    }, [salary]);

    if (!salary) return null;

    const handleComponentChange = (id: string, name: string, amount: number) => {
        setEditableComponents(prev => prev.map(c => c.id === id ? { ...c, name, amount } : c));
    };

    const removeComponent = (id: string) => {
        setEditableComponents(prev => prev.filter(c => c.id !== id));
    };

    const addComponent = (category: 'ADDITION' | 'DEDUCTION') => {
        const newComp = {
            id: `manual-${Date.now()}`,
            name: 'New Adjustment',
            category,
            amount: 0,
            type: 'FLAT_AMOUNT'
        };
        setEditableComponents(prev => [...prev, newComp]);
    };

    const additions = editableComponents.filter(c => c.category === 'ADDITION') || [];
    const deductions = editableComponents.filter(c => c.category === 'DEDUCTION') || [];

    const totalAdditions = additions.reduce((s, c) => s + c.amount, 0);
    const totalDeductions = deductions.reduce((s, c) => s + c.amount, 0);
    const grossEarnings = salary.basicSalary + salary.otAmount + totalAdditions;
    const totalRecoveries = salary.noPayAmount + salary.advanceDeduction + salary.taxAmount + totalDeductions;
    const currentNetSalary = grossEarnings - totalRecoveries;

    const getStatusBadge = (status: SalaryStatus) => {
        const styles: Record<string, string> = {
            DRAFT: "bg-neutral-100 text-neutral-600 border-neutral-200",
            APPROVED: "bg-blue-100 text-blue-600 border-blue-200",
            PARTIALLY_PAID: "bg-orange-100 text-orange-600 border-orange-200",
            PAID: "bg-green-100 text-green-600 border-green-200",
        };

        return (
            <Badge variant="outline" className={`font-bold ${styles[status]}`}>
                {status}
            </Badge>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-3xl flex flex-col max-h-[90vh] p-0 gap-0 border-none shadow-2xl overflow-hidden rounded-3xl md:rounded-[2rem]">
                <DialogHeader className="p-5 md:p-6 pb-4 border-b border-border/40 shrink-0 bg-background z-10 relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 rounded-full h-8 w-8 text-muted-foreground hover:bg-muted"
                        onClick={() => onOpenChange(false)}
                    >
                        <IconX className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0 shadow-lg">
                            <IconWallet className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-lg md:text-xl font-black uppercase tracking-tight">
                                Salary Details
                            </DialogTitle>
                            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                                <IconCalendarEvent className="h-3 w-3" />
                                {format(new Date(salary.periodStartDate), "MMMM d")} - {format(new Date(salary.periodEndDate), "MMMM d, yyyy")}
                            </DialogDescription>
                        </div>
                        <div className="mr-8 md:mr-0">
                            {getStatusBadge(salary.status)}
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 scrollbar-hide">
                    {/* Employee Information */}
                    <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <EmployeeAvatar
                                photo={(salary.employee as any)?.photo}
                                name={salary.employee?.fullName}
                                className="h-12 w-12 rounded-2xl text-lg shadow-lg"
                            />
                            <div>
                                <div className="font-black text-sm uppercase tracking-tight text-neutral-900 leading-tight">{salary.employee?.fullName}</div>
                                <div className="text-[10px] font-mono font-bold text-neutral-400 mt-0.5">EMP-{salary.employee?.employeeNo}</div>
                            </div>
                        </div>
                        <div className="flex flex-col md:items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Payroll Reference</span>
                            <span className="font-mono text-[10px] font-bold text-neutral-600">{salary.id.slice(0, 13).toUpperCase()}</span>
                        </div>
                    </div>

                    {/* Pay Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
                                <IconReceipt className="w-3.5 h-3.5" />
                                Basic Salary
                            </Label>
                            <div className="font-black text-xl text-neutral-900 leading-none">
                                {salary.basicSalary.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2 flex items-center gap-1.5">
                                <IconClock className="w-3.5 h-3.5" />
                                OT Amount
                            </Label>
                            <div className="font-black text-xl text-neutral-900 leading-none">
                                {salary.otAmount.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-white">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1.5">
                                <IconCash className="w-3.5 h-3.5" />
                                Net Salary
                            </Label>
                            <div className="font-black text-xl leading-none">
                                {currentNetSalary.toLocaleString()}
                            </div>
                            <div className="text-[9px] font-bold text-neutral-500 mt-1">Final Payable</div>
                        </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Additions */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-2 px-1">
                                <div className="flex items-center gap-2">
                                    <IconTrendingUp className="h-4 w-4 text-green-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-neutral-600">Earnings & Additions</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-lg text-green-600 hover:bg-green-50"
                                    onClick={() => addComponent('ADDITION')}
                                >
                                    <IconPlus className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <div className="bg-neutral-50 rounded-2xl border border-neutral-100 overflow-hidden">
                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-neutral-500">Basic Salary</span>
                                        <span className="font-black text-neutral-900">{salary.basicSalary.toLocaleString()}</span>
                                    </div>
                                    {salary.otAmount > 0 && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-neutral-500">Overtime (OT)</span>
                                            <span className="font-black text-blue-600">+{salary.otAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {additions.map((comp, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs group/row">
                                            <Input
                                                value={comp.name}
                                                onChange={(e) => handleComponentChange(comp.id, e.target.value, comp.amount)}
                                                className="h-6 flex-1 bg-transparent border-none font-bold text-neutral-500 p-0 focus-visible:ring-0 focus-visible:bg-white/50"
                                            />
                                            <div className="flex items-center gap-1 group/input">
                                                <span className="font-bold text-green-600 text-[10px]">+</span>
                                                <Input
                                                    type="number"
                                                    value={comp.amount}
                                                    onChange={(e) => handleComponentChange(comp.id, comp.name, parseFloat(e.target.value) || 0)}
                                                    className="h-6 w-20 bg-transparent border-none text-right font-black text-green-600 p-0 focus-visible:ring-0 focus-visible:bg-white/50"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 rounded-md text-red-400 opacity-0 group-hover/row:opacity-100 hover:text-red-600 hover:bg-red-50 transition-opacity"
                                                    onClick={() => removeComponent(comp.id)}
                                                >
                                                    <IconTrash className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-green-50/50 p-3 px-4 border-t border-green-100 flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-green-700">Gross Earnings</span>
                                    <span className="font-black text-sm text-green-700">
                                        {grossEarnings.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-2 px-1">
                                <div className="flex items-center gap-2">
                                    <IconTrendingDown className="h-4 w-4 text-red-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-neutral-600">Deductions & Recoveries</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-lg text-red-600 hover:bg-red-50"
                                    onClick={() => addComponent('DEDUCTION')}
                                >
                                    <IconPlus className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <div className="bg-neutral-50 rounded-2xl border border-neutral-100 overflow-hidden">
                                <div className="p-4 space-y-3">
                                    {salary.noPayAmount > 0 && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-neutral-500">No Pay Deduction</span>
                                            <span className="font-black text-red-600">-{salary.noPayAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {salary.advanceDeduction > 0 && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-neutral-500">Advance Recovery</span>
                                            <span className="font-black text-orange-600">-{salary.advanceDeduction.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {deductions.map((comp, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs group/row">
                                            <Input
                                                value={comp.name}
                                                onChange={(e) => handleComponentChange(comp.id, e.target.value, comp.amount)}
                                                className="h-6 flex-1 bg-transparent border-none font-bold text-neutral-500 p-0 focus-visible:ring-0 focus-visible:bg-white/50"
                                            />
                                            <div className="flex items-center gap-1 group/input">
                                                <span className="font-bold text-red-600 text-[10px]">-</span>
                                                <Input
                                                    type="number"
                                                    value={comp.amount}
                                                    onChange={(e) => handleComponentChange(comp.id, comp.name, parseFloat(e.target.value) || 0)}
                                                    className="h-6 w-20 bg-transparent border-none text-right font-black text-red-600 p-0 focus-visible:ring-0 focus-visible:bg-white/50"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 rounded-md text-red-400 opacity-0 group-hover/row:opacity-100 hover:text-red-600 hover:bg-red-50 transition-opacity"
                                                    onClick={() => removeComponent(comp.id)}
                                                >
                                                    <IconTrash className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {salary.taxAmount > 0 && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-neutral-500">Tax Payee</span>
                                            <span className="font-black text-red-600">-{salary.taxAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {salary.noPayAmount === 0 && salary.advanceDeduction === 0 && deductions.length === 0 && salary.taxAmount === 0 && (
                                        <div className="py-4 text-center text-[10px] font-bold text-neutral-400 italic">No deductions applied.</div>
                                    )}
                                </div>
                                <div className="bg-red-50/50 p-3 px-4 border-t border-red-100 flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-red-700">Total Deductions</span>
                                    <span className="font-black text-sm text-red-700">
                                        {totalRecoveries.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Tables (Mini) */}
                    {(salary.otBreakdown?.length > 0 || salary.noPayBreakdown?.length > 0) && (
                        <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 space-y-4">
                            <div className="flex items-center gap-2 text-neutral-500">
                                <IconTable className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Attendance Calculations</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {salary.otBreakdown?.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-black uppercase text-neutral-400">OT Breakdown</span>
                                        {salary.otBreakdown.map((ot, idx) => (
                                            <div key={idx} className="flex justify-between text-[11px] font-bold py-1 border-b border-neutral-100 last:border-0">
                                                <span className="text-neutral-500">{ot.type} OT ({ot.hours.toFixed(2)}h)</span>
                                                <span className="text-neutral-900">{ot.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {salary.noPayBreakdown?.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-black uppercase text-neutral-400">No Pay Breakdown</span>
                                        {salary.noPayBreakdown.map((np, idx) => (
                                            <div key={idx} className="flex justify-between text-[11px] font-bold py-1 border-b border-neutral-100 last:border-0">
                                                <span className="text-neutral-500">{np.type} ({np.count})</span>
                                                <span className="text-neutral-900">{np.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Remarks */}
                    {salary.remarks && (
                        <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
                            <div className="flex items-center gap-2 text-neutral-500 mb-3">
                                <IconNotes className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Processing Remarks</span>
                            </div>
                            <p className="text-xs leading-relaxed text-neutral-600 font-medium">{salary.remarks}</p>
                        </div>
                    )}
                </div>

                <div className="p-6 md:p-8 bg-neutral-900 border-t border-neutral-800 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-neutral-500 mb-1">Pay Date</span>
                        <span className="font-black text-white tracking-widest">
                            {format(new Date(salary.payDate), "MMM d, yyyy")}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 font-black text-xs uppercase px-8 shadow-xl shadow-primary/20"
                            onClick={() => {
                                onSave?.({
                                    ...salary,
                                    components: editableComponents,
                                    netSalary: currentNetSalary
                                });
                                onOpenChange(false);
                            }}
                        >
                            <IconDeviceFloppy className="h-4 w-4 mr-2" /> Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}
