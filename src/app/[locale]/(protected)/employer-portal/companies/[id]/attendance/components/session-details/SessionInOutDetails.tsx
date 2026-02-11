"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttendanceEvent, EventType } from "@/types/attendance";
import { IconChevronDown, IconChevronUp, IconLogin, IconLogout } from "@tabler/icons-react";
import { useAttendance } from "@/hooks/use-attendance";

interface SessionInOutDetailsProps {
    sessionId: string;
    additionalInOutCount: number;
}

export function SessionInOutDetails({
    sessionId,
    additionalInOutCount,
}: SessionInOutDetailsProps) {
    const [expanded, setExpanded] = useState(false);
    
    const events = useAttendance(state => state.events[sessionId] || []);
    const loading = useAttendance(state => state.loading[sessionId]);
    const error = useAttendance(state => state.error[sessionId]);
    const fetchSessionEvents = useAttendance(state => state.actions.fetchSessionEvents);

    useEffect(() => {
        if (expanded && events.length === 0 && !loading) {
            fetchSessionEvents(sessionId);
        }
    }, [expanded, sessionId, events.length, loading, fetchSessionEvents]);

    if (additionalInOutCount === 0) return null;

    // Separate IN and OUT events
    const inEvents = events.filter(e => e.eventType === EventType.IN).sort((a, b) => 
        new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime()
    );
    const outEvents = events.filter(e => e.eventType === EventType.OUT).sort((a, b) => 
        new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime()
    );

    // Create pairs of IN/OUT events
    const eventPairs = [];
    for (let i = 0; i < Math.max(inEvents.length, outEvents.length); i++) {
        eventPairs.push({
            in: inEvents[i] || null,
            out: outEvents[i] || null
        });
    }

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
                <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                    {loading ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            <span className="ml-2 text-sm">Loading events...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-4 text-destructive text-sm">
                            Error: {error}
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                            No events found for this session
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {eventPairs.map((pair, index) => (
                                <div 
                                    key={index} 
                                    className={`p-3 rounded-lg border ${
                                        index === 0 
                                            ? "border-green-200 bg-green-50/50 dark:border-green-800/50 dark:bg-green-950/20" 
                                            : index === eventPairs.length - 1 && !pair.out
                                                ? "border-red-200 bg-red-50/50 dark:border-red-800/50 dark:bg-red-950/20"
                                                : "border-border/50 bg-background"
                                    }`}
                                >
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-start gap-2 min-w-[150px]">
                                            <IconLogin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">IN</div>
                                                <div className="font-medium">
                                                    {pair.in ? format(new Date(pair.in.eventTime), "h:mm a") : "-"}
                                                </div>
                                                {pair.in && (
                                                    <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                                        {format(new Date(pair.in.eventTime), "MMM d, yyyy")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-2 min-w-[150px]">
                                            <IconLogout className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">OUT</div>
                                                <div className="font-medium">
                                                    {pair.out ? format(new Date(pair.out.eventTime), "h:mm a") : "-"}
                                                </div>
                                                {pair.out && (
                                                    <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                                        {format(new Date(pair.out.eventTime), "MMM d, yyyy")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {pair.in && (
                                            <div className="text-xs text-muted-foreground ml-auto">
                                                <div>Device: {pair.in.device || "N/A"}</div>
                                                <div>Source: {pair.in.source}</div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {(pair.in?.location || pair.out?.location) && (
                                        <div className="mt-2 pt-2 border-t border-border/30 text-xs text-muted-foreground flex flex-wrap gap-x-4">
                                            {pair.in?.location && (
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium">IN Location:</span>
                                                    <span>{pair.in.location}</span>
                                                </div>
                                            )}
                                            {pair.out?.location && (
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium">OUT Location:</span>
                                                    <span>{pair.out.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}