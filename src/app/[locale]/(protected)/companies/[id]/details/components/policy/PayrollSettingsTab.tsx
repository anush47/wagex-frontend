
import { useState, useEffect } from "react";
import { PayCycleFrequency, PayrollCalculationMethod, PayrollSettingsConfig, UnpaidLeaveAction, LateDeductionType } from "@/types/policy";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { IconCalendarTime, IconCalculator, IconCheck, IconInfoCircle, IconAlertCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface PayrollSettingsTabProps {
    value?: PayrollSettingsConfig;
    onChange: (val: PayrollSettingsConfig) => void;
}

const DEFAULT_CONFIG: PayrollSettingsConfig = {
    frequency: PayCycleFrequency.MONTHLY,
    runDay: "LAST",
    cutoffDaysBeforePayDay: 5,
    calculationMethod: PayrollCalculationMethod.HOURLY_ATTENDANCE_WITH_OT,
    baseRateDivisor: 30,
    autoDeductUnpaidLeaves: false,
    unpaidLeaveAction: UnpaidLeaveAction.DEDUCT_FROM_TOTAL,
    lateDeductionType: LateDeductionType.DIVISOR_BASED,
    lateDeductionValue: 8
};

export function PayrollSettingsTab({ value, onChange }: PayrollSettingsTabProps) {
    const [config, setConfig] = useState<PayrollSettingsConfig>(value || DEFAULT_CONFIG);

    useEffect(() => {
        if (value) setConfig(value);
    }, [value]);

    const handleChange = (field: keyof PayrollSettingsConfig, val: any) => {
        let newConfig = { ...config, [field]: val };

        if (field === 'frequency') {
            const freq = val as PayCycleFrequency;
            if (freq === PayCycleFrequency.DAILY) {
                newConfig.runDay = "DAILY";
            } else if (freq === PayCycleFrequency.WEEKLY || freq === PayCycleFrequency.BI_WEEKLY) {
                if (!['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].includes(newConfig.runDay) || newConfig.runDay === 'DAILY') {
                    newConfig.runDay = "FRI"; // Default to Friday
                }
            } else {
                if (['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].includes(newConfig.runDay) || newConfig.runDay === 'DAILY') {
                    newConfig.runDay = "LAST";
                }
            }
        }

        setConfig(newConfig);
        onChange(newConfig);
    };

    const isWeekly = config.frequency === PayCycleFrequency.WEEKLY || config.frequency === PayCycleFrequency.BI_WEEKLY;
    const isDaily = config.frequency === PayCycleFrequency.DAILY;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* Left Column */}
                <div className="space-y-6">
                    {/* 1. Cycle & Timing Card */}
                    <Card className="border-none shadow-none bg-muted/50 rounded-3xl">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-neutral-500">
                                <IconCalendarTime className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Pay Cycle Rules</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Frequency */}
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Cycle Frequency</Label>
                                <Select
                                    value={config.frequency}
                                    onValueChange={(v) => handleChange("frequency", v as PayCycleFrequency)}
                                >
                                    <SelectTrigger className="bg-background border-none h-12 rounded-xl text-base font-medium shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value={PayCycleFrequency.MONTHLY}>Monthly</SelectItem>
                                        <SelectItem value={PayCycleFrequency.WEEKLY}>Weekly</SelectItem>
                                        <SelectItem value={PayCycleFrequency.BI_WEEKLY}>Bi-Weekly</SelectItem>
                                        <SelectItem value={PayCycleFrequency.DAILY}>Daily</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Run Day Logic */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!isDaily && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">
                                            {isWeekly ? "Pay Day (Day of Week)" : "Pay Day (Date)"}
                                        </Label>
                                        {isWeekly ? (
                                            <Select
                                                value={config.runDay}
                                                onValueChange={(v) => handleChange("runDay", v)}
                                            >
                                                <SelectTrigger className="bg-background border-none h-12 rounded-xl font-medium shadow-sm">
                                                    <SelectValue placeholder="Select day" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="MON">Monday</SelectItem>
                                                    <SelectItem value="TUE">Tuesday</SelectItem>
                                                    <SelectItem value="WED">Wednesday</SelectItem>
                                                    <SelectItem value="THU">Thursday</SelectItem>
                                                    <SelectItem value="FRI">Friday</SelectItem>
                                                    <SelectItem value="SAT">Saturday</SelectItem>
                                                    <SelectItem value="SUN">Sunday</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Select
                                                value={config.runDay}
                                                onValueChange={(v) => handleChange("runDay", v)}
                                            >
                                                <SelectTrigger className="bg-background border-none h-12 rounded-xl font-medium shadow-sm">
                                                    <SelectValue placeholder="Select date" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl max-h-[300px]">
                                                    <SelectItem value="LAST" className="font-bold text-primary">Last Day of Month</SelectItem>
                                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                        <SelectItem key={day} value={day.toString()}>{day}{[1, 21, 31].includes(day) ? "st" : [2, 22].includes(day) ? "nd" : [3, 23].includes(day) ? "rd" : "th"}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">Attendance Cutoff</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min={0}
                                            max={30}
                                            value={config.cutoffDaysBeforePayDay}
                                            onChange={(e) => handleChange("cutoffDaysBeforePayDay", parseInt(e.target.value) || 0)}
                                            className="h-12 bg-background border-none rounded-xl font-bold px-4 shadow-sm pr-20"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400 pointer-events-none">
                                            days before
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-background/50 p-4 rounded-xl flex gap-3 text-xs text-muted-foreground leading-relaxed border border-border">
                                <IconInfoCircle className="w-5 h-5 flex-shrink-0 text-neutral-400" />
                                <span>
                                    <strong>Cutoff Logic:</strong> Attendance is calculated up to {config.cutoffDaysBeforePayDay} days before the Pay Day.
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Deduction Rules Card */}
                    <Card className="border-none shadow-none bg-muted/50 rounded-3xl">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <IconAlertCircle className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Deduction Rules</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Auto Deduct Unpaid Leaves */}
                            <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-transparent shadow-sm">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold block">Auto-Deduct Unpaid Leaves</Label>
                                    <p className="text-xs text-neutral-500">Calculate and deduct amount for absent days.</p>
                                </div>
                                <Switch
                                    checked={config.autoDeductUnpaidLeaves}
                                    onCheckedChange={(v) => handleChange("autoDeductUnpaidLeaves", v)}
                                />
                            </div>

                            {/* Unpaid Leave Action */}
                            {config.autoDeductUnpaidLeaves && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-sm font-bold">Unpaid Leave Treatment</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { value: UnpaidLeaveAction.DEDUCT_FROM_TOTAL, label: "Reduce from Earnings", desc: "Subtracts directly" },
                                            { value: UnpaidLeaveAction.ADD_AS_DEDUCTION, label: "Show as Deduction", desc: "Adds line item" },
                                        ].map((opt) => (
                                            <div
                                                key={opt.value}
                                                onClick={() => handleChange("unpaidLeaveAction", opt.value)}
                                                className={cn(
                                                    "cursor-pointer p-3 rounded-xl border-2 transition-all",
                                                    config.unpaidLeaveAction === opt.value
                                                        ? "border-primary bg-background shadow-md relative z-10"
                                                        : "border-transparent bg-background text-muted-foreground"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", config.unpaidLeaveAction === opt.value ? "border-primary" : "border-border")}>
                                                        {config.unpaidLeaveAction === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                                                    </div>
                                                    <span className="font-bold text-xs">{opt.label}</span>
                                                </div>
                                                <p className="text-[10px] pl-6 opacity-70">{opt.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Late Deduction Rate */}
                            <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-700/50">
                                <Label className="text-sm font-bold">Late Deduction Rules</Label>

                                {/* Toggle Calculation Type */}
                                <div className="bg-neutral-50 dark:bg-neutral-900/50 p-1 rounded-xl flex">
                                    {[
                                        { value: LateDeductionType.DIVISOR_BASED, label: "Divisor Based" },
                                        { value: LateDeductionType.FIXED_AMOUNT, label: "Fixed Amount" }
                                    ].map((type) => (
                                        <button
                                            key={type.value}
                                            onClick={() => handleChange("lateDeductionType", type.value)}
                                            className={cn(
                                                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                                config.lateDeductionType === type.value
                                                    ? "bg-background shadow-sm text-foreground"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Dynamic Input based on Type */}
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                    <Label className="text-xs font-medium text-neutral-500">
                                        {config.lateDeductionType === LateDeductionType.DIVISOR_BASED
                                            ? "Hourly Divisor (Factor)"
                                            : "Deduction Amount (per Hour)"}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={config.lateDeductionValue}
                                            onChange={(e) => handleChange("lateDeductionValue", parseFloat(e.target.value) || 0)}
                                            className="h-12 bg-background border-none rounded-xl font-bold px-4 shadow-sm pr-12"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 pointer-events-none">
                                            {config.lateDeductionType === LateDeductionType.DIVISOR_BASED ? "Hrs" : "LKR"}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 ml-1 leading-relaxed">
                                        {config.lateDeductionType === LateDeductionType.DIVISOR_BASED
                                            ? "Hourly Rate = (Basic Salary / Base Divisor) / This Value."
                                            : "Fixed deduction amount for every hour of late arrival."}
                                    </p>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>


                {/* Right Column */}
                <div className="space-y-6">
                    {/* 2. Calculation Logic Card */}
                    <Card className="border-none shadow-none bg-muted/50 rounded-3xl">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-neutral-500">
                                <IconCalculator className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Calculation Logic</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Method */}
                            <div className="space-y-3">
                                <Label className="text-sm font-bold">Processing Method</Label>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { value: PayrollCalculationMethod.HOURLY_ATTENDANCE_WITH_OT, label: "Hourly Attendance + OT", desc: "Pay based on hours worked. Divisor sets Hourly Rate." },
                                        { value: PayrollCalculationMethod.SHIFT_ATTENDANCE_WITH_OT, label: "Shift Attendance + OT", desc: "Pay based on shifts completed. Divisor sets Shift Rate." },
                                        { value: PayrollCalculationMethod.SHIFT_ATTENDANCE_FLAT, label: "Shift Attendance (Flat)", desc: "Pay based on shifts completed. Divisor sets Shift Rate." },
                                        { value: PayrollCalculationMethod.DAILY_ATTENDANCE_FLAT, label: "Daily Attendance (Flat)", desc: "Pay based on days present. Divisor sets Daily Rate." },
                                        { value: PayrollCalculationMethod.FIXED_MONTHLY_SALARY, label: "Fixed Monthly Salary", desc: "Fixed monthly amount. Divisor sets LOP deduction rate." }
                                    ].map((option) => (
                                        <div
                                            key={option.value}
                                            onClick={() => handleChange("calculationMethod", option.value)}
                                            className={cn(
                                                "cursor-pointer group relative p-4 bg-background border border-transparent rounded-2xl hover:border-border transition-all shadow-sm",
                                                config.calculationMethod === option.value && "ring-2 ring-primary border-transparent"
                                            )}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-bold text-sm text-foreground leading-tight">{option.label}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1">{option.desc}</p>
                                                </div>
                                                {config.calculationMethod === option.value && (
                                                    <div className="bg-primary text-primary-foreground rounded-full p-0.5">
                                                        <IconCheck className="w-3 h-3" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Divisor */}
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Base Rate Divisor</Label>
                                <div className="flex gap-3">
                                    {[30, 26, 22].map(divisor => (
                                        <div
                                            key={divisor}
                                            onClick={() => handleChange("baseRateDivisor", divisor)}
                                            className={cn(
                                                "flex-1 cursor-pointer h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all",
                                                config.baseRateDivisor === divisor
                                                    ? "bg-primary text-primary-foreground shadow-lg"
                                                    : "bg-background text-muted-foreground border border-transparent hover:border-border"
                                            )}
                                        >
                                            / {divisor}
                                        </div>
                                    ))}
                                    <div className="flex-[0.8] relative">
                                        <Input
                                            type="number"
                                            placeholder="Cus"
                                            value={[30, 26, 22].includes(config.baseRateDivisor) ? '' : config.baseRateDivisor}
                                            onChange={(e) => handleChange("baseRateDivisor", parseInt(e.target.value) || 30)}
                                            className={cn(
                                                "h-12 border-none rounded-xl text-center font-bold shadow-sm placeholder:text-muted-foreground",
                                                ![30, 26, 22].includes(config.baseRateDivisor)
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-background text-foreground"
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
