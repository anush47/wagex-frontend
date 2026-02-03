"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    IconBuildingSkyscraper,
    IconPlus,
    IconArrowRight,
    IconMapPin,
    IconCalendar,
    IconDotsVertical,
    IconSearch,
    IconChevronLeft,
    IconChevronRight
} from "@tabler/icons-react";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { useCompanies } from "@/hooks/useCompanies";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function CompaniesPage() {
    const t = useTranslations("Companies");
    const common = useTranslations("Common");

    // Pagination & Search State
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const limit = 6;

    const { data: response, isLoading } = useCompanies({
        page,
        limit,
        search
    });

    const companyData = (response as any)?.data;
    const companies = companyData?.data || [];
    const meta = companyData?.meta || response?.meta;

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto py-6 space-y-8 md:space-y-12">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 md:h-12 w-32 md:w-48 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                    <div className="h-4 md:h-6 w-full max-w-sm bg-neutral-100 dark:bg-neutral-900 rounded-lg" />
                </div>
                <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[300px] md:h-[400px] rounded-[1.5rem] md:rounded-[2.5rem] bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground">
                        {t("title")}
                    </h1>
                    <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 font-medium max-w-xl leading-relaxed">
                        {t("description")}
                    </p>
                </div>
                <Link href="/companies/new" className="w-full md:w-auto">
                    <Button className="w-full md:w-auto h-12 md:h-14 px-8 rounded-2xl md:rounded-3xl text-sm md:text-base font-black shadow-lg hover:-translate-y-1 active:translate-y-0.5 transition-all duration-300 gap-2">
                        <IconPlus className="h-5 w-5" />
                        {t("establishNew")}
                    </Button>
                </Link>
            </div>

            {/* Search & Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full sm:max-w-md group">
                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder={common("search") || "Search companies..."}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1); // Reset to first page on search
                        }}
                        className="pl-12 h-12 md:h-14 rounded-2xl md:rounded-3xl border-none bg-white dark:bg-neutral-900 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgb(0,0,0,0.2)] focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Companies Grid */}
            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {companies.map((company: any) => (
                    <Card key={company.id} className="group border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgb(0,0,0,0.3)] bg-white dark:bg-neutral-900/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-1">
                        <CardContent className="p-6 md:p-8 space-y-6 md:space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl md:rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    {company.logo ? (
                                        <img src={company.logo} alt={company.name} className="h-8 w-8 md:h-10 md:w-10 object-contain" />
                                    ) : (
                                        <IconBuildingSkyscraper className="h-6 w-6 md:h-8 md:w-8 text-neutral-400" />
                                    )}
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full text-neutral-400 h-8 w-8 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                    <IconDotsVertical className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="rounded-full font-bold uppercase tracking-tighter text-[10px] px-3 py-1 bg-primary/10 text-primary border-none">Active</Badge>
                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{company.employerNumber}</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black tracking-tight group-hover:text-primary transition-colors line-clamp-1">{company.name}</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <IconMapPin className="h-4 w-4 md:h-5 md:w-5 text-neutral-400 mt-0.5 shrink-0" />
                                    <p className="text-xs md:text-sm font-medium text-neutral-500 leading-relaxed line-clamp-2">{company.address}</p>
                                </div>
                                {company.startedDate && (
                                    <div className="flex items-center gap-3">
                                        <IconCalendar className="h-4 w-4 md:h-5 md:w-5 text-neutral-400 shrink-0" />
                                        <p className="text-xs md:text-sm font-bold text-neutral-500">
                                            {common("since")} {new Date(company.startedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Link href={`/companies/${company.id}/employees`} className="flex-1">
                                    <Button variant="outline" className="w-full h-11 md:h-14 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all">
                                        {common("employees")}
                                    </Button>
                                </Link>
                                <Link href={`/companies/${company.id}`} className="flex-1">
                                    <Button className="w-full h-11 md:h-14 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold bg-neutral-900 text-white dark:bg-white dark:text-black transition-all group/btn">
                                        {common("actions")}
                                        <IconArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Add New Card (only on first page or when list is short) */}
                {(!meta || page === 1) && companies.length < limit && (
                    <Link href="/companies/new" className="block h-full min-h-[300px] md:min-h-[400px]">
                        <div className="h-full rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-dashed border-neutral-100 dark:border-neutral-800 hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-500 group flex flex-col items-center justify-center p-10 text-center">
                            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-neutral-50 dark:bg-neutral-900 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500 flex items-center justify-center mb-6">
                                <IconPlus className="h-8 w-8 md:h-10 md:w-10 text-neutral-300 group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-neutral-300 group-hover:text-neutral-500 transition-colors mb-2">{common("create")}</h3>
                            <p className="text-xs md:text-sm font-medium text-neutral-400 group-hover:text-neutral-500 transition-colors">{t("createDescription")}</p>
                        </div>
                    </Link>
                )}
            </div>

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-10 pb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="h-12 w-12 rounded-2xl md:rounded-3xl hover:bg-white dark:hover:bg-neutral-900 shadow-sm"
                    >
                        <IconChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                            <Button
                                key={p}
                                variant={page === p ? "default" : "ghost"}
                                onClick={() => setPage(p)}
                                className={cn(
                                    "h-12 w-12 rounded-2xl md:rounded-3xl font-black text-sm transition-all",
                                    page === p ? "shadow-lg scale-110" : "text-neutral-400 hover:bg-white dark:hover:bg-neutral-900"
                                )}
                            >
                                {p}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={page === meta.totalPages}
                        onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                        className="h-12 w-12 rounded-2xl md:rounded-3xl hover:bg-white dark:hover:bg-neutral-900 shadow-sm"
                    >
                        <IconChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            )}
        </div>
    );
}
