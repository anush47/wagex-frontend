"use client";

import React, { useEffect, useMemo } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IconCalendarStats } from "@tabler/icons-react";
import { useCompanyPolicy } from "@/hooks/use-policies";
import { format, subMonths, startOfMonth, endOfMonth, setDate, isAfter, addDays, isBefore } from "date-fns";
import { PayCycleFrequency } from "@/types/policy";

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

        const getPeriodDates = (referenceDate: Date) => {
            let start: Date;
            let end: Date;

            if (day === 0 || day >= 28) {
                // Full month (End of month or 1st-style)
                start = startOfMonth(referenceDate);
                end = endOfMonth(referenceDate);
            } else {
                // Split month (e.g. 26th to 25th)
                // Determine which period we're in
                const runDayThisMonth = setDate(referenceDate, day);

                if (isBefore(referenceDate, runDayThisMonth) || referenceDate.getDate() === day) {
                    // We're in the period ending on runDay of this month
                    // Period runs from (runDay + 1) of last month to runDay of this month
                    const lastMonth = subMonths(referenceDate, 1);
                    start = addDays(setDate(lastMonth, day), 1);
                    end = setDate(referenceDate, day);
                } else {
                    // We're after runDay, so in the period ending next month
                    // Period runs from (runDay + 1) of this month to runDay of next month
                    start = addDays(setDate(referenceDate, day), 1);
                    const nextMonth = new Date(referenceDate);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    end = setDate(nextMonth, day);
                }
            }

            return {
                start: format(start, "yyyy-MM-dd"),
                end: format(end, "yyyy-MM-dd"),
                label: `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
            };
        };

        // Generate current + last 2 periods (3 total)
        for (let i = 0; i < 3; i++) {
            // For split months, we need to go back by the period, not just by month
            let periodDate: Date;

            if (i === 0) {
                periodDate = today;
            } else {
                // Go back by i months to get previous periods
                periodDate = subMonths(today, i);
            }

            const periodData = getPeriodDates(periodDate);
            result.push({
                ...periodData,
                key: i === 0 ? "current" : `period_${i}`,
                displayName: i === 0 ? "Current Period" : i === 1 ? "Last Period" : "2 Periods Ago"
            });
        }

        return result;
    }, [payrollConfig]);

    // Set default to current period on mount if no dates are selected
    useEffect(() => {
        if (periods.length > 0 && !currentStart && !currentEnd) {
            const currentPeriod = periods[0];
            console.log("SalaryPeriodQuickSelect: Auto-selecting current period", currentPeriod);
            onRangeSelect(currentPeriod.start, currentPeriod.end);
        }
    }, [periods, currentStart, currentEnd, onRangeSelect]);

    // Debug logging
    useEffect(() => {
        console.log("SalaryPeriodQuickSelect state:", {
            isLoading,
            hasPayrollConfig: !!payrollConfig,
            frequency: payrollConfig?.frequency,
            runDay: payrollConfig?.runDay,
            periodsCount: periods.length,
            currentStart,
            currentEnd
        });
    }, [isLoading, payrollConfig, periods, currentStart, currentEnd]);

    if (isLoading) {
        return (
            <div className="w-full md:w-[200px] h-9 rounded-xl bg-muted/50 animate-pulse" />
        );
    }

    if (!payrollConfig) {
        console.warn("SalaryPeriodQuickSelect: No payroll config found");
        return null;
    }

    if (payrollConfig.frequency !== PayCycleFrequency.MONTHLY) {
        console.warn("SalaryPeriodQuickSelect: Non-monthly frequency not supported", payrollConfig.frequency);
        return null;
    }

    if (periods.length === 0) {
        console.error("SalaryPeriodQuickSelect: No periods generated");
        return null;
    }

    const currentValue = `${currentStart}_${currentEnd}`;
    const selectedValue = periods.find(p => `${p.start}_${p.end}` === currentValue)?.key || "custom";

    console.log("SalaryPeriodQuickSelect: Rendering with", { selectedValue, periodsCount: periods.length });

    return (
        <Select
            value={selectedValue}
            onValueChange={(val) => {
                console.log("SalaryPeriodQuickSelect: Period changed to", val);
                const p = periods.find(period => period.key === val);
                if (p) {
                    console.log("SalaryPeriodQuickSelect: Selecting period", p);
                    onRangeSelect(p.start, p.end);
                }
            }}
        >
            <SelectTrigger
                className="w-full md:w-[200px] rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm h-9 text-xs font-bold transition-all hover:border-primary/30"
                onClick={() => console.log("SalaryPeriodQuickSelect: Trigger clicked")}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <IconCalendarStats className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">
                        {selectedValue === "custom" ? "Custom Range" : periods.find(p => p.key === selectedValue)?.displayName || "Select Period"}
                    </span>
                </div>
            </SelectTrigger>
            <SelectContent className="w-[280px] z-[100]" position="popper" sideOffset={4}>
                {periods.map((p, idx) => (
                    <SelectItem key={p.key} value={p.key} className="text-xs py-2.5 cursor-pointer">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">
                                    {p.displayName}
                                </span>
                                {idx === 0 && (
                                    <span className="bg-primary/10 text-primary text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wide">
                                        Active
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium">
                                {p.label}
                            </span>
                        </div>
                    </SelectItem>
                ))}
                <div className="border-t border-border my-1" />
                <SelectItem value="custom" className="text-xs italic text-muted-foreground py-2" disabled>
                    Custom Selection
                </SelectItem>
            </SelectContent>
        </Select>
    );
}
