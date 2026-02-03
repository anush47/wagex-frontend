"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBuildingSkyscraper, IconUsers, IconCalendarStats, IconArrowUpRight } from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const t = useTranslations("Common");
    const { user } = useAuthStore();

    return (
        <div className="flex flex-col gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-2 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">{t("dashboard")}</h1>
                <p className="text-muted-foreground text-sm md:text-lg">
                    Welcome back, <span className="text-foreground font-semibold">{user?.email}</span>
                </p>
            </div>

            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="rounded-[1.5rem] md:rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white dark:bg-neutral-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            {t("companies")}
                        </CardTitle>
                        <IconBuildingSkyscraper className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">12</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="text-emerald-500 font-bold">+2</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white dark:bg-neutral-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            {t("employees")}
                        </CardTitle>
                        <IconUsers className="h-5 w-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">450</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="text-emerald-500 font-bold">+15</span> new this week
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white dark:bg-neutral-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            Payroll Status
                        </CardTitle>
                        <IconCalendarStats className="h-5 w-5 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">Pending</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Finalize by Feb 28th
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <Card className="md:col-span-4 rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white dark:bg-neutral-900/50 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-xl font-black tracking-tight">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="h-12 w-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                        <IconBuildingSkyscraper className="h-6 w-6 text-neutral-400 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">
                                            New company registered
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Acme Global Holdings was added to your directory.
                                        </p>
                                    </div>
                                    <IconArrowUpRight className="h-5 w-5 text-neutral-300 group-hover:text-primary transition-colors" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white dark:bg-neutral-900/50">
                    <CardHeader>
                        <CardTitle className="text-xl font-black tracking-tight">Quick Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full h-14 rounded-2xl justify-start gap-3 font-bold border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 transition-all text-muted-foreground hover:text-foreground">
                            <IconBuildingSkyscraper className="h-5 w-5" />
                            Add Company
                        </Button>
                        <Button variant="outline" className="w-full h-14 rounded-2xl justify-start gap-3 font-bold border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 transition-all text-muted-foreground hover:text-foreground">
                            <IconUsers className="h-5 w-5" />
                            Import Employees
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
