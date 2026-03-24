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
    IconChevronRight,
    IconRefresh,
    IconSearch, 
    IconChevronLeft,
    IconX,
    IconTrash,
    IconActivity,
    IconFilter
} from "@tabler/icons-react";
import { useEtf } from "@/hooks/use-statutory";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { GenerateEtfDialog } from "./GenerateEtfDialog";
import { EtfDetailsDialog } from "./EtfDetailsDialog";
import { EtfRecord } from "@/types/statutory";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";

const monthsNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const EtfTab = () => {
    const params = useParams();
    const companyId = params.id as string;
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [month, setMonth] = useState<string>("ALL");
    const [year, setYear] = useState<string>("ALL");
    const [debouncedYear, setDebouncedYear] = useState<string>("ALL");
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => { setDebouncedSearch(search); }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => { setDebouncedYear(year); }, 500);
        return () => clearTimeout(timer);
    }, [year]);

    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<EtfRecord | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

    const { etfRecordsQuery, deleteEtfMutation } = useEtf({
        companyId,
        month: month === "ALL" ? undefined : parseInt(month),
        year: debouncedYear === "ALL" || !debouncedYear ? undefined : parseInt(debouncedYear),
        search: debouncedSearch || undefined,
        page,
        limit: 10,
    });

    const records = etfRecordsQuery.data?.items || [];
    const totalRecords = etfRecordsQuery.data?.total || 0;
    const totalPages = Math.ceil(totalRecords / 10);

    const getMonthName = (m: number) => monthsNames[m - 1];

    const hasActiveFilters = search || month !== "ALL" || year !== "ALL";

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1.5">
                    <h3 className="text-xl font-black tracking-tight uppercase text-foreground/90">ETF Submissions</h3>
                    <p className="text-neutral-500 font-medium text-xs">Manage monthly ETF contributions and payment slips</p>
                </div>
                <Button 
                    onClick={() => setIsGenerateOpen(true)}
                    className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all bg-primary text-white"
                >
                    <IconPlus className="mr-2 h-5 w-5 stroke-[3]" />
                    Generate ETF
                </Button>
            </div>

            <Card className="border border-neutral-200 dark:border-white/20 shadow-sm bg-background dark:bg-neutral-900/50 overflow-hidden rounded-[2rem]">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <IconActivity className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight text-foreground">Submission History</CardTitle>
                                <p className="text-xs font-medium text-muted-foreground">Review and verify past employer contributions.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "rounded-xl h-10 px-4",
                                    (showFilters || hasActiveFilters) && "bg-muted"
                                )}
                            >
                                <IconFilter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="rounded-xl h-10 w-10 hover:bg-muted"
                                onClick={() => etfRecordsQuery.refetch()}
                                disabled={etfRecordsQuery.isFetching}
                            >
                                <IconRefresh className={`h-4 w-4 ${etfRecordsQuery.isFetching ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                        {showFilters && (
                            <div className="flex flex-col md:flex-row items-center gap-3 pt-4 border-t mt-4 overflow-x-auto pb-2 no-scrollbar p-1">
                                <div className="relative w-full md:w-[280px] shrink-0">
                                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                                    <Input 
                                        placeholder="Search references..." 
                                        className="pl-10 h-10 rounded-xl border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 focus:ring-primary/20 font-bold text-xs"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                    {search && (
                                        <button 
                                            onClick={() => setSearch("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                                        >
                                            <IconX className="h-4 w-4" />
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
                                    <SelectTrigger className="h-10 w-full md:w-[130px] rounded-xl border-neutral-200 dark:border-neutral-800 font-bold text-xs bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
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

                                <div className="relative w-full md:w-[90px] shrink-0">
                                    <Input
                                        type="number"
                                        placeholder="Year"
                                        className="h-10 rounded-xl border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 font-bold text-xs focus:ring-primary/20"
                                        value={year === "ALL" ? "" : year}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setYear(val === "" ? "ALL" : val);
                                            setPage(1);
                                        }}
                                    />
                                </div>

                                {hasActiveFilters && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl shrink-0"
                                        onClick={() => {
                                            setSearch("");
                                            setMonth("ALL");
                                            setYear("ALL");
                                            setPage(1);
                                        }}
                                    >
                                        <IconX className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                </CardHeader>
                
                <CardContent>
                    {etfRecordsQuery.isLoading ? (
                        <div className="p-32 flex flex-col items-center justify-center gap-4 animate-pulse">
                            <IconRefresh className="h-10 w-10 animate-spin text-primary/30" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Synthesizing Records...</span>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="p-32 flex flex-col items-center justify-center text-center gap-6 bg-neutral-50/20 dark:bg-transparent">
                            <div className="h-20 w-20 rounded-[2rem] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-2 shadow-inner ring-1 ring-neutral-200 dark:ring-neutral-700">
                                <IconFileText className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-black uppercase tracking-tight text-neutral-400 dark:text-neutral-500">No submission records</h4>
                                <p className="text-[11px] font-medium text-neutral-400 max-w-[240px]">Access your ETF history by generating a new report or adjusting filters.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Period</TableHead>
                                        <TableHead className="text-right">Total Contribution</TableHead>
                                        <TableHead>Paid Date</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.map((record: any) => (
                                        <TableRow 
                                            key={record.id} 
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => setSelectedRecord(record)}
                                        >
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{getMonthName(record.month)}</span>
                                                    <span className="text-xs text-muted-foreground">{record.year}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-sm tracking-tight text-primary">
                                                        {formatCurrency(record.totalContribution)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {record.paidDate ? format(new Date(record.paidDate), "MMM d, yyyy") : 
                                                    <span className="text-amber-500 font-bold uppercase text-[9px]">Outstanding</span>
                                                }
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "font-bold text-[10px]",
                                                        record.paidDate 
                                                            ? "bg-green-50 text-green-700 border-green-200"
                                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                                    )}
                                                >
                                                    {record.paidDate ? "Cleared" : "Pending"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                    <IconChevronRight className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <IconChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
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

            <GenerateEtfDialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen} companyId={companyId} />
            <EtfDetailsDialog 
                open={!!selectedRecord}
                onOpenChange={(open) => !open && setSelectedRecord(null)}
                record={selectedRecord}
                onDelete={(id) => { setRecordToDelete(id); setIsDeleteDialogOpen(true); }}
            />

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete ETF Record"
                description="This action cannot be undone. This record and its associated data will be permanently removed from the system."
                icon={<IconTrash className="h-8 w-8 text-rose-500" />}
                actionLabel="Delete Record"
                cancelLabel="Cancel"
                onAction={() => {
                    if (recordToDelete) {
                        deleteEtfMutation.mutate(recordToDelete, {
                            onSuccess: () => {
                                setIsDeleteDialogOpen(false);
                                setRecordToDelete(null);
                                setSelectedRecord(null);
                                toast.success("Record deleted successfully");
                            }
                        });
                    }
                }}
                variant="destructive"
                loading={deleteEtfMutation.isPending}
            />
        </div>
    );
};
