"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AttendanceSession } from "@/types/attendance";

interface SessionWorkSummaryProps {
    session: AttendanceSession;
    editing: boolean;
    workMinutes: string;
    breakMinutes: string;
    overtimeMinutes: string;
    isBreakOverrideActive: boolean;
    onWorkMinutesChange: (value: string) => void;
    onBreakMinutesChange: (value: string) => void;
    onOvertimeMinutesChange: (value: string) => void;
    onBreakOverrideActiveChange: (value: boolean) => void;
    formatMinutes: (minutes?: number) => string;
}

export function SessionWorkSummary({
    session,
    editing,
    workMinutes,
    breakMinutes,
    overtimeMinutes,
    isBreakOverrideActive,
    onWorkMinutesChange,
    onBreakMinutesChange,
    onOvertimeMinutesChange,
    onBreakOverrideActiveChange,
    formatMinutes,
}: SessionWorkSummaryProps) {
    return (
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
                    {editing ? (
                        <div className="space-y-2">
                            <Input
                                type="number"
                                value={breakMinutes}
                                onChange={(e) => onBreakMinutesChange(e.target.value)}
                                placeholder="Min"
                                className="h-8 text-sm"
                            />
                            <div className="flex items-center gap-2 text-xs">
                                <Switch
                                    checked={isBreakOverrideActive}
                                    onCheckedChange={onBreakOverrideActiveChange}
                                    className="scale-75"
                                    id="break-override-toggle"
                                />
                                <Label htmlFor="break-override-toggle" className="text-xs">
                                    Override
                                </Label>
                            </div>
                        </div>
                    ) : (
                        <div className="font-black text-lg">
                            {formatMinutes(session.breakMinutes)}
                            {session.isBreakOverrideActive && (
                                <span className="ml-1 text-xs text-orange-600">(OVR)</span>
                            )}
                        </div>
                    )}
                </div>
                <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">Work Time</Label>
                    {editing ? (
                        <Input
                            disabled
                            type="number"
                            value={workMinutes}
                            onChange={(e) => onWorkMinutesChange(e.target.value)}
                            placeholder="Minutes"
                            className="h-8 text-sm opacity-60 cursor-not-allowed"
                        />
                    ) : (
                        <div className="font-black text-lg text-primary">{formatMinutes(session.workMinutes)}</div>
                    )}
                </div>
                <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">Overtime</Label>
                    {editing ? (
                        <Input
                            disabled
                            type="number"
                            value={overtimeMinutes}
                            onChange={(e) => onOvertimeMinutesChange(e.target.value)}
                            placeholder="Minutes"
                            className="h-8 text-sm opacity-60 cursor-not-allowed"
                        />
                    ) : (
                        <div className="font-black text-lg text-orange-600">{formatMinutes(session.overtimeMinutes)}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
