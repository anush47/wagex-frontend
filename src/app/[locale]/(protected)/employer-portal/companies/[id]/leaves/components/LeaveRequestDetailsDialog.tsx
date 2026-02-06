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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { IconCalendarEvent, IconUser, IconCalendarStar, IconClock, IconFileText, IconCheck, IconX, IconBan, IconTrash, IconDownload, IconEye } from "@tabler/icons-react";
import { StorageService } from "@/services/storage.service";
import { toast } from "sonner";
import type { LeaveRequest, LeaveStatus } from "@/types/leave";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { format } from "date-fns";

interface LeaveRequestDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: LeaveRequest | null;
    onApprove?: (id: string) => Promise<void>;
    onReject?: (id: string) => Promise<void>;
    onCancel?: (id: string) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
}

export function LeaveRequestDetailsDialog({
    open,
    onOpenChange,
    request,
    onApprove,
    onReject,
    onCancel,
    onDelete,
}: LeaveRequestDetailsDialogProps) {
    const [processing, setProcessing] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    if (!request) return null;

    const handleApprove = async () => {
        if (!onApprove) return;
        setProcessing(true);
        try {
            await onApprove(request.id);
            onOpenChange(false);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!onReject) return;
        setProcessing(true);
        try {
            await onReject(request.id);
            onOpenChange(false);
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!onCancel) return;
        setProcessing(true);
        try {
            await onCancel(request.id);
            onOpenChange(false);
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = () => {
        if (!onDelete) return;
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!onDelete) return;
        setProcessing(true);
        try {
            await onDelete(request.id);
            setDeleteConfirmOpen(false);
            onOpenChange(false);
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: LeaveStatus) => {
        const styles: Record<string, string> = {
            PENDING: "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200",
            APPROVED: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
            REJECTED: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
            CANCELLED: "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200",
        };

        return (
            <Badge variant="outline" className={`font-bold ${styles[status]}`}>
                {status}
            </Badge>
        );
    };

    const getTypeBadge = (type: string) => {
        const labels = {
            FULL_DAY: "Full Day",
            HALF_DAY_FIRST: "Half Day (First)",
            HALF_DAY_LAST: "Half Day (Last)",
            SHORT_LEAVE: "Short Leave",
        } as const;

        return labels[type as keyof typeof labels] || type;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-3xl max-h-[95vh] overflow-y-auto rounded-3xl md:rounded-[2rem] p-0 gap-0 border-none shadow-2xl">
                <DialogHeader className="p-5 md:p-6 pb-4 border-b border-border/40">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 shadow-lg">
                            <IconCalendarEvent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-lg md:text-xl font-bold tracking-tight">
                                Leave Request Details
                            </DialogTitle>
                            <DialogDescription className="text-[11px] font-medium text-muted-foreground/80">
                                Request ID: {request.id.slice(0, 8)}
                            </DialogDescription>
                        </div>
                        {getStatusBadge(request.status)}
                    </div>
                </DialogHeader>

                <div className="p-5 md:p-6 space-y-6">
                    {/* Employee Information */}
                    <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 space-y-4">
                        <div className="flex items-center gap-2 text-neutral-500 mb-2">
                            <IconUser className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Employee Information</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {request.employee?.photo ? (
                                <img
                                    src={request.employee.photo}
                                    alt={request.employee.nameWithInitials}
                                    className="h-12 w-12 rounded-full border-2 border-border"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                                    {request.employee?.nameWithInitials?.[0] || "?"}
                                </div>
                            )}
                            <div>
                                <div className="font-bold text-base">{request.employee?.nameWithInitials}</div>
                                {request.employee?.employeeNo && (
                                    <div className="text-xs text-muted-foreground">
                                        Employee No: <span className="font-mono font-bold">{request.employee.employeeNo}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Leave Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                            <Label className="text-xs font-bold text-neutral-500 mb-2 flex items-center gap-1.5">
                                <IconCalendarStar className="w-3.5 h-3.5" />
                                Leave Type
                            </Label>
                            <div className="font-bold text-sm mt-1">
                                {request.leaveTypeName || request.leaveTypeId}
                            </div>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                            <Label className="text-xs font-bold text-neutral-500 mb-2 flex items-center gap-1.5">
                                <IconClock className="w-3.5 h-3.5" />
                                Request Type
                            </Label>
                            <Badge variant="outline" className="mt-1 font-bold">
                                {getTypeBadge(request.type)}
                            </Badge>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-3">
                        <div className="text-xs font-bold text-primary/80 uppercase tracking-wider">
                            Duration
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-[10px] text-muted-foreground mb-1 block">Start Date</Label>
                                <div className="font-bold text-sm">
                                    {format(new Date(request.startDate), "MMM d, yyyy")}
                                </div>
                                {request.type === "SHORT_LEAVE" && (
                                    <div className="text-xs text-muted-foreground font-mono">
                                        {format(new Date(request.startDate), "HH:mm")}
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label className="text-[10px] text-muted-foreground mb-1 block">End Date</Label>
                                <div className="font-bold text-sm">
                                    {format(new Date(request.endDate), "MMM d, yyyy")}
                                </div>
                                {request.type === "SHORT_LEAVE" && (
                                    <div className="text-xs text-muted-foreground font-mono">
                                        {format(new Date(request.endDate), "HH:mm")}
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label className="text-[10px] text-muted-foreground mb-1 block">Total Days</Label>
                                <div className="font-black text-2xl text-primary">
                                    {request.days}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    {request.reason && (
                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                            <Label className="text-xs font-bold text-neutral-500 mb-2 flex items-center gap-1.5">
                                <IconFileText className="w-3.5 h-3.5" />
                                Reason
                            </Label>
                            <p className="text-sm mt-2 leading-relaxed">{request.reason}</p>
                        </div>
                    )}

                    {/* Documents */}
                    {request.documents && request.documents.length > 0 && (
                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                            <Label className="text-xs font-bold text-neutral-500 mb-2 flex items-center gap-1.5">
                                <IconFileText className="w-3.5 h-3.5" />
                                Supporting Documents
                            </Label>
                            <div className="space-y-2 mt-2">
                                {request.documents.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50">
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
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 rounded-lg"
                                            onClick={async () => {
                                                try {
                                                    const res = await StorageService.getUrl(doc.key);
                                                    if (res.data) {
                                                        window.open(res.data.url, '_blank');
                                                    }
                                                } catch (e) {
                                                    toast.error("Failed to open document");
                                                }
                                            }}
                                        >
                                            <IconEye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Approval Information */}
                    {(request.approvedBy || request.rejectedBy) && (
                        <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 space-y-3">
                            <div className="flex items-center gap-2 text-neutral-500">
                                {request.status === "APPROVED" ? (
                                    <IconCheck className="w-4 h-4 text-green-500" />
                                ) : (
                                    <IconX className="w-4 h-4 text-red-500" />
                                )}
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {request.status === "APPROVED" ? "Approval" : "Rejection"} Information
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <Label className="text-[10px] text-muted-foreground">
                                        {request.status === "APPROVED" ? "Approved By" : "Rejected By"}
                                    </Label>
                                    <div className="font-bold text-sm">
                                        {request.approvedBy || request.rejectedBy}
                                    </div>
                                </div>
                                {(request.approvalRemarks || request.rejectionRemarks) && (
                                    <div>
                                        <Label className="text-[10px] text-muted-foreground">Remarks</Label>
                                        <p className="text-sm mt-1">
                                            {request.approvalRemarks || request.rejectionRemarks}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <Label className="text-[9px] text-muted-foreground uppercase tracking-wider">Created</Label>
                            <div className="font-mono text-[10px] mt-1">
                                {format(new Date(request.createdAt), "MMM d, yyyy HH:mm")}
                            </div>
                        </div>
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <Label className="text-[9px] text-muted-foreground uppercase tracking-wider">Updated</Label>
                            <div className="font-mono text-[10px] mt-1">
                                {format(new Date(request.updatedAt), "MMM d, yyyy HH:mm")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {(request.status === "PENDING" || request.status === "APPROVED") && (
                    <DialogFooter className="p-6 md:p-8 bg-muted/60 border-t border-border mt-auto">
                        <div className="flex flex-col-reverse sm:flex-row gap-3 w-full justify-between">
                            {/* Delete button on the left for pending requests */}
                            {request.status === "PENDING" && onDelete && (
                                <Button
                                    variant="outline"
                                    className="rounded-xl px-8 h-11 font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                    onClick={handleDelete}
                                    disabled={processing}
                                >
                                    <IconTrash className="h-4 w-4 mr-2" />
                                    {processing ? "Deleting..." : "Delete"}
                                </Button>
                            )}

                            {/* Approve/Reject/Cancel buttons on the right */}
                            <div className="flex flex-col-reverse sm:flex-row gap-3">
                                {request.status === "PENDING" && (
                                    <>
                                        {onReject && (
                                            <Button
                                                variant="outline"
                                                className="rounded-xl px-8 h-11 font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                onClick={handleReject}
                                                disabled={processing}
                                            >
                                                <IconX className="h-4 w-4 mr-2" />
                                                Reject
                                            </Button>
                                        )}
                                        {onApprove && (
                                            <Button
                                                className="rounded-xl px-8 h-11 font-bold text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                onClick={handleApprove}
                                                disabled={processing}
                                            >
                                                <IconCheck className="h-4 w-4 mr-2" />
                                                {processing ? "Processing..." : "Approve"}
                                            </Button>
                                        )}
                                    </>
                                )}
                                {request.status === "APPROVED" && onCancel && (
                                    <Button
                                        variant="outline"
                                        className="rounded-xl px-8 h-11 font-bold text-xs hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                                        onClick={handleCancel}
                                        disabled={processing}
                                    >
                                        <IconBan className="h-4 w-4 mr-2" />
                                        {processing ? "Cancelling..." : "Cancel Request"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogFooter>
                )}
            </DialogContent>

            <ConfirmationDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Delete Leave Request"
                description="Are you sure you want to delete this leave request? This action cannot be undone."
                icon={<IconTrash className="h-8 w-8" />}
                actionLabel="Delete"
                cancelLabel="Cancel"
                onAction={confirmDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
                loading={processing}
                variant="destructive"
            />
        </Dialog>
    );
}
