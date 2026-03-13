"use client";

import React, { useState } from "react";
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
    IconRefresh
} from "@tabler/icons-react";
import { useEtf } from "@/hooks/use-statutory";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { GenerateEtfDialog } from "./GenerateEtfDialog";
import { EtfDetailsDialog } from "./EtfDetailsDialog";
import { EtfRecord } from "@/types/statutory";
import { toast } from "sonner";

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const EtfTab = () => {
    const params = useParams();
    const companyId = params.id as string;
    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<EtfRecord | null>(null);

    const { etfRecordsQuery, deleteEtfMutation } = useEtf({
        companyId,
        month: filters.month,
        year: filters.year,
    });

    const records = etfRecordsQuery.data?.items || [];

    const getMonthName = (m: number) => months[m - 1];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight uppercase text-foreground/90">ETF Submissions</h3>
                    <p className="text-neutral-500 font-medium text-xs">Manage monthly ETF contributions and payment slips</p>
                </div>
                <Button 
                    onClick={() => setIsGenerateOpen(true)}
                    className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <IconPlus className="mr-2 h-5 w-5" />
                    Generate ETF
                </Button>
            </div>

            <Card className="border border-neutral-200 dark:border-white/20 shadow-sm bg-background dark:bg-neutral-900/50 overflow-hidden rounded-[2rem]">
                <CardHeader className="border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                                <IconFileText className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight text-foreground">ETF History</CardTitle>
                                <p className="text-xs font-medium text-muted-foreground">Select period to view past submissions.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="rounded-xl h-10 w-10"
                                onClick={() => etfRecordsQuery.refetch()}
                                disabled={etfRecordsQuery.isFetching}
                            >
                                <IconRefresh className={`h-4 w-4 ${etfRecordsQuery.isFetching ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {etfRecordsQuery.isLoading ? (
                        <div className="p-20 flex justify-center">
                            <IconRefresh className="h-8 w-8 animate-spin text-primary/20" />
                        </div>
                    ) : records.length === 0 ? (
                        <div className="rounded-xl p-20 flex flex-col items-center justify-center text-center gap-2">
                            <div className="h-16 w-16 rounded-3xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center mb-2">
                                <IconFileText className="h-8 w-8 text-neutral-300" />
                            </div>
                            <p className="text-sm font-bold text-neutral-500">No ETF submission records found.</p>
                            <p className="text-xs text-neutral-400">Try changing the period or generate a new submission.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
                                        <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-wider text-neutral-500">Period</TableHead>
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
                                            <TableCell className="py-4 px-6 text-right">
                                                <span className="font-black text-sm text-orange-600">
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
                </CardContent>
            </Card>

            <GenerateEtfDialog 
                open={isGenerateOpen} 
                onOpenChange={setIsGenerateOpen} 
                companyId={companyId}
            />

            <EtfDetailsDialog 
                open={!!selectedRecord}
                onOpenChange={(open) => !open && setSelectedRecord(null)}
                record={selectedRecord}
                onDelete={(id) => {
                    if (confirm("Are you sure you want to delete this ETF record?")) {
                        deleteEtfMutation.mutate(id, {
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

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
