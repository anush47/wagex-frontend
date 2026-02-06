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
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { IconCalendarEvent, IconUser, IconCalendarStar, IconClock, IconCloudUpload, IconFileText, IconTrash } from "@tabler/icons-react";
import { LeavesService } from "@/services/leaves.service";
import { EmployeeService } from "@/services/employee.service";
import { PoliciesService } from "@/services/policies.service";
import type { Employee } from "@/types/employee";
import type { LeaveRequestType, LeaveBalance } from "@/types/leave";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { CompanyFile } from "@/types/company";
import { differenceInCalendarDays } from "date-fns";

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
    // const [employees, setEmployees] = useState<Employee[]>([]); // Removed

    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [documents, setDocuments] = useState<CompanyFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingConfig, setFetchingConfig] = useState(false);

    const [formData, setFormData] = useState({
        employeeId: "",
        leaveTypeId: "",
        type: "FULL_DAY" as LeaveRequestType,
        startDate: "",
        endDate: "",
        reason: "",
    });

    useEffect(() => {
        if (!open) {
            setFormData({
                employeeId: "",
                leaveTypeId: "",
                type: "FULL_DAY" as LeaveRequestType,
                startDate: "",
                endDate: "",
                reason: "",
            });
            setDocuments([]);
        }
    }, [open, companyId]);

    // Employee fetching useEffect removed


    useEffect(() => {
        const fetchConfig = async () => {
            if (!formData.employeeId) {
                setLeaveTypes([]);
                setBalances([]);
                return;
            }

            setFetchingConfig(true);
            try {
                // Fetch policy (leave types) and balances in parallel
                const [policyRes, balancesRes] = await Promise.all([
                    PoliciesService.getEffectivePolicy(formData.employeeId),
                    LeavesService.getBalances(formData.employeeId)
                ]);

                // Set leave types
                const types = policyRes.data?.data?.effective?.leaves?.leaveTypes || [];
                setLeaveTypes(types);

                // Set balances
                const balancesData = balancesRes.data;
                // Handle nested API response { data: { data: [...] } } or direct { data: [...] }
                const balancesArray = Array.isArray(balancesData)
                    ? balancesData
                    : (Array.isArray((balancesData as any)?.data) ? (balancesData as any).data : []);

                setBalances(balancesArray);
            } catch (error) {
                console.error("Failed to fetch config:", error);
                setLeaveTypes([]);
                setBalances([]);
            } finally {
                setFetchingConfig(false);
            }
        };

        fetchConfig();
    }, [formData.employeeId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await LeavesService.createRequest({
                ...formData,
                companyId,
                documents,
            });

            if (response.error) {
                toast.error(response.error.message || "Failed to create leave request");
                return;
            }

            if (response.data) {
                toast.success("Leave request created successfully");
                onSuccess();
                onOpenChange(false);
                setFormData({
                    employeeId: "",
                    leaveTypeId: "",
                    type: "FULL_DAY" as LeaveRequestType,
                    startDate: "",
                    endDate: "",
                    reason: "",
                });
                setDocuments([]);
            }
        } catch (error: any) {
            console.error("Unexpected error:", error);
            toast.error("An unexpected error occurred");
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
                            <SearchableEmployeeSelect
                                companyId={companyId}
                                value={formData.employeeId}
                                onSelect={(id) => {
                                    setFormData({ ...formData, employeeId: id, leaveTypeId: "" });
                                }}
                            />
                        </div>

                    </div>

                    {/* Balances Display */}
                    {balances.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-2xl border border-border/50">
                            {balances.map((balance) => {
                                const leaveType = leaveTypes.find(lt => lt.id === balance.leaveTypeId);
                                return (
                                    <div key={balance.leaveTypeId} className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <div
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: leaveType?.color || '#3b82f6' }}
                                            />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                                                {balance.leaveTypeCode || balance.leaveTypeName}
                                            </span>
                                        </div>
                                        <div className="text-xl font-bold tracking-tight">
                                            {Number(balance.available).toFixed(1).replace(/\.0$/, '')}
                                            <span className="text-[10px] font-medium text-muted-foreground ml-1">
                                                / {Number(balance.entitled).toFixed(1).replace(/\.0$/, '')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                        type: (selectedType?.isShortLeave ? "SHORT_LEAVE" : "FULL_DAY") as LeaveRequestType
                                    });
                                }}
                                disabled={!formData.employeeId || fetchingConfig}
                            >
                                <SelectTrigger className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm">
                                    <SelectValue placeholder={
                                        fetchingConfig ? "Loading leave types..." :
                                            formData.employeeId ? "Select leave type" : "Select employee first"
                                    } />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {leaveTypes.length === 0 && formData.employeeId ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No leave types available
                                        </div>
                                    ) : (
                                        leaveTypes.map((lt) => {
                                            const balance = balances.find(b => b.leaveTypeId === lt.id);
                                            return (
                                                <SelectItem key={lt.id} value={lt.id}>
                                                    <div className="flex items-center justify-between w-full min-w-[200px] gap-4">
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
                                                        {balance && (
                                                            <span className="text-xs font-medium text-muted-foreground">
                                                                {balance.available} days left
                                                            </span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })
                                    )}
                                </SelectContent>
                            </Select>
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
                    {/* Documents */}
                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-neutral-500 ml-1 flex items-center gap-1.5 justify-between">
                            <div className="flex items-center gap-1.5">
                                <IconCloudUpload className="w-3.5 h-3.5" />
                                Supporting Documents
                            </div>
                            {selectedLeaveType && (selectedLeaveType.requireDocuments || (
                                selectedLeaveType.requireDocumentsIfConsecutiveMoreThan &&
                                formData.startDate && formData.endDate &&
                                (differenceInCalendarDays(new Date(formData.endDate), new Date(formData.startDate)) + 1) > selectedLeaveType.requireDocumentsIfConsecutiveMoreThan
                            )) && (
                                    <Badge variant="destructive" className="text-[9px] h-5 px-2">Required</Badge>
                                )}
                        </Label>

                        {documents.length > 0 ? (
                            <div className="space-y-2">
                                {documents.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <IconFileText className="w-4 h-4" />
                                            </div>
                                            <div className="truncate">
                                                <div className="text-sm font-bold truncate">{doc.name}</div>
                                                <div className="text-[10px] text-muted-foreground">{doc.size}</div>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-50"
                                            onClick={() => setDocuments(docs => docs.filter((_, i) => i !== index))}
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        // Creating a hidden input to trigger more uploads would be complex here
                                        // Ideally FileUpload supports multiple or we just clear and add more
                                        // For now, let's keep it simple: one upload allows adding to list,
                                        // but the FileUpload component itself resets after upload.
                                        // So showing the FileUpload component again if they want to add more?
                                        // Or just always showing it?
                                        // Let's just show the FileUpload below the list for adding more.
                                    }}
                                    className="w-full text-xs font-bold h-9 hidden" // Hidden for now, using the FileUpload below
                                >
                                    Add Another Document
                                </Button>
                            </div>
                        ) : null}

                        <FileUpload
                            companyId={companyId}
                            folder="leaves"
                            onUpload={(file) => setDocuments(prev => [...prev, file])}
                            className="min-h-[120px]"
                        />
                    </div>
                </form>

                <DialogFooter className="p-4 bg-muted/60 border-t border-border mt-auto">
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
                        >
                            {loading ? "Creating..." : "Create Request"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
