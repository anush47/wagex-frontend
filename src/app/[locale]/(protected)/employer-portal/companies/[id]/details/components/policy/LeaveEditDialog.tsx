"use client";

import { useEffect, useState } from "react";
import { LeaveType, AccrualFrequency, AccrualMethod, EncashmentType, EmploymentType, Gender } from "@/types/policy";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { IconCalendarStar, IconClock, IconUsers, IconSettings, IconCoin, IconCheck, IconFileCheck, IconHistory, IconAlertCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface LeaveEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: LeaveType | null;
    onSave: (leave: LeaveType) => void;
}

export function LeaveEditDialog({ open, onOpenChange, initialData, onSave }: LeaveEditDialogProps) {
    const [editingLeave, setEditingLeave] = useState<LeaveType | null>(null);

    useEffect(() => {
        if (open && initialData) {
            setEditingLeave({ ...initialData });
        }
    }, [open, initialData]);

    if (!editingLeave) return null;

    const updateField = (field: keyof LeaveType, value: any) => {
        setEditingLeave(prev => prev ? { ...prev, [field]: value } : null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-5xl lg:max-w-5xl max-h-[95vh] overflow-y-auto rounded-3xl md:rounded-[2rem] p-0 gap-0 border-none shadow-2xl">
                <DialogHeader className="p-5 md:p-6 pb-4 border-b border-border/40">
                    <div className="flex items-center gap-4">
                        <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg"
                            style={{ backgroundColor: editingLeave.color || 'var(--primary)' }}
                        >
                            <IconCalendarStar className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-2.5">
                                {initialData?.name ? "Leave Type Configuration" : "New Leave Type"}
                                <Badge variant="secondary" className="font-mono text-[9px] uppercase tracking-wider h-4 px-1.5 opacity-70">
                                    {editingLeave.code || "NEW"}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="text-[11px] font-medium text-muted-foreground/80">
                                Manage structural rules, eligibility constraints, and payout logic.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-5 md:p-6 space-y-5">
                    {/* TOP SECTION: Identity & Eligibility */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5 sm:col-span-1">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1">Official Name</Label>
                                    <Input
                                        placeholder="e.g. Annual Leave"
                                        value={editingLeave.name}
                                        onChange={e => updateField('name', e.target.value)}
                                        className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5 sm:col-span-1">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1">System Code</Label>
                                    <Input
                                        placeholder="e.g. AL"
                                        value={editingLeave.code}
                                        onChange={e => updateField('code', e.target.value.toUpperCase())}
                                        className="h-11 bg-muted/40 border-none rounded-xl px-4 font-black font-mono text-sm text-primary shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5 sm:col-span-1">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1">Theme Color</Label>
                                    <div className="flex flex-wrap gap-2 p-2 bg-muted/40 rounded-xl h-11 items-center justify-around">
                                        {['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#6366f1'].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => updateField('color', c)}
                                                className={cn(
                                                    "w-5 h-5 rounded-full transition-all hover:scale-125",
                                                    editingLeave.color === c ? "ring-2 ring-offset-2 ring-primary" : "opacity-70 hover:opacity-100"
                                                )}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 bg-muted/30 p-5 rounded-3xl border border-border/50">
                                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                                    <IconUsers className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Eligibility Rules</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-neutral-600">Gender Target</Label>
                                        <div className="flex gap-1.5">
                                            {[Gender.MALE, Gender.FEMALE].map((gender) => {
                                                const selected = editingLeave.applicableGenders.includes(gender);
                                                return (
                                                    <Button
                                                        key={gender}
                                                        variant={selected ? "default" : "secondary"}
                                                        size="sm"
                                                        className={cn(
                                                            "flex-1 h-9 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                                                            selected ? "shadow-md shadow-primary/20" : "bg-background border border-border/50 text-neutral-400"
                                                        )}
                                                        onClick={() => {
                                                            const current = editingLeave.applicableGenders;
                                                            updateField('applicableGenders', selected ? current.filter(g => g !== gender) : [...current, gender]);
                                                        }}
                                                    >
                                                        {gender}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-neutral-600">Employment Types</Label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {[EmploymentType.PROBATION, EmploymentType.CONTRACT, EmploymentType.PERMANENT, EmploymentType.INTERN, EmploymentType.TEMPORARY].map((type) => {
                                                const selected = editingLeave.applicableEmploymentTypes.includes(type);
                                                return (
                                                    <Button
                                                        key={type}
                                                        variant={selected ? "default" : "secondary"}
                                                        size="sm"
                                                        className={cn(
                                                            "h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-tight",
                                                            selected ? "bg-primary" : "bg-background border border-border/50 text-neutral-400"
                                                        )}
                                                        onClick={() => {
                                                            const current = editingLeave.applicableEmploymentTypes;
                                                            updateField('applicableEmploymentTypes', selected ? current.filter(t => t !== type) : [...current, type]);
                                                        }}
                                                    >
                                                        {type}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ACCRUAL LOGIC (Compact Card) */}
                        <div className="bg-muted/50 p-5 rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 text-neutral-500">
                                <IconClock className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Accrual Engine</span>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-neutral-600">
                                        {editingLeave.accrualFrequency === AccrualFrequency.YEARLY ? "Annual" :
                                            editingLeave.accrualFrequency === AccrualFrequency.MONTHLY ? "Monthly" :
                                                editingLeave.accrualFrequency === AccrualFrequency.WEEKLY ? "Weekly" :
                                                    editingLeave.accrualFrequency === AccrualFrequency.QUARTERLY ? "Quarterly" :
                                                        editingLeave.accrualFrequency === AccrualFrequency.HALF_YEARLY ? "Half-Yearly" : "Base"} Allowance (Days)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={editingLeave.baseAmount}
                                        onChange={e => updateField('baseAmount', parseFloat(e.target.value))}
                                        className="h-10 bg-background border-none rounded-xl font-bold px-4 shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-neutral-600">Reset Cycle</Label>
                                    <Select
                                        value={editingLeave.accrualFrequency}
                                        onValueChange={v => updateField('accrualFrequency', v as AccrualFrequency)}
                                    >
                                        <SelectTrigger className="h-10 bg-background border-none rounded-xl font-bold px-4 shadow-sm text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value={AccrualFrequency.WEEKLY}>Weekly</SelectItem>
                                            <SelectItem value={AccrualFrequency.MONTHLY}>Monthly</SelectItem>
                                            <SelectItem value={AccrualFrequency.QUARTERLY}>Quarterly</SelectItem>
                                            <SelectItem value={AccrualFrequency.HALF_YEARLY}>Half Yearly</SelectItem>
                                            <SelectItem value={AccrualFrequency.YEARLY}>Yearly</SelectItem>
                                            <SelectItem value={AccrualFrequency.CUSTOM}>Custom Duration</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {editingLeave.accrualFrequency === AccrualFrequency.CUSTOM && (
                                    <div className="space-y-1.5 pt-2 border-t border-border/20 animate-in fade-in slide-in-from-top-1">
                                        <Label className="text-xs font-bold text-amber-600">Cycle Duration (Days)</Label>
                                        <Input
                                            type="number"
                                            value={editingLeave.customFrequencyDays || ""}
                                            onChange={e => updateField('customFrequencyDays', parseInt(e.target.value) || 0)}
                                            className="h-9 bg-background/50 border-none rounded-lg text-center font-bold text-xs"
                                            placeholder="e.g. 45"
                                        />
                                    </div>
                                )}

                                <div className="space-y-1.5 pt-2 border-t border-border/20">
                                    <Label className="text-xs font-bold text-neutral-600">Accrual Method</Label>
                                    <Select
                                        value={editingLeave.accrualMethod || AccrualMethod.PRO_RATA}
                                        onValueChange={v => updateField('accrualMethod', v as AccrualMethod)}
                                    >
                                        <SelectTrigger className="h-10 bg-background border-none rounded-xl font-bold px-4 shadow-sm text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value={AccrualMethod.PRO_RATA}>
                                                <div className="space-y-0.5">
                                                    <div className="font-bold">Pro-rata</div>
                                                    <div className="text-[10px] text-muted-foreground">Calculate based on remaining days</div>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value={AccrualMethod.FULL_UPFRONT}>
                                                <div className="space-y-0.5">
                                                    <div className="font-bold">Full Upfront</div>
                                                    <div className="text-[10px] text-muted-foreground">Grant full amount at period start</div>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground ml-1 mt-1">
                                        Controls how leave is granted to employees who join mid-period
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE SECTION: Usage & Verification Rules */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Governance & Approval */}
                        <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 space-y-5">
                            <div className="flex items-center gap-2 text-neutral-500 mb-2">
                                <IconSettings className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Governance & Approval</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3.5 bg-background rounded-xl shadow-sm border border-transparent">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold block">Manual Approval Required</Label>
                                        <p className="text-[10px] text-muted-foreground">Requests must be approved by authorizers.</p>
                                    </div>
                                    <Switch
                                        checked={editingLeave.requiresApproval}
                                        onCheckedChange={v => updateField('requiresApproval', v)}
                                    />
                                </div>

                                {editingLeave.requiresApproval && (
                                    <div className="px-4 py-3 bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold text-primary/80">Require only if consecutive days &gt;</Label>
                                            <Input
                                                type="number"
                                                className="w-16 h-8 bg-background border-none rounded-lg text-center font-bold text-xs"
                                                value={editingLeave.approvalRequiredIfConsecutiveMoreThan || ""}
                                                onChange={e => updateField('approvalRequiredIfConsecutiveMoreThan', parseInt(e.target.value) || undefined)}
                                                placeholder="Off"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-3.5 bg-background rounded-xl shadow-sm border border-transparent">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold block">Can Apply Backdated</Label>
                                        <p className="text-[10px] text-muted-foreground">Allows applying for past dates.</p>
                                    </div>
                                    <Switch
                                        checked={editingLeave.canApplyBackdated}
                                        onCheckedChange={v => updateField('canApplyBackdated', v)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3.5 bg-background rounded-xl shadow-sm border border-transparent">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold block">Short Leave Policy</Label>
                                        <p className="text-[10px] text-muted-foreground">Treat as quick 1.5 - 2 hour chunks.</p>
                                    </div>
                                    <Switch
                                        checked={editingLeave.isShortLeave}
                                        onCheckedChange={v => updateField('isShortLeave', v)}
                                    />
                                </div>
                                {editingLeave.isShortLeave && (
                                    <div className="px-4 py-3 bg-amber-500/5 rounded-xl border border-amber-500/10 animate-in fade-in slide-in-from-top-2 flex justify-between items-center">
                                        <Label className="text-xs font-bold text-amber-600">Max Duration (Mins)</Label>
                                        <Input
                                            type="number"
                                            className="w-20 h-8 bg-background border-none rounded-lg text-center font-bold text-xs"
                                            value={editingLeave.maxDurationMinutes || ""}
                                            onChange={e => updateField('maxDurationMinutes', parseInt(e.target.value) || 0)}
                                            placeholder="90"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Constraints & Documents */}
                        <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 space-y-5">
                            <div className="flex items-center gap-2 text-neutral-500 mb-2">
                                <IconFileCheck className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Constraints & Verification</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-background rounded-xl shadow-sm border border-transparent space-y-2">
                                    <div className="flex items-center gap-2 text-neutral-400">
                                        <IconAlertCircle className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase">Max Consecutive</Label>
                                    </div>
                                    <Input
                                        type="number"
                                        className="h-9 w-full bg-muted/40 border-none rounded-lg font-bold text-sm px-3"
                                        value={editingLeave.maxConsecutiveDays || ""}
                                        onChange={e => updateField('maxConsecutiveDays', parseInt(e.target.value) || undefined)}
                                        placeholder="No limit"
                                    />
                                </div>
                                <div className="p-4 bg-background rounded-xl shadow-sm border border-transparent space-y-2">
                                    <div className="flex items-center gap-2 text-neutral-400">
                                        <IconHistory className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase">Min Delay (Days)</Label>
                                    </div>
                                    <Input
                                        type="number"
                                        className="h-9 w-full bg-muted/40 border-none rounded-lg font-bold text-sm px-3"
                                        value={editingLeave.minDelayBetweenRequestsDays || ""}
                                        onChange={e => updateField('minDelayBetweenRequestsDays', parseInt(e.target.value) || undefined)}
                                        placeholder="None"
                                    />
                                </div>
                                <div className="p-4 bg-background rounded-xl shadow-sm border border-transparent space-y-2">
                                    <div className="flex items-center gap-2 text-neutral-400">
                                        <IconClock className="w-3.5 h-3.5" />
                                        <Label className="text-[10px] font-bold uppercase">Min Notice (Days)</Label>
                                    </div>
                                    <Input
                                        type="number"
                                        className="h-9 w-full bg-muted/40 border-none rounded-lg font-bold text-sm px-3"
                                        value={editingLeave.minNoticeDays || ""}
                                        onChange={e => updateField('minNoticeDays', parseInt(e.target.value) || undefined)}
                                        placeholder="None"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2 border-t border-border/50">
                                <div className="flex items-center justify-between p-3.5 bg-background rounded-xl shadow-sm border border-transparent">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold block text-neutral-700">Supporting Documents</Label>
                                        <p className="text-[10px] text-muted-foreground">Require medical/legal proof uploads.</p>
                                    </div>
                                    <Switch
                                        checked={editingLeave.requireDocuments}
                                        onCheckedChange={v => updateField('requireDocuments', v)}
                                    />
                                </div>
                                {editingLeave.requireDocuments && (
                                    <div className="px-4 py-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 animate-in fade-in slide-in-from-top-2 flex justify-between items-center">
                                        <Label className="text-xs font-bold text-indigo-600">Required if &gt; consecutive days</Label>
                                        <Input
                                            type="number"
                                            className="w-16 h-8 bg-background border-none rounded-lg text-center font-bold text-xs"
                                            value={editingLeave.requireDocumentsIfConsecutiveMoreThan || ""}
                                            onChange={e => updateField('requireDocumentsIfConsecutiveMoreThan', parseInt(e.target.value) || undefined)}
                                            placeholder="Always"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM SECTION: Payout & Rollover */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Carry Over */}
                        <div className="p-5 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-3xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-neutral-500">
                                    <IconHistory className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Rollover Rule</span>
                                </div>
                                <Switch
                                    checked={editingLeave.canCarryOver}
                                    onCheckedChange={v => updateField('canCarryOver', v)}
                                />
                            </div>
                            {editingLeave.canCarryOver && (
                                <div className="animate-in zoom-in-95 duration-200">
                                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border/50 shadow-sm">
                                        <Label className="text-xs font-bold text-neutral-600">Maximum Rollover Cap (Days)</Label>
                                        <Input
                                            type="number"
                                            className="w-20 h-9 bg-muted/40 border-none rounded-xl text-center font-bold text-sm"
                                            value={editingLeave.maxCarryOverDays || ""}
                                            onChange={e => updateField('maxCarryOverDays', parseFloat(e.target.value) || 0)}
                                            placeholder="5"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Financials (Encashment) */}
                        <div className="p-5 bg-muted/30 rounded-3xl border border-border/50 space-y-4 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-neutral-500">
                                    <IconCoin className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Encashment Engine</span>
                                </div>
                                <Switch
                                    checked={editingLeave.isEncashable}
                                    onCheckedChange={v => updateField('isEncashable', v)}
                                />
                            </div>
                            {editingLeave.isEncashable && (
                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-neutral-400 ml-1">Calculation Logic</Label>
                                            <Select
                                                value={editingLeave.encashmentType || EncashmentType.MULTIPLIER_BASED}
                                                onValueChange={v => updateField('encashmentType', v as EncashmentType)}
                                            >
                                                <SelectTrigger className="h-9 bg-background border-none rounded-xl font-bold px-3 text-[10px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value={EncashmentType.MULTIPLIER_BASED}>Salary Multiplier</SelectItem>
                                                    <SelectItem value={EncashmentType.FIXED_AMOUNT}>Fixed Rate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-neutral-400 ml-1">
                                                {editingLeave.encashmentType === EncashmentType.FIXED_AMOUNT ? "Daily Rate (LKR)" : "Multiplier (x)"}
                                            </Label>
                                            <Input
                                                type="number"
                                                className="h-9 bg-background border-none rounded-xl font-black text-xs px-3"
                                                value={editingLeave.encashmentType === EncashmentType.FIXED_AMOUNT ? editingLeave.fixedAmount : editingLeave.encashmentMultiplier}
                                                onChange={e => updateField(editingLeave.encashmentType === EncashmentType.FIXED_AMOUNT ? 'fixedAmount' : 'encashmentMultiplier', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 md:p-8 bg-muted/60 border-t border-border mt-auto">
                    <div className="flex flex-col-reverse sm:flex-row gap-3 w-full justify-end">
                        <Button variant="ghost" className="rounded-xl px-10 h-11 font-bold text-xs hover:bg-background/50" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button className="rounded-xl px-14 h-11 font-bold text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={() => onSave(editingLeave)}>
                            Confirm & Save Leave Type
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
