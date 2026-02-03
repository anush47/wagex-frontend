
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PayrollComponent, PayrollComponentCategory, PayrollComponentType } from "@/types/policy";
import { IconCoin } from "@tabler/icons-react";

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

    const handleChange = (field: keyof PayrollComponent, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!formData.name) return;
        onSave(formData);
        onOpenChange(false);
    };

    const isAddition = category === PayrollComponentCategory.ADDITION;
    const accentColor = isAddition ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
    const accentBg = isAddition ? "bg-green-500/10" : "bg-red-500/10";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-3xl p-0 overflow-hidden max-h-[90vh] h-[90vh] sm:h-auto flex flex-col bg-white dark:bg-neutral-900 border-none shadow-2xl rounded-[2rem]">

                {/* Header - Compact Glassmorphism */}
                <div className="absolute top-0 left-0 right-0 z-20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800/50 transition-all">
                    <DialogHeader className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 dark:text-white capitalize">
                                    {initialData ? "Edit" : "Add"} {isAddition ? "Addition" : "Deduction"}
                                </DialogTitle>
                                <DialogDescription className="text-sm font-medium text-neutral-500 mt-1">
                                    Configure payroll component details.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pt-24 pb-24 px-6 md:px-8 space-y-6 scroll-smooth">

                    {/* Name */}
                    <div className="space-y-2 mt-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Component Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder={isAddition ? "e.g. Travel Allowance, Bonus" : "e.g. Health Insurance, Tax"}
                            className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-transparent focus:border-primary/20 rounded-2xl px-5 text-lg font-bold shadow-sm transition-all text-neutral-900 dark:text-white"
                        />
                    </div>

                    {/* Configuration Card */}
                    <div className="space-y-4 p-5 bg-neutral-50 dark:bg-neutral-800/30 rounded-[1.5rem]">
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`h-8 w-8 rounded-xl ${accentBg} flex items-center justify-center ${accentColor}`}>
                                <IconCoin className="w-5 h-5" />
                            </div>
                            <Label className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">Calculation Logic</Label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">Calculation Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(v) => handleChange("type", v as PayrollComponentType)}
                                >
                                    <SelectTrigger className="h-12 bg-white dark:bg-neutral-900 border-transparent rounded-xl font-bold shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={PayrollComponentType.FLAT_AMOUNT}>Flat Amount</SelectItem>
                                        <SelectItem value={PayrollComponentType.PERCENTAGE_BASIC}>% of Basic Salary</SelectItem>
                                        <SelectItem value={PayrollComponentType.PERCENTAGE_GROSS}>% of Gross Salary</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="value" className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">
                                    {formData.type === PayrollComponentType.FLAT_AMOUNT ? "Default Amount" : "Percentage Value (%)"}
                                </Label>
                                <Input
                                    id="value"
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => handleChange("value", parseFloat(e.target.value) || 0)}
                                    className="h-12 bg-white dark:bg-neutral-900 border-transparent rounded-xl text-center font-mono text-lg font-bold shadow-sm"
                                />
                            </div>
                        </div>

                        {formData.type !== PayrollComponentType.FLAT_AMOUNT && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-700/50">
                                <div className="space-y-1.5">
                                    <Label htmlFor="minCap" className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">
                                        Minimum Cap (Optional)
                                    </Label>
                                    <Input
                                        id="minCap"
                                        type="number"
                                        value={formData.minCap || ''}
                                        onChange={(e) => handleChange("minCap", e.target.value ? parseFloat(e.target.value) : undefined)}
                                        placeholder="e.g. 500"
                                        className="h-12 bg-white dark:bg-neutral-900 border-transparent rounded-xl font-bold shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="maxCap" className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">
                                        Maximum Cap (Optional)
                                    </Label>
                                    <Input
                                        id="maxCap"
                                        type="number"
                                        value={formData.maxCap || ''}
                                        onChange={(e) => handleChange("maxCap", e.target.value ? parseFloat(e.target.value) : undefined)}
                                        placeholder="e.g. 10000"
                                        className="h-12 bg-white dark:bg-neutral-900 border-transparent rounded-xl font-bold shadow-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/30 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Statutory Component</Label>
                                <p className="text-[10px] text-neutral-400 max-w-[250px] leading-tight">This component is required by law (e.g. EPF, ETF).</p>
                            </div>
                            <Switch
                                checked={formData.isStatutory}
                                onCheckedChange={(c) => handleChange("isStatutory", c)}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/30 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Affects Total Earnings</Label>
                                <p className="text-[10px] text-neutral-400 max-w-[250px] leading-tight">Include this in the total earnings calculation.</p>
                            </div>
                            <Switch
                                checked={formData.affectsTotalEarnings}
                                onCheckedChange={(c) => handleChange("affectsTotalEarnings", c)}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer - Compact Glassmorphism */}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800/50 px-6 py-4">
                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-12 px-6 text-sm font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">Cancel</Button>
                        <Button onClick={handleSave} className="rounded-xl h-12 px-8 bg-primary text-primary-foreground text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            {initialData ? "Save Changes" : "Create Component"}
                        </Button>
                    </DialogFooter>
                </div>

            </DialogContent>
        </Dialog>
    );
}
