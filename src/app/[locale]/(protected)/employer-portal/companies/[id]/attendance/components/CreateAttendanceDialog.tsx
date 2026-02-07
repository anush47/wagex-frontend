"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";
import { useAttendance } from "@/hooks/use-attendance";
import { AttendanceSource } from "@/types/attendance";
import { IconCheck, IconCalendar, IconClock, IconMapPin } from "@tabler/icons-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useEmployees } from "@/hooks/use-employees";

interface CreateAttendanceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
}

export function CreateAttendanceDialog({
    open,
    onOpenChange,
    companyId,
}: CreateAttendanceDialogProps) {
    const { syncManual, isSyncing } = useAttendance(companyId);
    const { data: employeesData } = useEmployees({ companyId });
    const employees = employeesData?.data || employeesData || [];

    const [formData, setFormData] = useState({
        employeeId: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm"),
        location: "Office (Manual)",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const employee = employees.find((emp: any) => emp.id === formData.employeeId);
        if (!employee) {
            toast.error("Please select an employee");
            return;
        }

        const timestamp = new Date(`${formData.date}T${formData.time}:00`).toISOString();

        syncManual(
            [{
                employeeNo: employee.employeeNo,
                timestamp,
                location: formData.location,
            }],
            {
                onSuccess: () => {
                    onOpenChange(false);
                    setFormData({
                        employeeId: "",
                        date: format(new Date(), "yyyy-MM-dd"),
                        time: format(new Date(), "HH:mm"),
                        location: "Office (Manual)",
                    });
                }
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl md:rounded-[2rem] p-0 gap-0 border-none shadow-2xl">
                <DialogHeader className="p-5 md:p-6 pb-4 border-b border-border/40">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 shadow-lg">
                            <IconClock className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg md:text-xl font-bold tracking-tight">
                                Create Attendance Record
                            </DialogTitle>
                            <DialogDescription className="text-[11px] font-medium text-muted-foreground/80">
                                Submit a new workforce participation record
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-neutral-500 ml-1 flex items-center gap-1.5">
                            <IconCheck className="w-3.5 h-3.5" />
                            Select Employee
                        </Label>
                        <SearchableEmployeeSelect
                            companyId={companyId}
                            value={formData.employeeId}
                            onSelect={(id) => setFormData(p => ({ ...p, employeeId: id }))}
                            placeholder="Type to search..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-neutral-500 ml-1 flex items-center gap-1.5">
                                <IconCalendar className="w-3.5 h-3.5" />
                                Event Date
                            </Label>
                            <Input
                                type="date"
                                required
                                className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm"
                                value={formData.date}
                                onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-neutral-500 ml-1 flex items-center gap-1.5">
                                <IconClock className="w-3.5 h-3.5" />
                                Event Time
                            </Label>
                            <Input
                                type="time"
                                required
                                className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm"
                                value={formData.time}
                                onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-neutral-500 ml-1 flex items-center gap-1.5">
                            <IconMapPin className="w-3.5 h-3.5" />
                            Location Label
                        </Label>
                        <Input
                            placeholder="e.g. Head Office"
                            className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm"
                            value={formData.location}
                            onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                        />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 w-full justify-end pt-4 border-t border-border/50">
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-xl px-10 h-11 font-bold text-xs hover:bg-background/50"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSyncing}
                            className="rounded-xl px-14 h-11 font-bold text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isSyncing ? "Creating..." : "Save Record"}
                        </Button>
                    </div>
                </form>
            </DialogContent>

        </Dialog>
    );
}
