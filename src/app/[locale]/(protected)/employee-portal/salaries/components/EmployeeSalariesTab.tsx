"use client";

import React from "react";
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    IconCalendar,
    IconReceipt,
    IconEye,
    IconChevronLeft,
    IconChevronRight,
    IconLayoutGrid,
} from "@tabler/icons-react";
import { usePortalSalaries } from "@/hooks/use-portal-salaries";
import { formatCurrency } from "@/lib/utils";
import { Salary, SalaryStatus } from "@/types/salary";
import { EmployeeSalaryDetailsDialog } from "./EmployeeSalaryDetailsDialog";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/hooks/useAuth";
import { useMe } from "@/hooks/use-employees";

export default function EmployeeSalariesTab() {
    const { user } = useAuth();
    const { data: employee } = useMe();
    const [page, setPage] = React.useState(1);
    const [year, setYear] = React.useState(new Date().getFullYear());
    const [month, setMonth] = React.useState<string>("ALL");
    const [selectedSalary, setSelectedSalary] = React.useState<Salary | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

    const { salariesQuery } = usePortalSalaries({
        page,
        limit: 10,
        year,
        month: month === "ALL" ? undefined : month,
    });

    const salaries = salariesQuery.data?.items || [];
    const meta = salariesQuery.data?.total || 0;
    const totalPages = Math.ceil(meta / 10);

    const months = [
        { value: "ALL", label: "All Months" },
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ];

    const getStatusBadge = (status: SalaryStatus) => {
        const styles: Record<string, string> = {
            APPROVED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
            PARTIALLY_PAID: "bg-orange-500/10 text-orange-600 border-orange-500/20",
            PAID: "bg-green-500/10 text-green-600 border-green-500/20",
        };

        return (
            <Badge variant="outline" className={`font-bold ${styles[status]}`}>
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    const handleViewDetails = (salary: Salary) => {
        setSelectedSalary(salary);
        setIsDetailsOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <Card className="border border-neutral-200 dark:border-white/20 shadow-sm bg-background dark:bg-neutral-900/50 overflow-hidden rounded-[2rem]">
                <CardHeader className="p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <IconReceipt className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                                Salary History
                            </CardTitle>
                            <CardDescription className="text-xs font-medium text-muted-foreground">
                                View and download your monthly salary records
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select value={month} onValueChange={(v) => { setMonth(v); setPage(1); }}>
                            <SelectTrigger className="w-full md:w-[140px] h-10 rounded-xl border-neutral-200 dark:border-white/10 font-bold text-xs bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {months.map((m) => (
                                    <SelectItem key={m.value} value={m.value} className="font-bold text-xs">
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2 bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 rounded-xl px-2 h-10">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-white/5"
                                onClick={() => { setYear(year - 1); setPage(1); }}
                            >
                                <IconChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs font-black min-w-[40px] text-center">{year}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-white/5"
                                onClick={() => { setYear(year + 1); setPage(1); }}
                            >
                                <IconChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8 pt-0">
                    {salariesQuery.isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : salaries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <IconLayoutGrid className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-lg font-bold">No salary records found</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                No approved salary records found for the selected period.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-neutral-100 dark:border-white/5 overflow-hidden bg-neutral-50/30 dark:bg-neutral-900/40">
                                <Table>
                                    <TableHeader className="bg-neutral-100/50 dark:bg-neutral-800/50">
                                        <TableRow className="hover:bg-transparent border-neutral-200 dark:border-white/5">
                                            <TableHead className="font-bold text-xs uppercase tracking-wider py-4 px-6">Period</TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Status</TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider py-4 text-right">Net Salary</TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider py-4 text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {salaries.map((salary) => (
                                            <TableRow key={salary.id} className="group hover:bg-muted/30 transition-colors border-b last:border-0">
                                                <TableCell className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">
                                                            {format(new Date(salary.periodEndDate), "MMMM yyyy")}
                                                        </span>
                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">
                                                            {format(new Date(salary.periodStartDate), "MMM d")} - {format(new Date(salary.periodEndDate), "MMM d")}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    {getStatusBadge(salary.status)}
                                                </TableCell>
                                                <TableCell className="py-4 text-right">
                                                    <span className="font-black text-sm">
                                                        LKR {formatCurrency(salary.netSalary)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4 text-right pr-6">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="rounded-xl h-9 hover:bg-indigo-600 hover:text-white transition-all font-bold group/btn"
                                                        onClick={() => handleViewDetails(salary)}
                                                    >
                                                        <IconEye className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                                                        View Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-end gap-2 px-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className="rounded-xl font-bold"
                                    >
                                        <IconChevronLeft className="h-4 w-4 mr-1" /> Previous
                                    </Button>
                                    <span className="text-xs font-bold px-4">Page {page} of {totalPages}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        className="rounded-xl font-bold"
                                    >
                                        Next <IconChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <EmployeeSalaryDetailsDialog
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                salary={selectedSalary}
            />
        </div>
    );
}
