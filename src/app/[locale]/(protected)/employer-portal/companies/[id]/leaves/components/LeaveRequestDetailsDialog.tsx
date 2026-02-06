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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { LeaveRequest, LeaveStatus } from "@/types/leave";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { format, isSameDay } from "date-fns";

interface LeaveRequestDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: LeaveRequest | null;
    leaveTypes?: any[];
    onApprove?: (id: string, reason?: string) => Promise<void>;
    onReject?: (id: string, reason: string) => Promise<void>;
    onCancel?: (id: string) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
}

export function LeaveRequestDetailsDialog({
    open,
    onOpenChange,
    request,
    leaveTypes = [],
    onApprove,
    onReject,
    onCancel,
    onDelete,
}: LeaveRequestDetailsDialogProps) {
    const [processing, setProcessing] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [responseReason, setResponseReason] = useState("");

    // Reset response reason when dialog opens with a new request
    React.useEffect(() => {
        if (open && request) {
            setResponseReason(request.responseReason || "");
        }
    }, [open, request]);

    if (!request) return null;

    const handleApprove = async () => {
        if (!onApprove) return;
        setProcessing(true);
        try {
            await onApprove(request.id, responseReason);
            onOpenChange(false);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!onReject) return;
        if (!responseReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        setProcessing(true);
        try {
            await onReject(request.id, responseReason);
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

    const handleViewDocument = async (doc: any) => {
        try {
            // Using as any to bypass strict typing issues with the response structure
            const res = await StorageService.getUrl(doc.key) as any;

            // Check for url in nested structures (res.data.url or res.data.data.url)
            const url = res.data?.url || res.data?.data?.url;

            if (url) {
                window.open(url, '_blank');
            } else {
                console.error("URL not found in response:", res);
                toast.error("Could not retrieve document URL");
            }
        } catch (e) {
            console.error("View doc error:", e);
            toast.error("Failed to open document");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-3xl flex flex-col max-h-[90vh] p-0 gap-0 border-none shadow-2xl overflow-hidden rounded-3xl md:rounded-[2rem]">
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
                        <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg"
                            style={{ backgroundColor: leaveTypes.find(t => t.id === request.leaveTypeId)?.color || '#3b82f6' }}
                        >
                            <IconCalendarEvent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <DialogTitle className="text-lg md:text-xl font-bold tracking-tight">
                                    Leave Request Details
                                </DialogTitle>
                                {request.leaveNumber && (
                                    <Badge variant="secondary" className="font-mono text-[10px] h-5">
                                        #{request.leaveNumber}
                                    </Badge>
                                )}
                            </div>
                            <DialogDescription className="text-[11px] font-medium text-muted-foreground/80">
                                {(() => {
                                    const lt = leaveTypes.find(t => t.id === request.leaveTypeId);
                                    return lt?.code ? (
                                        <span className="font-bold text-primary uppercase tracking-tighter">
                                            {lt.code}
                                        </span>
                                    ) : null;
                                })()}
                            </DialogDescription>
                        </div>
                        <div className="mr-8 md:mr-0">
                            {getStatusBadge(request.status)}
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
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
                                <Label className="text-[10px] text-muted-foreground mb-1 block">Dates</Label>
                                <div className="font-bold text-sm">
                                    {format(new Date(request.startDate), "MMM d, yyyy")}
                                    {!isSameDay(new Date(request.startDate), new Date(request.endDate)) && (
                                        <> - {format(new Date(request.endDate), "MMM d, yyyy")}</>
                                    )}
                                </div>
                                {request.type === "SHORT_LEAVE" && (
                                    <div className="text-xs text-muted-foreground font-mono mt-1">
                                        {format(new Date(request.startDate), "h:mm a")} - {format(new Date(request.endDate), "h:mm a")}
                                    </div>
                                )}
                            </div>

                            {/* For Short Leave, showing 'Days' as 1 is redundant/confusing if we show time. 
                                Could show duration in hours/minutes if available, or just hide days for short leave */}
                            <div>
                                <Label className="text-[10px] text-muted-foreground mb-1 block">
                                    {request.type === "SHORT_LEAVE" ? "Duration Info" : "Total Days"}
                                </Label>
                                <div className="font-black text-2xl text-primary">
                                    {request.type === "SHORT_LEAVE" ? "Short" : request.days}
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
                            <p className="text-sm mt-2 leading-relaxed whitespace-pre-wrap">{request.reason}</p>
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
                                            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                            onClick={() => handleViewDocument(doc)}
                                        >
                                            <IconEye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Approval Information / Response Workflow */}
                    <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 space-y-4">
                        <div className="flex items-center gap-2 text-neutral-500">
                            {request.status === "APPROVED" ? (
                                <IconCheck className="w-4 h-4 text-green-500" />
                            ) : request.status === "REJECTED" ? (
                                <IconX className="w-4 h-4 text-red-500" />
                            ) : (
                                <IconUser className="w-4 h-4" />
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                {request.status === "PENDING" ? "Your Response" : "Processing Information"}
                            </span>
                        </div>

                        {request.status === "PENDING" ? (
                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-muted-foreground ml-1">
                                    Response Reason (Remarks)
                                </Label>
                                <Textarea
                                    placeholder="Enter reason or remarks for your decision..."
                                    className="min-h-[100px] rounded-xl bg-background/50 border-border/50 focus:border-primary/50 transition-all text-sm"
                                    value={responseReason}
                                    onChange={(e) => setResponseReason(e.target.value)}
                                    disabled={processing}
                                />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(request.approvedBy || request.rejectedBy) && (
                                    <div>
                                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                            {request.status === "APPROVED" ? "Approved By" : "Rejected By"}
                                        </Label>
                                        <div className="font-bold text-sm mt-0.5">
                                            {request.approvedBy || request.rejectedBy}
                                        </div>
                                    </div>
                                )}
                                {(request.responseReason || request.approvalRemarks || request.rejectionRemarks) && (
                                    <div>
                                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Remarks</Label>
                                        <p className="text-sm mt-1 leading-relaxed text-neutral-700">
                                            {request.responseReason || request.approvalRemarks || request.rejectionRemarks}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

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

                {/* Action Buttons - Sticky Footer */}
                {(request.status === "PENDING" || request.status === "APPROVED") && (
                    <DialogFooter className="p-4 md:p-8 bg-muted/60 border-t border-border shrink-0 z-10 transition-all">
                        <div className="flex flex-row gap-3 w-full justify-between items-center">
                            {/* Delete button on the left for pending requests */}
                            {request.status === "PENDING" && onDelete && (
                                <Button
                                    variant="outline"
                                    className="rounded-xl h-10 w-10 p-0 md:w-auto md:px-8 md:h-11 font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 shrink-0"
                                    onClick={handleDelete}
                                    disabled={processing}
                                    title="Delete Request"
                                >
                                    <IconTrash className="h-4 w-4 md:mr-2" />
                                    <span className="hidden md:inline">{processing ? "Deleting..." : "Delete"}</span>
                                </Button>
                            )}

                            {/* Approve/Reject/Cancel buttons on the right */}
                            <div className="flex flex-row gap-2 md:gap-3 ml-auto flex-1 justify-end">
                                {request.status === "PENDING" && (
                                    <>
                                        {onReject && (
                                            <Button
                                                variant="outline"
                                                className="rounded-xl px-4 md:px-8 h-10 md:h-11 font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                onClick={handleReject}
                                                disabled={processing}
                                            >
                                                <IconX className="h-4 w-4 md:mr-2" />
                                                <span>Reject</span>
                                            </Button>
                                        )}
                                        {onApprove && (
                                            <Button
                                                className="rounded-xl px-4 md:px-8 h-10 md:h-11 font-bold text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                onClick={handleApprove}
                                                disabled={processing}
                                            >
                                                <IconCheck className="h-4 w-4 md:mr-2" />
                                                <span>{processing ? "Processing..." : "Approve"}</span>
                                            </Button>
                                        )}
                                    </>
                                )}
                                {request.status === "APPROVED" && onCancel && (
                                    <Button
                                        variant="outline"
                                        className="rounded-xl px-4 md:px-8 h-10 md:h-11 font-bold text-xs hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                                        onClick={handleCancel}
                                        disabled={processing}
                                    >
                                        <IconBan className="h-3.5 w-3.5 mr-2" />
                                        <span>{processing ? "Cancelling..." : "Cancel Request"}</span>
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
