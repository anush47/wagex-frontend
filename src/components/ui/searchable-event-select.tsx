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
import { useAttendanceEvents } from "@/hooks/use-attendance";
import { format, addDays, subDays } from "date-fns";
import type { AttendanceEvent } from "@/types/attendance";
import { EventType } from "@/types/attendance";

interface SearchableEventSelectProps {
    companyId: string;
    employeeId: string;
    sessionDate: Date;
    value?: string | null;
    currentEvent?: AttendanceEvent | null;
    eventType?: EventType; // Filter by IN or OUT if needed
    onSelect?: (eventId: string | null) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function SearchableEventSelect({
    companyId,
    employeeId,
    sessionDate,
    value,
    currentEvent,
    eventType,
    onSelect,
    placeholder = "Pick a raw event...",
    className,
    disabled = false,
}: SearchableEventSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Calculate window: day before and day after
    const startDate = format(subDays(sessionDate, 1), "yyyy-MM-dd");
    const endDate = format(addDays(sessionDate, 1), "yyyy-MM-dd");

    const { data: eventsData, isLoading } = useAttendanceEvents({
        companyId,
        employeeId,
        startDate,
        endDate,
        onlyUnlinked: true,
        limit: 100
    });

    const events = (eventsData as any)?.items || [];
    const displayEvent = currentEvent || events.find((e: AttendanceEvent) => e.id === value);

    const getEventLabel = (event: AttendanceEvent) => {
        const time = format(new Date(event.eventTime), "h:mm a");
        const date = format(new Date(event.eventTime), "MMM d");
        return `${event.eventType}: ${time} (${date})`;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "h-8 px-2 rounded-lg text-xs font-medium justify-between hover:bg-muted/80 w-full",
                        !displayEvent && "text-muted-foreground italic font-normal",
                        className
                    )}
                    disabled={disabled || isLoading}
                >
                    <span className="truncate mr-1">
                        {displayEvent ? getEventLabel(displayEvent) : placeholder}
                    </span>
                    <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command shouldFilter={true}>
                    <CommandInput
                        placeholder="Search unlinked events..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        className="h-8 text-[11px]"
                    />
                    <CommandList className="max-h-[250px]">
                        <CommandEmpty>No unlinked events found.</CommandEmpty>
                        <CommandGroup heading="Actions">
                            {(value || currentEvent) && (
                                <CommandItem
                                    className="text-xs text-red-600 dark:text-red-400 font-bold"
                                    onSelect={() => {
                                        if (onSelect) onSelect(null);
                                        setOpen(false);
                                    }}
                                >
                                    <Unlink className="mr-2 h-3.5 w-3.5" />
                                    Clear Link (Unlink)
                                </CommandItem>
                            )}
                        </CommandGroup>

                        {currentEvent && (
                            <CommandGroup heading="Currently Linked">
                                <CommandItem
                                    value={getEventLabel(currentEvent)}
                                    className="text-xs bg-primary/5"
                                    onSelect={() => setOpen(false)}
                                >
                                    <Check className="mr-2 h-3 w-3 opacity-100 text-primary" />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-primary">{getEventLabel(currentEvent)}</span>
                                        <span className="text-[10px] text-muted-foreground truncate">
                                            {currentEvent.source} • {currentEvent.location || "No location"}
                                        </span>
                                    </div>
                                </CommandItem>
                            </CommandGroup>
                        )}

                        <CommandGroup heading="Unlinked Events">
                            {events
                                .filter((e: AttendanceEvent) => !eventType || e.eventType === eventType)
                                .map((event: AttendanceEvent) => (
                                    <CommandItem
                                        key={event.id}
                                        value={getEventLabel(event)}
                                        onSelect={() => {
                                            if (onSelect) onSelect(event.id);
                                            setOpen(false);
                                        }}
                                        className="text-xs"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-3 w-3",
                                                value === event.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-bold">{getEventLabel(event)}</span>
                                            <span className="text-[10px] text-muted-foreground truncate">
                                                {event.source} • {event.location || "No location"}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
