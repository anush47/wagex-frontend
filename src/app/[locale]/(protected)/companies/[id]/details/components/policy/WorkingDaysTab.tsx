
import { useState, useEffect } from "react";
import { WorkingDaysConfig, WorkDayType, HalfDayShift, DailyWorkConfig } from "@/types/policy";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconCalendar, IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface WorkingDaysTabProps {
    value?: WorkingDaysConfig;
    onChange: (val: WorkingDaysConfig) => void;
}

const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const DEFAULT_DAY_CONFIG: DailyWorkConfig = {
    type: WorkDayType.FULL
};

const DEFAULT_CONFIG: WorkingDaysConfig = {
    // Default: Mon-Fri Full, Sat Half (First), Sun Off (common pattern)
    defaultPattern: {
        "MON": { type: WorkDayType.FULL },
        "TUE": { type: WorkDayType.FULL },
        "WED": { type: WorkDayType.FULL },
        "THU": { type: WorkDayType.FULL },
        "FRI": { type: WorkDayType.FULL },
        "SAT": { type: WorkDayType.HALF, halfDayShift: HalfDayShift.FIRST },
        "SUN": { type: WorkDayType.OFF }
    },
    isDynamic: false
};

export function WorkingDaysTab({ value, onChange }: WorkingDaysTabProps) {
    const [config, setConfig] = useState<WorkingDaysConfig>(value || DEFAULT_CONFIG);

    useEffect(() => {
        if (value) setConfig(value);
    }, [value]);

    const handleConfigChange = (newConfig: WorkingDaysConfig) => {
        setConfig(newConfig);
        onChange(newConfig);
    };

    const updateDayConfig = (
        dayKey: string,
        field: keyof DailyWorkConfig,
        val: any
    ) => {
        let newConfig = { ...config };

        // Update Default Pattern
        const currentDay = newConfig.defaultPattern?.[dayKey] || DEFAULT_DAY_CONFIG;
        const updatedDay = { ...currentDay, [field]: val };

        // Clean up if switch to full/off
        if (field === 'type' && val !== WorkDayType.HALF) {
            delete updatedDay.halfDayShift;
        } else if (field === 'type' && val === WorkDayType.HALF && !updatedDay.halfDayShift) {
            updatedDay.halfDayShift = HalfDayShift.FIRST;
        }

        newConfig.defaultPattern = {
            ...(newConfig.defaultPattern || DEFAULT_CONFIG.defaultPattern),
            [dayKey]: updatedDay
        };

        handleConfigChange(newConfig);
    };

    const DayRow = ({ day, configData }: { day: string, configData?: DailyWorkConfig }) => {
        const data = configData || { type: WorkDayType.FULL }; // Fallback

        return (
            <div className="flex items-center gap-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 px-2 rounded-lg transition-colors">
                <div className="w-16 font-bold text-sm text-muted-foreground">{day}</div>

                {/* Type Selection */}
                <div className="flex-1 flex gap-2">
                    {[
                        { val: WorkDayType.FULL, label: "Full Day", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
                        { val: WorkDayType.HALF, label: "Half Day", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
                        { val: WorkDayType.OFF, label: "Day Off", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
                    ].map((opt) => (
                        <button
                            key={opt.val}
                            onClick={() => updateDayConfig(day, 'type', opt.val)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2",
                                data.type === opt.val
                                    ? cn(opt.color, "border-transparent shadow-sm")
                                    : "bg-background border-transparent text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Half Day Specifics */}
                <div className="w-40 flex justify-end">
                    {data.type === WorkDayType.HALF ? (
                        <Select
                            value={data.halfDayShift || HalfDayShift.FIRST}
                            onValueChange={(v) => updateDayConfig(day, 'halfDayShift', v)}
                        >
                            <SelectTrigger className="h-8 text-xs bg-background border-input w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={HalfDayShift.FIRST}>First Half</SelectItem>
                                <SelectItem value={HalfDayShift.LAST}>Second Half</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="h-8" /> // Spacer
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                <Card className="border-none shadow-none bg-muted/50 rounded-3xl">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <IconCalendar className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Default Week Pattern</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-card rounded-xl border border-border p-2">
                            {DAYS_OF_WEEK.map(day => (
                                <DayRow
                                    key={day}
                                    day={day}
                                    configData={config.defaultPattern?.[day]}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Dynamic Config */}
                <Card className="border-none shadow-none bg-muted/50 rounded-3xl">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <IconInfoCircle className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Dynamic Rules</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="dynamic-mode" className="text-xs font-bold">Enable Weekly Overrides</Label>
                            <Switch
                                id="dynamic-mode"
                                checked={config.isDynamic}
                                onCheckedChange={(v) => handleConfigChange({ ...config, isDynamic: v })}
                            />
                        </div>
                    </CardHeader>
                    {config.isDynamic && (
                        <CardContent className="animate-in fade-in slide-in-from-top-4">
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 text-xs text-primary/80 leading-relaxed">
                                <IconInfoCircle className="w-5 h-5 flex-shrink-0" />
                                <span>
                                    <strong>Dynamic Mode Enabled:</strong> The default pattern above establishes the baseline. You can now override specific days directly on the Attendance Roster or Calendar for each week.
                                </span>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}
