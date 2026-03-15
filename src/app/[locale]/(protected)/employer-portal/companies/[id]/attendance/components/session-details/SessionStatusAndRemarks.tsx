"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IconCalendarEvent } from "@tabler/icons-react";
import { AttendanceSession, SessionWorkDayStatus } from "@/types/attendance";

interface SessionStatusAndRemarksProps {
    session: AttendanceSession;
    editing: boolean;
    workDayStatus: SessionWorkDayStatus;
    remarks: string;
    onWorkDayStatusChange: (value: SessionWorkDayStatus) => void;
    onRemarksChange: (value: string) => void;
}

export function SessionStatusAndRemarks({
    session,
    editing,
    workDayStatus,
    remarks,
    onWorkDayStatusChange,
    onRemarksChange,
}: SessionStatusAndRemarksProps) {
    return (
        <div className="space-y-6">
            {/* Work Day Status */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-bold text-neutral-500">Work Day Type</Label>
                    {!editing && (
                        <Badge variant="outline" className="bg-primary/10 text-primary text-xs border-primary/20">
                            {session.workDayStatus}
                        </Badge>
                    )}
                </div>
                {editing ? (
                    <Select value={workDayStatus} onValueChange={(v) => onWorkDayStatusChange(v as SessionWorkDayStatus)}>
                        <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={SessionWorkDayStatus.FULL}>Full Day</SelectItem>
                            <SelectItem value={SessionWorkDayStatus.HALF_FIRST}>Half Day (First Shift)</SelectItem>
                            <SelectItem value={SessionWorkDayStatus.HALF_LAST}>Half Day (Last Shift)</SelectItem>
                            <SelectItem value={SessionWorkDayStatus.OFF}>Off Day</SelectItem>
                        </SelectContent>
                    </Select>
                ) : (
                    <div className="flex items-center gap-2 mt-1">
                        <IconCalendarEvent className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            {session.workDayStatus === SessionWorkDayStatus.FULL && "Full Working Day"}
                            {session.workDayStatus === SessionWorkDayStatus.HALF_FIRST && "Half Day (First Shift)"}
                            {session.workDayStatus === SessionWorkDayStatus.HALF_LAST && "Half Day (Last Shift)"}
                            {session.workDayStatus === SessionWorkDayStatus.OFF && "Off Day / Holiday"}
                        </span>
                    </div>
                )}
            </div>

            {/* Status Flags */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <Label className="text-xs font-bold text-neutral-500 mb-3">Status Flags</Label>
                <div className="flex flex-wrap gap-2">
                    {session.payrollStatus === 'PROCESSED' && (
                        <Badge variant="outline" className="bg-green-600 text-white border-green-700 font-black shadow-sm">
                            Processed in Payroll
                        </Badge>
                    )}
                    {session.isLate && (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
                            Late {session.lateMinutes ? `(${session.lateMinutes}m)` : ""}
                        </Badge>
                    )}
                    {session.isEarlyLeave && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                            Early Leave {session.earlyLeaveMinutes ? `(${session.earlyLeaveMinutes}m)` : ""}
                        </Badge>
                    )}
                    {session.isOnLeave && (
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                            On Leave
                        </Badge>
                    )}
                    {session.isHalfDay && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                            Half Day
                        </Badge>
                    )}
                    {session.hasShortLeave && (
                        <Badge variant="outline" className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
                            Short Leave
                        </Badge>
                    )}
                    {session.manuallyEdited ? (
                        <Badge variant="outline" className="bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20">
                            Manually Edited
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                            System (Original)
                        </Badge>
                    )}
                    {session.autoCheckout && (
                        <Badge variant="outline" className="bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20">
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
                        onChange={(e) => onRemarksChange(e.target.value)}
                        placeholder="Add remarks..."
                        className="mt-2 min-h-[80px]"
                    />
                ) : (
                    <p className="text-sm mt-2 leading-relaxed whitespace-pre-wrap">
                        {session.remarks || "-"}
                    </p>
                )}
            </div>
        </div>
    );
}
