"use client";

import React from "react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

interface SessionTimestampsProps {
    createdAt: string;
    updatedAt: string;
}

export function SessionTimestamps({ createdAt, updatedAt }: SessionTimestampsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-muted/20 p-3 rounded-lg">
                <Label className="text-[9px] text-muted-foreground uppercase tracking-wider">Created</Label>
                <div className="font-mono text-[10px] mt-1">
                    {format(new Date(createdAt), "MMM d, yyyy HH:mm")}
                </div>
            </div>
            <div className="bg-muted/20 p-3 rounded-lg">
                <Label className="text-[9px] text-muted-foreground uppercase tracking-wider">Updated</Label>
                <div className="font-mono text-[10px] mt-1">
                    {format(new Date(updatedAt), "MMM d, yyyy HH:mm")}
                </div>
            </div>
        </div>
    );
}
