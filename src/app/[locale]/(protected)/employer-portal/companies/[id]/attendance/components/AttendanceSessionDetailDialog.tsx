"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconClock, IconMapPin, IconDeviceDesktop, IconCalendar, IconUser, IconCheck, IconX, IconInfoCircle, IconEdit, IconTrash, IconRefresh } from "@tabler/icons-react";
import { AttendanceSession, AttendanceStatus, AttendanceApprovalStatus } from "@/types/attendance";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";


interface AttendanceSessionDetailDialogProps {
    session: AttendanceSession | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove: (id: string, status: AttendanceApprovalStatus) => void;
    isApproving?: boolean;
    onUpdate?: (id: string, data: any) => void;
    isUpdating?: boolean;
    onDelete?: (id: string) => void;
    isDeleting?: boolean;
}

export function AttendanceSessionDetailDialog({
    session,
    open,
    onOpenChange,
    onApprove,
    isApproving = false,
    onUpdate,
    isUpdating = false,
    onDelete,
    isDeleting = false,
}: AttendanceSessionDetailDialogProps) {
    const [editData, setEditData] = React.useState<any>(null);
    const [isDirty, setIsDirty] = React.useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);


    React.useEffect(() => {
        if (session && open) {
            setEditData({
                checkInTime: session.checkInTime ? format(new Date(session.checkInTime), "yyyy-MM-dd'T'HH:mm") : "",
                checkOutTime: session.checkOutTime ? format(new Date(session.checkOutTime), "yyyy-MM-dd'T'HH:mm") : "",
                remarks: session.remarks || "",
                inApprovalStatus: session.inApprovalStatus,
                outApprovalStatus: session.outApprovalStatus,
            });
            setIsDirty(false);
        }
    }, [session, open]);

    // Reset dirty state after successful update
    React.useEffect(() => {
        if (!isUpdating && session && editData) {
            // Check if data matches current session (update completed)
            const currentCheckIn = session.checkInTime ? format(new Date(session.checkInTime), "yyyy-MM-dd'T'HH:mm") : "";
            const currentCheckOut = session.checkOutTime ? format(new Date(session.checkOutTime), "yyyy-MM-dd'T'HH:mm") : "";
            const currentRemarks = session.remarks || "";

            if (editData.checkInTime === currentCheckIn &&
                editData.checkOutTime === currentCheckOut &&
                editData.remarks === currentRemarks &&
                editData.inApprovalStatus === session.inApprovalStatus &&
                editData.outApprovalStatus === session.outApprovalStatus) {
                setIsDirty(false);
            }
        }
    }, [isUpdating, session, editData]);

    if (!session || !editData) return null;

    const handleChange = (field: string, value: string) => {
        setEditData(prev => {
            const newData = { ...prev, [field]: value };

            // Basic dirty check
            const originalCheckIn = session.checkInTime ? format(new Date(session.checkInTime), "yyyy-MM-dd'T'HH:mm") : "";
            const originalCheckOut = session.checkOutTime ? format(new Date(session.checkOutTime), "yyyy-MM-dd'T'HH:mm") : "";
            const originalRemarks = session.remarks || "";
            const originalInApproval = session.inApprovalStatus;
            const originalOutApproval = session.outApprovalStatus;

            const hasChanged =
                newData.checkInTime !== originalCheckIn ||
                newData.checkOutTime !== originalCheckOut ||
                newData.remarks !== originalRemarks ||
                newData.inApprovalStatus !== originalInApproval ||
                newData.outApprovalStatus !== originalOutApproval;

            setIsDirty(hasChanged);
            return newData;
        });
    };

    const handleSave = () => {
        // If both in and out are removed, auto-delete the session
        if (!editData.checkInTime && !editData.checkOutTime) {
            if (onDelete) {
                onDelete(session.id);
                return;
            }
        }

        if (onUpdate) {
            const dataToSubmit = {
                checkInTime: editData.checkInTime ? new Date(editData.checkInTime).toISOString() : null,
                checkOutTime: editData.checkOutTime ? new Date(editData.checkOutTime).toISOString() : null,
                remarks: editData.remarks,
                inApprovalStatus: editData.inApprovalStatus,
                outApprovalStatus: editData.outApprovalStatus,
            };
            onUpdate(session.id, dataToSubmit);
        }
    };

    const getStatusStyle = (status: AttendanceStatus) => {
        const styles: Record<AttendanceStatus, string> = {
            [AttendanceStatus.PRESENT]: "bg-emerald-50 text-emerald-700 border-emerald-200",
            [AttendanceStatus.LATE]: "bg-amber-50 text-amber-700 border-amber-200",
            [AttendanceStatus.EARLY_LEAVE]: "bg-orange-50 text-orange-700 border-orange-200",
            [AttendanceStatus.ABSENT]: "bg-red-50 text-red-700 border-red-200",
            [AttendanceStatus.ON_LEAVE]: "bg-blue-50 text-blue-700 border-blue-200",
            [AttendanceStatus.HALF_DAY]: "bg-purple-50 text-purple-700 border-purple-200",
        };
        return styles[status] || "bg-neutral-50 text-neutral-700";
    };

    const getApprovalStyle = (status: AttendanceApprovalStatus) => {
        const styles: Record<AttendanceApprovalStatus, string> = {
            [AttendanceApprovalStatus.APPROVED]: "bg-emerald-500",
            [AttendanceApprovalStatus.REJECTED]: "bg-rose-500",
            [AttendanceApprovalStatus.PENDING]: "bg-amber-500",
        };
        return styles[status] || "bg-primary";
    };

    const getStatusBadge = (status: AttendanceStatus) => {
        const styles: Record<string, string> = {
            PRESENT: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
            LATE: "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200",
            EARLY_LEAVE: "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200",
            ABSENT: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
            ON_LEAVE: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200",
            HALF_DAY: "bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200",
        };

        return (
            <Badge variant="outline" className={`font-bold h-5 text-[10px] ${styles[status]}`}>
                {status.replace('_', ' ')}
            </Badge>
        );
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
                        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 shadow-lg">
                            <IconClock className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg md:text-xl font-bold tracking-tight">
                                Attendance Details
                            </DialogTitle>
                            <DialogDescription className="text-[11px] font-medium text-muted-foreground/80">
                                View and manage workforce participation logs
                            </DialogDescription>
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
                                photo={session.employee?.photo}
                                name={session.employee?.nameWithInitials}
                                className="h-12 w-12 rounded-2xl shadow-lg"
                            />
                            <div className="flex-1">
                                <div className="font-bold text-base">{session.employee?.nameWithInitials}</div>
                                {session.employee?.employeeNo && (
                                    <div className="text-xs text-muted-foreground">
                                        Employee No: <span className="font-mono font-bold text-foreground">{session.employee.employeeNo}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>



                    <div className="space-y-6">
                        {/* Quick Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <IconInfoCircle className="h-3 w-3" /> Shift
                                </p>
                                <p className="font-bold text-sm text-primary uppercase">{session.shiftName || "Standard"}</p>
                                {session.shiftStartTime && session.shiftEndTime && (
                                    <p className="text-[10px] text-muted-foreground font-mono">
                                        {session.shiftStartTime} - {session.shiftEndTime}
                                    </p>
                                )}
                            </div>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <IconCalendar className="h-3 w-3" /> Status
                                </p>
                                {getStatusBadge(session.status)}
                            </div>


                        </div>

                        {/* Modifiable Form Area */}
                        <div className="space-y-4 p-5 rounded-2xl bg-muted/30 border border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <IconEdit className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Update Logs</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-emerald-600 ml-1">Check In</Label>
                                        <Input
                                            type="datetime-local"
                                            className="h-10 rounded-xl font-mono text-xs font-bold bg-background border-border"
                                            value={editData.checkInTime}
                                            onChange={e => handleChange('checkInTime', e.target.value)}
                                        />
                                        {session.checkInLocation && (
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                                <IconMapPin className="h-3 w-3" />
                                                {session.checkInLocation}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">In Approval</Label>
                                        <Select
                                            value={editData.inApprovalStatus}
                                            onValueChange={(val) => handleChange('inApprovalStatus', val)}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl bg-background border-border text-[10px] font-bold uppercase">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value={AttendanceApprovalStatus.PENDING} className="text-[10px] font-bold uppercase">Pending</SelectItem>
                                                <SelectItem value={AttendanceApprovalStatus.APPROVED} className="text-[10px] font-bold uppercase text-green-600">Approved</SelectItem>
                                                <SelectItem value={AttendanceApprovalStatus.REJECTED} className="text-[10px] font-bold uppercase text-red-600">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-rose-600 ml-1">Check Out</Label>
                                        <Input
                                            type="datetime-local"
                                            className="h-10 rounded-xl font-mono text-xs font-bold bg-background border-border"
                                            value={editData.checkOutTime}
                                            onChange={e => handleChange('checkOutTime', e.target.value)}
                                        />
                                        {session.checkOutLocation && (
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                                <IconMapPin className="h-3 w-3" />
                                                {session.checkOutLocation}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Out Approval</Label>
                                        <Select
                                            value={editData.outApprovalStatus}
                                            onValueChange={(val) => handleChange('outApprovalStatus', val)}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl bg-background border-border text-[10px] font-bold uppercase">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value={AttendanceApprovalStatus.PENDING} className="text-[10px] font-bold uppercase">Pending</SelectItem>
                                                <SelectItem value={AttendanceApprovalStatus.APPROVED} className="text-[10px] font-bold uppercase text-green-600">Approved</SelectItem>
                                                <SelectItem value={AttendanceApprovalStatus.REJECTED} className="text-[10px] font-bold uppercase text-red-600">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>


                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Remarks</Label>
                                <Input
                                    placeholder="Reason for change..."
                                    className="h-10 rounded-xl font-medium bg-background border-border text-sm"
                                    value={editData.remarks}
                                    onChange={e => handleChange('remarks', e.target.value)}
                                />
                            </div>


                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Duration</p>
                                    <p className="font-mono text-sm font-bold text-neutral-600">
                                        {session.totalMinutes ? `${Math.floor(session.totalMinutes / 60)}h ${session.totalMinutes % 60}m` : "--:--"}
                                    </p>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>

                {/* Action Buttons - Sticky Footer */}
                {/* Show footer if either status is PENDING or APPROVED (hide only if both are REJECTED) */}
                {!(session.inApprovalStatus === AttendanceApprovalStatus.REJECTED && session.outApprovalStatus === AttendanceApprovalStatus.REJECTED) && (
                    <DialogFooter className="p-4 md:p-8 bg-muted/60 border-t border-border shrink-0 z-10 transition-all">
                        <div className="flex flex-row gap-3 w-full justify-between items-center">
                            {/* Delete button on the left for pending requests */}
                            {(session.inApprovalStatus === AttendanceApprovalStatus.PENDING || session.outApprovalStatus === AttendanceApprovalStatus.PENDING) && (
                                <Button
                                    variant="outline"
                                    className="rounded-xl h-10 w-10 p-0 md:w-auto md:px-8 md:h-11 font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 shrink-0"
                                    onClick={() => setDeleteConfirmOpen(true)}
                                    disabled={isDeleting || isApproving}
                                    title="Delete Record"
                                >
                                    <IconTrash className="h-4 w-4 md:mr-2" />
                                    <span className="hidden md:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
                                </Button>
                            )}

                            {/* Approve/Reject/Update buttons on the right */}
                            <div className="flex flex-row gap-2 md:gap-3 ml-auto flex-1 justify-end">
                                {/* Show approve/reject only if either status is still PENDING */}
                                {(session.inApprovalStatus === AttendanceApprovalStatus.PENDING || session.outApprovalStatus === AttendanceApprovalStatus.PENDING) && (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="rounded-xl px-4 md:px-8 h-10 md:h-11 font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                            onClick={() => onApprove(session.id, AttendanceApprovalStatus.REJECTED)}
                                            disabled={isApproving || isDeleting || isUpdating}
                                        >
                                            {isApproving ? <IconRefresh className="h-4 w-4 md:mr-2 animate-spin" /> : <IconX className="h-4 w-4 md:mr-2" />}
                                            <span>{isApproving ? "Rejecting..." : "Reject"}</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="rounded-xl px-4 md:px-8 h-10 md:h-11 font-bold text-xs hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                                            onClick={() => onApprove(session.id, AttendanceApprovalStatus.APPROVED)}
                                            disabled={isApproving || isDeleting || isUpdating}
                                        >
                                            {isApproving ? <IconRefresh className="h-4 w-4 md:mr-2 animate-spin" /> : <IconCheck className="h-4 w-4 md:mr-2" />}
                                            <span>{isApproving ? "Approving..." : "Approve"}</span>
                                        </Button>
                                    </>
                                )}
                                <Button
                                    className="rounded-xl px-4 md:px-8 h-10 md:h-11 font-bold text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handleSave}
                                    disabled={!isDirty || isUpdating || isApproving || isDeleting}
                                >
                                    {isUpdating ? <IconRefresh className="h-4 w-4 md:mr-2 animate-spin" /> : <IconCheck className="h-4 w-4 md:mr-2" />}
                                    <span>{isUpdating ? "Updating..." : "Update"}</span>
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                )}



            </DialogContent>

            <ConfirmationDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Delete Attendance Record"
                description="Are you sure you want to delete this attendance record? This action cannot be undone."
                icon={<IconTrash className="h-8 w-8" />}
                actionLabel="Delete"
                cancelLabel="Cancel"
                onAction={async () => {
                    if (onDelete) {
                        await onDelete(session.id);
                        setDeleteConfirmOpen(false);
                    }
                }}
                onCancel={() => setDeleteConfirmOpen(false)}
                loading={isDeleting}
                variant="destructive"
            />
        </Dialog>
    );
}


