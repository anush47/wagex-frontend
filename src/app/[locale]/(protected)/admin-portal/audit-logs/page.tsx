"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconClipboardList } from "@tabler/icons-react";
import { useEmployerDashboard } from "@/hooks/use-dashboard";

export default function AuditLogsPage() {
    const t = useTranslations("Common");
    const { data: stats } = useEmployerDashboard();

    return (
        <div className="flex flex-col gap-8 pb-12">
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Admin Portal</p>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
                    Audit Logs
                </h1>
                <p className="text-neutral-500 font-bold">
                    Full history of system actions.
                </p>
            </div>

            <Card className="rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
                <CardHeader className="p-8 pb-4">
                     <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3 uppercase">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <IconClipboardList className="h-4 w-4" />
                        </div>
                        Detailed History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                    <div className="space-y-6">
                        {stats?.recentActivity?.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                                <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">No activity yet.</p>
                            </div>
                        ) : (
                            stats?.recentActivity?.map((act: any) => (
                                <div key={act.id} className="flex items-start gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4 last:border-0 last:pb-0">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <p className="text-sm font-black text-neutral-900 dark:text-white truncate uppercase tracking-tight">
                                                {act.action}
                                            </p>
                                            <span className="text-xs font-bold text-neutral-400 uppercase">
                                                {new Date(act.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-neutral-500 tracking-wide">
                                            {act.details}
                                        </p>
                                        <p className="text-[10px] font-bold text-neutral-400 mt-2">
                                            Actor ID: {act.userId} • Type: {act.type}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
