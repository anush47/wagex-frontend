"use client";

import { useState } from "react";
import { LeavesConfig, LeaveType, AccrualFrequency, EmploymentType, Gender } from "@/types/policy";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconTrash, IconPlus, IconCalendar, IconCoin, IconEdit, IconCheck, IconCalendarStar, IconSettings } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { LeaveEditDialog } from "./LeaveEditDialog";

interface LeavesTabProps {
    value?: LeavesConfig;
    onChange: (config: LeavesConfig) => void;
}

const DEFAULT_LEAVE: LeaveType = {
    id: "",
    name: "",
    code: "",
    applicableGenders: [Gender.MALE, Gender.FEMALE],
    applicableEmploymentTypes: [EmploymentType.PERMANENT],
    requiresApproval: true,
    isShortLeave: false,
    baseAmount: 14,
    accrualFrequency: AccrualFrequency.YEARLY,
    canCarryOver: false,
    isEncashable: false,
};

export function LeavesTab({ value, onChange }: LeavesTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingLeave, setEditingLeave] = useState<LeaveType | null>(null);

    const leaveTypes = value?.leaveTypes || [];

    const handleAdd = () => {
        setEditingLeave({ ...DEFAULT_LEAVE, id: uuidv4() });
        setIsEditing(true);
    };

    const handleEdit = (leave: LeaveType) => {
        setEditingLeave({ ...leave });
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        const newList = leaveTypes.filter(l => l.id !== id);
        onChange({ ...value, leaveTypes: newList });
        toast.success("Leave type removed");
    };

    const handleSave = (leave: LeaveType) => {
        if (!leave.name || !leave.code) {
            toast.error("Please fill in name and code");
            return;
        }

        const exists = leaveTypes.find(l => l.id === leave.id);
        let newList;
        if (exists) {
            newList = leaveTypes.map(l => l.id === leave.id ? leave : l);
        } else {
            newList = [...leaveTypes, leave];
        }

        onChange({ ...value, leaveTypes: newList });
        setIsEditing(false);
        setEditingLeave(null);
        toast.success(exists ? "Leave type updated" : "Leave type added");
    };

    return (
        <div className="space-y-8">
            <LeaveEditDialog
                open={isEditing}
                onOpenChange={setIsEditing}
                initialData={editingLeave}
                onSave={handleSave}
            />


            {/* Leave Types List */}
            <Card className="border-none shadow-none bg-muted/50 rounded-[2rem]">
                <CardHeader className="pb-3 border-b border-border/40 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neutral-500">
                            <IconCalendar className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Define Leave Types</span>
                        </div>
                        <Button onClick={handleAdd} size="sm" className="bg-primary text-primary-foreground rounded-lg font-bold h-8 px-4 text-[10px] uppercase tracking-wider hover:bg-primary/90 shadow-md shadow-primary/20">
                            <IconPlus className="w-3 h-3 mr-1.5" />
                            New Leave Type
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {leaveTypes.map((leave) => (
                            <div
                                key={leave.id}
                                className="group relative p-5 rounded-2xl transition-all duration-300 border-2 bg-card/50 border-border hover:border-foreground/10 hover:shadow-xl hover:shadow-primary/5"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="h-9 w-9 rounded-lg flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                                            style={{
                                                backgroundColor: leave.color || 'var(--primary)',
                                                boxShadow: leave.color ? `0 10px 15px -3px ${leave.color}40` : undefined
                                            }}
                                        >
                                            <span className="font-black text-[10px]">{leave.code}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm tracking-tight">{leave.name}</h4>
                                            {leave.isShortLeave && <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded">Short Leave</span>}
                                        </div>
                                    </div>

                                    <div className="flex gap-0.5">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(leave)}>
                                            <IconEdit className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(leave.id)}>
                                            <IconTrash className="h-4 w-4 text-muted-foreground/50" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                                        <div className="text-center flex-1 border-r border-border px-1">
                                            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest block mb-0.5">Allowance</span>
                                            <span className="text-lg font-black font-mono tracking-tighter">
                                                {leave.baseAmount}d
                                            </span>
                                        </div>
                                        <div className="text-center flex-1 px-1">
                                            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest block mb-0.5">Cycle</span>
                                            <span className="text-[10px] font-black uppercase tracking-tight">
                                                {leave.accrualFrequency}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex flex-wrap gap-1">
                                            {leave.applicableGenders.length === Object.keys(Gender).length ? (
                                                <Badge variant="outline" className="text-[8px] uppercase font-black tracking-tight border-border bg-background h-4 px-1.5 opacity-60">
                                                    Everyone
                                                </Badge>
                                            ) : (
                                                leave.applicableGenders.map(gender => (
                                                    <Badge key={gender} variant="outline" className="text-[8px] uppercase font-black tracking-tight border-border bg-background h-4 px-1.5 opacity-60">
                                                        {gender}
                                                    </Badge>
                                                ))
                                            )}
                                            {leave.applicableEmploymentTypes.map(type => (
                                                <Badge key={type} variant="outline" className="text-[8px] uppercase font-black tracking-tight border-border bg-background h-4 px-1.5 opacity-60">{type}</Badge>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-muted-foreground pt-1">
                                            <div className="flex justify-between items-center bg-background/50 p-2 px-2.5 rounded-xl border border-border/40">
                                                <span className="text-[8px] uppercase tracking-tighter opacity-70">Approval</span>
                                                {leave.requiresApproval ? (
                                                    <IconCheck className="h-2.5 w-2.5 text-green-500" />
                                                ) : (
                                                    <span className="text-[7px] text-amber-500 uppercase font-black">Auto</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center bg-background/50 p-2 px-2.5 rounded-xl border border-border/40">
                                                <span className="text-[8px] uppercase tracking-tighter opacity-70">Encash</span>
                                                {leave.isEncashable ? (
                                                    <IconCoin className="h-3 w-3 text-emerald-500" />
                                                ) : (
                                                    <span className="text-[7px] uppercase font-black">No</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {leaveTypes.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-background/50 border-2 border-dashed border-border rounded-[3rem]">
                                <div className="h-24 w-24 rounded-3xl bg-primary/5 flex items-center justify-center mb-6">
                                    <IconCalendarStar className="h-12 w-12 text-primary/30" />
                                </div>
                                <h4 className="text-xl font-bold mb-2">No Leave Types Defined</h4>
                                <p className="text-muted-foreground text-sm mb-8 max-w-sm text-center leading-relaxed font-medium">Create policies for Annual, Sick, or Medical leaves to start tracking employee balances automatically.</p>
                                <Button onClick={handleAdd} className="rounded-2xl px-10 py-7 h-auto font-black text-base shadow-2xl shadow-primary/30 transition-all hover:scale-105">
                                    <IconPlus className="mr-2 h-6 w-6" />
                                    Create First Leave Type
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
