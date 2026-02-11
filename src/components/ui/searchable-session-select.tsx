"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, Unlink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useAttendanceSessions, useAttendanceMutations } from "@/hooks/use-attendance";
import { format, addDays, subDays } from "date-fns";
import type { AttendanceSession } from "@/types/attendance";
import { PlusCircle } from "lucide-react";
import { CreateSessionDialog } from "./create-session-dialog";

interface SearchableSessionSelectProps {
    companyId: string;
    employeeId: string;
    eventDate: Date;
    value?: string | null;
    onSelect?: (sessionId: string | null) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function SearchableSessionSelect({
    companyId,
    employeeId,
    eventDate,
    value,
    onSelect,
    placeholder = "Assign to session...",
    className,
    disabled = false,
}: SearchableSessionSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Calculate 3-day window
    const startDate = format(subDays(eventDate, 1), "yyyy-MM-dd");
    const endDate = format(addDays(eventDate, 1), "yyyy-MM-dd");

    const { data: sessionsData, isLoading } = useAttendanceSessions({
        companyId,
        employeeId,
        startDate,
        endDate,
        limit: 50
    });

    const sessions = sessionsData?.items || [];
    const selectedSession = sessions.find((s: AttendanceSession) => s.id === value);

    const getSessionLabel = (session: AttendanceSession) => {
        const day = format(new Date(session.date), "MMM d");
        const shift = session.shiftName || "No Shift";
        return `${day} - ${shift}`;
    };

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "h-8 px-2 rounded-lg text-xs font-medium justify-between hover:bg-muted/80 w-full max-w-[180px]",
                            !value && "text-muted-foreground italic font-normal",
                            className
                        )}
                        disabled={disabled || isLoading}
                    >
                        <span className="truncate mr-1">
                            {selectedSession ? getSessionLabel(selectedSession) : placeholder}
                        </span>
                        <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0" align="start">
                    <Command shouldFilter={true}>
                        <CommandInput
                            placeholder="Search session..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            className="h-8 text-[11px]"
                        />
                        <CommandList className="max-h-[250px]">
                            <CommandEmpty>No sessions found.</CommandEmpty>
                            <CommandGroup heading="Actions">
                                <CommandItem
                                    className="text-xs text-primary font-bold"
                                    onSelect={() => {
                                        setCreateDialogOpen(true);
                                        setOpen(false);
                                    }}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create New Session
                                </CommandItem>

                                {value && (
                                    <CommandItem
                                        className="text-xs text-red-600 dark:text-red-400"
                                        onSelect={() => {
                                            if (onSelect) onSelect(null);
                                            setOpen(false);
                                        }}
                                    >
                                        <Unlink className="mr-2 h-3 w-3" />
                                        Unlink from session
                                    </CommandItem>
                                )}
                            </CommandGroup>

                            <CommandGroup heading="Available Sessions">
                                {sessions.map((session: AttendanceSession) => (
                                    <CommandItem
                                        key={session.id}
                                        value={`${format(new Date(session.date), "MMM d")} ${session.shiftName || ""}`}
                                        onSelect={() => {
                                            if (onSelect) onSelect(session.id);
                                            setOpen(false);
                                        }}
                                        className="text-xs"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-3 w-3",
                                                value === session.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-bold">{getSessionLabel(session)}</span>
                                            {session.checkInTime && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    {format(new Date(session.checkInTime), "h:mm a")} - {session.checkOutTime ? format(new Date(session.checkOutTime), "h:mm a") : "???"}
                                                </span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <CreateSessionDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                employeeId={employeeId}
                initialDate={eventDate}
                onSuccess={(sessionId) => {
                    if (onSelect) onSelect(sessionId);
                }}
            />
        </>
    );
}
