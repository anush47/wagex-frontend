"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { 
    IconPlus, 
    IconFileText, 
    IconDownload, 
    IconChevronRight,
    IconRefresh,
    IconSearch, 
    IconChevronLeft,
    IconInfoCircle,
    IconX
} from "@tabler/icons-react";
import { useEpf } from "@/hooks/use-statutory";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { GenerateEpfDialog } from "./GenerateEpfDialog";
import { EpfDetailsDialog } from "./EpfDetailsDialog";
import { EpfRecord } from "@/types/statutory";
import { toast } from "sonner";

const monthsNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];



import { Input } from "@/components/ui/input";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const EpfTab = () => {
    const params = useParams();
    const companyId = params.id as string;
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [month, setMonth] = useState<string>("ALL");
    const [year, setYear] = useState<string>("ALL");
    const [debouncedYear, setDebouncedYear] = useState<string>("ALL");
    const [page, setPage] = useState(1);
    
    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Debounce year
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedYear(year);
        }, 500);
        return () => clearTimeout(timer);
    }, [year]);
 
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<EpfRecord | null>(null);

    const { epfRecordsQuery, deleteEpfMutation } = useEpf({
        companyId,
        month: month === "ALL" ? undefined : parseInt(month),
        year: debouncedYear === "ALL" || !debouncedYear ? undefined : parseInt(debouncedYear),
        search: debouncedSearch || undefined,
        page,
        limit: 10,
    });

    const records = epfRecordsQuery.data?.items || [];
    const totalRecords = epfRecordsQuery.data?.total || 0;
    const totalPages = Math.ceil(totalRecords / 10);

    const getMonthName = (m: number) => monthsNames[m - 1];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight uppercase text-foreground/90">EPF Submissions</h3>
                    <p className="text-neutral-500 font-medium text-xs">Manage monthly EPF contributions and payment slips</p>
                </div>
                <Button 
                    onClick={() => setIsGenerateOpen(true)}
                    className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <IconPlus className="mr-2 h-5 w-5" />
                    Generate EPF
                </Button>
            </div>

            <Card className="border border-neutral-200 dark:border-white/20 shadow-sm bg-background dark:bg-neutral-900/50 overflow-hidden rounded-[2rem]">
                <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <IconFileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground">EPF History</CardTitle>
                                    <p className="text-xs font-medium text-muted-foreground">View and search past submissions.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="rounded-xl h-10 w-10"
                                    onClick={() => epfRecordsQuery.refetch()}
                                    disabled={epfRecordsQuery.isFetching}
                                >
                                    <IconRefresh className={`h-4 w-4 ${epfRecordsQuery.isFetching ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <div className="relative w-full md:w-[300px]">
                                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input 
                                    placeholder="Search ref, remarks, period..." 
                                    className="pl-10 h-11 rounded-xl border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 focus:ring-primary/20 font-bold text-xs"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                />
                                {search && (
                                    <button 
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        <IconX className="h-3 w-3" />
                                    </button>
                                )}
                            </div>

                            <Select 
                                value={month} 
                                onValueChange={(v) => {
                                    setMonth(v);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="h-11 w-full md:w-[150px] rounded-xl border-neutral-200 dark:border-neutral-800 font-bold text-xs">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="ALL" className="font-bold text-xs">All Months</SelectItem>
                                    {monthsNames.map((m, i) => (
                                        <SelectItem key={m} value={(i + 1).toString()} className="font-bold text-xs">
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="relative w-full md:w-[120px]">
                                <Input
                                    type="number"
                                    placeholder="Year"
                                    min={1900}
                                    max={2500}
                                    className="h-11 rounded-xl border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 focus:ring-primary/20 font-bold text-xs"
                                    value={year === "ALL" ? "" : year}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "") {
                                            setYear("ALL");
                                        } else {
                                            const num = parseInt(val);
                                            if (!isNaN(num)) {
                                                setYear(val);
                                            }
                                        }
                                        setPage(1);
                                    }}
                                />
                                {year !== "ALL" && (
                                    <span className="absolute -top-6 left-0 text-[10px] font-black uppercase text-neutral-400">Year Filter</span>
                                )}
                            </div>

                            {(search || month !== "ALL" || year !== "ALL") && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-11 px-4 font-black text-[10px] uppercase text-neutral-500 hover:text-primary rounded-xl"
                                    onClick={() => {
                                        setSearch("");
                                        setMonth("ALL");
                                        setYear("ALL");
                                        setPage(1);
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {epfRecordsQuery.isLoading ? (
                        <div className="p-20 flex justify-center">
                            <IconRefresh className="h-8 w-8 animate-spin text-primary/20" />
                        </div>
                    ) : records.length === 0 ? (
                        <div className="rounded-xl p-20 flex flex-col items-center justify-center text-center gap-2">
                            <div className="h-16 w-16 rounded-3xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center mb-2">
                                <IconFileText className="h-8 w-8 text-neutral-300" />
                            </div>
                            <p className="text-sm font-bold text-neutral-500">No EPF submission records found.</p>
                            <p className="text-xs text-neutral-400">Try changing the period or generate a new submission.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
                                        <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-wider text-neutral-500">Period</TableHead>
                                        <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-wider text-neutral-500">Ref Number</TableHead>
                                        <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-wider text-neutral-500 text-right">Total Contribution</TableHead>
                                        <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-wider text-neutral-500">Paid Date</TableHead>
                                        <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-wider text-neutral-500 text-center">Status</TableHead>
                                        <TableHead className="py-4 px-6 w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.map((record: any) => (
                                        <TableRow 
                                            key={record.id} 
                                            className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-0 cursor-pointer"
                                            onClick={() => setSelectedRecord(record)}
                                        >
                                            <TableCell className="py-4 px-6 font-bold text-sm">
                                                {getMonthName(record.month)} {record.year}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 font-mono text-xs text-neutral-500 uppercase">
                                                {record.referenceNo || "---"}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-right">
                                                <span className="font-black text-sm">
                                                    {record.totalContribution.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-neutral-500">
                                                {record.paidDate ? format(new Date(record.paidDate), "MMM d, yyyy") : "Pending"}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "font-black uppercase text-[10px] tracking-widest px-2 py-0.5 rounded-lg",
                                                        record.paidDate 
                                                            ? "bg-green-50 text-green-600 border-green-200"
                                                            : "bg-orange-50 text-orange-600 border-orange-200"
                                                    )}
                                                >
                                                    {record.paidDate ? "Paid" : "Pending"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-neutral-800 shadow-sm border border-transparent hover:border-neutral-100 dark:hover:border-neutral-700 transition-all">
                                                        <IconChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/30 dark:bg-neutral-900/30">
                            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                                Page {page} of {totalPages} ({totalRecords} total)
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-9 p-0 rounded-xl border-neutral-200 dark:border-neutral-800"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <IconChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-9 p-0 rounded-xl border-neutral-200 dark:border-neutral-800"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <IconChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <GenerateEpfDialog 
                open={isGenerateOpen} 
                onOpenChange={setIsGenerateOpen} 
                companyId={companyId}
            />

            <EpfDetailsDialog 
                open={!!selectedRecord}
                onOpenChange={(open) => !open && setSelectedRecord(null)}
                record={selectedRecord}
                onDelete={(id) => {
                    if (confirm("Are you sure you want to delete this EPF record?")) {
                        deleteEpfMutation.mutate(id, {
                            onSuccess: () => {
                                setSelectedRecord(null);
                                toast.success("Record deleted successfully");
                            }
                        });
                    }
                }}
            />
        </div>
    );
};

