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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { IconCalendarStats, IconCheck, IconChevronDown } from "@tabler/icons-react";
import { useCompanyPolicy, useEffectivePolicy } from "@/hooks/use-policies";
import {
    format,
    subMonths,
    startOfMonth,
    endOfMonth,
    setDate,
    addDays,
    getYear,
    isSameMonth,
    subWeeks,
    startOfWeek,
    endOfWeek,
    isWithinInterval,
    getDate,
    subDays,
    addWeeks,
    differenceInCalendarWeeks,
    isSameDay,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { PayCycleFrequency, Policy } from "@/types/policy";
import { cn } from "@/lib/utils";

const DEFAULT_PAYROLL_CONFIG = {
    frequency: PayCycleFrequency.MONTHLY,
    runDay: "LAST",
    runDayAnchor: undefined as string | undefined,
    cutoffDaysBeforePayDay: 5,
};

const DAY_MAP: Record<string, number> = {
    SUN: 0,
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6,
};

interface SalaryPeriodQuickSelectProps {
    companyId: string;
    employeeId?: string | null;
    onRangeSelect: (start: string, end: string, fullPeriod?: any) => void;
    currentStart?: string;
    currentEnd?: string;
    timezone?: string;
    manualPolicy?: Policy | null;
    className?: string;
}

export function SalaryPeriodQuickSelect({
    companyId,
    employeeId,
    onRangeSelect,
    currentStart,
    currentEnd,
    timezone = "UTC",
    manualPolicy,
    className,
}: SalaryPeriodQuickSelectProps) {
    const [open, setOpen] = useState(false);
    const { data: defaultPolicy, isLoading: isLoadingDefault } = useCompanyPolicy(companyId);
    const {
        data: effectiveData,
        isLoading: isLoadingEffective,
    } = useEffectivePolicy(employeeId || null);

    const isLoading = isLoadingDefault || (!!employeeId && isLoadingEffective);
    const policy =
        manualPolicy ||
        (employeeId ? (effectiveData?.effective as unknown as Policy) : defaultPolicy);
    const payrollConfig = policy?.settings?.payrollConfiguration || DEFAULT_PAYROLL_CONFIG;

    const periods = useMemo(() => {
        const today = toZonedTime(new Date(), timezone);
        const result = [];
        const frequency = payrollConfig.frequency;
        const cutoff = parseInt(payrollConfig.cutoffDaysBeforePayDay as any) || 0;

        if (frequency === PayCycleFrequency.MONTHLY) {
            const { runDay } = payrollConfig;
            const day = parseInt(runDay) || 0;

            // Helper to determine the period for a given date based on runDay
            const getPeriodForDate = (referenceDate: Date) => {
                let start: Date;
                let end: Date;

                if (day === 0 || day >= 28 || runDay === "LAST") {
                    // Full month mechanism (e.g. 1st to 30th/31st)
                    start = startOfMonth(referenceDate);
                    end = endOfMonth(referenceDate);
                } else {
                    // Split month mechanism (e.g. 26th to 25th)
                    end = setDate(referenceDate, day);
                    // Start is previous month's day + 1
                    const prevMonth = subMonths(referenceDate, 1);
                    start = addDays(setDate(prevMonth, day), 1);
                }

                const attendanceEnd = subDays(end, cutoff);
                const prevPeriodEnd =
                    day === 0 || day >= 28 || runDay === "LAST"
                        ? endOfMonth(subMonths(referenceDate, 1))
                        : setDate(subMonths(referenceDate, 1), day);
                const attendanceStart = addDays(subDays(prevPeriodEnd, cutoff), 1);

                return {
                    start: format(start, "yyyy-MM-dd"),
                    end: format(end, "yyyy-MM-dd"),
                    attendanceStart: format(attendanceStart, "yyyy-MM-dd"),
                    attendanceEnd: format(attendanceEnd, "yyyy-MM-dd"),
                    payDay: format(end, "yyyy-MM-dd"),
                    label: `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`,
                    monthLabel: format(end, "MMMM"),
                    year: getYear(end),
                    endObj: end,
                };
            };

            for (let i = -2; i < 60; i++) {
                const periodDate = subMonths(today, i);
                const periodData = getPeriodForDate(periodDate);

                let status = "past";
                if (
                    isWithinInterval(today, {
                        start: new Date(periodData.start),
                        end: new Date(periodData.end),
                    })
                ) {
                    status = "current";
                } else if (new Date(periodData.start) > today) {
                    status = "upcoming";
                }

                result.push({
                    ...periodData,
                    key: `${periodData.start}_${periodData.end}`,
                    status,
                    fullLabel: `${periodData.monthLabel} ${periodData.year} ${periodData.label}`,
                });
            }
        } else if (frequency === PayCycleFrequency.WEEKLY) {
            const targetDay = DAY_MAP[payrollConfig.runDay] ?? 5; // Default to Friday
            const weekStartsOn = ((targetDay + 1) % 7) as any;

            for (let i = -2; i < 52; i++) {
                const refDate = subWeeks(today, i);
                const start = startOfWeek(refDate, { weekStartsOn });
                const end = endOfWeek(refDate, { weekStartsOn });

                const attendanceEnd = subDays(end, cutoff);
                const prevPeriodEnd = subDays(start, 1);
                const attendanceStart = addDays(subDays(prevPeriodEnd, cutoff), 1);

                let status = "past";
                if (isWithinInterval(today, { start, end })) {
                    status = "current";
                } else if (start > today) {
                    status = "upcoming";
                }

                result.push({
                    start: format(start, "yyyy-MM-dd"),
                    end: format(end, "yyyy-MM-dd"),
                    attendanceStart: format(attendanceStart, "yyyy-MM-dd"),
                    attendanceEnd: format(attendanceEnd, "yyyy-MM-dd"),
                    payDay: format(end, "yyyy-MM-dd"),
                    label: `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`,
                    monthLabel: format(end, "MMM"),
                    year: getYear(end),
                    endObj: end,
                    key: `${format(start, "yyyy-MM-dd")}_${format(end, "yyyy-MM-dd")}`,
                    status,
                    fullLabel: `${format(end, "MMM")} Week ${Math.ceil(getDate(end) / 7)} ${getYear(end)}`,
                });
            }
        } else if (frequency === PayCycleFrequency.BI_WEEKLY) {
            const anchor = payrollConfig.runDayAnchor
                ? new Date(payrollConfig.runDayAnchor)
                : new Date("2024-01-05"); // Default anchor (a Friday)

            const diffInWeeks = Math.floor(differenceInCalendarWeeks(today, anchor) / 2);

            for (let i = -2; i < 26; i++) {
                const end = addWeeks(anchor, (diffInWeeks - i) * 2);
                const start = addDays(subWeeks(end, 2), 1);

                const attendanceEnd = subDays(end, cutoff);
                const prevPeriodEnd = subDays(start, 1);
                const attendanceStart = addDays(subDays(prevPeriodEnd, cutoff), 1);

                let status = "past";
                if (isWithinInterval(today, { start, end })) {
                    status = "current";
                } else if (start > today) {
                    status = "upcoming";
                }

                result.push({
                    start: format(start, "yyyy-MM-dd"),
                    end: format(end, "yyyy-MM-dd"),
                    attendanceStart: format(attendanceStart, "yyyy-MM-dd"),
                    attendanceEnd: format(attendanceEnd, "yyyy-MM-dd"),
                    payDay: format(end, "yyyy-MM-dd"),
                    label: `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`,
                    monthLabel: format(end, "MMM"),
                    year: getYear(end),
                    endObj: end,
                    key: `${format(start, "yyyy-MM-dd")}_${format(end, "yyyy-MM-dd")}`,
                    status,
                    fullLabel: `Bi-Weekly ${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`,
                });
            }
        } else if (frequency === PayCycleFrequency.DAILY) {
            for (let i = -2; i < 90; i++) {
                const day = subDays(today, i);
                const start = day;
                const end = day;

                const attendanceEnd = subDays(end, cutoff);
                const prevPeriodEnd = subDays(start, 1);
                const attendanceStart = addDays(subDays(prevPeriodEnd, cutoff), 1);

                let status = "past";
                if (isWithinInterval(today, { start, end })) {
                    status = "current";
                } else if (start > today) {
                    status = "upcoming";
                }

                result.push({
                    start: format(start, "yyyy-MM-dd"),
                    end: format(end, "yyyy-MM-dd"),
                    attendanceStart: format(attendanceStart, "yyyy-MM-dd"),
                    attendanceEnd: format(attendanceEnd, "yyyy-MM-dd"),
                    payDay: format(end, "yyyy-MM-dd"),
                    label: format(start, "MMM d, yyyy"),
                    monthLabel: format(start, "MMM"),
                    year: getYear(start),
                    endObj: end,
                    key: format(start, "yyyy-MM-dd"),
                    status,
                    fullLabel: format(start, "MMMM d, yyyy"),
                });
            }
        } else if (frequency === PayCycleFrequency.SEMI_MONTHLY) {
            const periodsToGenerate = 24; // Generate periods for 1 year (24 halves) + 2 upcoming
            const generatedPeriods: any[] = [];

            for (let m = -2; m < periodsToGenerate / 2; m++) { // Iterate through months
                const refMonth = subMonths(today, m);

                // First half (1st to 15th)
                const s1 = startOfMonth(refMonth);
                const e1 = setDate(refMonth, 15);

                // Second half (16th to End)
                const s2 = setDate(refMonth, 16);
                const e2 = endOfMonth(refMonth);

                // Add periods in chronological order (first half then second half)
                // For past periods, we want to show them in reverse chronological order (most recent first)
                // For upcoming, we want to show them in chronological order
                const currentMonthPeriods = [
                    { start: s1, end: e1, labelSuffix: "H1" },
                    { start: s2, end: e2, labelSuffix: "H2" }
                ];

                currentMonthPeriods.forEach((p) => {
                    let status = "past";
                    if (isWithinInterval(today, { start: p.start, end: p.end })) {
                        status = "current";
                    } else if (p.start > today) {
                        status = "upcoming";
                    }

                    const attendanceEnd = subDays(p.end, cutoff);
                    const prevPeriodEnd = subDays(p.start, 1);
                    const attendanceStart = addDays(subDays(prevPeriodEnd, cutoff), 1);

                    generatedPeriods.push({
                        start: format(p.start, "yyyy-MM-dd"),
                        end: format(p.end, "yyyy-MM-dd"),
                        attendanceStart: format(attendanceStart, "yyyy-MM-dd"),
                        attendanceEnd: format(attendanceEnd, "yyyy-MM-dd"),
                        payDay: format(p.end, "yyyy-MM-dd"),
                        label: `${format(p.start, "MMM d")} - ${format(p.end, "MMM d, yyyy")}`,
                        monthLabel: format(p.end, "MMMM"),
                        year: getYear(p.end),
                        endObj: p.end,
                        key: `${format(p.start, "yyyy-MM-dd")}_${format(p.end, "yyyy-MM-dd")}`,
                        status,
                        fullLabel: `${format(p.end, "MMMM")} ${p.labelSuffix} ${getYear(p.end)}`,
                    });
                });
            }
            // Sort periods to ensure correct chronological order for display, especially for upcoming/current
            // and reverse chronological for past.
            // A simpler approach for generation is to generate all, then sort.
            // For now, let's just push and rely on the status filtering later.
            result.push(...generatedPeriods.sort((a, b) => b.endObj.getTime() - a.endObj.getTime()));
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
                onRangeSelect(current.start, current.end, current);
            }
        }
    }, [periods, currentStart, currentEnd, onRangeSelect]);

    if (isLoading) {
        return <div className="h-10 w-full md:w-[240px] rounded-xl bg-muted/50 animate-pulse" />;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full md:w-[280px] justify-between h-10 rounded-xl px-3 font-normal border-border hover:bg-muted/50 transition-all bg-background", className)}
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
            <PopoverContent
                className="w-[300px] p-0 rounded-2xl shadow-xl border border-border/60 bg-white dark:bg-neutral-900 z-[100] outline-none"
                align="start"
                side="bottom"
                sideOffset={8}
                onWheel={(e) => e.stopPropagation()}
                onPointerDownCapture={(e) => e.stopPropagation()}
            >
                <Command className="rounded-2xl border-none">
                    <CommandInput placeholder="Search month or year..." className="h-11 text-xs" />
                    <CommandList
                        className="h-[320px] max-h-[400px] overflow-y-auto py-1 custom-scrollbar"
                    >
                        <CommandEmpty>No period found.</CommandEmpty>
                        <CommandGroup heading="Recent & Upcoming">
                            {periods.filter(p => ['current', 'upcoming'].includes(p.status)).map((period) => (
                                <CommandItem
                                    key={period.key}
                                    value={period.fullLabel}
                                    onSelect={() => {
                                        onRangeSelect(period.start, period.end, period);
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
                        <CommandGroup heading="Historical Periods">
                            {periods.filter(p => p.status === 'past').map((period) => (
                                <CommandItem
                                    key={period.key}
                                    value={period.fullLabel}
                                    onSelect={() => {
                                        onRangeSelect(period.start, period.end, period);
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
