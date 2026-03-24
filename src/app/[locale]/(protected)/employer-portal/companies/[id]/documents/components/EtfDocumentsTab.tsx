"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconDownload, IconActivity, IconSearch, IconFilter, IconX, IconRefresh } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const monthsNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export function EtfDocumentsTab() {
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [year, setYear] = React.useState(new Date().getFullYear());
    const [showFilters, setShowFilters] = React.useState(false);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1.5">
                    <h3 className="text-xl font-black tracking-tight uppercase text-foreground/90">ETF Contribution Reports</h3>
                    <p className="text-neutral-500 font-medium text-xs">Generate and download monthly ETF contribution schedules</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "h-10 rounded-xl px-4 font-bold text-xs uppercase transition-all gap-2",
                            showFilters ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                        )}
                    >
                        <IconFilter className="h-4 w-4" />
                        <span>Filters</span>
                    </Button>
                    <Button 
                        className="rounded-2xl h-10 px-6 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.05] active:scale-[0.95] transition-all bg-indigo-600 text-white"
                        disabled
                    >
                        <IconDownload className="mr-2 h-4 w-4 stroke-[3]" />
                        Download Forms
                    </Button>
                </div>
            </div>

            {showFilters && (
                <Card className="border-2 border-dashed border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-950/20 rounded-[2rem] p-8 animate-in slide-in-from-top-4 duration-300 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] pl-1">Compliance Period</Label>
                            <div className="flex gap-3">
                                <select 
                                    value={month}
                                    onChange={(e) => setMonth(parseInt(e.target.value))}
                                    className="flex-1 h-14 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-5 text-xs font-black uppercase tracking-wider focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                                >
                                    {monthsNames.map((m, i) => (
                                        <option key={i + 1} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                                <select 
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value))}
                                    className="w-32 h-14 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-5 text-xs font-black uppercase tracking-wider focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                                >
                                    {[2024, 2025, 2026].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] pl-1">Search ETF Filings</Label>
                            <div className="relative group">
                                <IconSearch className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                                <Input 
                                    placeholder="Reference number..." 
                                    className="pl-12 h-14 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-xs font-black uppercase tracking-wide focus:border-indigo-500/50 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="border border-neutral-200 dark:border-white/10 shadow-sm bg-white dark:bg-neutral-900/40 overflow-hidden rounded-[3rem] ring-1 ring-neutral-100 dark:ring-neutral-800/50">
                <CardContent className="p-0">
                    <div className="flex flex-col items-center justify-center py-32 text-center gap-8">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-[2.5rem] bg-indigo-500/5 flex items-center justify-center animate-pulse">
                                <IconActivity className="h-10 w-10 text-indigo-500/20" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-white dark:bg-neutral-800 shadow-xl flex items-center justify-center border border-neutral-100 dark:border-neutral-700">
                                <IconDownload className="h-5 w-5 text-indigo-500" />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="font-black text-3xl tracking-tighter uppercase text-foreground">
                                ETF Data Pending
                            </h3>
                            <p className="text-neutral-400 text-xs max-w-[280px] mx-auto font-bold uppercase tracking-widest leading-relaxed">
                                Salary calculations for {monthsNames[month - 1]} {year} must be finalized first.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <Button 
                                variant="outline"
                                size="lg"
                                className="h-16 px-12 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] border-2 border-neutral-100 dark:border-neutral-800 opacity-60 cursor-not-allowed"
                                disabled
                            >
                                <IconRefresh className="mr-3 h-5 w-5 stroke-[2]" />
                                Finalize Payroll
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
