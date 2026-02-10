"use client";

import React from "react";
import { format, isSameDay } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IconMapPin, IconLogin, IconLogout } from "@tabler/icons-react";
import { AttendanceSession, ApprovalStatus } from "@/types/attendance";

interface SessionTimeDetailsProps {
    session: AttendanceSession;
    editing: boolean;
    checkInTime: string;
    checkOutTime: string;
    onCheckInChange: (value: string) => void;
    onCheckOutChange: (value: string) => void;
    getApprovalBadge: (status: ApprovalStatus, type: "IN" | "OUT") => React.ReactNode;
}

export function SessionTimeDetails({
    session,
    editing,
    checkInTime,
    checkOutTime,
    onCheckInChange,
    onCheckOutChange,
    getApprovalBadge,
}: SessionTimeDetailsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-1.5 mb-2">
                    <IconLogin className="h-3.5 w-3.5 text-green-600" />
                    <Label className="text-xs font-bold text-neutral-500">Check In</Label>
                </div>
                {editing ? (
                    <div className="flex flex-col gap-2">
                        <Input
                            type="datetime-local"
                            value={checkInTime}
                            onChange={(e) => onCheckInChange(e.target.value)}
                            className="mt-1"
                        />
                        {getApprovalBadge(session.inApprovalStatus, "IN")}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <div className="font-bold text-sm mt-1">
                            {session.checkInTime ? (
                                <div className="flex flex-col">
                                    <span>{format(new Date(session.checkInTime), "h:mm a")}</span>
                                    {!isSameDay(new Date(session.checkInTime), new Date(session.date)) && (
                                        <span className="text-[10px] text-muted-foreground font-normal">
                                            {format(new Date(session.checkInTime), "MMM d, yyyy")}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                "-"
                            )}
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
                <div className="flex items-center gap-1.5 mb-2">
                    <IconLogout className="h-3.5 w-3.5 text-red-600" />
                    <Label className="text-xs font-bold text-neutral-500">Check Out</Label>
                </div>
                {editing ? (
                    <div className="flex flex-col gap-2">
                        <Input
                            type="datetime-local"
                            value={checkOutTime}
                            onChange={(e) => onCheckOutChange(e.target.value)}
                            className="mt-1"
                        />
                        {getApprovalBadge(session.outApprovalStatus, "OUT")}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <div className="font-bold text-sm mt-1">
                            {session.checkOutTime ? (
                                <div className="flex flex-col">
                                    <span>{format(new Date(session.checkOutTime), "h:mm a")}</span>
                                    {!isSameDay(new Date(session.checkOutTime), new Date(session.date)) && (
                                        <span className="text-[10px] text-muted-foreground font-normal">
                                            {format(new Date(session.checkOutTime), "MMM d, yyyy")}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                "-"
                            )}
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
    );
}
