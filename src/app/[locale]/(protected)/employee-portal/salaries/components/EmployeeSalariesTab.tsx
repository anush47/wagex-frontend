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

export default function EmployeeSalariesTab() {
    const [page, setPage] = React.useState(1);
    const [year, setYear] = React.useState(new Date().getFullYear());
    const [selectedSalary, setSelectedSalary] = React.useState<Salary | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

    const { salariesQuery } = usePortalSalaries({
        page,
        limit: 10,
        year,
    });

    const salaries = salariesQuery.data?.items || [];
    const meta = salariesQuery.data?.total || 0;
    const totalPages = Math.ceil(meta / 10);

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-background/60 backdrop-blur-sm border-none shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <IconCalendar className="w-3.5 h-3.5" /> Filter Year
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-muted"
                                onClick={() => setYear(year - 1)}
                            >
                                <IconChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xl font-black">{year}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-muted"
                                onClick={() => setYear(year + 1)}
                            >
                                <IconChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <Card className="bg-background/60 backdrop-blur-sm border-none shadow-xl shadow-neutral-200/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                <IconReceipt className="w-5 h-5" />
                            </div>
                            Salary History
                        </CardTitle>
                        <CardDescription className="mt-1 font-medium">
                            View and download your monthly salary records
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="p-8 pt-6">
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
                                You don't have any approved salary records for the year {year} yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="rounded-2xl border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent border-b">
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
