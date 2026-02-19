"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    IconWallet,
    IconCalendarEvent,
    IconClock,
    IconReceipt,
    IconX,
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
            DRAFT: "bg-neutral-100 text-neutral-700 hover:bg-neutral-100 border-neutral-200",
            APPROVED: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200",
            PARTIALLY_PAID: "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200",
            PAID: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
        };

        return (
            <Badge variant="outline" className={`font-bold ${styles[status]}`}>
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl flex flex-col max-h-[90vh] p-0 gap-0 border-none shadow-2xl overflow-hidden rounded-[2rem]">
                <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-background z-10 relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 rounded-full h-8 w-8 text-muted-foreground hover:bg-muted"
                        onClick={() => onOpenChange(false)}
                    >
                        <IconX className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-600/20">
                            <IconWallet className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <DialogTitle className="text-xl font-bold tracking-tight">
                                    Salary Details
                                </DialogTitle>
                                {getStatusBadge(salary.status)}
                            </div>
                            <DialogDescription className="text-xs font-medium text-muted-foreground flex items-center gap-2 mt-1">
                                <IconCalendarEvent className="h-3.5 w-3.5" />
                                {format(new Date(salary.periodStartDate), "MMMM d")} - {format(new Date(salary.periodEndDate), "MMMM d, yyyy")}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/20">
                    {/* Employee & Summary Header */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 bg-background p-4 rounded-2xl border shadow-sm flex items-center gap-4">
                            <EmployeeAvatar
                                photo={(salary.employee as any)?.photo}
                                name={salary.employee?.fullName}
                                className="h-12 w-12 rounded-xl text-lg shadow-sm"
                            />
                            <div>
                                <div className="font-bold text-sm text-foreground">{salary.employee?.fullName}</div>
                                <div className="text-xs font-mono text-muted-foreground">EMP-{salary.employee?.employeeNo}</div>
                            </div>
                        </div>

                        <div className="md:w-1/3 bg-background p-4 rounded-2xl border shadow-sm flex flex-col justify-center">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Net Salary</Label>
                            <div className="text-2xl font-black text-foreground">
                                LKR {currentNetSalary.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Pay Components Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Earnings Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-md bg-green-100 text-green-700 flex items-center justify-center">
                                        <IconTrendingUp className="h-4 w-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">Earnings</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs font-bold text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => addComponent('ADDITION')}
                                >
                                    <IconPlus className="h-3.5 w-3.5 mr-1" /> Add
                                </Button>
                            </div>

                            <div className="bg-background rounded-xl border shadow-sm overflow-hidden divide-y">
                                <div className="p-3 px-4 flex justify-between items-center text-sm hover:bg-muted/30 transition-colors">
                                    <span className="font-medium text-muted-foreground flex items-center gap-2">
                                        <IconReceipt className="h-3.5 w-3.5" /> Basic Salary
                                    </span>
                                    <span className="font-bold">{salary.basicSalary.toLocaleString()}</span>
                                </div>
                                {salary.otAmount > 0 && (
                                    <div className="p-3 px-4 flex justify-between items-center text-sm hover:bg-muted/30 transition-colors">
                                        <span className="font-medium text-muted-foreground flex items-center gap-2">
                                            <IconClock className="h-3.5 w-3.5" /> Overtime (OT)
                                        </span>
                                        <span className="font-bold text-blue-600">+{salary.otAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                {additions.map((comp, idx) => (
                                    <div key={idx} className="p-2 px-4 flex justify-between items-center text-sm group hover:bg-muted/30 transition-colors">
                                        <Input
                                            value={comp.name}
                                            onChange={(e) => handleComponentChange(comp.id, e.target.value, comp.amount)}
                                            className="h-7 border-transparent hover:border-input focus:border-primary bg-transparent w-full max-w-[180px] px-2 text-sm font-medium"
                                        />
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-green-600 font-bold text-xs">+</span>
                                                <Input
                                                    type="number"
                                                    value={comp.amount}
                                                    onChange={(e) => handleComponentChange(comp.id, comp.name, parseFloat(e.target.value) || 0)}
                                                    className="h-7 w-24 pl-5 text-right font-bold text-green-600 border-transparent hover:border-input focus:border-primary bg-transparent"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50"
                                                onClick={() => removeComponent(comp.id)}
                                            >
                                                <IconTrash className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <div className="p-3 px-4 bg-muted/30 flex justify-between items-center border-t">
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Gross Earnings</span>
                                    <span className="font-bold text-green-700">{grossEarnings.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deductions Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-md bg-red-100 text-red-700 flex items-center justify-center">
                                        <IconTrendingDown className="h-4 w-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">Deductions</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => addComponent('DEDUCTION')}
                                >
                                    <IconPlus className="h-3.5 w-3.5 mr-1" /> Add
                                </Button>
                            </div>

                            <div className="bg-background rounded-xl border shadow-sm overflow-hidden divide-y">
                                {salary.noPayAmount > 0 && (
                                    <div className="p-3 px-4 flex justify-between items-center text-sm hover:bg-muted/30 transition-colors">
                                        <span className="font-medium text-muted-foreground">No Pay Deduction</span>
                                        <span className="font-bold text-red-600">-{salary.noPayAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                {salary.advanceDeduction > 0 && (
                                    <div className="p-3 px-4 flex justify-between items-center text-sm hover:bg-muted/30 transition-colors">
                                        <span className="font-medium text-muted-foreground">Advance Recovery</span>
                                        <span className="font-bold text-orange-600">-{salary.advanceDeduction.toLocaleString()}</span>
                                    </div>
                                )}
                                {deductions.map((comp, idx) => (
                                    <div key={idx} className="p-2 px-4 flex justify-between items-center text-sm group hover:bg-muted/30 transition-colors">
                                        <Input
                                            value={comp.name}
                                            onChange={(e) => handleComponentChange(comp.id, e.target.value, comp.amount)}
                                            className="h-7 border-transparent hover:border-input focus:border-primary bg-transparent w-full max-w-[180px] px-2 text-sm font-medium"
                                        />
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-red-600 font-bold text-xs">-</span>
                                                <Input
                                                    type="number"
                                                    value={comp.amount}
                                                    onChange={(e) => handleComponentChange(comp.id, comp.name, parseFloat(e.target.value) || 0)}
                                                    className="h-7 w-24 pl-5 text-right font-bold text-red-600 border-transparent hover:border-input focus:border-primary bg-transparent"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50"
                                                onClick={() => removeComponent(comp.id)}
                                            >
                                                <IconTrash className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {salary.taxAmount > 0 && (
                                    <div className="p-3 px-4 flex justify-between items-center text-sm hover:bg-muted/30 transition-colors">
                                        <span className="font-medium text-muted-foreground">Tax Payee</span>
                                        <span className="font-bold text-red-600">-{salary.taxAmount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="p-3 px-4 bg-muted/30 flex justify-between items-center border-t">
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Total Recoveries</span>
                                    <span className="font-bold text-red-700">{totalRecoveries.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Tables (Mini) */}
                    {(salary.otBreakdown?.length > 0 || salary.noPayBreakdown?.length > 0) && (
                        <div className="bg-background p-4 rounded-xl border shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <IconTable className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Attendance Details</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {salary.otBreakdown?.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground block border-b pb-1">OT Breakdown</span>
                                        {salary.otBreakdown.map((ot, idx) => (
                                            <div key={idx} className="flex justify-between text-xs py-1 border-b border-border/50 last:border-0">
                                                <span className="text-muted-foreground">{ot.type} OT ({ot.hours.toFixed(2)}h)</span>
                                                <span className="font-medium">+{ot.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {salary.noPayBreakdown?.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground block border-b pb-1">No Pay Breakdown</span>
                                        {salary.noPayBreakdown.map((np, idx) => (
                                            <div key={idx} className="flex justify-between text-xs py-1 border-b border-border/50 last:border-0">
                                                <span className="text-muted-foreground">{np.type} ({np.count})</span>
                                                <span className="font-medium text-red-600">-{np.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Remarks */}
                    {salary.remarks && (
                        <div className="bg-muted/30 p-4 rounded-xl border space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <IconNotes className="h-3.5 w-3.5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Remarks</span>
                            </div>
                            <p className="text-sm text-foreground">{salary.remarks}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 md:p-6 border-t bg-background">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Pay Date</span>
                            <span className="font-medium text-sm">
                                {format(new Date(salary.payDate), "MMM d, yyyy")}
                            </span>
                        </div>
                        <Button
                            className="bg-primary hover:bg-primary/90 rounded-xl px-8 font-bold shadow-lg shadow-primary/20"
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
