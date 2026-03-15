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
    IconTrendingDown,
    IconCash,
    IconNotes,
    IconDeviceFloppy,
    IconPlus,
    IconTrash,
    IconEdit,
    IconListDetails,
    IconX,
    IconWallet,
    IconCalendarEvent,
    IconReceipt,
    IconTable,
    IconTrendingUp,
    IconChecks,
    IconCalendar,
    IconClock,
    IconArrowRight,
    IconCheck,
    IconAlertCircle,
} from "@tabler/icons-react";
import { Salary, SalaryStatus } from "@/types/salary";
import { format } from "date-fns";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";
import { PaymentDetailsDialog } from "./PaymentDetailsDialog";

interface SalaryDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    salary: Salary | null;
    onSave?: (updatedSalary: any) => void;
    onApprove?: () => void;
    onPay?: () => void;
    onDelete?: () => void;
    isSaving?: boolean;
    isApproving?: boolean;
    isDeleting?: boolean;
    onDeletePayment?: (id: string) => Promise<void>;
    isDeletingPayment?: boolean;
}

export function SalaryDetailsDialog({
    open,
    onOpenChange,
    salary,
    onSave,
    onApprove,
    onPay,
    onDelete,
    isSaving,
    isApproving,
    isDeleting,
    onDeletePayment,
    isDeletingPayment,
}: SalaryDetailsDialogProps) {
    const [editableComponents, setEditableComponents] = React.useState<any[]>(salary?.components || []);
    const [editableBasicSalary, setEditableBasicSalary] = React.useState<number>(salary?.basicSalary || 0);
    const [editableRemarks, setEditableRemarks] = React.useState<string>(salary?.remarks || "");
    const [editableOtAdjustment, setEditableOtAdjustment] = React.useState<number>(salary?.otAdjustment || 0);
    const [editableOtAdjustmentReason, setEditableOtAdjustmentReason] = React.useState<string>(salary?.otAdjustmentReason || "");
    const [editableRecoveryAdjustment, setEditableRecoveryAdjustment] = React.useState<number>(salary?.recoveryAdjustment || 0);
    const [editableRecoveryAdjustmentReason, setEditableRecoveryAdjustmentReason] = React.useState<string>(salary?.recoveryAdjustmentReason || "");
    const [editableHolidayPayAdjustment, setEditableHolidayPayAdjustment] = React.useState<number>(salary?.holidayPayAdjustment || 0);
    const [editableHolidayPayAdjustmentReason, setEditableHolidayPayAdjustmentReason] = React.useState<string>(salary?.holidayPayAdjustmentReason || "");
    const [editableAdvanceDeduction, setEditableAdvanceDeduction] = React.useState<number>(salary?.advanceDeduction || 0);
    const [editableAdvanceAdjustments, setEditableAdvanceAdjustments] = React.useState<any[]>(salary?.advanceAdjustments || []);
    const [editableSessions, setEditableSessions] = React.useState<any[]>(salary?.sessions || []);
    const [selectedPayment, setSelectedPayment] = React.useState<any>(null);
    const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = React.useState(false);

    React.useEffect(() => {
        if (salary) {
            setEditableComponents(salary.components || []);
            setEditableBasicSalary(salary.basicSalary);
            setEditableRemarks(salary.remarks || "");
            setEditableOtAdjustment(salary.otAdjustment || 0);
            setEditableOtAdjustmentReason(salary.otAdjustmentReason || "");
            setEditableRecoveryAdjustment(salary.recoveryAdjustment || 0);
            setEditableRecoveryAdjustmentReason(salary.recoveryAdjustmentReason || "");
            setEditableHolidayPayAdjustment(salary.holidayPayAdjustment || 0);
            setEditableHolidayPayAdjustmentReason(salary.holidayPayAdjustmentReason || "");
            setEditableAdvanceDeduction(salary.advanceDeduction || 0);
            setEditableAdvanceAdjustments(salary.advanceAdjustments || []);
            setEditableSessions(salary.sessions || []);
        }
    }, [salary]);

    if (!salary) return null;

    const handleComponentChange = (id: string, name: string, amount: number, employerAmount?: number) => {
        setEditableComponents(prev => prev.map(c => c.id === id ? { 
            ...c, 
            name, 
            amount,
            employerAmount: employerAmount !== undefined ? employerAmount : c.employerAmount
        } : c));
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

    const removeSession = (id: string) => {
        setEditableSessions(prev => prev.filter(s => s.id !== id));
    };

    const additions = editableComponents.filter(c => c.category === 'ADDITION') || [];
    const deductions = editableComponents.filter(c => c.category === 'DEDUCTION') || [];

    const totalAdditions = additions.reduce((s, c) => s + c.amount, 0);
    const totalDeductions = deductions.reduce((s, c) => s + c.amount, 0);
    const grossEarnings = (editableBasicSalary || 0) + salary.otAmount + (editableOtAdjustment || 0) + (editableHolidayPayAdjustment || 0) + totalAdditions;
    const totalRecoveries = salary.noPayAmount + editableAdvanceDeduction + salary.taxAmount + totalDeductions + (editableRecoveryAdjustment || 0);
    const currentNetSalary = grossEarnings - totalRecoveries;

    const isDirty = (
        editableBasicSalary !== salary.basicSalary ||
        (editableRemarks || "") !== (salary.remarks || "") ||
        editableOtAdjustment !== (salary.otAdjustment || 0) ||
        (editableOtAdjustmentReason || "") !== (salary.otAdjustmentReason || "") ||
        editableHolidayPayAdjustment !== (salary.holidayPayAdjustment || 0) ||
        (editableHolidayPayAdjustmentReason || "") !== (salary.holidayPayAdjustmentReason || "") ||
        editableRecoveryAdjustment !== (salary.recoveryAdjustment || 0) ||
        (editableRecoveryAdjustmentReason || "") !== (salary.recoveryAdjustmentReason || "") ||
        editableAdvanceDeduction !== (salary.advanceDeduction || 0) ||
        JSON.stringify(editableComponents.map(c => ({ id: c.id, name: c.name, amount: c.amount, employerAmount: c.employerAmount }))) !== 
        JSON.stringify((salary.components || []).map((c: any) => ({ id: c.id, name: c.name, amount: c.amount, employerAmount: c.employerAmount }))) ||
        JSON.stringify(editableSessions.map(s => s.id)) !== JSON.stringify((salary.sessions || []).map((s: any) => s.id))
    );

    const getStatusBadge = (status: SalaryStatus) => {
        const styles: Record<string, string> = {
            DRAFT: "bg-muted text-muted-foreground hover:bg-muted border-border",
            APPROVED: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 border-blue-500/20",
            PARTIALLY_PAID: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/15 border-orange-500/20",
            PAID: "bg-green-500/10 text-green-600 hover:bg-green-500/15 border-green-500/20",
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
                                    Net Pay Details
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
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Net Payable</Label>
                            <div className="text-2xl font-black text-foreground">
                                LKR {currentNetSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    {/* Pay Components Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Earnings Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-md bg-green-500/10 text-green-600 flex items-center justify-center">
                                        <IconTrendingUp className="h-4 w-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">Earnings</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs font-bold text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                    onClick={() => addComponent('ADDITION')}
                                >
                                    <IconPlus className="h-3.5 w-3.5 mr-1" /> Add
                                </Button>
                            </div>

                            <div className="bg-background rounded-xl border shadow-sm overflow-hidden divide-y">
                                <div className="p-3 px-4 flex justify-between items-center text-sm group hover:bg-muted/30 transition-colors">
                                    <span className="font-medium text-muted-foreground flex items-center gap-2">
                                        <IconReceipt className="h-3.5 w-3.5" /> Basic Salary
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={editableBasicSalary.toFixed(2)}
                                            onChange={(e) => setEditableBasicSalary(parseFloat(e.target.value) || 0)}
                                            className="h-8 w-32 font-bold text-right border-transparent hover:border-input focus:border-primary bg-transparent"
                                        />
                                        <IconEdit className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                    </div>
                                </div>

                                <div className="p-2 px-4 bg-primary/5 flex justify-between items-center text-[10px] border-y border-primary/10">
                                    <span className="font-black uppercase tracking-widest text-primary/60 flex items-center gap-1.5 px-2">
                                        <IconTable className="h-3 w-3" /> Tot. Earn. (EPF/ETF)
                                    </span>
                                    <span className="font-black text-primary tabular-nums px-3 py-1 bg-white rounded-lg border border-primary/20 shadow-sm">
                                        {(() => {
                                            const epfComp = (salary.components || []).find((c: any) => c.systemType === 'EPF_EMPLOYEE');
                                            const baseBeforeAdj = (epfComp && epfComp.value > 0)
                                                ? (epfComp.amount / (epfComp.value / 100))
                                                : (editableBasicSalary || 0);
                                            return (baseBeforeAdj + (editableHolidayPayAdjustment || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 });
                                        })()}
                                    </span>
                                </div>

                                {salary.otAmount > 0 && (
                                    <div className="p-3 px-4 flex justify-between items-center text-sm hover:bg-muted/30 transition-colors">
                                        <span className="font-medium text-muted-foreground flex items-center gap-2">
                                            <IconClock className="h-3.5 w-3.5" /> Calculated Overtime (OT)
                                        </span>
                                        <span className="font-bold text-blue-600">+{salary.otAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}

                                {/* Holiday Pay Adjustment Row */}
                                <div className="p-3 px-4 space-y-3 bg-amber-50/10 border-l-2 border-l-amber-400">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-black uppercase tracking-tight text-amber-600 flex items-center gap-1.5">
                                            <IconTrendingUp className="h-3 w-3" /> Holiday Pay Adjustment
                                        </span>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-600 font-bold text-xs">±</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={editableHolidayPayAdjustment === 0 ? "" : editableHolidayPayAdjustment.toFixed(2)}
                                                onChange={(e) => setEditableHolidayPayAdjustment(parseFloat(e.target.value) || 0)}
                                                className="h-7 w-32 pl-5 text-right font-bold text-amber-600 border-dashed border-amber-200 focus:border-amber-400 bg-white"
                                            />
                                        </div>
                                    </div>
                                    {(editableHolidayPayAdjustment !== 0) && (
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest pl-1">Adjustment Reason</Label>
                                            <Input
                                                value={editableHolidayPayAdjustmentReason}
                                                onChange={(e) => setEditableHolidayPayAdjustmentReason(e.target.value)}
                                                placeholder="Reason for holiday pay adjustment..."
                                                className="h-7 text-xs border-dashed border-amber-500/30 focus:border-amber-500 bg-muted/30 italic"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* OT Adjustment Row */}
                                <div className="p-3 px-4 space-y-3 bg-blue-50/10 border-l-2 border-l-blue-400">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-black uppercase tracking-tight text-blue-600 flex items-center gap-1.5">
                                            <IconTrendingUp className="h-3 w-3" /> OT Adjustment
                                        </span>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-xs">±</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={editableOtAdjustment === 0 ? "" : editableOtAdjustment.toFixed(2)}
                                                onChange={(e) => setEditableOtAdjustment(parseFloat(e.target.value) || 0)}
                                                onBlur={(e) => {
                                                    if (e.target.value) {
                                                        const val = parseFloat(parseFloat(e.target.value).toFixed(2));
                                                        setEditableOtAdjustment(val);
                                                    }
                                                }}
                                                className="h-7 w-32 pl-5 text-right font-bold text-blue-600 border-dashed border-blue-200 focus:border-blue-400 bg-white"
                                            />
                                        </div>
                                    </div>
                                    {(editableOtAdjustment !== 0) && (
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest pl-1">Adjustment Reason</Label>
                                            <Input
                                                value={editableOtAdjustmentReason}
                                                onChange={(e) => setEditableOtAdjustmentReason(e.target.value)}
                                                placeholder="e.g. Manual correction, Approved extra shift..."
                                                className="h-7 text-xs border-dashed border-blue-500/30 focus:border-blue-500 bg-muted/30 italic"
                                            />
                                        </div>
                                    )}
                                </div>

                                {additions.map((comp, idx) => (
                                    <div key={idx} className="p-2 px-4 flex justify-between items-center text-sm group hover:bg-muted/30 transition-colors">
                                        <Input
                                            value={comp.name}
                                            onChange={(e) => handleComponentChange(comp.id, e.target.value, comp.amount, comp.employerAmount)}
                                            className="h-7 border-transparent hover:border-input focus:border-primary bg-transparent w-full max-w-[180px] px-2 text-sm font-medium"
                                        />
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-green-600 font-bold text-xs">+</span>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={comp.amount.toFixed(2)}
                                                    onChange={(e) => handleComponentChange(comp.id, comp.name, parseFloat(e.target.value) || 0, comp.employerAmount)}
                                                    className="h-7 w-32 pl-5 text-right font-bold text-green-600 border-transparent hover:border-input focus:border-primary bg-transparent"
                                                />
                                            </div>
                                            {comp.employerAmount > 0 && (
                                                <div className="flex flex-col items-end gap-1 mt-1">
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-70 pr-2">Employer:</span>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={comp.employerAmount.toFixed(2)}
                                                            onChange={(e) => handleComponentChange(comp.id, comp.name, comp.amount, parseFloat(e.target.value) || 0)}
                                                            className="h-6 w-32 pr-2 text-right font-bold text-muted-foreground border-transparent hover:border-input focus:border-primary bg-transparent text-[11px]"
                                                        />
                                                    </div>
                                                </div>
                                            )}
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
                                ))}
                                <div className="p-3 px-4 bg-muted/50 flex justify-between items-center border-t border-border/50">
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Gross Earnings</span>
                                    <span className="font-bold text-green-600 tabular-nums">{grossEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deductions Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-md bg-red-500/10 text-red-600 flex items-center justify-center">
                                        <IconTrendingDown className="h-4 w-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">Deductions</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-500/10"
                                    onClick={() => addComponent('DEDUCTION')}
                                >
                                    <IconPlus className="h-3.5 w-3.5 mr-1" /> Add
                                </Button>
                            </div>

                            <div className="bg-background rounded-xl border shadow-sm overflow-hidden divide-y">
                                {salary.noPayAmount > 0 && (
                                    <div className="p-3 px-4 flex justify-between items-center text-sm hover:bg-muted/30 transition-colors">
                                        <span className="font-medium text-muted-foreground">No Pay Deduction</span>
                                        <span className="font-bold text-red-600">-{salary.noPayAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                    <div className="p-3 px-4 flex justify-between items-center text-sm group hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-muted-foreground flex items-center gap-2">
                                                <IconCash className="h-3.5 w-3.5" /> Advance Recovery
                                            </span>
                                            {editableAdvanceAdjustments.length > 0 && (
                                                <Badge 
                                                    variant="outline" 
                                                    className="h-4 px-1 text-[8px] font-black border-orange-200 bg-orange-50 text-orange-600 cursor-help"
                                                    title="Click 'Calculation Factors' below for breakdown"
                                                >
                                                    {editableAdvanceAdjustments.length} LINKED
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-orange-600 font-bold text-xs">-</span>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={editableAdvanceDeduction.toFixed(2)}
                                                    onChange={(e) => setEditableAdvanceDeduction(parseFloat(e.target.value) || 0)}
                                                    className="h-8 w-32 pl-5 text-right font-bold text-orange-600 border-transparent hover:border-input focus:border-primary bg-transparent"
                                                />
                                            </div>
                                            <IconEdit className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                        </div>
                                    </div>
                                {deductions.map((comp, idx) => (
                                    <div key={idx} className="p-2 px-4 flex justify-between items-center text-sm group hover:bg-muted/30 transition-colors">
                                        <Input
                                            value={comp.name}
                                            onChange={(e) => handleComponentChange(comp.id, e.target.value, comp.amount, comp.employerAmount)}
                                            className="h-7 border-transparent hover:border-input focus:border-primary bg-transparent w-full max-w-[180px] px-2 text-sm font-medium"
                                        />
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-red-600 font-bold text-xs">-</span>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={comp.amount.toFixed(2)}
                                                    onChange={(e) => handleComponentChange(comp.id, comp.name, parseFloat(e.target.value) || 0, comp.employerAmount)}
                                                    className="h-7 w-32 pl-5 text-right font-bold text-red-600 border-transparent hover:border-input focus:border-primary bg-transparent"
                                                />
                                            </div>
                                            {comp.employerAmount > 0 && (
                                                <div className="flex flex-col items-end gap-1 mt-1">
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-70 pr-2">Employer:</span>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={comp.employerAmount.toFixed(2)}
                                                            onChange={(e) => handleComponentChange(comp.id, comp.name, comp.amount, parseFloat(e.target.value) || 0)}
                                                            className="h-6 w-32 pr-2 text-right font-bold text-muted-foreground border-transparent hover:border-input focus:border-primary bg-transparent text-[11px]"
                                                        />
                                                    </div>
                                                </div>
                                            )}
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
                                ))}

                                {editableAdvanceDeduction !== salary.advanceDeduction && (
                                    <div className="p-3 px-4 bg-orange-500/5 border-y border-orange-500/10">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-orange-600 flex items-center gap-1.5 uppercase text-[10px] tracking-tight">
                                                <IconAlertCircle className="h-3.5 w-3.5" /> Recovery Auto-Correction
                                            </span>
                                            <span className="text-[10px] text-orange-500/60 font-medium italic mt-0.5">
                                                Changing this will auto-distribute the balance to future installments.
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {salary.taxAmount > 0 && (
                                    <div className="p-3 px-4 flex justify-between items-center text-sm hover:bg-muted/30 transition-colors">
                                        <span className="font-medium text-muted-foreground">Tax Payee</span>
                                        <span className="font-bold text-red-600">-{salary.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}

                                {/* Recovery Adjustment Row */}
                                <div className="p-3 px-4 space-y-3 bg-red-50/10 border-l-2 border-l-red-400">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-black uppercase tracking-tight text-red-600 flex items-center gap-1.5">
                                            <IconTrendingDown className="h-3 w-3" /> Recovery Adjustment
                                        </span>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-red-600 font-bold text-xs">±</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={editableRecoveryAdjustment === 0 ? "" : editableRecoveryAdjustment.toFixed(2)}
                                                onChange={(e) => setEditableRecoveryAdjustment(parseFloat(e.target.value) || 0)}
                                                onBlur={(e) => {
                                                    if (e.target.value) {
                                                        const val = parseFloat(parseFloat(e.target.value).toFixed(2));
                                                        setEditableRecoveryAdjustment(val);
                                                    }
                                                }}
                                                className="h-7 w-32 pl-5 text-right font-bold text-red-600 border-dashed border-red-200 focus:border-red-400 bg-white"
                                            />
                                        </div>
                                    </div>
                                    {(editableRecoveryAdjustment !== 0) && (
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-red-500 uppercase tracking-widest pl-1">Reason for Adjustment</Label>
                                            <Input
                                                value={editableRecoveryAdjustmentReason}
                                                onChange={(e) => setEditableRecoveryAdjustmentReason(e.target.value)}
                                                placeholder="e.g. Loan settlement, Damage recovery..."
                                                className="h-7 text-xs border-dashed border-red-500/30 focus:border-red-500 bg-muted/30 italic"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 px-4 bg-muted/50 flex justify-between items-center border-t border-border/50">
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Total Recoveries</span>
                                    <span className="font-bold text-red-600 tabular-nums">{totalRecoveries.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Tables (Mini) */}
                    {(salary.otBreakdown?.length > 0 || salary.noPayBreakdown?.length > 0 || (salary as any).advanceAdjustments?.length > 0) && (
                        <div className="bg-background p-4 rounded-xl border shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <IconTable className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Calculation Factors</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {salary.otBreakdown?.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">OT Breakdown</span>
                                            <span className="text-[10px] font-black text-blue-600 uppercase">Rate Multiplier</span>
                                        </div>
                                        {salary.otBreakdown.map((ot, idx) => (
                                            <div key={idx} className="flex justify-between text-xs py-1 border-b border-border/50 last:border-0">
                                                <span className="text-muted-foreground">{ot.type} OT ({ot.hours.toFixed(2)}h)</span>
                                                <span className="font-medium">+{ot.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
                                                <span className="font-medium text-red-600">-{np.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {(editableAdvanceAdjustments as any[])?.length > 0 && (
                                    <div className="space-y-2 md:col-span-2 border-t pt-4">
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Advance Recovery Breakdown</span>
                                            <span className="text-[10px] font-black text-orange-600 uppercase">Linked Advance</span>
                                        </div>
                                        {(editableAdvanceAdjustments as any[]).map((adj, idx) => (
                                            <div key={idx} className="flex justify-between text-xs py-2 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-neutral-800">{adj.reason || 'Salary Advance'}</span>
                                                    <span className="text-[9px] text-muted-foreground font-mono flex items-center gap-1">
                                                        ID: {adj.advanceId.slice(0, 8)}...
                                                        <IconAlertCircle className="h-2.5 w-2.5 text-orange-400" />
                                                    </span>
                                                </div>
                                                <span className="font-black text-red-600">-{adj.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Remarks Section */}
                    <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 space-y-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <IconNotes className="h-4 w-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Internal Remarks / Observations</span>
                        </div>
                        <textarea
                            value={editableRemarks}
                            onChange={(e) => setEditableRemarks(e.target.value)}
                            placeholder="Add any specific notes for this salary slip..."
                            className="w-full bg-background border border-border rounded-xl p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all italic"
                        />
                    </div>

                    {/* Linked Sessions Breakdown */}
                    {salary.sessions && salary.sessions.length > 0 && (
                        <div className="bg-background p-5 rounded-2xl border shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <IconListDetails className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-wider">Attendance Sessions</span>
                                </div>
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                    {salary.sessions.length} Logs Used
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b text-muted-foreground uppercase text-[9px] font-black">
                                            <th className="pb-2">Date</th>
                                            <th className="pb-2">Clock In</th>
                                            <th className="pb-2">Clock Out</th>
                                            <th className="pb-2 text-right">Work</th>
                                            <th className="pb-2 text-right">OT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {editableSessions.map((session: any, sIdx: number) => {
                                            const sessionDate = session.date ? new Date(session.date) : null;
                                            const checkIn = session.checkInTime ? new Date(session.checkInTime) : sessionDate;
                                            const checkOut = session.checkOutTime ? new Date(session.checkOutTime) : null;

                                            return (
                                                <tr key={sIdx} className="group hover:bg-muted/30 transition-colors">
                                                    <td className="py-2.5 font-bold">
                                                        {sessionDate ? format(sessionDate, "MMM d (EEE)") : 'N/A'}
                                                    </td>
                                                    <td className="py-2.5 text-muted-foreground font-medium">
                                                        {checkIn && !isNaN(checkIn.getTime()) ? format(checkIn, "HH:mm") : '--:--'}
                                                    </td>
                                                    <td className="py-2.5 text-muted-foreground font-medium">
                                                        {checkOut && !isNaN(checkOut.getTime()) ? format(checkOut, "HH:mm") : '--:--'}
                                                    </td>
                                                    <td className="py-2.5 text-right font-medium">
                                                        {((session.workMinutes || 0) / 60).toFixed(1)}h
                                                    </td>
                                                    <td className="py-2.5 text-right flex items-center justify-end pr-4">
                                                        <span className="font-bold text-blue-600">
                                                            {((session.overtimeMinutes || 0) / 60).toFixed(1)}h
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {salary.payments && salary.payments.length > 0 && (
                        <div className="space-y-4 pt-4 animate-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-2 px-1">
                                <IconWallet className="h-4 w-4 text-green-600" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Transaction History</h4>
                            </div>
                            <div className="bg-muted/10 rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                                <table className="w-full text-[11px]">
                                    <thead className="bg-muted/30 border-b border-border/50">
                                        <tr>
                                            <th className="py-2.5 pl-4 text-left font-black uppercase tracking-tighter text-muted-foreground">Date</th>
                                            <th className="py-2.5 text-left font-black uppercase tracking-tighter text-muted-foreground">Method</th>
                                            <th className="py-2.5 text-left font-black uppercase tracking-tighter text-muted-foreground">Ref</th>
                                            <th className="py-2.5 pr-4 text-right font-black uppercase tracking-tighter text-muted-foreground">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {salary.payments.map((payment, pIdx) => (
                                            <tr
                                                key={pIdx}
                                                className="hover:bg-muted/30 transition-colors cursor-pointer group"
                                                onClick={() => {
                                                    setSelectedPayment(payment);
                                                    setIsPaymentDetailsOpen(true);
                                                }}
                                            >
                                                <td className="py-3 pl-4 font-bold">
                                                    <div className="flex items-center gap-2 tabular-nums">
                                                        {format(new Date(payment.date), "MMM d, yyyy")}
                                                        <IconArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                                    </div>
                                                </td>
                                                <td className="py-3 text-muted-foreground font-medium capitalize">
                                                    {payment.paymentMethod.toLowerCase().replace('_', ' ')}
                                                </td>
                                                <td className="py-3 text-muted-foreground/60 font-mono">
                                                    {payment.referenceNo || '-'}
                                                </td>
                                                <td className="py-3 pr-4 text-right font-black tabular-nums">
                                                    {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-green-50/50 dark:bg-green-500/5 border-t border-green-100 dark:border-green-500/10">
                                        <tr>
                                            <td colSpan={3} className="py-3 pl-4 font-black uppercase tracking-tighter text-green-600 dark:text-green-500">Total Paid</td>
                                            <td className="py-3 pr-4 text-right font-black text-green-700 dark:text-green-400 text-sm">
                                                {salary.payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 md:p-6 border-t bg-background shrink-0">
                    <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
                        <div className="flex items-center gap-4 self-start md:self-auto">
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    className="h-10 w-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl shrink-0"
                                    disabled={isSaving || isApproving || isDeleting}
                                    onClick={() => onDelete?.()}
                                    title="Delete Salary"
                                >
                                    <IconTrash className="h-5 w-5" />
                                </Button>
                            )}

                            {salary.status === SalaryStatus.APPROVED ? (
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase text-green-600">Approved By</span>
                                    <span className="font-bold text-sm text-foreground">
                                        {salary.approvedBy?.fullName || "Verified User"}
                                        {salary.approvedAt && (
                                            <span className="text-muted-foreground font-normal ml-1">
                                                • {format(new Date(salary.approvedAt), "MMM d, HH:mm")}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Pay Date</span>
                                    <span className="font-medium text-sm">
                                        {format(new Date(salary.payDate), "MMM d, yyyy")}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            {onApprove && salary.status === "DRAFT" && (
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 font-bold flex-1 md:flex-none shadow-md shadow-green-200"
                                    disabled={isSaving || isApproving}
                                    onClick={() => onApprove?.()}
                                >
                                    <IconCheck className="h-4 w-4 mr-2" />
                                    {isApproving ? "Approving..." : "Approve Salary"}
                                </Button>
                            )}
                            {onPay && (salary.status === "APPROVED" || salary.status === "PARTIALLY_PAID") && (
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 font-bold flex-1 md:flex-none shadow-md shadow-green-200"
                                    onClick={() => onPay?.()}
                                >
                                    <IconCash className="h-4 w-4 mr-2" />
                                    Pay
                                </Button>
                            )}
                            <Button
                                className="bg-primary hover:bg-primary/90 rounded-xl px-8 font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex-1 md:flex-none"
                                disabled={isSaving || !isDirty || isApproving || isDeleting}
                                onClick={() => {
                                    onSave?.({
                                        ...salary,
                                        basicSalary: editableBasicSalary,
                                        components: editableComponents,
                                        otAdjustment: editableOtAdjustment,
                                        otAdjustmentReason: editableOtAdjustmentReason,
                                        holidayPayAdjustment: editableHolidayPayAdjustment,
                                        holidayPayAdjustmentReason: editableHolidayPayAdjustmentReason,
                                        recoveryAdjustment: editableRecoveryAdjustment,
                                        recoveryAdjustmentReason: editableRecoveryAdjustmentReason,
                                        advanceDeduction: editableAdvanceDeduction,
                                        advanceAdjustments: editableAdvanceAdjustments,
                                        remarks: editableRemarks,
                                        sessions: editableSessions,
                                        sessionIds: editableSessions.map(s => s.id),
                                        netSalary: currentNetSalary
                                    });
                                }}
                            >
                                <IconDeviceFloppy className="h-4 w-4 mr-2" />
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>

            <PaymentDetailsDialog
                open={isPaymentDetailsOpen}
                onOpenChange={setIsPaymentDetailsOpen}
                payment={selectedPayment}
                onDelete={onDeletePayment}
                isDeleting={isDeletingPayment}
            />
        </Dialog>
    );
}
