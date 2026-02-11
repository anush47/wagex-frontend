"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IconCalendarPlus, IconX, IconPlus } from "@tabler/icons-react";
import { format } from "date-fns";
import { useAttendanceMutations } from "@/hooks/use-attendance";
import { useEffectivePolicy } from "@/hooks/use-policies";

interface CreateSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: string;
    initialDate?: Date;
    onSuccess?: (sessionId: string) => void;
}

export function CreateSessionDialog({
    open,
    onOpenChange,
    employeeId,
    initialDate,
    onSuccess,
}: CreateSessionDialogProps) {
    const [processing, setProcessing] = useState(false);
    const [date, setDate] = useState(format(initialDate || new Date(), "yyyy-MM-dd"));
    const [shiftId, setShiftId] = useState<string>("none");

    const { createSession } = useAttendanceMutations();
    const { data: policyData } = useEffectivePolicy(employeeId);
    const availableShifts = policyData?.effective?.shifts?.list || [];

    const handleCreate = async () => {
        setProcessing(true);
        try {
            const data = await createSession.mutateAsync({
                employeeId,
                date,
                shiftId: shiftId === "none" ? undefined : shiftId,
            });

            if (data && onSuccess) {
                onSuccess(data.id);
            }
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create session", error);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[400px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-border/40 shrink-0 bg-background relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 rounded-full h-8 w-8 text-muted-foreground hover:bg-muted"
                        onClick={() => onOpenChange(false)}
                    >
                        <IconX className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-lg">
                            <IconCalendarPlus className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-lg font-bold tracking-tight">
                                Create New Session
                            </DialogTitle>
                            <DialogDescription className="text-[11px] font-medium text-muted-foreground/80">
                                Manually create a placeholder session
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            Work Date
                        </Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="rounded-xl h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            Expected Shift
                        </Label>
                        <Select value={shiftId} onValueChange={setShiftId}>
                            <SelectTrigger className="rounded-xl h-11">
                                <SelectValue placeholder="Select shift..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="none">No Shift (General)</SelectItem>
                                {availableShifts.map((shift: any) => (
                                    <SelectItem key={shift.id} value={shift.id}>
                                        {shift.name} ({shift.startTime} - {shift.endTime})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="p-4 bg-muted/60 border-t border-border">
                    <div className="flex flex-row gap-3 w-full justify-end">
                        <Button
                            variant="outline"
                            className="rounded-xl px-6 h-10 font-bold text-xs"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="rounded-xl px-6 h-10 font-bold text-xs shadow-lg shadow-primary/20"
                            onClick={handleCreate}
                            disabled={processing}
                        >
                            <IconPlus className="h-4 w-4 mr-2" />
                            <span>{processing ? "Creating..." : "Create Session"}</span>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
