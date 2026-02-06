"use client";

import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { IconCalendarEvent, IconUser, IconCalendarStar, IconClock } from "@tabler/icons-react";
import { LeavesService } from "@/services/leaves.service";
import { EmployeeService } from "@/services/employee.service";
import { PoliciesService } from "@/services/policies.service";
import type { Employee } from "@/types/employee";
import type { LeaveRequestType } from "@/types/leave";
import { toast } from "sonner";

interface CreateLeaveRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    onSuccess: () => void;
}

export function CreateLeaveRequestDialog({
    open,
    onOpenChange,
    companyId,
    onSuccess,
}: CreateLeaveRequestDialogProps) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        employeeId: "",
        leaveTypeId: "",
        type: "FULL_DAY" as LeaveRequestType,
        startDate: "",
        endDate: "",
        reason: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await EmployeeService.getEmployees({ companyId });
                setEmployees(response.data?.data?.data || []);
            } catch (error) {
                console.error("Failed to fetch employees:", error);
                setEmployees([]);
            }
        };

        if (open) {
            fetchData();
        }
    }, [open, companyId]);

    useEffect(() => {
        const fetchLeaveTypes = async () => {
            if (!formData.employeeId) {
                setLeaveTypes([]);
                return;
            }

            try {
                const response = await PoliciesService.getEffectivePolicy(formData.employeeId);
                // Extract from response.data.data.effective.leaves.leaveTypes
                const types = response.data?.data?.effective?.leaves?.leaveTypes || [];
                console.log("Fetched leave types:", types);
                setLeaveTypes(types);
            } catch (error) {
                console.error("Failed to fetch leave types:", error);
                setLeaveTypes([]);
            }
        };

        fetchLeaveTypes();
    }, [formData.employeeId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await LeavesService.createRequest({
                ...formData,
                companyId,
            });
            if (response.data) {
                toast.success("Leave request created successfully");
                onSuccess();
                onOpenChange(false);
            }
            setFormData({
                employeeId: "",
                leaveTypeId: "",
                type: "FULL_DAY",
                startDate: "",
                endDate: "",
                reason: "",
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create leave request");
        } finally {
            setLoading(false);
        }
    };

    const selectedLeaveType = leaveTypes.find(lt => lt.id === formData.leaveTypeId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl md:rounded-[2rem] p-0 gap-0 border-none shadow-2xl">
                <DialogHeader className="p-5 md:p-6 pb-4 border-b border-border/40">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 shadow-lg">
                            <IconCalendarEvent className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg md:text-xl font-bold tracking-tight">
                                Create Leave Request
                            </DialogTitle>
                            <DialogDescription className="text-[11px] font-medium text-muted-foreground/80">
                                Submit a new leave request for an employee
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Employee Selection */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-neutral-500 ml-1 flex items-center gap-1.5">
                                <IconUser className="w-3.5 h-3.5" />
                                Employee
                            </Label>
                            <Select
                                value={formData.employeeId}
                                onValueChange={(value) => {
                                    setFormData({ ...formData, employeeId: value, leaveTypeId: "" });
                                }}
                            >
                                <SelectTrigger className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm">
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{emp.nameWithInitials}</span>
                                                <Badge variant="outline" className="text-[9px] font-mono">
                                                    {emp.employeeNo}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Leave Type Selection */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-neutral-500 ml-1 flex items-center gap-1.5">
                                <IconCalendarStar className="w-3.5 h-3.5" />
                                Leave Type
                            </Label>
                            <Select
                                value={formData.leaveTypeId}
                                onValueChange={(value) => {
                                    const selectedType = leaveTypes.find(lt => lt.id === value);
                                    setFormData({
                                        ...formData,
                                        leaveTypeId: value,
                                        type: selectedType?.isShortLeave ? "SHORT_LEAVE" : "FULL_DAY"
                                    });
                                }}
                                disabled={!formData.employeeId}
                            >
                                <SelectTrigger className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm">
                                    <SelectValue placeholder={formData.employeeId ? "Select leave type" : "Select employee first"} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {leaveTypes.length === 0 && formData.employeeId ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No leave types available
                                        </div>
                                    ) : (
                                        leaveTypes.map((lt) => (
                                            <SelectItem key={lt.id} value={lt.id}>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 rounded"
                                                        style={{ backgroundColor: lt.color || '#3b82f6' }}
                                                    />
                                                    <span className="font-bold">{lt.name}</span>
                                                    <Badge variant="outline" className="text-[9px] font-mono font-black">
                                                        {lt.code}
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Request Type */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-neutral-500 ml-1 flex items-center gap-1.5">
                            <IconClock className="w-3.5 h-3.5" />
                            Request Type
                        </Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value as LeaveRequestType })}
                            disabled={!formData.leaveTypeId}
                        >
                            <SelectTrigger className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm">
                                <SelectValue placeholder={formData.leaveTypeId ? "Select request type" : "Select leave type first"} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {selectedLeaveType?.isShortLeave ? (
                                    <SelectItem value="SHORT_LEAVE">Short Leave</SelectItem>
                                ) : (
                                    <>
                                        <SelectItem value="FULL_DAY">Full Day</SelectItem>
                                        <SelectItem value="HALF_DAY_FIRST">Half Day (First Half)</SelectItem>
                                        <SelectItem value="HALF_DAY_LAST">Half Day (Second Half)</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-neutral-500 ml-1">
                                {formData.type === "SHORT_LEAVE" ? "Start Time" : "Start Date"}
                            </Label>
                            <Input
                                type={formData.type === "SHORT_LEAVE" ? "datetime-local" : "date"}
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-neutral-500 ml-1">
                                {formData.type === "SHORT_LEAVE" ? "End Time" : "End Date"}
                            </Label>
                            <Input
                                type={formData.type === "SHORT_LEAVE" ? "datetime-local" : "date"}
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-neutral-500 ml-1">Reason (Optional)</Label>
                        <Textarea
                            placeholder="Enter reason for leave..."
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            rows={3}
                            className="bg-muted/40 border-none rounded-xl px-4 py-3 font-medium text-sm shadow-sm resize-none"
                        />
                    </div>

                    {/* Summary Card */}
                    {selectedLeaveType && (
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 space-y-2">
                            <div className="text-xs font-bold text-primary/80 uppercase tracking-wider">
                                Request Summary
                            </div>
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-6 w-6 rounded flex items-center justify-center text-white text-[9px] font-black"
                                    style={{ backgroundColor: selectedLeaveType.color || '#3b82f6' }}
                                >
                                    {selectedLeaveType.code}
                                </div>
                                <span className="font-bold text-sm">{selectedLeaveType.name}</span>
                                <Badge variant="secondary" className="text-[9px]">
                                    {formData.type.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                        </div>
                    )}
                </form>

                <DialogFooter className="p-6 md:p-8 bg-muted/60 border-t border-border mt-auto">
                    <div className="flex flex-col-reverse sm:flex-row gap-3 w-full justify-end">
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
                            className="rounded-xl px-14 h-11 font-bold text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={loading || !formData.employeeId || !formData.leaveTypeId}
                            onClick={handleSubmit}
                        >
                            {loading ? "Creating..." : "Create Request"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
