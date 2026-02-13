"use client";

import React from "react";
import { format, isSameDay } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IconMapPin, IconLogin, IconLogout, IconExternalLink } from "@tabler/icons-react";
import { AttendanceSession, ApprovalStatus, EventType, AttendanceEvent } from "@/types/attendance";
import { SessionInOutDetails } from "./SessionInOutDetails";
import { SearchableEventSelect } from "@/components/ui/searchable-event-select";
import { useAttendanceMutations } from "@/hooks/use-attendance";

interface SessionTimeDetailsProps {
    session: AttendanceSession;
    events: AttendanceEvent[];
    editing: boolean;
    checkInTime: string;
    checkOutTime: string;
    onCheckInChange: (value: string) => void;
    onCheckOutChange: (value: string) => void;
    getApprovalBadge: (status: ApprovalStatus, type: "IN" | "OUT") => React.ReactNode;
    onViewEvent?: (event: AttendanceEvent) => void;
}

export function SessionTimeDetails({
    session,
    events,
    editing,
    checkInTime,
    checkOutTime,
    onCheckInChange,
    onCheckOutChange,
    getApprovalBadge,
    onViewEvent,
}: SessionTimeDetailsProps) {
    const { linkEventToSession, unlinkEventFromSession } = useAttendanceMutations();

    // Find currently linked events for IN and OUT
    const checkInEvent = events.find(e =>
        e.eventType === EventType.IN &&
        session.checkInTime &&
        new Date(e.eventTime).getTime() === new Date(session.checkInTime).getTime()
    );

    const checkOutEvent = events.find(e =>
        e.eventType === EventType.OUT &&
        session.checkOutTime &&
        new Date(e.eventTime).getTime() === new Date(session.checkOutTime).getTime()
    );

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
                        <div className="flex flex-col gap-1.5 p-2 bg-blue-500/5 rounded-lg border border-blue-500/10">
                            <span className="text-[10px] font-bold text-blue-600/70 uppercase tracking-tight">Link existing event</span>
                            <SearchableEventSelect
                                companyId={session.companyId}
                                employeeId={session.employeeId}
                                sessionDate={new Date(session.date)}
                                eventType={EventType.IN}
                                currentEvent={checkInEvent}
                                onSelect={async (eventId) => {
                                    if (eventId) {
                                        await linkEventToSession.mutateAsync({ eventId, sessionId: session.id });
                                    } else if (checkInEvent) {
                                        await unlinkEventFromSession.mutateAsync(checkInEvent.id);
                                    }
                                }}
                                placeholder="Link an unlinked IN event..."
                            />
                        </div>
                        {getApprovalBadge(session.inApprovalStatus, "IN")}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <div className="font-bold text-sm mt-1">
                            {session.checkInTime ? (
                                <div className="flex items-center gap-2 group">
                                    <div className="flex flex-col">
                                        <span>{format(new Date(session.checkInTime), "h:mm a")}</span>
                                        {!isSameDay(new Date(session.checkInTime), new Date(session.date)) && (
                                            <span className="text-[10px] text-muted-foreground font-normal">
                                                {format(new Date(session.checkInTime), "MMM d, yyyy")}
                                            </span>
                                        )}
                                    </div>
                                    {checkInEvent && (
                                        <Badge
                                            variant="outline"
                                            className="bg-blue-500/5 text-blue-600 border-blue-500/10 cursor-pointer hover:bg-blue-500/10 transition-all text-[9px] py-0 px-1.5 h-4 flex items-center gap-1 ml-auto"
                                            onClick={() => onViewEvent?.(checkInEvent)}
                                        >
                                            <IconExternalLink className="w-2.5 h-2.5" />
                                            RAW LOG
                                        </Badge>
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
                        <div className="flex flex-col gap-1.5 p-2 bg-blue-500/5 rounded-lg border border-blue-500/10">
                            <span className="text-[10px] font-bold text-blue-600/70 uppercase tracking-tight">Link existing event</span>
                            <SearchableEventSelect
                                companyId={session.companyId}
                                employeeId={session.employeeId}
                                sessionDate={new Date(session.date)}
                                eventType={EventType.OUT}
                                currentEvent={checkOutEvent}
                                onSelect={async (eventId) => {
                                    if (eventId) {
                                        await linkEventToSession.mutateAsync({ eventId, sessionId: session.id });
                                    } else if (checkOutEvent) {
                                        await unlinkEventFromSession.mutateAsync(checkOutEvent.id);
                                    }
                                }}
                                placeholder="Link an unlinked OUT event..."
                            />
                        </div>
                        {getApprovalBadge(session.outApprovalStatus, "OUT")}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <div className="font-bold text-sm mt-1">
                            {session.checkOutTime ? (
                                <div className="flex items-center gap-2 group">
                                    <div className="flex flex-col">
                                        <span>{format(new Date(session.checkOutTime), "h:mm a")}</span>
                                        {!isSameDay(new Date(session.checkOutTime), new Date(session.date)) && (
                                            <span className="text-[10px] text-muted-foreground font-normal">
                                                {format(new Date(session.checkOutTime), "MMM d, yyyy")}
                                            </span>
                                        )}
                                    </div>
                                    {checkOutEvent && (
                                        <Badge
                                            variant="outline"
                                            className="bg-blue-500/5 text-blue-600 border-blue-500/10 cursor-pointer hover:bg-blue-500/10 transition-all text-[9px] py-0 px-1.5 h-4 flex items-center gap-1 ml-auto"
                                            onClick={() => onViewEvent?.(checkOutEvent)}
                                        >
                                            <IconExternalLink className="w-2.5 h-2.5" />
                                            RAW LOG
                                        </Badge>
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

            {/* Additional IN/OUT pairs section */}
            {Number(session.additionalInOutCount || 0) > 0 && (
                <div className="md:col-span-2 mt-4">
                    <SessionInOutDetails
                        sessionId={session.id}
                        additionalInOutCount={session.additionalInOutCount || 0}
                        editing={editing}
                    />
                </div>
            )}
        </div>
    );
}
