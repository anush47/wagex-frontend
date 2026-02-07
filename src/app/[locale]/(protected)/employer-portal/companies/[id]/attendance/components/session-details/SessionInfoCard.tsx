"use client";

import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";
import { IconBriefcase } from "@tabler/icons-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AttendanceSession } from "@/types/attendance";

interface SessionInfoCardProps {
    session: AttendanceSession;
    editing: boolean;
    shiftId: string;
    onShiftChange: (value: string) => void;
    availableShifts: any[];
}

export function SessionInfoCard({
    session,
    editing,
    shiftId,
    onShiftChange,
    availableShifts,
}: SessionInfoCardProps) {
    return (
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-4">
                <EmployeeAvatar
                    photo={session.employee?.photo}
                    name={session.employee?.fullName}
                    className="h-12 w-12 rounded-2xl border-2 border-background shadow-sm"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold truncate">
                        {session.employee?.fullName || "Unknown"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Badge variant="secondary" className="font-mono text-[10px] h-4 text-zinc-600 dark:text-zinc-400">
                            EMP-{session.employee?.employeeNo || "N/A"}
                        </Badge>
                        <span>•</span>
                        <span>{format(new Date(session.date), "MMMM d, yyyy")}</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
                <Label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight mb-2 block">Assigned Shift</Label>
                {editing ? (
                    <Select
                        value={shiftId}
                        onValueChange={onShiftChange}
                    >
                        <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Shift</SelectItem>
                            {availableShifts.map((s: any) => (
                                <SelectItem key={s.id} value={s.id}>
                                    {s.name} ({s.startTime} - {s.endTime})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <IconBriefcase className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <div className="text-sm font-bold leading-none">
                                {session.shiftName || "No Shift Assigned"}
                            </div>
                            {session.shiftStartTime && (
                                <div className="text-[10px] text-muted-foreground mt-1">
                                    {session.shiftStartTime} - {session.shiftEndTime}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
