
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shift } from "@/types/policy";
import { IconClock } from "@tabler/icons-react";

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
            <DialogContent className="w-full max-w-3xl p-0 overflow-hidden max-h-[90vh] h-[90vh] sm:h-auto flex flex-col bg-white dark:bg-neutral-900 border-none shadow-2xl rounded-[2rem]">

                {/* Header - Compact Glassmorphism */}
                <div className="absolute top-0 left-0 right-0 z-20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800/50 transition-all">
                    <DialogHeader className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                                    {initialData ? "Edit Shift" : "Add New Shift"}
                                </DialogTitle>
                                <DialogDescription className="text-sm font-medium text-neutral-500 mt-1">
                                    Configure working hours & rules.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Scrollable Content - Padding Adjusted */}
                <div className="flex-1 overflow-y-auto pt-24 pb-24 px-6 md:px-8 space-y-6 scroll-smooth">

                    {/* Shift Name */}
                    <div className="space-y-2 mt-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Shift Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="e.g. Morning Shift A"
                            className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-transparent focus:border-primary/20 rounded-2xl px-5 text-lg font-bold shadow-sm transition-all text-neutral-900 dark:text-white"
                        />
                    </div>

                    {/* Time Configuration */}
                    <div className="space-y-4 p-5 bg-neutral-50 dark:bg-neutral-800/30 rounded-[1.5rem]">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <IconClock className="w-5 h-5" />
                            </div>
                            <Label className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">Working Hours</Label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="startTime" className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">Start Time</Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => handleChange("startTime", e.target.value)}
                                    className="h-12 bg-white dark:bg-neutral-900 border-transparent rounded-xl text-center font-mono text-lg font-bold shadow-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="endTime" className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">End Time</Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => handleChange("endTime", e.target.value)}
                                    className="h-12 bg-white dark:bg-neutral-900 border-transparent rounded-xl text-center font-mono text-lg font-bold shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Constraints */}
                    <div className="space-y-4 p-5 bg-neutral-50 dark:bg-neutral-800/30 rounded-[1.5rem]">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <IconClock className="w-5 h-5" />
                            </div>
                            <Label className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">Constraints (Optional)</Label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="minStartTime" className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">Earliest Clock-In</Label>
                                <Input
                                    id="minStartTime"
                                    type="time"
                                    value={formData.minStartTime || ""}
                                    onChange={(e) => handleChange("minStartTime", e.target.value)}
                                    className="h-12 bg-white dark:bg-neutral-900 border-transparent rounded-xl text-center font-mono text-lg font-medium shadow-sm text-neutral-600 dark:text-neutral-300"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="maxOutTime" className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">Latest Clock-Out</Label>
                                <Input
                                    id="maxOutTime"
                                    type="time"
                                    value={formData.maxOutTime || ""}
                                    onChange={(e) => handleChange("maxOutTime", e.target.value)}
                                    className="h-12 bg-white dark:bg-neutral-900 border-transparent rounded-xl text-center font-mono text-lg font-medium shadow-sm text-neutral-600 dark:text-neutral-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Numeric Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="breakTime" className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Break (Min)</Label>
                            <Input
                                id="breakTime"
                                type="number"
                                value={formData.breakTime}
                                onChange={(e) => handleChange("breakTime", parseInt(e.target.value) || 0)}
                                className="h-12 bg-neutral-50 dark:bg-neutral-800/50 border-transparent rounded-xl text-center font-bold text-lg shadow-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Grace Periods (Min)</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Input
                                        placeholder="Late"
                                        type="number"
                                        value={formData.gracePeriodLate}
                                        onChange={(e) => handleChange("gracePeriodLate", parseInt(e.target.value) || 0)}
                                        className="h-12 bg-neutral-50 dark:bg-neutral-800/50 border-transparent rounded-xl text-center font-bold text-lg shadow-sm"
                                    />
                                    <span className="text-[9px] text-center block text-neutral-400 font-bold uppercase">Late</span>
                                </div>
                                <div className="space-y-1">
                                    <Input
                                        placeholder="Early"
                                        type="number"
                                        value={formData.gracePeriodEarly}
                                        onChange={(e) => handleChange("gracePeriodEarly", parseInt(e.target.value) || 0)}
                                        className="h-12 bg-neutral-50 dark:bg-neutral-800/50 border-transparent rounded-xl text-center font-bold text-lg shadow-sm"
                                    />
                                    <span className="text-[9px] text-center block text-neutral-400 font-bold uppercase">Early</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/30 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Smart Clock-In</Label>
                                <p className="text-[10px] text-neutral-400 max-w-[200px] leading-tight">Count work from Shift Start if early.</p>
                            </div>
                            <Switch
                                checked={formData.useShiftStartAsClockIn}
                                onCheckedChange={(c) => handleChange("useShiftStartAsClockIn", c)}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/30 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Auto Clock-Out</Label>
                                <p className="text-[10px] text-neutral-400 max-w-[200px] leading-tight">Auto end attendance at Latest Out.</p>
                            </div>
                            <Switch
                                checked={formData.autoClockOut}
                                onCheckedChange={(c) => handleChange("autoClockOut", c)}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer - Compact Glassmorphism */}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800/50 px-6 py-4">
                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-12 px-6 text-sm font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">Cancel</Button>
                        <Button onClick={handleSave} className="rounded-xl h-12 px-8 bg-primary text-primary-foreground text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            {initialData ? "Save Changes" : "Create Shift"}
                        </Button>
                    </DialogFooter>
                </div>

            </DialogContent>
        </Dialog>
    );
}
