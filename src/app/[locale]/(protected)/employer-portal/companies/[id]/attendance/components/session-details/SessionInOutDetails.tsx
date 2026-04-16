"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttendanceEvent, EventType } from "@/types/attendance";
import { IconChevronDown, IconChevronUp, IconRefresh } from "@tabler/icons-react";
import { useAttendance, useAttendanceMutations } from "@/hooks/use-attendance";

interface SessionInOutDetailsProps {
    sessionId: string;
    additionalInOutCount: number;
    editing?: boolean;
    onViewEvent?: (event: AttendanceEvent) => void;
}

const EMPTY_ARRAY: any[] = [];

export function SessionInOutDetails({
    sessionId,
    additionalInOutCount,
    editing = false,
    onViewEvent,
}: SessionInOutDetailsProps) {
    const [expanded, setExpanded] = useState(false);

    const events = useAttendance(state => state.events[sessionId] || EMPTY_ARRAY);
    const loading = useAttendance(state => state.loading[sessionId]);
    const error = useAttendance(state => state.error[sessionId]);
    const fetchSessionEvents = useAttendance(state => state.actions.fetchSessionEvents);

    useEffect(() => {
        if (sessionId && events.length === 0 && !loading) {
            fetchSessionEvents(sessionId);
        }
    }, [sessionId, events.length, loading, fetchSessionEvents]);

    const { updateEventType } = useAttendanceMutations();

    const handleTypeToggle = async (eventId: string, currentType: EventType) => {
        if (!editing) return;
        const newType = currentType === EventType.IN ? EventType.OUT : EventType.IN;
        try {
            await updateEventType.mutateAsync({ id: eventId, eventType: newType });
            // Refresh events for this session
            fetchSessionEvents(sessionId);
        } catch (error) {
            console.error("Failed to update event type", error);
        }
    };

    if (additionalInOutCount === 0) return null;

    return (
        <div className="mt-4">
            <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-between"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    <span className="font-medium">
                        Additional IN/OUT Activity ({additionalInOutCount})
                    </span>
                    <Badge variant="secondary" className="text-xs">
                        {events.length} total events
                    </Badge>
                </div>
                {expanded ? (
                    <IconChevronUp className="h-4 w-4" />
                ) : (
                    <IconChevronDown className="h-4 w-4" />
                )}
            </Button>

            {expanded && (
                <div className="mt-2 border rounded-xl overflow-hidden bg-background/50">
                    {loading ? (
                        <div className="flex items-center justify-center py-6 text-muted-foreground">
                            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2" />
                            <span className="text-xs font-medium">Loading events...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-4 text-destructive text-xs font-medium bg-red-50/50">
                            Error: {error}
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-xs italic">
                            No events found for this session
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-muted/50 border-b border-border/50">
                                    <tr>
                                        <th className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Type</th>
                                        <th className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Time</th>
                                        <th className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Source / Device</th>
                                        <th className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Location</th>
                                        <th className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {[...events].sort((a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime()).map((event) => (
                                        <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[9px] font-bold h-5 px-1.5 transition-all ${editing ? "cursor-pointer hover:border-primary hover:shadow-sm" : ""} ${event.eventType === EventType.IN
                                                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                                                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                                                        }`}
                                                    onClick={() => handleTypeToggle(event.id, event.eventType)}
                                                >
                                                    {updateEventType.isPending && updateEventType.variables?.id === event.id ? (
                                                        <IconRefresh className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        event.eventType
                                                    )}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold leading-none">
                                                        {format(new Date(event.eventTime), "h:mm:ss a")}
                                                    </span>
                                                    <span className="text-[9px] text-muted-foreground mt-0.5">
                                                        {format(new Date(event.eventTime), "MMM d, yyyy")}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-medium leading-none truncate max-w-[120px]">
                                                        {event.source}
                                                    </span>
                                                    {event.device && (
                                                        <span className="text-[9px] text-muted-foreground mt-0.5 truncate max-w-[120px]">
                                                            {event.device}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-[10px] text-muted-foreground italic">
                                                {event.location || "-"}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-[10px] font-bold uppercase tracking-tight"
                                                    onClick={() => (onViewEvent as any)?.(event)}
                                                >
                                                    Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}