"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { PayrollComponent, PayrollComponentCategory, PayrollComponentType, PayrollComponentSystemType } from "@/types/policy";
import { IconCoin, IconCalculator, IconScale, IconShieldCheck, IconSettings } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface PayrollComponentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: PayrollComponentCategory;
    initialData?: PayrollComponent;
    onSave: (component: PayrollComponent) => void;
}

const DEFAULT_COMPONENT: Partial<PayrollComponent> = {
    name: "",
    type: PayrollComponentType.FLAT_AMOUNT,
    value: 0,
    isStatutory: false,
    affectsTotalEarnings: false,
};

export function PayrollComponentDialog({ open, onOpenChange, category, initialData, onSave }: PayrollComponentDialogProps) {
    const [formData, setFormData] = useState<PayrollComponent>({
        ...DEFAULT_COMPONENT,
        id: "",
        category: category,
    } as PayrollComponent);

    useEffect(() => {
        if (open) {
            setFormData(initialData ? { ...initialData } : {
                ...DEFAULT_COMPONENT,
                id: crypto.randomUUID(),
                category: category,
            } as PayrollComponent);
        }
    }, [open, initialData, category]);

    const handleChange = (field: keyof PayrollComponent | 'template', value: any) => {
        if (field === 'template') {
            // Handle Template Selection
            if (value === 'TEMPLATE_EPF_8') {
                setFormData(prev => ({
                    ...prev,
                    name: "EPF (Employee Share)",
                    type: PayrollComponentType.PERCENTAGE_TOTAL_EARNINGS,
                    value: 8,
                    isStatutory: true,
                    systemType: PayrollComponentSystemType.EPF_EMPLOYEE
                }));
            } else if (value === 'TEMPLATE_HOLIDAY_PAY') {
                setFormData(prev => ({
                    ...prev,
                    name: "Holiday Pay",
                    type: PayrollComponentType.FLAT_AMOUNT, // Actually system calculated, but we use flat as placeholder
                    value: 0,
                    isStatutory: true,
                    affectsTotalEarnings: true,
                    systemType: PayrollComponentSystemType.HOLIDAY_PAY
                }));
            } else if (value === 'TEMPLATE_NO_PAY') {
                setFormData(prev => ({
                    ...prev,
                    name: "No-Pay Deduction",
                    type: PayrollComponentType.FLAT_AMOUNT, // System calculated
                    value: 0,
                    isStatutory: false,
                    affectsTotalEarnings: true,
                    systemType: PayrollComponentSystemType.NO_PAY_DEDUCTION
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSave = () => {
        if (!formData.name) return;
        onSave(formData);
        onOpenChange(false);
    };

    const isAddition = category === PayrollComponentCategory.ADDITION;
    const accentColor = isAddition ? "text-emerald-600" : "text-rose-600";
    const accentBg = isAddition ? "bg-emerald-500/10" : "bg-rose-500/10";

    // Determine the value to show in the Select component
    let selectValue = formData.type as string;
    if (formData.systemType === PayrollComponentSystemType.EPF_EMPLOYEE) {
        selectValue = 'TEMPLATE_EPF_8';
    } else if (formData.systemType === PayrollComponentSystemType.HOLIDAY_PAY) {
        selectValue = 'TEMPLATE_HOLIDAY_PAY';
    } else if (formData.systemType === PayrollComponentSystemType.NO_PAY_DEDUCTION) {
        selectValue = 'TEMPLATE_NO_PAY';
    }

    const isSystemCalculated = formData.systemType && formData.systemType !== PayrollComponentSystemType.NONE;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl md:rounded-[2.5rem] p-0 gap-0 border-none shadow-2xl">
                <DialogHeader className="p-6 md:p-8 pb-4 border-b border-border/40">
                    <div className="flex items-center gap-4">
                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", accentBg, accentColor)}>
                            <IconCoin className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight">
                                {initialData ? "Component Configuration" : `New ${isAddition ? "Addition" : "Deduction"}`}
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground">
                                Define how this {category.toLowerCase()} is calculated and its statutory status.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 md:p-8 space-y-8">
                    {/* Identity Section */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Label</Label>
                        <Input
                            placeholder={isAddition ? "e.g. Performance Bonus" : "e.g. Employee Insurance"}
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="h-14 bg-muted/40 border-none rounded-2xl px-6 text-lg font-bold shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Calculation Engine */}
                        <div className="bg-muted/30 p-6 rounded-[2rem] border border-border/50 space-y-6">
                            <div className="flex items-center gap-2 text-neutral-500 mb-2">
                                <IconCalculator className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Calculation Engine</span>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-neutral-600 ml-1">Computational Basis</Label>
                                    <Select
                                        value={selectValue}
                                        onValueChange={(v) => {
                                            if (v.startsWith('TEMPLATE_')) {
                                                handleChange('template', v);
                                            } else {
                                                handleChange("type", v as PayrollComponentType);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="h-11 bg-background border-none rounded-xl font-bold px-4 shadow-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value={PayrollComponentType.FLAT_AMOUNT}>Fixed Amount (Flat)</SelectItem>
                                            <SelectItem value={PayrollComponentType.PERCENTAGE_BASIC}>% of Basic Salary</SelectItem>
                                            <SelectItem value={PayrollComponentType.PERCENTAGE_TOTAL_EARNINGS}>% of Total Earnings</SelectItem>

                                            <SelectGroup>
                                                <SelectLabel className="text-[10px] font-black uppercase text-muted-foreground pl-3 py-1">System Templates</SelectLabel>
                                                {category === PayrollComponentCategory.DEDUCTION && (
                                                    <>
                                                        <SelectItem value="TEMPLATE_EPF_8">EPF 8% (Employee Share)</SelectItem>
                                                        <SelectItem value="TEMPLATE_NO_PAY">No-Pay Deduction (System Calculated)</SelectItem>
                                                    </>
                                                )}
                                                {category === PayrollComponentCategory.ADDITION && (
                                                    <SelectItem value="TEMPLATE_HOLIDAY_PAY">Holiday Pay (System Calculated)</SelectItem>
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-neutral-600 ml-1">
                                        {isSystemCalculated ? "Default Value / Rate" : (formData.type === PayrollComponentType.FLAT_AMOUNT ? "Base Amount (LKR)" : "Percentage Value (%)")}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={formData.value}
                                            disabled={selectValue === 'TEMPLATE_HOLIDAY_PAY' || selectValue === 'TEMPLATE_NO_PAY'}
                                            onChange={(e) => handleChange("value", parseFloat(e.target.value) || 0)}
                                            className={cn(
                                                "h-11 bg-background border-none rounded-xl font-black px-4 shadow-sm",
                                                (selectValue === 'TEMPLATE_HOLIDAY_PAY' || selectValue === 'TEMPLATE_NO_PAY') && "opacity-50"
                                            )}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-neutral-400">
                                            {formData.type === PayrollComponentType.FLAT_AMOUNT ? "LKR" : "%"}
                                        </span>
                                    </div>
                                    {(selectValue === 'TEMPLATE_HOLIDAY_PAY' || selectValue === 'TEMPLATE_NO_PAY') && (
                                        <p className="text-[10px] text-muted-foreground font-medium ml-1">
                                            Calculated automatically based on attendance records.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {formData.type !== PayrollComponentType.FLAT_AMOUNT && (
                                <div className="pt-6 border-t border-border/40 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-2 text-neutral-500">
                                        <IconScale className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Guardrails (Caps)</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">Floor (Min)</Label>
                                            <Input
                                                type="number"
                                                value={formData.minCap || ''}
                                                onChange={(e) => handleChange("minCap", e.target.value ? parseFloat(e.target.value) : undefined)}
                                                placeholder="None"
                                                className="h-10 bg-background/50 border-none rounded-xl font-bold px-4 text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">Ceiling (Max)</Label>
                                            <Input
                                                type="number"
                                                value={formData.maxCap || ''}
                                                onChange={(e) => handleChange("maxCap", e.target.value ? parseFloat(e.target.value) : undefined)}
                                                placeholder="None"
                                                className="h-10 bg-background/50 border-none rounded-xl font-bold px-4 text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rules & Status */}
                        <div className="space-y-6">
                            <div className="bg-muted/30 p-6 rounded-[2rem] border border-border/50 space-y-4">
                                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                                    <IconSettings className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Computational Rules</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl shadow-sm border border-transparent">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <IconShieldCheck className="w-4 h-4 text-indigo-500" />
                                                <Label className="text-sm font-bold block">Statutory Compliance</Label>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">Required by labor laws (e.g. ETF/EPF).</p>
                                        </div>
                                        <Switch
                                            checked={formData.isStatutory}
                                            onCheckedChange={(c) => handleChange("isStatutory", c)}
                                            className="data-[state=active]:bg-indigo-500"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl shadow-sm border border-transparent">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold block">Affects Total Earnings</Label>
                                            <p className="text-[10px] text-muted-foreground">Impacts gross pay calculations.</p>
                                        </div>
                                        <Switch
                                            checked={formData.affectsTotalEarnings}
                                            onCheckedChange={(c) => handleChange("affectsTotalEarnings", c)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 md:p-8 bg-muted/60 border-t border-border mt-auto">
                    <div className="flex flex-col-reverse sm:flex-row gap-3 w-full justify-end">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl px-8 h-12 font-bold text-xs hover:bg-background/50">
                            Dismiss
                        </Button>
                        <Button onClick={handleSave} className={cn("rounded-xl px-12 h-12 font-bold text-xs shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-white", isAddition ? "bg-emerald-600 shadow-emerald-500/20" : "bg-rose-600 shadow-rose-500/20")}>
                            {initialData ? "Save Config" : `Activate ${isAddition ? "Addition" : "Deduction"}`}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
