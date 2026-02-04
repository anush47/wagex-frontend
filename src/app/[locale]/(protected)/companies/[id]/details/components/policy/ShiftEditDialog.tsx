"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shift } from "@/types/policy";
import { IconClock, IconCalendarTime, IconSettings, IconAlertCircle, IconSparkles, IconLogout } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ShiftEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Shift;
    onSave: (shift: Shift) => void;
}

const DEFAULT_SHIFT: Shift = {
    id: "",
    name: "",
    startTime: "09:00",
    endTime: "17:00",
    breakTime: 60,
    gracePeriodLate: 15,
    gracePeriodEarly: 15,
    useShiftStartAsClockIn: false,
    autoClockOut: false
};

export function ShiftEditDialog({ open, onOpenChange, initialData, onSave }: ShiftEditDialogProps) {
    const [formData, setFormData] = useState<Shift>(DEFAULT_SHIFT);

    useEffect(() => {
        if (open) {
            setFormData(initialData ? { ...DEFAULT_SHIFT, ...initialData } : { ...DEFAULT_SHIFT, id: crypto.randomUUID() });
        }
    }, [open, initialData]);

    const handleChange = (field: keyof Shift, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!formData.name || !formData.startTime || !formData.endTime) return;
        onSave(formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl md:rounded-[2.5rem] p-0 gap-0 border-none shadow-2xl">
                <DialogHeader className="p-6 md:p-8 pb-4 border-b border-border/40">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                            <IconCalendarTime className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight">
                                {initialData ? "Shift Configuration" : "New Shift Pattern"}
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground">
                                Define working hours, grace periods, and automated attendance rules.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 md:p-8 space-y-8">
                    {/* Identity Section */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Identity</Label>
                        <Input
                            placeholder="e.g. Morning Standard A"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="h-14 bg-muted/40 border-none rounded-2xl px-6 text-lg font-bold shadow-sm focus-visible:ring-blue-500/30"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Timing */}
                        <div className="space-y-6">
                            <div className="bg-muted/30 p-6 rounded-[2rem] border border-border/50 space-y-6">
                                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                                    <IconClock className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Core Working Hours</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-neutral-600 ml-1">Daily Start</Label>
                                        <Input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) => handleChange("startTime", e.target.value)}
                                            className="h-11 bg-background border-none rounded-xl text-center font-mono text-base font-bold shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-neutral-600 ml-1">Daily End</Label>
                                        <Input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) => handleChange("endTime", e.target.value)}
                                            className="h-11 bg-background border-none rounded-xl text-center font-mono text-base font-bold shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border/40 space-y-4">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Clock-in Constraints</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-neutral-600 ml-1">Earliest In</Label>
                                            <Input
                                                type="time"
                                                value={formData.minStartTime || ""}
                                                onChange={(e) => handleChange("minStartTime", e.target.value)}
                                                className="h-10 bg-background/50 border-none rounded-xl text-center font-mono text-sm shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-neutral-600 ml-1">Latest Out</Label>
                                            <Input
                                                type="time"
                                                value={formData.maxOutTime || ""}
                                                onChange={(e) => handleChange("maxOutTime", e.target.value)}
                                                className="h-10 bg-background/50 border-none rounded-xl text-center font-mono text-sm shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/30 p-6 rounded-[2rem] border border-border/50">
                                <div className="flex items-center gap-2 text-neutral-500 mb-4">
                                    <IconSettings className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Break Management</span>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={formData.breakTime}
                                        onChange={(e) => handleChange("breakTime", parseInt(e.target.value) || 0)}
                                        className="h-12 bg-background border-none rounded-xl font-bold px-4 shadow-sm pr-16"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">Minutes</span>
                                </div>
                                <p className="text-[10px] text-neutral-400 mt-2 px-1">Unpaid duration deducted from total working hours.</p>
                            </div>
                        </div>

                        {/* Right Column: Rules & Toggles */}
                        <div className="space-y-6">
                            <div className="bg-muted/30 p-6 rounded-[2rem] border border-border/50 space-y-5">
                                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                                    <IconAlertCircle className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Leniency Rules</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-background rounded-2xl border border-border/30 shadow-sm space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-tight text-amber-600/70">Late Arrival Grace</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                value={formData.gracePeriodLate}
                                                onChange={(e) => handleChange("gracePeriodLate", parseInt(e.target.value) || 0)}
                                                className="h-9 w-full bg-muted/40 border-none rounded-lg font-bold text-sm px-3"
                                            />
                                            <span className="text-[10px] font-bold text-neutral-400">Min</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-background rounded-2xl border border-border/30 shadow-sm space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-tight text-emerald-600/70">Early Exit Grace</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                value={formData.gracePeriodEarly}
                                                onChange={(e) => handleChange("gracePeriodEarly", parseInt(e.target.value) || 0)}
                                                className="h-9 w-full bg-muted/40 border-none rounded-lg font-bold text-sm px-3"
                                            />
                                            <span className="text-[10px] font-bold text-neutral-400">Min</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/30 p-6 rounded-[2rem] border border-border/50 space-y-4">
                                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                                    <IconSparkles className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Automation Engine</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl shadow-sm border border-transparent hover:border-blue-500/20 transition-all group">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold block">Smart Clock-In</Label>
                                            <p className="text-[10px] text-muted-foreground">Adjust early check-ins to shift start time.</p>
                                        </div>
                                        <Switch
                                            checked={formData.useShiftStartAsClockIn}
                                            onCheckedChange={(c) => handleChange("useShiftStartAsClockIn", c)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl shadow-sm border border-transparent hover:border-red-500/20 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-bold block">Automated Checkout</Label>
                                                <p className="text-[10px] text-muted-foreground">Force clock-out at the defined end time.</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={formData.autoClockOut}
                                            onCheckedChange={(c) => handleChange("autoClockOut", c)}
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
                        <Button onClick={handleSave} className="rounded-xl px-12 h-12 font-bold text-xs shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary text-primary-foreground">
                            {initialData ? "Apply Changes" : "Activate Shift"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
