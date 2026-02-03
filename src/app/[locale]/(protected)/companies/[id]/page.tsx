"use client";

import { use, useEffect, useState } from "react";
import { CompanyService } from "@/services/company.service";
import { Company } from "@/types/company";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    IconBuildingSkyscraper,
    IconMapPin,
    IconCalendar,
    IconId,
    IconUsers,
    IconChartBar
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const t = useTranslations("Companies");
    const common = useTranslations("Common");
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompany = async () => {
            if (!id) return;
            try {
                const response = await CompanyService.getCompany(id);
                if (response.data) {
                    setCompany(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch company", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [id]);

    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto py-6 space-y-8 animate-pulse">
                <div className="h-12 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2 h-[400px] bg-neutral-100 dark:bg-neutral-900 rounded-3xl" />
                    <div className="h-[400px] bg-neutral-100 dark:bg-neutral-900 rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!company) {
        return <div className="p-10 text-center font-bold text-neutral-500">Company not found</div>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">

            {/* Header / Banner Area */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 dark:from-white dark:via-neutral-100 dark:to-white p-8 md:p-12 text-white dark:text-neutral-900 shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                    <div className="h-24 w-24 md:h-32 md:w-32 rounded-3xl bg-white/10 dark:bg-black/5 backdrop-blur-md border border-white/20 dark:border-black/5 flex items-center justify-center shadow-inner">
                        {company.logo ? (
                            <img src={company.logo} alt={company.name} className="h-16 w-16 md:h-20 md:w-20 object-contain" />
                        ) : (
                            <IconBuildingSkyscraper className="h-10 w-10 md:h-14 md:w-14 text-white/50 dark:text-black/50" />
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">
                                {company.name}
                            </h1>
                            {company.active && (
                                <Badge className="bg-green-500/20 text-green-300 dark:text-green-700 dark:bg-green-500/20 border-none uppercase tracking-widest font-bold text-[10px] px-3">
                                    Active
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-white/60 dark:text-black/60 font-medium text-sm md:text-base">
                            {company.address && (
                                <div className="flex items-center gap-2">
                                    <IconMapPin className="h-5 w-5" />
                                    <span>{company.address}</span>
                                </div>
                            )}
                            {company.employerNumber && (
                                <div className="flex items-center gap-2">
                                    <IconId className="h-5 w-5" />
                                    <span className="uppercase tracking-wider">{company.employerNumber}</span>
                                </div>
                            )}
                            {company.startedDate && (
                                <div className="flex items-center gap-2">
                                    <IconCalendar className="h-5 w-5" />
                                    <span>{common("since")} {new Date(company.startedDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Overview Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatsCard
                            title="Total Employees"
                            value="--"
                            icon={<IconUsers className="h-6 w-6 text-blue-500" />}
                            description="Active employees in payroll"
                        />
                        <StatsCard
                            title="Last Payroll"
                            value="--"
                            icon={<IconChartBar className="h-6 w-6 text-green-500" />}
                            description="Processed on --/--/----"
                        />
                    </div>

                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgb(0,0,0,0.3)] bg-white dark:bg-neutral-900/40 backdrop-blur-xl rounded-[2rem]">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">About {company.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-neutral-500 font-medium leading-relaxed">
                                {company.address ?
                                    `Located at ${company.address}, ${company.name} has been operating since ${new Date(company.startedDate || Date.now()).getFullYear()}.` :
                                    "No additional details available for this company."
                                }
                            </p>
                            {/* Placeholder for future charts/activity */}
                            <div className="mt-8 h-48 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border-2 border-dashed border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-neutral-400 font-medium">
                                Activity Chart Placeholder
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions / Sidebar-like on Desktop */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgb(0,0,0,0.3)] bg-white dark:bg-neutral-900/40 backdrop-blur-xl rounded-[2rem] h-full">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm text-neutral-500 mb-4">Common tasks for this company.</p>
                            {/* Shortcuts could go here */}
                            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-medium text-sm text-neutral-600 dark:text-neutral-400">
                                Coming soon: Quick Payroll Run
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) {
    return (
        <Card className="border-none shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgb(0,0,0,0.2)] bg-white dark:bg-neutral-900/40 backdrop-blur-xl rounded-[1.5rem] hover:-translate-y-1 transition-transform cursor-default">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
                        {icon}
                    </div>
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">{title}</h4>
                    <div className="text-3xl font-black tracking-tight">{value}</div>
                    <p className="text-xs font-medium text-neutral-400">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
