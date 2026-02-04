
import { useState } from "react";
import { Shift, ShiftsConfig, ShiftSelectionPolicy } from "@/types/policy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconClock, IconPlus, IconPencil, IconTrash, IconCheck, IconSettings } from "@tabler/icons-react";
import { ShiftEditDialog } from "./ShiftEditDialog";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShiftsSectionProps {
    value: ShiftsConfig;
    onChange: (val: ShiftsConfig) => void;
}

export function ShiftsSection({ value, onChange }: ShiftsSectionProps) {
    const shifts = value.list || [];
    const [editingShift, setEditingShift] = useState<Shift | undefined>(undefined);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSaveShift = (newShift: Shift) => {
        let updatedList: Shift[];
        const exists = shifts.find(s => s.id === newShift.id);

        if (exists) {
            updatedList = shifts.map(s => s.id === newShift.id ? newShift : s);
        } else {
            updatedList = [...shifts, newShift];
        }

        const updatedConfig = { ...value, list: updatedList };

        // If it's the first shift, make it default
        if (updatedList.length === 1 && !updatedConfig.defaultShiftId) {
            updatedConfig.defaultShiftId = newShift.id;
        }

        onChange(updatedConfig);
    };

    const handleDeleteShift = (id: string) => {
        const updatedList = shifts.filter(s => s.id !== id);
        onChange({
            ...value,
            list: updatedList,
            defaultShiftId: value.defaultShiftId === id ? (updatedList[0]?.id || undefined) : value.defaultShiftId
        });
    };

    const handleOpenAdd = () => {
        setEditingShift(undefined);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (shift: Shift) => {
        setEditingShift(shift);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-8">
            <ShiftEditDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                initialData={editingShift}
                onSave={handleSaveShift}
            />

            <div className="flex flex-col md:flex-row gap-6">
                {/* Configuration Card */}
                <Card className="flex-1 border-none shadow-none bg-muted/50 rounded-3xl">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <IconSettings className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Global Rules</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Shift Selection Mode</Label>
                                <Select
                                    value={value.selectionPolicy || ShiftSelectionPolicy.FIXED}
                                    onValueChange={(v) => onChange({ ...value, selectionPolicy: v as ShiftSelectionPolicy })}
                                >
                                    <SelectTrigger className="bg-background border-none h-11 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ShiftSelectionPolicy.FIXED}>Fixed (Use Default)</SelectItem>
                                        <SelectItem value={ShiftSelectionPolicy.CLOSEST_START_TIME}>Smart (Closest Start Time)</SelectItem>
                                        <SelectItem value={ShiftSelectionPolicy.MANUAL}>Manual Selection</SelectItem>
                                        <SelectItem value={ShiftSelectionPolicy.EMPLOYEE_ROSTER}>Employee Roster</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Default Shift</Label>
                                <Select
                                    value={value.defaultShiftId || ""}
                                    onValueChange={(v) => onChange({ ...value, defaultShiftId: v })}
                                    disabled={!shifts.length}
                                >
                                    <SelectTrigger className="bg-background border-none h-11 rounded-xl">
                                        <SelectValue placeholder={shifts.length ? "Select default" : "No shifts available"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {shifts.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name} ({s.startTime})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Shifts List */}
            {/* All Shifts List */}
            <Card className="border-none shadow-none bg-muted/50 rounded-3xl">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <IconClock className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">All Shifts</span>
                        </div>
                        <Button onClick={handleOpenAdd} size="sm" className="bg-primary text-primary-foreground rounded-xl font-bold h-8 text-xs hover:bg-primary/90">
                            <IconPlus className="w-3.5 h-3.5 mr-1.5" />
                            Add Shift
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {shifts.map((shift) => {
                            const isDefault = value.defaultShiftId === shift.id;
                            return (
                                <div
                                    key={shift.id}
                                    className={cn(
                                        "group relative p-6 rounded-3xl transition-all duration-300 border-2",
                                        isDefault
                                            ? "bg-card border-primary/20 shadow-xl shadow-primary/5"
                                            : "bg-card/50 border-border hover:border-foreground/10"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                                                isDefault ? "bg-primary shadow-primary/30" : "bg-muted text-muted-foreground"
                                            )}>
                                                <IconClock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg leading-tight">{shift.name}</h4>
                                                {isDefault && <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded ml-[-1px]">Default</span>}
                                            </div>
                                        </div>

                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl" onClick={() => handleOpenEdit(shift)}>
                                                <IconPencil className="h-5 w-5 text-muted-foreground" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteShift(shift.id)}>
                                                <IconTrash className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between p-5 bg-muted/50 rounded-3xl">
                                            <div className="text-center flex-1 border-r border-border">
                                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest block mb-1">Clock In</span>
                                                <span className="text-2xl font-black font-mono tracking-tighter">
                                                    {new Date(`1970-01-01T${shift.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="text-center flex-1">
                                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest block mb-1">Clock Out</span>
                                                <span className="text-2xl font-black font-mono tracking-tighter">
                                                    {new Date(`1970-01-01T${shift.endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Small Info Grid for Limits */}
                                        {(shift.minStartTime || shift.maxOutTime) && (
                                            <div className="grid grid-cols-2 gap-3">
                                                {shift.minStartTime && (
                                                    <div className="text-center p-2 rounded-xl bg-green-500/5 border border-green-500/10">
                                                        <span className="text-[9px] font-bold uppercase text-green-600/70 block">Earliest In</span>
                                                        <span className="text-xs font-black font-mono text-green-700 dark:text-green-500">{shift.minStartTime}</span>
                                                    </div>
                                                )}
                                                {shift.maxOutTime && (
                                                    <div className="text-center p-2 rounded-xl bg-orange-500/5 border border-orange-500/10">
                                                        <span className="text-[9px] font-bold uppercase text-orange-600/70 block">Latest Out</span>
                                                        <span className="text-xs font-black font-mono text-orange-700 dark:text-orange-500">{shift.maxOutTime}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3 text-xs font-bold text-muted-foreground pt-2 px-2">
                                            <div className="flex justify-between items-center bg-background p-2 rounded-lg border border-border">
                                                <span>Break</span>
                                                <span className="text-foreground bg-muted px-2 py-0.5 rounded-md">{shift.breakTime}m</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-background p-2 rounded-lg border border-border">
                                                <span>Grace</span>
                                                <span className="text-foreground bg-muted px-2 py-0.5 rounded-md">{shift.gracePeriodLate}m</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
