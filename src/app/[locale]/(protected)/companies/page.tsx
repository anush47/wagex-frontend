"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    IconBuildingSkyscraper,
    IconPlus,
    IconArrowRight,
    IconMapPin,
    IconCalendar,
    IconSearch,
    IconChevronLeft,
    IconChevronRight,
    IconLoader2
} from "@tabler/icons-react";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { useCompanies } from "@/hooks/useCompanies";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";

export default function CompaniesPage() {
    const t = useTranslations("Companies");
    const common = useTranslations("Common");

    // Pagination & Search State
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const limit = 6;

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data: response, isLoading, isFetching } = useCompanies({
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
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[250px] md:h-[300px] rounded-[1.5rem] md:rounded-[2rem] bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-foreground">
                        {t("title")}
                    </h1>
                    <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-medium max-w-xl leading-relaxed">
                        {t("description")}
                    </p>
                </div>
                <Link href="/companies/new" className="w-full md:w-auto">
                    <Button className="w-full md:w-auto h-11 md:h-12 px-6 rounded-xl md:rounded-2xl text-sm md:text-base font-black shadow-lg hover:-translate-y-1 active:translate-y-0.5 transition-all duration-300 gap-2">
                        <IconPlus className="h-4 w-4 md:h-5 md:w-5" />
                        {t("establishNew")}
                    </Button>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full sm:max-w-md group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-primary transition-colors">
                        {isFetching && searchInput !== search ? (
                            <IconLoader2 className="h-full w-full animate-spin text-primary" />
                        ) : (
                            <IconSearch className="h-full w-full" />
                        )}
                    </div>
                    <Input
                        placeholder={t("searchPlaceholder")}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-12 h-11 md:h-12 rounded-xl md:rounded-2xl border-none bg-white dark:bg-neutral-900 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgb(0,0,0,0.2)] focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Companies Grid */}
            <div className="relative min-h-[400px]">
                <AnimatePresence>
                    {isFetching && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-x-0 top-0 bottom-0 z-10 flex items-center justify-center bg-white/40 dark:bg-neutral-950/40 backdrop-blur-[2px] rounded-[2rem] transition-all duration-300"
                        >
                            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-neutral-100 dark:border-neutral-800">
                                <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">Searching...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {companies.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4"
                    >
                        <div className="h-20 w-20 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-2">
                            <IconSearch className="h-10 w-10 text-neutral-300" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-neutral-900 dark:text-white">
                                {search ? "No matches found" : t("noCompanies")}
                            </h3>
                            <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                                {search
                                    ? "We couldn't find any companies matching your search criteria. Try adjusting your filters."
                                    : "You haven't added any companies yet. Click the button above to get started."}
                            </p>
                        </div>
                        {search && (
                            <Button
                                variant="outline"
                                onClick={() => setSearchInput("")}
                                className="h-10 rounded-xl px-4 text-xs font-bold"
                            >
                                Clear search
                            </Button>
                        )}
                    </motion.div>
                ) : (
                    <div className={cn(
                        "grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 transition-all duration-500",
                        isFetching && "blur-[1px]"
                    )}>
                        {companies.map((company: any) => (
                            <Card key={company.id} className="group flex flex-col h-full border-none shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgb(0,0,0,0.22)] bg-white dark:bg-neutral-900/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-1">
                                <CardContent className="p-5 md:p-6 flex flex-col flex-1 space-y-4 md:space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                                            {company.logo ? (
                                                <img src={company.logo} alt={company.name} className="h-7 w-7 md:h-9 md:w-9 object-contain" />
                                            ) : (
                                                <IconBuildingSkyscraper className="h-5 w-5 md:h-7 md:w-7 text-neutral-400" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="rounded-full font-bold uppercase tracking-tighter text-[9px] px-2 py-0.5 bg-primary/10 text-primary border-none">Active</Badge>
                                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{company.employerNumber}</span>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-black tracking-tight group-hover:text-primary transition-colors line-clamp-1">{company.name}</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <IconMapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-neutral-400 mt-0.5 shrink-0" />
                                            <p className="text-xs md:text-sm font-medium text-neutral-500 leading-relaxed line-clamp-2">{company.address}</p>
                                        </div>
                                        {company.startedDate && (
                                            <div className="flex items-center gap-2">
                                                <IconCalendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-neutral-400 shrink-0" />
                                                <p className="text-xs md:text-sm font-bold text-neutral-500">
                                                    {common("since")} {new Date(company.startedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2.5 pt-2 mt-auto">
                                        <Link href={`/companies/${company.id}/employees`} className="flex-1">
                                            <Button variant="outline" className="w-full h-10 md:h-12 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all">
                                                {common("employees")}
                                            </Button>
                                        </Link>
                                        <Link href={`/companies/${company.id}`} className="flex-1">
                                            <Button className="w-full h-10 md:h-12 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-black transition-all group/btn">
                                                {common("actions")}
                                                <IconArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {meta && meta.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-6 pb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl hover:bg-white dark:hover:bg-neutral-900 shadow-sm"
                        >
                            <IconChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                                <Button
                                    key={p}
                                    variant={page === p ? "default" : "ghost"}
                                    onClick={() => setPage(p)}
                                    className={cn(
                                        "h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl font-black text-xs transition-all",
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
                            onClick={() => setPage(page + 1)}
                            className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl hover:bg-white dark:hover:bg-neutral-900 shadow-sm"
                        >
                            <IconChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
