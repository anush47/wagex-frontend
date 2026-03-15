
import { useState, useEffect } from "react";
import { PayCycleFrequency, PayrollCalculationMethod, PayrollSettingsConfig, LateDeductionType } from "@/types/policy";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { IconCalendarTime, IconCalculator, IconCheck, IconInfoCircle, IconAlertCircle, IconPlus, IconTrash, IconChevronUp, IconChevronDown, IconClock, IconLayersIntersect } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OvertimeDayType, OvertimeRule, OvertimeTier } from "@/types/policy";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

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
    unpaidLeaveFullDayType: LateDeductionType.DIVISOR_BASED,
    unpaidLeaveFullDayValue: 1,
    unpaidLeaveHalfDayType: LateDeductionType.DIVISOR_BASED,
    unpaidLeaveHalfDayValue: 0.5,
    unpaidLeavesAffectTotalEarnings: false,
    autoDeductLate: false,
    lateDeductionsAffectTotalEarnings: false,
    lateDeductionType: LateDeductionType.DIVISOR_BASED,
    lateDeductionValue: 8,
    lateDeductionGraceMinutes: 0,
    otHourlyType: LateDeductionType.DIVISOR_BASED,
    otHourlyValue: 8,
    enableAutoDraft: false,
    draftCreationDaysBeforePayDay: 3,
    autoAcknowledgePayments: false,
    otRules: []
};

export function PayrollSettingsTab({ value, onChange }: PayrollSettingsTabProps) {
    const [config, setConfig] = useState<PayrollSettingsConfig>(value || DEFAULT_CONFIG);

    useEffect(() => {
        if (value) {
            setConfig({
                ...DEFAULT_CONFIG,
                ...value
            });
        }
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
                    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-muted/50 rounded-3xl">
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
                                            value={config.cutoffDaysBeforePayDay ?? 0}
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
                    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-muted/50 rounded-3xl">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <IconAlertCircle className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Deduction Rules</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* 1. Unpaid Leaves Section */}
                            <div className="space-y-4">
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

                                {config.autoDeductUnpaidLeaves && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        {/* Indented Sub-options */}
                                        <div className="pl-6 space-y-4 border-l-2 border-primary/10 ml-2">
                                            {/* Full Day Deduction */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-bold text-neutral-600">Full Day Unpaid Leave</Label>
                                                    <div className="bg-neutral-50 dark:bg-neutral-900/50 p-0.5 rounded-lg flex w-48">
                                                        {[
                                                            { value: LateDeductionType.DIVISOR_BASED, label: "Divisor" },
                                                            { value: LateDeductionType.FIXED_AMOUNT, label: "Fixed" }
                                                        ].map((type) => (
                                                            <button
                                                                key={type.value}
                                                                onClick={() => handleChange("unpaidLeaveFullDayType", type.value)}
                                                                className={cn(
                                                                    "flex-1 py-1 text-[9px] font-bold rounded-md transition-all",
                                                                    config.unpaidLeaveFullDayType === type.value
                                                                        ? "bg-background shadow-sm text-foreground"
                                                                        : "text-muted-foreground hover:text-foreground"
                                                                )}
                                                            >
                                                                {type.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        value={config.unpaidLeaveFullDayValue ?? 0}
                                                        onChange={(e) => handleChange("unpaidLeaveFullDayValue", parseFloat(e.target.value) || 0)}
                                                        className="h-10 bg-background border-none rounded-xl font-bold px-4 shadow-sm pr-12 text-sm"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400">
                                                        {config.unpaidLeaveFullDayType === LateDeductionType.DIVISOR_BASED ? "Days" : "LKR"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Half Day Deduction */}
                                            <div className="space-y-3 pt-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-bold text-neutral-600">Half Day Unpaid Leave</Label>
                                                    <div className="bg-neutral-50 dark:bg-neutral-900/50 p-0.5 rounded-lg flex w-48">
                                                        {[
                                                            { value: LateDeductionType.DIVISOR_BASED, label: "Divisor" },
                                                            { value: LateDeductionType.FIXED_AMOUNT, label: "Fixed" }
                                                        ].map((type) => (
                                                            <button
                                                                key={type.value}
                                                                onClick={() => handleChange("unpaidLeaveHalfDayType", type.value)}
                                                                className={cn(
                                                                    "flex-1 py-1 text-[9px] font-bold rounded-md transition-all",
                                                                    config.unpaidLeaveHalfDayType === type.value
                                                                        ? "bg-background shadow-sm text-foreground"
                                                                        : "text-muted-foreground hover:text-foreground"
                                                                )}
                                                            >
                                                                {type.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        value={config.unpaidLeaveHalfDayValue ?? 0}
                                                        onChange={(e) => handleChange("unpaidLeaveHalfDayValue", parseFloat(e.target.value) || 0)}
                                                        className="h-10 bg-background border-none rounded-xl font-bold px-4 shadow-sm pr-12 text-sm"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400">
                                                        {config.unpaidLeaveHalfDayType === LateDeductionType.DIVISOR_BASED ? "Days" : "LKR"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Statutory Toggle (Indented) */}
                                            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                                                <div className="space-y-0.5">
                                                    <Label className="text-[11px] font-bold block text-primary/80">Affects Total Earnings</Label>
                                                    <p className="text-[9px] text-muted-foreground leading-tight max-w-[200px]">Reduces statutory base (EPF/ETF).</p>
                                                </div>
                                                <Switch
                                                    size="sm"
                                                    className="scale-90"
                                                    checked={config.unpaidLeavesAffectTotalEarnings || false}
                                                    onCheckedChange={(v) => handleChange("unpaidLeavesAffectTotalEarnings", v)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 2. Late Arrivals Section */}
                            <div className="space-y-4 pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-transparent shadow-sm">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold block">Auto-Deduct Late Arrivals</Label>
                                        <p className="text-xs text-neutral-500">Calculate and deduct for late arrivals / early leaves.</p>
                                    </div>
                                    <Switch
                                        checked={config.autoDeductLate}
                                        onCheckedChange={(v) => handleChange("autoDeductLate", v)}
                                    />
                                </div>

                                {config.autoDeductLate && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="pl-6 space-y-4 border-l-2 border-primary/10 ml-2">
                                            {/* Grace Period */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-neutral-600">Late Grace Period (Minutes)</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={config.lateDeductionGraceMinutes ?? 0}
                                                        onChange={(e) => handleChange("lateDeductionGraceMinutes", parseInt(e.target.value) || 0)}
                                                        className="h-10 bg-background border-none rounded-xl font-bold px-4 shadow-sm pr-12 text-sm"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400">
                                                        Min
                                                    </span>
                                                </div>
                                                <p className="text-[9px] text-muted-foreground ml-1">No deduction if lateness is within this limit.</p>
                                            </div>

                                            {/* Statutory Toggle (Indented) */}
                                            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                                                <div className="space-y-0.5">
                                                    <Label className="text-[11px] font-bold block text-primary/80">Affects Total Earnings</Label>
                                                    <p className="text-[9px] text-muted-foreground leading-tight max-w-[200px]">Reduces statutory base (EPF/ETF).</p>
                                                </div>
                                                <Switch
                                                    size="sm"
                                                    className="scale-90"
                                                    checked={config.lateDeductionsAffectTotalEarnings || false}
                                                    onCheckedChange={(v) => handleChange("lateDeductionsAffectTotalEarnings", v)}
                                                />
                                            </div>

                                            {/* Hourly Rate Rule for Late (Indented) */}
                                            <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-900/50">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-bold text-neutral-600">Late Rate Rule</Label>
                                                    <div className="bg-neutral-50 dark:bg-neutral-900/50 p-0.5 rounded-lg flex w-48">
                                                        {[
                                                            { value: LateDeductionType.DIVISOR_BASED, label: "Divisor" },
                                                            { value: LateDeductionType.FIXED_AMOUNT, label: "Fixed" }
                                                        ].map((type) => (
                                                            <button
                                                                key={type.value}
                                                                onClick={() => handleChange("lateDeductionType", type.value)}
                                                                className={cn(
                                                                    "flex-1 py-1 text-[9px] font-bold rounded-md transition-all",
                                                                    config.lateDeductionType === type.value
                                                                        ? "bg-background shadow-sm text-foreground"
                                                                        : "text-muted-foreground hover:text-foreground"
                                                                )}
                                                            >
                                                                {type.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        value={config.lateDeductionValue ?? 0}
                                                        onChange={(e) => handleChange("lateDeductionValue", parseFloat(e.target.value) || 0)}
                                                        className="h-10 bg-background border-none rounded-xl font-bold px-4 shadow-sm pr-12 text-sm"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400">
                                                        {config.lateDeductionType === LateDeductionType.DIVISOR_BASED ? "Hrs" : "LKR"}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] text-muted-foreground ml-1">
                                                    {config.lateDeductionType === LateDeductionType.DIVISOR_BASED 
                                                        ? "Hourly Rate = (Basic / Base Divisor) / This Value" 
                                                        : "Fixed amount deducted per late/early hour."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>


                        </CardContent>
                    </Card>

                    {/* 4. Acknowledge Rules Card */}
                    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-muted/50 rounded-3xl">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-neutral-500">
                                <IconCheck className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Acknowledge Rules</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-transparent shadow-sm">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold block">Auto-Acknowledge Payments</Label>
                                    <p className="text-xs text-neutral-500">Payments will be automatically marked as acknowledged.</p>
                                </div>
                                <Switch
                                    checked={config.autoAcknowledgePayments || false}
                                    onCheckedChange={(v) => handleChange("autoAcknowledgePayments", v)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 5. Automation Card */}
                    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-muted/50 rounded-3xl">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-neutral-500">
                                <IconCalculator className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Automation</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-transparent shadow-sm">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold block">Auto-Create Draft Salaries</Label>
                                    <p className="text-xs text-neutral-500">Automatically generate draft salaries before payday.</p>
                                </div>
                                <Switch
                                    checked={config.enableAutoDraft || false}
                                    onCheckedChange={(v) => handleChange("enableAutoDraft", v)}
                                />
                            </div>

                            {config.enableAutoDraft && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-sm font-bold">Draft Creation Timing</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={30}
                                            value={config.draftCreationDaysBeforePayDay ?? 3}
                                            onChange={(e) => handleChange("draftCreationDaysBeforePayDay", parseInt(e.target.value) || 1)}
                                            className="h-12 bg-background border-none rounded-xl font-bold px-4 shadow-sm pr-20"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400 pointer-events-none">
                                            days before
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 ml-1">
                                        Drafts will be generated this many days before the scheduled payday.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>


                {/* Right Column */}
                <div className="space-y-6">
                    {/* 2. Calculation Logic Card */}
                    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-muted/50 rounded-3xl">
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
                            <div className="space-y-4">
                                <Label className="text-sm font-bold">Base Rate Divisor</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { value: 30, label: "30 Days", sub: "Shop & Office", tip: "(4 Wages Board)" },
                                        { value: 25, label: "25 Days", sub: "Wages Board Common", tip: null }
                                    ].map(divisor => (
                                        <div
                                            key={divisor.value}
                                            onClick={() => handleChange("baseRateDivisor", divisor.value)}
                                            className={cn(
                                                "cursor-pointer group relative p-4 bg-background border rounded-2xl transition-all shadow-sm",
                                                config.baseRateDivisor === divisor.value ? "ring-2 ring-primary border-primary" : "border-transparent hover:border-border"
                                            )}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-bold text-sm text-foreground leading-tight">/ {divisor.value}</h4>
                                                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">{divisor.sub}</p>
                                                    {divisor.tip && (
                                                        <p className="text-[9px] text-primary/70 font-bold mt-0.5">{divisor.tip}</p>
                                                    )}
                                                </div>
                                                {config.baseRateDivisor === divisor.value && (
                                                    <div className="bg-primary text-primary-foreground rounded-full p-0.5">
                                                        <IconCheck className="w-2.5 h-2.5" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Or Custom</span>
                                    <div className="flex-1 h-px bg-border" />
                                </div>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="Enter custom divisor..."
                                        value={[30, 25].includes(config.baseRateDivisor) ? '' : (config.baseRateDivisor ?? 30)}
                                        onChange={(e) => handleChange("baseRateDivisor", parseInt(e.target.value) || 30)}
                                        className={cn(
                                            "h-12 bg-background border-none rounded-xl text-center font-bold shadow-sm placeholder:text-muted-foreground",
                                            ![30, 25].includes(config.baseRateDivisor) && "ring-2 ring-primary"
                                        )}
                                    />
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">/</span>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                    
                    {/* 6. Overtime Policies Card */}
                    {config.calculationMethod.includes('_WITH_OT') ? (
                        <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-muted/50 rounded-3xl">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-neutral-500">
                                        <IconClock className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Overtime Policies</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => {
                                            const newRule: OvertimeRule = {
                                                id: uuidv4(),
                                                name: "Holiday Override",
                                                dayStatus: OvertimeDayType.ANY,
                                                isHoliday: true,
                                                holidayTypes: ['PUBLIC'],
                                                otEnabled: true,
                                                startAfterMinutes: 0,
                                                tiers: [{ thresholdMinutes: 0, multiplier: 2.0 }]
                                            };
                                            handleChange("otRules", [...(config.otRules || []), newRule]);
                                        }}
                                        className="h-8 rounded-xl text-xs font-bold gap-1 bg-background"
                                    >
                                        <IconPlus className="w-3 h-3" /> Add Holiday Override
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* OT Hourly Rate Calculation (Indented) */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-1 h-4 bg-primary rounded-full" />
                                        <h3 className="text-sm font-bold">Calculation Rule (OT Hourly)</h3>
                                    </div>
                                    <div className="pl-6 space-y-4 border-l-2 border-primary/10 ml-2">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-bold text-neutral-600">Hourly Rate Rule</Label>
                                                <div className="bg-neutral-50 dark:bg-neutral-900/50 p-0.5 rounded-lg flex w-48">
                                                    {[
                                                        { value: LateDeductionType.DIVISOR_BASED, label: "Divisor" },
                                                        { value: LateDeductionType.FIXED_AMOUNT, label: "Fixed" }
                                                    ].map((type) => (
                                                        <button
                                                            key={type.value}
                                                            onClick={() => handleChange("otHourlyType", type.value)}
                                                            className={cn(
                                                                "flex-1 py-1 text-[9px] font-bold rounded-md transition-all",
                                                                config.otHourlyType === type.value
                                                                    ? "bg-background shadow-sm text-foreground"
                                                                    : "text-muted-foreground hover:text-foreground"
                                                            )}
                                                        >
                                                            {type.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={config.otHourlyValue ?? 8}
                                                    onChange={(e) => handleChange("otHourlyValue", parseFloat(e.target.value) || 0)}
                                                    className="h-10 bg-background border-none rounded-xl font-bold px-4 shadow-sm pr-12 text-sm"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400">
                                                    {config.otHourlyType === LateDeductionType.DIVISOR_BASED ? "Hrs" : "LKR"}
                                                </span>
                                            </div>
                                            <p className="text-[9px] text-muted-foreground ml-1">
                                                {config.otHourlyType === LateDeductionType.DIVISOR_BASED 
                                                    ? "Base OT Hourly Rate = (Basic / Base Divisor) / This Value" 
                                                    : "Fixed amount used as base hourly rate for OT."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* A. Daily Defaults (Non-Holiday) */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-1 h-4 bg-primary rounded-full" />
                                        <h3 className="text-sm font-bold">Workday Defaults</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { status: OvertimeDayType.WORKING_DAY, label: "Full Day", defaultStart: 480 },
                                            { status: OvertimeDayType.HALF_DAY, label: "Half Day", defaultStart: 360 },
                                            { status: OvertimeDayType.OFF_DAY, label: "Off Day", defaultStart: 0 }
                                        ].map((defaultType) => {
                                            // Only show "Affect Total Earnings" for Off Day
                                            const showAffectToggle = defaultType.status === OvertimeDayType.OFF_DAY;
                                            
                                            const ruleIdx = (config.otRules || []).findIndex(r => r.dayStatus === defaultType.status && !r.isHoliday);
                                            let rule = ruleIdx !== -1 ? config.otRules![ruleIdx] : null;

                                            const updateRule = (updated: Partial<OvertimeRule>) => {
                                                const newRules = [...(config.otRules || [])];
                                                if (ruleIdx !== -1) {
                                                    newRules[ruleIdx] = { ...rule!, ...updated };
                                                } else {
                                                    newRules.push({
                                                        id: uuidv4(),
                                                        name: defaultType.label,
                                                        dayStatus: defaultType.status,
                                                        isHoliday: false,
                                                        otEnabled: true,
                                                        startAfterMinutes: defaultType.defaultStart,
                                                        tiers: [{ thresholdMinutes: 0, multiplier: 1.5 }],
                                                        ...updated
                                                    });
                                                }
                                                handleChange("otRules", newRules);
                                            };

                                            return (
                                                <div key={defaultType.status} className="bg-background rounded-2xl border border-border p-3 space-y-3">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-xs font-bold text-foreground min-w-[80px]">{defaultType.label}</span>
                                                        <div className="flex-1 flex items-center justify-end gap-3 px-3 py-1 bg-muted/30 rounded-xl border border-border/50">
                                                            <div className="flex items-center gap-2">
                                                                <Label className="text-[10px] text-muted-foreground uppercase whitespace-nowrap">OT Starts After</Label>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Input
                                                                        type="number"
                                                                        value={(rule ? rule.startAfterMinutes : defaultType.defaultStart) ?? 0}
                                                                        onChange={(e) => updateRule({ startAfterMinutes: parseInt(e.target.value) || 0 })}
                                                                        className="h-7 w-24 text-xs font-bold rounded-lg text-center bg-background"
                                                                    />
                                                                    <span className="text-[10px] font-bold text-muted-foreground">m</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {showAffectToggle && (
                                                        <div className="flex items-center justify-between px-3 py-2 bg-muted/20 rounded-xl border border-border/50">
                                                            <div className="flex items-center gap-2">
                                                                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Affect Total Earnings</Label>
                                                                <Badge variant="outline" className="text-[8px] h-4 px-1">For EPF/ETF Base</Badge>
                                                            </div>
                                                            <Switch
                                                                checked={rule?.affectTotalEarnings ?? true}
                                                                onCheckedChange={(v) => updateRule({ affectTotalEarnings: v })}
                                                                className="scale-75"
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    <div className="space-y-3">
                                                            {/* Tiers List */}
                                                            <div className="space-y-3 pt-2 mt-2 border-t border-dashed border-neutral-100 dark:border-neutral-800">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-[9px] text-muted-foreground uppercase font-bold">Rate Tiers</Label>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        onClick={() => {
                                                                            const newTiers = rule ? [...rule!.tiers] : [{ thresholdMinutes: 0, multiplier: 1.5 }];
                                                                            // Add a new tier with a sensible default (e.g., +4 hours from last tier)
                                                                            const lastThreshold = newTiers[newTiers.length - 1].thresholdMinutes;
                                                                            newTiers.push({ thresholdMinutes: lastThreshold + 240, multiplier: newTiers[newTiers.length - 1].multiplier + 0.5 });
                                                                            updateRule({ tiers: newTiers });
                                                                        }}
                                                                        className="h-5 text-[8px] px-1.5 font-bold gap-1 bg-muted/50 hover:bg-muted"
                                                                    >
                                                                        <IconPlus className="w-2.5 h-2.5" /> Add Tier
                                                                    </Button>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    {(rule ? rule.tiers : [{ thresholdMinutes: 0, multiplier: 1.5 }]).map((tier, tIdx) => (
                                                                        <div key={tIdx} className="group relative flex items-center gap-2 bg-muted/20 p-2 rounded-xl border border-transparent hover:border-border transition-all">
                                                                            {tIdx === 0 ? (
                                                                                <div className="flex-1 flex items-center justify-between">
                                                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Base</span>
                                                                                    <div className="flex items-center gap-1">
                                                                                        <Input 
                                                                                            type="number"
                                                                                            step="0.1"
                                                                                            value={tier.multiplier ?? 1.5}
                                                                                            onChange={(e) => {
                                                                                                const newTiers = rule ? [...rule!.tiers] : [{ thresholdMinutes: 0, multiplier: 1.5 }];
                                                                                                newTiers[0] = { ...newTiers[0], multiplier: parseFloat(e.target.value) || 0 };
                                                                                                updateRule({ tiers: newTiers });
                                                                                            }}
                                                                                            className="h-7 w-16 text-[10px] font-bold rounded-lg p-1 text-right text-primary bg-background"
                                                                                        />
                                                                                        <span className="text-[9px] text-primary font-bold">x</span>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    <div className="flex-1 space-y-1">
                                                                                        <Label className="text-[7px] text-muted-foreground uppercase font-bold">After (Min)</Label>
                                                                                        <Input 
                                                                                            type="number"
                                                                                            value={tier.thresholdMinutes ?? 0}
                                                                                            onChange={(e) => {
                                                                                                const newTiers = [...rule!.tiers];
                                                                                                newTiers[tIdx] = { ...newTiers[tIdx], thresholdMinutes: parseInt(e.target.value) || 0 };
                                                                                                updateRule({ tiers: newTiers });
                                                                                            }}
                                                                                            className="h-7 text-[10px] font-bold rounded-lg p-1"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="flex-1 space-y-1">
                                                                                        <Label className="text-[7px] text-muted-foreground uppercase font-bold">Rate</Label>
                                                                                        <div className="flex items-center gap-1">
                                                                                            <Input 
                                                                                                type="number"
                                                                                                step="0.1"
                                                                                                value={tier.multiplier ?? 1.0}
                                                                                                onChange={(e) => {
                                                                                                    const newTiers = [...rule!.tiers];
                                                                                                    newTiers[tIdx] = { ...newTiers[tIdx], multiplier: parseFloat(e.target.value) || 0 };
                                                                                                    updateRule({ tiers: newTiers });
                                                                                                }}
                                                                                                className="h-7 w-16 text-[10px] font-bold rounded-lg p-1 text-right text-primary bg-background"
                                                                                            />
                                                                                            <span className="text-[9px] text-primary font-bold">x</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <Button 
                                                                                        variant="ghost" 
                                                                                        size="icon" 
                                                                                        className="h-6 w-6 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                        onClick={() => {
                                                                                            const newTiers = rule!.tiers.filter((_, i) => i !== tIdx);
                                                                                            updateRule({ tiers: newTiers });
                                                                                        }}
                                                                                    >
                                                                                        <IconTrash className="w-3 h-3" />
                                                                                    </Button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* B. Holiday Overrides */}
                                <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-1 h-4 bg-orange-500 rounded-full" />
                                        <h3 className="text-sm font-bold">Holiday Overrides</h3>
                                    </div>

                                    <div className="space-y-3">
                                        {(config.otRules || []).filter(r => r.isHoliday).length === 0 ? (
                                            <div className="text-center py-6 bg-background/30 rounded-2xl border border-dashed border-border">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium">No special holiday overrides defined.</p>
                                            </div>
                                        ) : (
                                            (config.otRules || []).filter(r => r.isHoliday).map((rule, idx) => (
                                                <div key={rule.id} className="bg-background rounded-2xl border border-border p-4 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex gap-2">
                                                            {['PUBLIC', 'MERCANTILE', 'BANK'].map(type => {
                                                                const active = rule.holidayTypes?.includes(type);
                                                                return (
                                                                    <Badge 
                                                                        key={type}
                                                                        onClick={() => {
                                                                            const current = rule.holidayTypes || [];
                                                                            const next = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
                                                                            const newRules = [...(config.otRules || [])];
                                                                            const globalIdx = newRules.findIndex(r => r.id === rule.id);
                                                                            newRules[globalIdx] = { ...rule, holidayTypes: next };
                                                                            handleChange("otRules", newRules);
                                                                        }}
                                                                        className={cn(
                                                                            "cursor-pointer text-[9px] h-5 transition-all",
                                                                            active ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground hover:bg-neutral-200 dark:bg-neutral-800"
                                                                        )}
                                                                    >
                                                                        {type}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-6 w-6 text-muted-foreground hover:text-red-500"
                                                            onClick={() => {
                                                                const newRules = (config.otRules || []).filter(r => r.id !== rule.id);
                                                                handleChange("otRules", newRules);
                                                            }}
                                                        >
                                                            <IconTrash className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-3">
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Start OT At</Label>
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        type="number"
                                                                        value={rule.startAfterMinutes}
                                                                        onChange={(e) => {
                                                                            const newRules = [...(config.otRules || [])];
                                                                            const globalIdx = newRules.findIndex(r => r.id === rule.id);
                                                                            newRules[globalIdx] = { ...rule, startAfterMinutes: parseInt(e.target.value) || 0 };
                                                                            handleChange("otRules", newRules);
                                                                        }}
                                                                        className="h-8 text-xs font-bold rounded-lg text-right"
                                                                    />
                                                                    <span className="text-[10px] text-muted-foreground font-bold">min</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Base Rate</Label>
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        type="number"
                                                                        step="0.1"
                                                                        value={rule.tiers[0].multiplier}
                                                                        onChange={(e) => {
                                                                            const newRules = [...(config.otRules || [])];
                                                                            const globalIdx = newRules.findIndex(r => r.id === rule.id);
                                                                            const newTiers = [...rule!.tiers];
                                                                            newTiers[0] = { ...newTiers[0], multiplier: parseFloat(e.target.value) || 0 };
                                                                            newRules[globalIdx] = { ...rule, tiers: newTiers };
                                                                            handleChange("otRules", newRules);
                                                                        }}
                                                                        className="h-8 text-xs font-bold rounded-lg text-right text-primary"
                                                                    />
                                                                    <span className="text-[10px] text-primary font-bold">x</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1.5 pt-2 border-t border-border">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Affect Total Earnings</Label>
                                                                    <Switch
                                                                        checked={rule.affectTotalEarnings ?? true}
                                                                        onCheckedChange={(v) => {
                                                                            const newRules = [...(config.otRules || [])];
                                                                            const globalIdx = newRules.findIndex(r => r.id === rule.id);
                                                                            newRules[globalIdx] = { ...rule, affectTotalEarnings: v };
                                                                            handleChange("otRules", newRules);
                                                                        }}
                                                                        className="scale-75"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 space-y-4 pl-4 border-l border-neutral-100 dark:border-neutral-800">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <Label className="text-[9px] text-muted-foreground uppercase font-bold">Rate Tiers</Label>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    onClick={() => {
                                                                        const newRules = [...(config.otRules || [])];
                                                                        const globalIdx = newRules.findIndex(r => r.id === rule.id);
                                                                        const newTiers = [...rule!.tiers];
                                                                        const lastThreshold = newTiers[newTiers.length - 1].thresholdMinutes;
                                                                        newTiers.push({ thresholdMinutes: lastThreshold + 240, multiplier: newTiers[newTiers.length - 1].multiplier + 0.5 });
                                                                        newRules[globalIdx] = { ...rule, tiers: newTiers };
                                                                        handleChange("otRules", newRules);
                                                                    }}
                                                                    className="h-5 text-[8px] px-1.5 font-bold gap-1 bg-muted/50 hover:bg-muted"
                                                                >
                                                                    <IconPlus className="w-2.5 h-2.5" /> Add Tier
                                                                </Button>
                                                            </div>
                                                            
                                                            <div className="space-y-2">
                                                                {rule.tiers.map((tier, tIdx) => (
                                                                    <div key={tIdx} className="group relative bg-muted/20 p-2 rounded-xl border border-transparent hover:border-border transition-all">
                                                                        {tIdx === 0 ? (
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-[8px] uppercase text-muted-foreground font-bold">Base Rate</span>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Input 
                                                                                        type="number"
                                                                                        step="0.1"
                                                                                        value={tier.multiplier}
                                                                                        onChange={(e) => {
                                                                                            const newRules = [...(config.otRules || [])];
                                                                                            const globalIdx = newRules.findIndex(r => r.id === rule.id);
                                                                                            const newTiers = [...rule!.tiers];
                                                                                            newTiers[0] = { ...newTiers[0], multiplier: parseFloat(e.target.value) || 0 };
                                                                                            newRules[globalIdx] = { ...rule, tiers: newTiers };
                                                                                            handleChange("otRules", newRules);
                                                                                        }}
                                                                                        className="h-6 w-10 text-[10px] font-bold rounded-lg p-1 text-right text-primary"
                                                                                    />
                                                                                    <span className="text-[8px] text-primary font-bold">x</span>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="space-y-2">
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className="text-[8px] uppercase text-muted-foreground">After</span>
                                                                                    <div className="flex items-center gap-1">
                                                                                        <Input 
                                                                                            type="number"
                                                                                            value={tier.thresholdMinutes}
                                                                                            onChange={(e) => {
                                                                                                const newRules = [...(config.otRules || [])];
                                                                                                const globalIdx = newRules.findIndex(r => r.id === rule.id);
                                                                                                const newTiers = [...rule!.tiers];
                                                                                                newTiers[tIdx] = { ...newTiers[tIdx], thresholdMinutes: parseInt(e.target.value) || 0 };
                                                                                                newRules[globalIdx] = { ...rule, tiers: newTiers };
                                                                                                handleChange("otRules", newRules);
                                                                                            }}
                                                                                            className="h-6 w-12 text-[10px] font-bold rounded-lg p-1 text-right"
                                                                                        />
                                                                                        <span className="text-[8px] text-muted-foreground">m</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className="text-[8px] uppercase text-muted-foreground">Rate</span>
                                                                                    <div className="flex items-center gap-1">
                                                                                        <Input 
                                                                                            type="number"
                                                                                            step="0.1"
                                                                                            value={tier.multiplier}
                                                                                            onChange={(e) => {
                                                                                                const newRules = [...(config.otRules || [])];
                                                                                                const globalIdx = newRules.findIndex(r => r.id === rule.id);
                                                                                                const newTiers = [...rule!.tiers];
                                                                                                newTiers[tIdx] = { ...newTiers[tIdx], multiplier: parseFloat(e.target.value) || 0 };
                                                                                                newRules[globalIdx] = { ...rule, tiers: newTiers };
                                                                                                handleChange("otRules", newRules);
                                                                                            }}
                                                                                            className="h-6 w-12 text-[10px] font-bold rounded-lg p-1 text-right text-primary"
                                                                                        />
                                                                                        <span className="text-[8px] text-primary font-bold">x</span>
                                                                                    </div>
                                                                                </div>
                                                                                <Button 
                                                                                    variant="ghost" 
                                                                                    size="icon" 
                                                                                    className="absolute -top-1 -right-1 h-5 w-5 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 bg-background shadow-sm border rounded-full transition-all"
                                                                                    onClick={() => {
                                                                                        const newRules = [...(config.otRules || [])];
                                                                                        const globalIdx = newRules.findIndex(r => r.id === rule.id);
                                                                                        const newTiers = rule.tiers.filter((_, i) => i !== tIdx);
                                                                                        newRules[globalIdx] = { ...rule, tiers: newTiers };
                                                                                        handleChange("otRules", newRules);
                                                                                    }}
                                                                                >
                                                                                    <IconTrash className="w-2.5 h-2.5" />
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-muted/30 rounded-3xl opacity-60">
                            <CardContent className="flex flex-col items-center justify-center py-10 gap-2">
                                <IconInfoCircle className="w-6 h-6 text-muted-foreground" />
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">OT Settings Locked</p>
                                <p className="text-[10px] text-muted-foreground">Select an Attendance-with-OT method to enable policies.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
