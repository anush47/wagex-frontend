
import { PolicySettings } from "@/types/policy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { IconClock, IconCalendarStats, IconCoin, IconSettings } from "@tabler/icons-react";
import { ShiftsSection } from "./policy/ShiftsSection";

interface PoliciesTabProps {
    settings: PolicySettings;
    onChange: (settings: PolicySettings) => void;
}

export function PoliciesTab({ settings, onChange }: PoliciesTabProps) {

    // Helper to update specific section
    const updateShifts = (shifts: any) => {
        onChange({ ...settings, shifts });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-600 shadow-inner">
                    <IconSettings className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-black tracking-tight">Policy Configuration</h3>
                    <p className="text-sm text-neutral-500">Manage automation rules for attendance and payroll.</p>
                </div>
            </div>

            <Tabs defaultValue="shifts" className="w-full">
                <TabsList className="bg-transparent p-0 mb-6 gap-2 flex-wrap h-auto justify-start">
                    <TabsTrigger
                        value="shifts"
                        className="rounded-xl px-6 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                    >
                        <IconClock className="w-4 h-4 mr-2" />
                        Shifts & Hours
                    </TabsTrigger>
                    <TabsTrigger
                        value="attendance"
                        disabled
                        className="rounded-xl px-6 py-3 opacity-50 cursor-not-allowed bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                    >
                        <IconCalendarStats className="w-4 h-4 mr-2" />
                        Attendance Rules
                    </TabsTrigger>
                    <TabsTrigger
                        value="payroll"
                        disabled
                        className="rounded-xl px-6 py-3 opacity-50 cursor-not-allowed bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                    >
                        <IconCoin className="w-4 h-4 mr-2" />
                        Payroll Defaults
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="shifts" className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <ShiftsSection
                        value={settings.shifts || { list: [] }}
                        onChange={updateShifts}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
