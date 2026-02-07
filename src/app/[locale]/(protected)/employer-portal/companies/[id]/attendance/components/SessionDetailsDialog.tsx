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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconClock, IconUser, IconX, IconTrash, IconCheck, IconMapPin } from "@tabler/icons-react";
import type { AttendanceSession, ApprovalStatus, UpdateSessionDto } from "@/types/attendance";
import { useAttendanceMutations } from "@/hooks/use-attendance";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";

interface SessionDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session: AttendanceSession | null;
    onDelete?: (id: string) => Promise<void>;
}

export function SessionDetailsDialog({
    open,
    onOpenChange,
    session,
    onDelete,
}: SessionDetailsDialogProps) {
    const [processing, setProcessing] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editing, setEditing] = useState(false);

    // Form state
    const [checkInTime, setCheckInTime] = useState("");
    const [checkOutTime, setCheckOutTime] = useState("");
    const [workMinutes, setWorkMinutes] = useState("");
    const [overtimeMinutes, setOvertimeMinutes] = useState("");
    const [remarks, setRemarks] = useState("");

    const { updateSession } = useAttendanceMutations();

    // Reset form when dialog opens with a new session
    useEffect(() => {
        if (open && session) {
            // Format as datetime-local (YYYY-MM-DDTHH:mm)
            setCheckInTime(session.checkInTime ? format(new Date(session.checkInTime), "yyyy-MM-dd'T'HH:mm") : "");
            setCheckOutTime(session.checkOutTime ? format(new Date(session.checkOutTime), "yyyy-MM-dd'T'HH:mm") : "");
            setWorkMinutes(session.workMinutes?.toString() || "");
            setOvertimeMinutes(session.overtimeMinutes?.toString() || "");
            setRemarks(session.remarks || "");
            setEditing(false);
        }
    }, [open, session]);

    if (!session) return null;

    const handleSave = async () => {
        setProcessing(true);
        try {
            const dto: UpdateSessionDto = {
                // Convert datetime-local to ISO 8601 UTC or null if cleared
                checkInTime: checkInTime ? new Date(checkInTime).toISOString() : null,
                checkOutTime: checkOutTime ? new Date(checkOutTime).toISOString() : null,
                workMinutes: workMinutes ? parseInt(workMinutes) : undefined,
                overtimeMinutes: overtimeMinutes ? parseInt(overtimeMinutes) : undefined,
                remarks: remarks, // Allow empty string
            };

            await updateSession.mutateAsync({ id: session.id, dto });
            setEditing(false);
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to update session", error);
        } finally {
            setProcessing(false);
        }
    };

    const handleApproval = async (type: "IN" | "OUT", status: ApprovalStatus) => {
        setProcessing(true);
        try {
            const dto: UpdateSessionDto = {};
            if (type === "IN") {
                dto.inApprovalStatus = status;
            } else {
                dto.outApprovalStatus = status;
            }

            await updateSession.mutateAsync({ id: session.id, dto });
            toast.success(`Session ${type} ${status === "APPROVED" ? "approved" : "rejected"} successfully`);
        } catch (error) {
            console.error(`Failed to ${status.toLowerCase()} session`, error);
            toast.error(`Failed to ${status.toLowerCase()} session`);
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
            await onDelete(session.id);
            setDeleteConfirmOpen(false);
            onOpenChange(false);
        } finally {
            setProcessing(false);
        }
    };

    const getApprovalBadge = (status: ApprovalStatus, type: "IN" | "OUT") => {
        const styles: Record<string, string> = {
            PENDING: "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200",
            APPROVED: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
            REJECTED: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
        };

        return (
            <div className="flex items-center gap-2">
                <Badge variant="outline" className={`font-bold text-[10px] ${styles[status]}`}>
                    {status}
                </Badge>
                {!editing && status === "PENDING" && (
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApproval(type, "APPROVED" as ApprovalStatus)}
                            disabled={processing}
                            title="Approve"
                        >
                            <IconCheck className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleApproval(type, "REJECTED" as ApprovalStatus)}
                            disabled={processing}
                            title="Reject"
                        >
                            <IconX className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const formatMinutes = (minutes?: number) => {
        if (!minutes) return "0h 0m";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
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
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-lg">
                            <IconClock className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-lg md:text-xl font-bold tracking-tight">
                                Attendance Session Details
                            </DialogTitle>
                            <DialogDescription className="text-[11px] font-medium text-muted-foreground/80">
                                {format(new Date(session.date), "MMMM d, yyyy")}
                            </DialogDescription>
                        </div>
                        <div className="mr-8 md:mr-0 flex gap-2">
                            {!editing && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditing(true)}
                                    className="rounded-xl"
                                >
                                    Edit
                                </Button>
                            )}
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
                            <EmployeeAvatar
                                name={session.employee?.nameWithInitials}
                                className="h-12 w-12 rounded-2xl text-lg shadow-lg"
                            />
                            <div>
                                <div className="font-bold text-base">{session.employee?.nameWithInitials}</div>
                                {session.employee?.employeeNo && (
                                    <div className="text-xs text-muted-foreground">
                                        Employee No: <span className="font-mono font-bold">{session.employee.employeeNo}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Shift Information */}
                    {session.shiftName && (
                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                            <Label className="text-xs font-bold text-neutral-500 mb-2">Shift</Label>
                            <div className="font-bold text-sm mt-1">{session.shiftName}</div>
                            {session.shiftStartTime && session.shiftEndTime && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    {session.shiftStartTime} - {session.shiftEndTime}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Time Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                            <Label className="text-xs font-bold text-neutral-500 mb-2">Check In</Label>
                            {editing ? (
                                <Input
                                    type="datetime-local"
                                    value={checkInTime}
                                    onChange={(e) => setCheckInTime(e.target.value)}
                                    className="mt-1"
                                />
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <div className="font-bold text-sm mt-1">
                                        {session.checkInTime ? format(new Date(session.checkInTime), "h:mm a") : "-"}
                                    </div>
                                    {getApprovalBadge(session.inApprovalStatus, "IN")}
                                </div>
                            )}
                            {session.checkInLocation && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                    <IconMapPin className="w-3 h-3" />
                                    <span className="truncate">{session.checkInLocation}</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                            <Label className="text-xs font-bold text-neutral-500 mb-2">Check Out</Label>
                            {editing ? (
                                <Input
                                    type="datetime-local"
                                    value={checkOutTime}
                                    onChange={(e) => setCheckOutTime(e.target.value)}
                                    className="mt-1"
                                />
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <div className="font-bold text-sm mt-1">
                                        {session.checkOutTime ? format(new Date(session.checkOutTime), "h:mm a") : "-"}
                                    </div>
                                    {getApprovalBadge(session.outApprovalStatus, "OUT")}
                                </div>
                            )}
                            {session.checkOutLocation && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                    <IconMapPin className="w-3 h-3" />
                                    <span className="truncate">{session.checkOutLocation}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Work Time Summary */}
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-3">
                        <div className="text-xs font-bold text-primary/80 uppercase tracking-wider">
                            Work Time Summary
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <Label className="text-[10px] text-muted-foreground mb-1 block">Total Time</Label>
                                <div className="font-black text-lg">{formatMinutes(session.totalMinutes)}</div>
                            </div>
                            <div>
                                <Label className="text-[10px] text-muted-foreground mb-1 block">Break</Label>
                                <div className="font-black text-lg">{formatMinutes(session.breakMinutes)}</div>
                            </div>
                            <div>
                                <Label className="text-[10px] text-muted-foreground mb-1 block">Work Time</Label>
                                {editing ? (
                                    <Input
                                        type="number"
                                        value={workMinutes}
                                        onChange={(e) => setWorkMinutes(e.target.value)}
                                        placeholder="Minutes"
                                        className="h-8 text-sm"
                                    />
                                ) : (
                                    <div className="font-black text-lg text-primary">{formatMinutes(session.workMinutes)}</div>
                                )}
                            </div>
                            <div>
                                <Label className="text-[10px] text-muted-foreground mb-1 block">Overtime</Label>
                                {editing ? (
                                    <Input
                                        type="number"
                                        value={overtimeMinutes}
                                        onChange={(e) => setOvertimeMinutes(e.target.value)}
                                        placeholder="Minutes"
                                        className="h-8 text-sm"
                                    />
                                ) : (
                                    <div className="font-black text-lg text-orange-600">{formatMinutes(session.overtimeMinutes)}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Flags */}
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                        <Label className="text-xs font-bold text-neutral-500 mb-3">Status Flags</Label>
                        <div className="flex flex-wrap gap-2">
                            {session.isLate && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                    Late
                                </Badge>
                            )}
                            {session.isEarlyLeave && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Early Leave
                                </Badge>
                            )}
                            {session.isOnLeave && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    On Leave
                                </Badge>
                            )}
                            {session.isHalfDay && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    Half Day
                                </Badge>
                            )}
                            {session.hasShortLeave && (
                                <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                                    Short Leave
                                </Badge>
                            )}
                            {session.manuallyEdited && (
                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                    Manually Edited
                                </Badge>
                            )}
                            {session.autoCheckout && (
                                <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                                    Auto Checkout
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                        <Label className="text-xs font-bold text-neutral-500 mb-2">Remarks</Label>
                        {editing ? (
                            <Textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Add remarks..."
                                className="mt-2 min-h-[80px]"
                            />
                        ) : (
                            <p className="text-sm mt-2 leading-relaxed whitespace-pre-wrap">
                                {session.remarks || "-"}
                            </p>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <Label className="text-[9px] text-muted-foreground uppercase tracking-wider">Created</Label>
                            <div className="font-mono text-[10px] mt-1">
                                {format(new Date(session.createdAt), "MMM d, yyyy HH:mm")}
                            </div>
                        </div>
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <Label className="text-[9px] text-muted-foreground uppercase tracking-wider">Updated</Label>
                            <div className="font-mono text-[10px] mt-1">
                                {format(new Date(session.updatedAt), "MMM d, yyyy HH:mm")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <DialogFooter className="p-4 md:p-6 bg-muted/60 border-t border-border shrink-0 z-10">
                    <div className="flex flex-row gap-3 w-full justify-between items-center">
                        {onDelete && !editing && (
                            <Button
                                variant="outline"
                                className="rounded-xl h-10 w-10 p-0 md:w-auto md:px-8 md:h-11 font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 shrink-0"
                                onClick={handleDelete}
                                disabled={processing}
                                title="Delete Session"
                            >
                                <IconTrash className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">Delete</span>
                            </Button>
                        )}
                        <div className="flex flex-row gap-2 md:gap-3 ml-auto">
                            {editing ? (
                                <>
                                    <Button
                                        variant="outline"
                                        className="rounded-xl px-4 md:px-8 h-10 md:h-11 font-bold text-xs"
                                        onClick={() => setEditing(false)}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="rounded-xl px-4 md:px-8 h-10 md:h-11 font-bold text-xs shadow-lg shadow-primary/20"
                                        onClick={handleSave}
                                        disabled={processing}
                                    >
                                        <IconCheck className="h-4 w-4 md:mr-2" />
                                        <span>{processing ? "Saving..." : "Save"}</span>
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="rounded-xl px-4 md:px-8 h-10 md:h-11 font-bold text-xs"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Close
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>

            <ConfirmationDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Delete Attendance Session"
                description="Are you sure you want to delete this attendance session? This action cannot be undone."
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
