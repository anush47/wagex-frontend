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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
                // Backend returns {data: {data: [], meta: {}}}
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
            if (!formData.employeeId) return;

            try {
                const response = await PoliciesService.getEffectivePolicy(formData.employeeId);
                setLeaveTypes(response.data?.effective?.leaves?.leaveTypes || []);
            } catch (error) {
                console.error("Failed to fetch leave types:", error);
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Leave Request</DialogTitle>
                    <DialogDescription>
                        Submit a new leave request for an employee
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="employee">Employee</Label>
                        <Select
                            value={formData.employeeId}
                            onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.nameWithInitials} ({emp.employeeNo})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="leaveType">Leave Type</Label>
                        <Select
                            value={formData.leaveTypeId}
                            onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                            disabled={!formData.employeeId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select leave type" />
                            </SelectTrigger>
                            <SelectContent>
                                {leaveTypes.map((lt) => (
                                    <SelectItem key={lt.id} value={lt.id}>
                                        {lt.name} ({lt.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Request Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value as LeaveRequestType })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FULL_DAY">Full Day</SelectItem>
                                <SelectItem value="HALF_DAY_FIRST">Half Day (First)</SelectItem>
                                <SelectItem value="HALF_DAY_LAST">Half Day (Last)</SelectItem>
                                <SelectItem value="SHORT_LEAVE">Short Leave</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">
                                {formData.type === "SHORT_LEAVE" ? "Start Time" : "Start Date"}
                            </Label>
                            <input
                                type={formData.type === "SHORT_LEAVE" ? "datetime-local" : "date"}
                                id="startDate"
                                className="w-full p-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">
                                {formData.type === "SHORT_LEAVE" ? "End Time" : "End Date"}
                            </Label>
                            <input
                                type={formData.type === "SHORT_LEAVE" ? "datetime-local" : "date"}
                                id="endDate"
                                className="w-full p-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason (Optional)</Label>
                        <Textarea
                            id="reason"
                            placeholder="Enter reason for leave..."
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !formData.employeeId || !formData.leaveTypeId}>
                            {loading ? "Creating..." : "Create Request"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
