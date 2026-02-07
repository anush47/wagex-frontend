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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";
import { IconClock, IconX, IconPlus } from "@tabler/icons-react";
import type { CreateEventDto } from "@/types/attendance";
import { EventType } from "@/types/attendance";
import { useAttendanceMutations } from "@/hooks/use-attendance";
import { toast } from "sonner";
import { format } from "date-fns";

interface CreateEventDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
}

export function CreateEventDialog({
    open,
    onOpenChange,
    companyId,
}: CreateEventDialogProps) {
    const [processing, setProcessing] = useState(false);

    // Form state
    const [employeeId, setEmployeeId] = useState<string>("");
    const [eventDate, setEventDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [eventTime, setEventTime] = useState(format(new Date(), "HH:mm"));
    const [eventType, setEventType] = useState<EventType>(EventType.IN);
    const [device, setDevice] = useState("");
    const [location, setLocation] = useState("");
    const [remark, setRemark] = useState("");

    const { createEvent } = useAttendanceMutations();

    const resetForm = () => {
        setEmployeeId("");
        setEventDate(format(new Date(), "yyyy-MM-dd"));
        setEventTime(format(new Date(), "HH:mm"));
        setEventType(EventType.IN);
        setDevice("");
        setLocation("");
        setRemark("");
    };

    const handleCreate = async () => {
        if (!employeeId) {
            toast.error("Please select an employee");
            return;
        }

        setProcessing(true);
        try {
            const eventDateTime = `${eventDate}T${eventTime}:00`;

            const dto: CreateEventDto = {
                employeeId,
                eventTime: eventDateTime,
                eventType,
                device: device || undefined,
                location: location || undefined,
                remark: remark || undefined,
            };

            await createEvent.mutateAsync(dto);
            resetForm();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create event", error);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-xl flex flex-col max-h-[90vh] p-0 gap-0 border-none shadow-2xl overflow-hidden rounded-3xl md:rounded-[2rem]">
                <DialogHeader className="p-5 md:p-6 pb-4 border-b border-border/40 shrink-0 bg-background z-10 relative">
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
                            <IconClock className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-lg md:text-xl font-bold tracking-tight">
                                Create Manual Attendance Event
                            </DialogTitle>
                            <DialogDescription className="text-[11px] font-medium text-muted-foreground/80">
                                Record a manual check-in or check-out event
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
                    {/* Employee Selection */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-500">
                            Employee <span className="text-red-500">*</span>
                        </Label>
                        <SearchableEmployeeSelect
                            companyId={companyId}
                            value={employeeId}
                            onSelect={(id) => setEmployeeId(id || "")}
                            placeholder="Select employee..."
                        />
                    </div>

                    {/* Event Type */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-500">
                            Event Type <span className="text-red-500">*</span>
                        </Label>
                        <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IN">Check In</SelectItem>
                                <SelectItem value="OUT">Check Out</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-neutral-500">
                                Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-neutral-500">
                                Time <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="time"
                                value={eventTime}
                                onChange={(e) => setEventTime(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Device (Optional) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-500">
                            Device (Optional)
                        </Label>
                        <Input
                            value={device}
                            onChange={(e) => setDevice(e.target.value)}
                            placeholder="e.g., Mobile App, Web Portal"
                            className="rounded-xl"
                        />
                    </div>

                    {/* Location (Optional) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-500">
                            Location (Optional)
                        </Label>
                        <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., Main Office, Branch 2"
                            className="rounded-xl"
                        />
                    </div>

                    {/* Remark (Optional) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-500">
                            Remark (Optional)
                        </Label>
                        <Textarea
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Add any additional notes..."
                            className="rounded-xl min-h-[80px]"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <DialogFooter className="p-4 md:p-6 bg-muted/60 border-t border-border shrink-0 z-10">
                    <div className="flex flex-row gap-2 md:gap-3 w-full justify-end">
                        <Button
                            variant="outline"
                            className="rounded-xl px-4 md:px-8 h-10 md:h-11 font-bold text-xs"
                            onClick={() => {
                                resetForm();
                                onOpenChange(false);
                            }}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="rounded-xl px-4 md:px-8 h-10 md:h-11 font-bold text-xs shadow-lg shadow-primary/20"
                            onClick={handleCreate}
                            disabled={processing}
                        >
                            <IconPlus className="h-4 w-4 md:mr-2" />
                            <span>{processing ? "Creating..." : "Create Event"}</span>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
