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
import { LeaveBalance } from "@/types/leave";
import { toast } from "sonner";
import { CompanyFile } from "@/types/company";
import { validateLeaveRequest, CreatorRole } from "@/lib/validations/leave-request";
import { CreateLeaveRequestForm } from "./create-request/CreateLeaveRequestForm";
import { useLeaveRequests, useLeaveBalances, useLeaveMutations } from "@/hooks/use-leaves";
import { useEffectivePolicy } from "@/hooks/use-policies";

interface CreateLeaveRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    defaultEmployeeId?: string;
    creatorRole?: CreatorRole;
}

export function CreateLeaveRequestDialog({
    open,
    onOpenChange,
    companyId,
    defaultEmployeeId,
    creatorRole = 'EMPLOYER'
}: CreateLeaveRequestDialogProps) {
    // Let's hoist employeeId state to here so we can fetch config
    const [employeeId, setEmployeeId] = useState(defaultEmployeeId || "");

    // Use React Query hooks
    const { data: policyData, isLoading: policyLoading } = useEffectivePolicy(employeeId || null);
    const { data: balancesData, isLoading: balancesLoading } = useLeaveBalances(employeeId || null);
    const { data: requestsData, isLoading: requestsLoading } = useLeaveRequests(companyId, { employeeId });

    const leaveTypes = (policyData as any)?.effective?.leaves?.leaveTypes || [];
    const balances = Array.isArray(balancesData) ? balancesData : [];
    const existingRequests = Array.isArray(requestsData) ? requestsData : [];
    const fetchingConfig = policyLoading || balancesLoading || requestsLoading;

    const { createRequest } = useLeaveMutations();

    const handleFormSubmit = async (formData: any, documents: CompanyFile[]) => {
        const selectedLeaveType = leaveTypes.find((lt: any) => lt.id === formData.leaveTypeId);

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

        try {
            await createRequest.mutateAsync({
                ...formData,
                companyId,
                documents,
            });
            onOpenChange(false);
        } catch (error) {
            // Error handled by mutation hook
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
                    loading={createRequest.isPending}
                    fetchingConfig={fetchingConfig}
                    onSubmit={handleFormSubmit}
                    onCancel={() => onOpenChange(false)}
                    onEmployeeChange={setEmployeeId}
                />
            </DialogContent>
        </Dialog>
    );
}
