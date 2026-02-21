"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
    IconX,
    IconMapPin,
    IconDeviceMobile,
    IconActivity,
    IconCalendarTime,
    IconUser,
    IconDatabase,
    IconArrowRight,
    IconArrowLeft,
    IconCode,
    IconRefresh
} from "@tabler/icons-react";
import { AttendanceEvent, EventType } from "@/types/attendance";
import { useAttendanceMutations } from "@/hooks/use-attendance";
import { Badge } from "@/components/ui/badge";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";
import { useEffectivePolicy } from "@/hooks/use-policies";
import dynamic from "next/dynamic";

const AttendanceMap = dynamic(() => import("../../policies/components/policy/AttendanceMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-xl" />
});

interface EventDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: AttendanceEvent | null;
}

export function EventDetailsDialog({
    open,
    onOpenChange,
    event,
}: EventDetailsDialogProps) {
    const { data: policyData } = useEffectivePolicy(event?.employeeId || null);
    const zones = policyData?.effective?.attendance?.geofencing?.zones || [];

    const { updateEventType } = useAttendanceMutations();

    if (!event) return null;

    const handleTypeToggle = async () => {
        const newType = event.eventType === "IN" ? "OUT" : "IN";
        try {
            await updateEventType.mutateAsync({ id: event.id, eventType: newType });
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to toggle type", error);
        }
    };

    const getEventTypeBadge = (type: EventType) => {
        const styles = {
            IN: "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
            OUT: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
        };

        const isUpdating = updateEventType.isPending && updateEventType.variables?.id === event.id;

        return (
            <Badge
                variant="outline"
                className={`font-bold px-3 py-1 cursor-pointer transition-all ${styles[type]} ${isUpdating ? "opacity-70 pointer-events-none" : ""}`}
                onClick={handleTypeToggle}
                title="Click to toggle type"
            >
                {isUpdating ? (
                    <IconRefresh className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                    type === "IN" ? <IconArrowRight className="h-4 w-4 mr-1.5" /> : <IconArrowLeft className="h-4 w-4 mr-1.5" />
                )}
                {type}
            </Badge>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-3xl flex flex-col max-h-[90vh] p-0 gap-0 border-none shadow-2xl overflow-hidden rounded-3xl md:rounded-[2rem]">
                <DialogHeader className="p-6 pb-4 border-b border-border/40 shrink-0 bg-background z-10 relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 rounded-full h-8 w-8 text-muted-foreground hover:bg-muted"
                        onClick={() => onOpenChange(false)}
                    >
                        <IconX className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <IconActivity className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-lg font-bold tracking-tight">
                                Raw Log Details
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground/80">
                                Event ID: {event.id}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Employee & Status */}
                    <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border/50">
                        <div className="flex items-center gap-3">
                            <EmployeeAvatar
                                photo={event.employee?.photo}
                                name={event.employee?.nameWithInitials || ""}
                                className="h-10 w-10 shrink-0 shadow-sm border-2 border-background"
                            />
                            <div>
                                <p className="text-sm font-bold uppercase tracking-tight">{event.employee?.nameWithInitials}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">Employee No: {event.employee?.employeeNo}</p>
                            </div>
                        </div>
                        {getEventTypeBadge(event.eventType)}
                    </div>

                    {/* Time Info */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase text-neutral-400">
                            <IconCalendarTime className="h-3.5 w-3.5" />
                            Timing
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                <p className="text-[10px] font-black uppercase text-neutral-400 mb-1">Date</p>
                                <p className="text-sm font-bold">{format(new Date(event.eventTime), "MMMM d, yyyy")}</p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                <p className="text-[10px] font-black uppercase text-neutral-400 mb-1">Time</p>
                                <p className="text-sm font-bold">{format(new Date(event.eventTime), "h:mm:ss a")}</p>
                            </div>
                        </div>
                    </div>

                    {/* Coordinates & Map */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase text-neutral-400">
                            <IconMapPin className="h-3.5 w-3.5" />
                            Location & Allowed Zones
                        </div>

                        <div className="space-y-4">
                            <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-border shadow-inner bg-muted/50">
                                {event.latitude && event.longitude ? (
                                    <AttendanceMap
                                        center={[event.latitude, event.longitude]}
                                        zones={zones}
                                        selectedLocation={{ lat: event.latitude, lng: event.longitude }}
                                        onLocationSelect={() => { }} // Read-only
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs italic">
                                        No GPS coordinates available for this log
                                    </div>
                                )}
                            </div>

                            <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-neutral-400 mb-0.5">Latitude</p>
                                        <p className="text-xs font-mono font-bold text-primary">{event.latitude || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-neutral-400 mb-0.5">Longitude</p>
                                        <p className="text-xs font-mono font-bold text-primary">{event.longitude || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-border/50">
                                    <p className="text-[10px] font-black uppercase text-neutral-400 mb-1">Address/Label</p>
                                    <p className="text-xs font-medium">{event.location || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Device & Source */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-black uppercase text-neutral-400">
                                <IconDeviceMobile className="h-3.5 w-3.5" />
                                Device
                            </div>
                            <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                                <p className="text-xs font-bold">{event.device || "Unknown Device"}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{event.source} Source</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-black uppercase text-neutral-400">
                                <IconDatabase className="h-3.5 w-3.5" />
                                API Key
                            </div>
                            <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                                <p className="text-xs font-bold">{event.apiKeyName || "Manual Action"}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{event.apiKeyName ? "External Auth" : "System"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-black uppercase text-neutral-400">
                                <IconCode className="h-3.5 w-3.5" />
                                Payload Metadata
                            </div>
                            <div className="bg-neutral-900 rounded-xl p-4 overflow-x-auto shadow-inner border border-neutral-800">
                                <pre className="text-[10px] font-mono text-cyan-400 leading-relaxed">
                                    {JSON.stringify(event.metadata, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Remark */}
                    {event.remark && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-black uppercase text-neutral-400">
                                Remark
                            </div>
                            <p className="text-sm bg-orange-50/50 dark:bg-orange-500/5 p-4 rounded-xl border border-orange-200/50 dark:border-orange-500/20 italic text-neutral-600 dark:text-neutral-400">
                                "{event.remark}"
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-muted/60 border-t border-border flex justify-end">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl px-8 font-bold text-xs"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
