"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { IconCalendarEvent } from "@tabler/icons-react";
import { LeavesService } from "@/services/leaves.service";
import { PoliciesService } from "@/services/policies.service";
import { LeaveBalance } from "@/types/leave";
import { toast } from "sonner";
import { CompanyFile } from "@/types/company";
import { validateLeaveRequest, CreatorRole } from "@/lib/validations/leave-request";
import { CreateLeaveRequestForm } from "./create-request/CreateLeaveRequestForm";

interface CreateLeaveRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    onSuccess: () => void;
    defaultEmployeeId?: string;
    creatorRole?: CreatorRole;
}

export function CreateLeaveRequestDialog({
    open,
    onOpenChange,
    companyId,
    onSuccess,
    defaultEmployeeId,
    creatorRole = 'EMPLOYER'
}: CreateLeaveRequestDialogProps) {
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingConfig, setFetchingConfig] = useState(false);
    // Track employee ID change here to re-fetch config if needed
    // But mostly the Form handles the employee ID selection if not default.
    // However, the config depends on employee ID.
    // So the Form needs to tell the Dialog when employee changes so we can fetch config?
    // OR we hoist the employeeId state to here.

    // Let's hoist employeeId state to here so we can fetch config
    const [employeeId, setEmployeeId] = useState(defaultEmployeeId || "");
    const [existingRequests, setExistingRequests] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            setEmployeeId(defaultEmployeeId || "");
        }
    }, [open, defaultEmployeeId]);

    useEffect(() => {
        const fetchConfig = async () => {
            if (!employeeId) {
                setLeaveTypes([]);
                setBalances([]);
                setExistingRequests([]);
                return;
            }

            setFetchingConfig(true);
            try {
                const [policyRes, balancesRes, requestsRes] = await Promise.all([
                    PoliciesService.getEffectivePolicy(employeeId),
                    LeavesService.getBalances(employeeId),
                    LeavesService.getCompanyRequests(companyId, { employeeId })
                ]);

                const types = policyRes.data?.data?.effective?.leaves?.leaveTypes || [];
                setLeaveTypes(types);

                const balancesData = balancesRes.data;
                const balancesArray = Array.isArray(balancesData)
                    ? balancesData
                    : (Array.isArray((balancesData as any)?.data) ? (balancesData as any).data : []);

                setBalances(balancesArray);

                const requests = Array.isArray((requestsRes as any).data)
                    ? (requestsRes as any).data
                    : ((requestsRes as any).data?.data || []);
                setExistingRequests(requests);

            } catch (error) {
                console.error("Failed to fetch config:", error);
                setLeaveTypes([]);
                setBalances([]);
                setExistingRequests([]);
            } finally {
                setFetchingConfig(false);
            }
        };

        fetchConfig();
    }, [employeeId, companyId]);

    const handleFormSubmit = async (formData: any, documents: CompanyFile[]) => {
        const selectedLeaveType = leaveTypes.find(lt => lt.id === formData.leaveTypeId);

        const validationError = validateLeaveRequest({
            formData,
            selectedLeaveType,
            documents,
            creatorRole,
            balances,
            existingRequests
        });

        if (validationError) {
            toast.error(validationError);
            return;
        }

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
            }
        } catch (error: any) {
            console.error("Unexpected error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

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
                                {creatorRole === 'EMPLOYEE' ? 'Request Leave' : 'Create Leave Request'}
                            </DialogTitle>
                            <DialogDescription className="text-[11px] font-medium text-muted-foreground/80">
                                {creatorRole === 'EMPLOYEE' ? 'Submit a new leave application' : 'Submit a new leave request for an employee'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <CreateLeaveRequestForm
                    companyId={companyId}
                    defaultEmployeeId={defaultEmployeeId}
                    creatorRole={creatorRole}
                    leaveTypes={leaveTypes}
                    balances={balances}
                    loading={loading}
                    fetchingConfig={fetchingConfig}
                    onSubmit={handleFormSubmit}
                    onCancel={() => onOpenChange(false)}
                    onEmployeeChange={setEmployeeId}
                />
            </DialogContent>
        </Dialog>
    );
}
