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
import { useAttendance, useAttendanceMutations } from "@/hooks/use-attendance";
import { useEffectivePolicy } from "@/hooks/use-policies";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { toast } from "sonner";
import { IconClock, IconX, IconTrash, IconCheck } from "@tabler/icons-react";
import { AttendanceSession, ApprovalStatus, UpdateSessionDto, SessionWorkDayStatus, EventType, AttendanceEvent } from "@/types/attendance";
import { Badge } from "@/components/ui/badge";
import { EventDetailsDialog } from "./EventDetailsDialog";

// Sub-components
import { SessionInfoCard } from "./session-details/SessionInfoCard";
import { SessionTimeDetails } from "./session-details/SessionTimeDetails";
import { SessionWorkSummary } from "./session-details/SessionWorkSummary";
import { SessionStatusAndRemarks } from "./session-details/SessionStatusAndRemarks";
import { SessionTimestamps } from "./session-details/SessionTimestamps";

interface SessionDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session: AttendanceSession | null;
    onDelete?: (id: string) => Promise<void>;
    isLoading?: boolean;
    timezone?: string;
}

const EMPTY_ARRAY: any[] = [];

export function SessionDetailsDialog({
    open,
    onOpenChange,
    session,
    onDelete,
    isLoading,
    timezone = "UTC",
}: SessionDetailsDialogProps) {
    const [processing, setProcessing] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editing, setEditing] = useState(false);

    // Form state
    const [checkInTime, setCheckInTime] = useState("");
    const [checkOutTime, setCheckOutTime] = useState("");
    const [workMinutes, setWorkMinutes] = useState("");
    const [breakMinutes, setBreakMinutes] = useState("");
    const [overtimeMinutes, setOvertimeMinutes] = useState("");
    const [shiftId, setShiftId] = useState("");
    const [workDayStatus, setWorkDayStatus] = useState<SessionWorkDayStatus>(SessionWorkDayStatus.FULL);
    const [remarks, setRemarks] = useState("");
    const [isBreakOverrideActive, setIsBreakOverrideActive] = useState(false);

    // Event details state
    const [selectedEventForDialog, setSelectedEventForDialog] = useState<AttendanceEvent | null>(null);
    const [eventDetailsOpen, setEventDetailsOpen] = useState(false);

    const { data: policyData } = useEffectivePolicy(session?.employeeId || null);
    const availableShifts = policyData?.effective?.shifts?.list || [];

    const { updateSession } = useAttendanceMutations();
    const { events: sessionEventsMap, actions: attendanceActions } = useAttendance();
    const events = session?.id ? sessionEventsMap[session.id] || EMPTY_ARRAY : EMPTY_ARRAY;

    useEffect(() => {
        if (open && session?.id) {
            attendanceActions.fetchSessionEvents(session.id);
        }
    }, [open, session?.id, attendanceActions]);

    // Reset form when dialog opens with a new session
    useEffect(() => {
        if (open && session) {
            setCheckInTime(session.checkInTime ? formatInTimeZone(new Date(session.checkInTime), timezone, "yyyy-MM-dd'T'HH:mm") : "");
            setCheckOutTime(session.checkOutTime ? formatInTimeZone(new Date(session.checkOutTime), timezone, "yyyy-MM-dd'T'HH:mm") : "");
            setWorkMinutes(session.workMinutes !== null && session.workMinutes !== undefined ? session.workMinutes.toString() : "");
            setBreakMinutes(session.breakMinutes !== null && session.breakMinutes !== undefined ? session.breakMinutes.toString() : "");
            setOvertimeMinutes(session.overtimeMinutes !== null && session.overtimeMinutes !== undefined ? session.overtimeMinutes.toString() : "");
            setShiftId(session.shiftId || "");
            setWorkDayStatus(session.workDayStatus || SessionWorkDayStatus.FULL);
            setRemarks(session.remarks || "");
            setIsBreakOverrideActive(session.isBreakOverrideActive);
            setEditing(false);
        }
    }, [open, session]);

    // Recalculate times when check-in or check-out changes
    useEffect(() => {
        if (editing && checkInTime && checkOutTime) {
            const checkIn = new Date(checkInTime);
            const checkOut = new Date(checkOutTime);

            // 1. Calculate total duration (matching server logic)
            const totalMins = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60));
            if (totalMins < 0) return; // Prevent negative durations in UI

            // 2. Resolve Break
            let brk = parseInt(breakMinutes) || 0;

            if (!isBreakOverrideActive) {
                // Auto-calculate break ONLY if override is off
                const selectedShift = availableShifts.find((s: any) => s.id === shiftId);
                const shiftBreak = selectedShift?.breakTime || session?.shiftBreakMinutes || 0;

                // Calculate gap break from events
                let gapBreak = 0;
                if (events && events.length > 1) {
                    const sortedEvents = [...events].sort((a, b) =>
                        new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime()
                    );

                    for (let i = 0; i < sortedEvents.length - 1; i++) {
                        const current = sortedEvents[i];
                        const next = sortedEvents[i + 1];
                        if (current.eventType === EventType.OUT && next.eventType === EventType.IN) {
                            const gap = Math.floor((new Date(next.eventTime).getTime() - new Date(current.eventTime).getTime()) / (1000 * 60));
                            gapBreak += Math.max(0, gap);
                        }
                    }
                }

                // Per user request: max of in out calculated or shifts break
                brk = Math.max(gapBreak, (totalMins > 360) ? shiftBreak : 0);

                // Only update state if it actually changed to avoid effect cycles
                if (brk.toString() !== breakMinutes) {
                    setBreakMinutes(brk.toString());
                }
            }

            const work = Math.max(0, totalMins - brk);

            // 3. Calculate overtime if shift is selected
            let overtime = 0;
            const selectedShift = availableShifts.find((s: any) => s.id === shiftId);
            const shiftStart = selectedShift?.startTime || session?.shiftStartTime;
            const shiftEnd = selectedShift?.endTime || session?.shiftEndTime;

            if (shiftStart && shiftEnd) {
                const [startH, startM] = shiftStart.split(':').map(Number);
                const [endH, endM] = shiftEnd.split(':').map(Number);

                let shiftDuration = (endH * 60 + endM) - (startH * 60 + startM);
                if (shiftDuration < 0) shiftDuration += 24 * 60; // Overnight shift

                overtime = Math.max(0, work - shiftDuration);
            }

            setWorkMinutes(work.toString());
            setOvertimeMinutes(overtime.toString());
        }
    }, [checkInTime, checkOutTime, breakMinutes, editing, shiftId, session?.shiftStartTime, session?.shiftEndTime, session?.shiftBreakMinutes, availableShifts, isBreakOverrideActive, events]);


    const handleSave = async () => {
        if (!session) return;
        console.log('[ATTENDANCE_UI] Saving session:', { id: session.id, checkInTime, checkOutTime });
        setProcessing(true);
        try {
            const dto: UpdateSessionDto = {
                checkInTime: checkInTime ? new Date(checkInTime).toISOString() : null,
                checkOutTime: checkOutTime ? new Date(checkOutTime).toISOString() : null,
                breakMinutes: (breakMinutes !== "" && !isNaN(parseInt(breakMinutes))) ? parseInt(breakMinutes) : undefined,
                shiftId: shiftId === "none" ? null : (shiftId || undefined),
                workDayStatus,
                remarks: remarks,
                isBreakOverrideActive: !!isBreakOverrideActive,
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
        if (!session) return;
        setProcessing(true);
        try {
            const dto: UpdateSessionDto = {};
            if (type === "IN") dto.inApprovalStatus = status;
            else dto.outApprovalStatus = status;

            await updateSession.mutateAsync({ id: session.id, dto });
            // Toast is shown by the mutation hook
        } catch (error) {
            console.error(`Failed to update session ${type}`, error);
            toast.error(`Failed to update session ${type}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = () => {
        if (!onDelete) return;
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!onDelete || !session) return;
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
            PENDING: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
            APPROVED: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
            REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        };

        return (
            <div className="flex flex-col gap-2 w-full">
                <Badge variant="outline" className={`font-bold text-[10px] w-fit ${styles[status]}`}>
                    {status}
                </Badge>
                {!editing && status === "PENDING" && (
                    <div className="flex gap-2 w-full">
                        <Button
                            variant="default"
                            size="sm"
                            className="flex-1 h-9 rounded-lg shadow-md hover:shadow-lg transition-all"
                            onClick={() => handleApproval(type, "APPROVED" as ApprovalStatus)}
                            disabled={processing}
                            title="Approve"
                        >
                            <IconCheck className="h-3.5 w-3.5 mr-1.5" />
                            <span className="text-xs font-bold">Approve</span>
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 h-9 rounded-lg shadow-md hover:shadow-lg transition-all"
                            onClick={() => handleApproval(type, "REJECTED" as ApprovalStatus)}
                            disabled={processing}
                            title="Reject"
                        >
                            <IconX className="h-3.5 w-3.5 mr-1.5" />
                            <span className="text-xs font-bold">Reject</span>
                        </Button>
                    </div>
                )}
                {editing && status !== "PENDING" && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9 rounded-lg shadow-sm hover:shadow-md transition-all"
                        onClick={() => handleApproval(type, "PENDING" as ApprovalStatus)}
                        disabled={processing}
                        title="Reset to Pending"
                    >
                        <IconClock className="h-3.5 w-3.5 mr-1.5" />
                        <span className="text-xs font-bold">Reset to Pending</span>
                    </Button>
                )}
            </div>
        );
    };

    const formatMinutes = (minutes?: number) => {
        if (minutes === null || minutes === undefined) return "0h 0m";
        if (minutes === 0) return "0h 0m"; // Keep 0 as 0h 0m
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
                                {session && !isLoading ? formatInTimeZone(new Date(session.date), timezone, "MMMM d, yyyy") : "Retrieving session data..."}
                            </DialogDescription>
                        </div>

                    </div>
                </DialogHeader>

                {(!session || isLoading) ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground font-medium">Loading session details...</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
                        <SessionInfoCard
                            session={session}
                            editing={editing}
                            shiftId={shiftId}
                            onShiftChange={(v) => {
                                setShiftId(v);
                                if (v !== "none") {
                                    const shift = availableShifts.find((s: any) => s.id === v);
                                    if (shift && shift.breakTime) {
                                        setBreakMinutes(shift.breakTime.toString());
                                    }
                                }
                            }}
                            availableShifts={availableShifts}
                        />

                        <SessionTimeDetails
                            session={session}
                            events={events}
                            editing={editing}
                            checkInTime={checkInTime}
                            checkOutTime={checkOutTime}
                            onCheckInChange={setCheckInTime}
                            onCheckOutChange={setCheckOutTime}
                            getApprovalBadge={getApprovalBadge}
                            onViewEvent={(event) => {
                                setSelectedEventForDialog(event);
                                setEventDetailsOpen(true);
                            }}
                        />

                        <SessionWorkSummary
                            session={session}
                            editing={editing}
                            workMinutes={workMinutes}
                            breakMinutes={breakMinutes}
                            overtimeMinutes={overtimeMinutes}
                            isBreakOverrideActive={isBreakOverrideActive}
                            onWorkMinutesChange={setWorkMinutes}
                            onBreakMinutesChange={setBreakMinutes}
                            onOvertimeMinutesChange={setOvertimeMinutes}
                            onBreakOverrideActiveChange={setIsBreakOverrideActive}
                            formatMinutes={formatMinutes}
                        />

                        <SessionStatusAndRemarks
                            session={session}
                            editing={editing}
                            workDayStatus={workDayStatus}
                            remarks={remarks}
                            onWorkDayStatusChange={setWorkDayStatus}
                            onRemarksChange={setRemarks}
                        />

                        <SessionTimestamps
                            createdAt={session.createdAt}
                            updatedAt={session.updatedAt}
                        />
                    </div>
                )}

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
                                <>
                                    <Button
                                        variant="outline"
                                        className="rounded-xl px-4 md:px-8 h-10 md:h-11 font-bold text-xs"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        Close
                                    </Button>
                                    {session && !isLoading && (
                                        <Button
                                            onClick={() => setEditing(true)}
                                            className="rounded-xl px-4 md:px-8 h-10 md:h-11 font-bold text-xs bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                                        >
                                            Edit Session
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>

            <EventDetailsDialog
                open={eventDetailsOpen}
                onOpenChange={setEventDetailsOpen}
                event={selectedEventForDialog}
            />

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
