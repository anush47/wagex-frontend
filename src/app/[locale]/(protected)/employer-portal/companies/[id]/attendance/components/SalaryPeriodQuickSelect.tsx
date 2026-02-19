"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { IconCalendarStats, IconCheck, IconChevronDown } from "@tabler/icons-react";
import { useCompanyPolicy } from "@/hooks/use-policies";
import { format, subMonths, startOfMonth, endOfMonth, setDate, addDays, getYear, isSameMonth } from "date-fns";
import { PayCycleFrequency } from "@/types/policy";
import { cn } from "@/lib/utils";

interface SalaryPeriodQuickSelectProps {
    companyId: string;
    onRangeSelect: (start: string, end: string) => void;
    currentStart?: string;
    currentEnd?: string;
}

export function SalaryPeriodQuickSelect({
    companyId,
    onRangeSelect,
    currentStart,
    currentEnd
}: SalaryPeriodQuickSelectProps) {
    const [open, setOpen] = useState(false);
    const { data: policy, isLoading } = useCompanyPolicy(companyId);

    const payrollConfig = policy?.settings?.payrollConfiguration;

    const periods = useMemo(() => {
        if (!payrollConfig || payrollConfig.frequency !== PayCycleFrequency.MONTHLY) {
            return [];
        }

        const { runDay } = payrollConfig;
        const day = parseInt(runDay) || 0;
        const today = new Date();
        const result = [];

        // Helper to determine the period for a given date based on runDay
        const getPeriodForDate = (referenceDate: Date) => {
            let start: Date;
            let end: Date;

            if (day === 0 || day >= 28) {
                // Full month mechanism (e.g. 1st to 30th/31st)
                start = startOfMonth(referenceDate);
                end = endOfMonth(referenceDate);
            } else {
                // Split month mechanism (e.g. 26th to 25th)
                // If runDay is 25, the period for "Jan" ends ends on Jan 25.
                // It starts Dec 26.

                // We define the period by its END date's month.
                // So if we are looking at "referenceDate", we calculate the period that ends in referenceDate's month.

                end = setDate(referenceDate, day);
                // Start is previous month's day + 1
                const prevMonth = subMonths(referenceDate, 1);
                start = addDays(setDate(prevMonth, day), 1);
            }

            return {
                start: format(start, "yyyy-MM-dd"),
                end: format(end, "yyyy-MM-dd"),
                label: `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`,
                monthLabel: format(end, "MMMM"),
                year: getYear(end),
                endObj: end
            };
        };

        // Generate periods:
        // -2: 2 months in future
        // -1: 1 month in future
        // 0: Current month
        // 1...60: Past months
        for (let i = -2; i < 60; i++) {
            const periodDate = subMonths(today, i);
            const periodData = getPeriodForDate(periodDate);

            let status = "past";
            // Check if this period is the "current" one based solely on today's date
            // For split periods (e.g. 25th), if today is 26th, we are in next month's period.
            // But iteration based on 'Reference Date' (Month) is stable. 
            // i=0 is "This Month's Period". 
            // If today is Jan 26, and runDay is 25. "This Month" (Jan) period ended Jan 25. So it's technically past/closed.
            // The "Active" period is Feb (Jan 26 - Feb 25).

            // Let's rely on date comparison for "Current" status
            if (i < 0) status = "upcoming";
            else if (i === 0) status = "current";

            // Refined status logic:
            // If today is within start and end?
            // Actually, for generation, "Current" usually means the one matching today's month, or the active pay cycle.
            // Simple mapping for now: i=0 is "Current Month"

            result.push({
                ...periodData,
                key: `${periodData.start}_${periodData.end}`,
                status,
                fullLabel: `${periodData.monthLabel} ${periodData.year} ${periodData.label}`
            });
        }

        return result;
    }, [payrollConfig]);

    const selectedPeriod = useMemo(() => {
        if (!currentStart || !currentEnd) return null;
        return periods.find(p => p.start === currentStart && p.end === currentEnd);
    }, [periods, currentStart, currentEnd]);

    // Auto-select current (index 0) if nothing selected
    // Only if we haven't selected anything yet
    useEffect(() => {
        if (periods.length > 0 && !currentStart && !currentEnd) {
            // Find the period that corresponds to 'this month' (i=0)
            const current = periods.find(p => p.status === "current");
            if (current) {
                onRangeSelect(current.start, current.end);
            }
        }
    }, [periods, currentStart, currentEnd, onRangeSelect]);

    if (isLoading) {
        return <div className="h-10 w-full md:w-[240px] rounded-xl bg-muted/50 animate-pulse" />;
    }

    if (!payrollConfig) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full md:w-[280px] justify-between h-10 rounded-xl px-3 font-normal border-border hover:bg-muted/50 transition-all bg-background"
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <IconCalendarStats className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col items-start overflow-hidden text-left">
                            {selectedPeriod ? (
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold leading-none truncate text-foreground">
                                            {selectedPeriod.monthLabel} {selectedPeriod.year}
                                        </span>
                                        {selectedPeriod.status === 'current' && (
                                            <span className="text-[8px] bg-green-100 text-green-700 px-1 rounded-[4px] font-black uppercase tracking-wider">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[9px] text-muted-foreground leading-none truncate mt-0.5 font-medium">
                                        {selectedPeriod.label}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground">Select Period...</span>
                            )}
                        </div>
                    </div>
                    <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 rounded-2xl shadow-xl border-border/60 bg-white dark:bg-neutral-900" align="start">
                <Command className="rounded-2xl">
                    <CommandInput placeholder="Search month or year..." className="h-11 text-xs" />
                    <CommandList className="max-h-[300px] scrollbar-hide py-1">
                        <CommandEmpty>No period found.</CommandEmpty>
                        <CommandGroup heading="Recent & Upcoming">
                            {periods.filter(p => ['current', 'upcoming'].includes(p.status)).map((period) => (
                                <CommandItem
                                    key={period.key}
                                    value={period.fullLabel}
                                    onSelect={() => {
                                        onRangeSelect(period.start, period.end);
                                        setOpen(false);
                                    }}
                                    className="cursor-pointer aria-selected:bg-primary/5 m-1 rounded-lg"
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <div className={cn(
                                            "h-9 w-9 rounded-lg flex flex-col items-center justify-center text-[9px] font-black uppercase border shrink-0",
                                            period.status === 'current'
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-muted text-muted-foreground border-transparent"
                                        )}>
                                            <span>{format(period.endObj, "MMM")}</span>
                                        </div>
                                        <div className="flex flex-col flex-1 overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <span className={cn("text-xs font-bold truncate", period.status === 'current' && "text-primary")}>
                                                    {period.monthLabel} {period.year}
                                                </span>
                                                {period.status === 'current' && (
                                                    <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-2">Current</span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-medium truncate">
                                                {period.label}
                                            </span>
                                        </div>
                                        {selectedPeriod?.key === period.key && (
                                            <IconCheck className="h-4 w-4 text-primary shrink-0" />
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandGroup heading="Past Periods">
                            {periods.filter(p => p.status === 'past').map((period) => (
                                <CommandItem
                                    key={period.key}
                                    value={period.fullLabel}
                                    onSelect={() => {
                                        onRangeSelect(period.start, period.end);
                                        setOpen(false);
                                    }}
                                    className="cursor-pointer aria-selected:bg-muted/50 m-1 rounded-lg"
                                >
                                    <div className="flex items-center gap-3 w-full opacity-70 aria-selected:opacity-100">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground border border-transparent shrink-0">
                                            {format(period.endObj, "MMM")}
                                        </div>
                                        <div className="flex flex-col flex-1 overflow-hidden">
                                            <span className="text-xs font-medium text-foreground truncate">
                                                {period.monthLabel} {period.year}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground truncate">
                                                {period.label}
                                            </span>
                                        </div>
                                        {selectedPeriod?.key === period.key && (
                                            <IconCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                                        )}
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
