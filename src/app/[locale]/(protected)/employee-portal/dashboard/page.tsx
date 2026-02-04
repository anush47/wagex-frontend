"use client";

import { useAuthStore } from "@/stores/auth.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconLayoutDashboard, IconUser } from "@tabler/icons-react";

export default function EmployeeDashboard() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 text-primary">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <IconLayoutDashboard className="h-7 w-7" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight italic">Employee Portal</h1>
                </div>
                <p className="text-neutral-500 font-medium text-lg max-w-xl leading-relaxed">
                    Welcome back, <span className="text-foreground font-black underline decoration-primary/30 underline-offset-4">{user?.nameWithInitials || user?.fullName || "User"}</span>.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white overflow-hidden group">
                    <CardHeader className="p-8 pb-0">
                        <IconUser className="w-10 h-10 mb-4 opacity-50 group-hover:scale-110 transition-transform" />
                        <CardTitle className="text-xl font-black uppercase tracking-tight">Quick Access</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <p className="font-medium text-indigo-100 mb-6">View your profile and attendance records.</p>
                        <div className="h-1.5 w-12 bg-white/30 rounded-full" />
                    </CardContent>
                </Card>

                {/* Additional modules can be added here */}
                <div className="col-span-1 md:col-span-2 p-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-[3rem] border-2 border-dashed border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-black uppercase tracking-widest text-neutral-400 mb-2 italic">Module Pipeline</h3>
                    <p className="text-neutral-500 font-medium max-w-xs">New employee features like payslips and leave management are being processed.</p>
                </div>
            </div>
        </div>
    );
}
