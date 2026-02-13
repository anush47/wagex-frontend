"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";
import { IconRefresh, IconX, IconChevronLeft, IconChevronRight, IconFilter, IconCheck, IconChecks, IconDeviceFloppy } from "@tabler/icons-react";
import { useSalaries } from "@/hooks/use-salaries";
import { SalaryStatus, Salary } from "@/types/salary";
import { format } from "date-fns";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { SalaryDetailsDialog } from "./SalaryDetailsDialog";
import { SalaryPeriodQuickSelect } from "../../attendance/components/SalaryPeriodQuickSelect";

export function SalariesTab({
    companyId,
    filters,
    onFilterChange
}: {
    companyId: string;
    filters: any;
    onFilterChange: (f: any) => void;
}) {
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);

    const { salariesQuery, saveDraftsMutation } = useSalaries({
        companyId,
        ...filters,
        page: page || 1,
        limit: 20,
    });

    const salaries = (salariesQuery.data as any)?.items || [];
    const meta = salariesQuery.data as any;
    const lastPage = meta?.lastPage || (meta?.total ? Math.ceil(meta.total / (meta.limit || 20)) : 1);

    const toggleSelectAll = () => {
        if (selectedIds.length === salaries.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(salaries.map((s: any) => s.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getStatusBadge = (status: SalaryStatus) => {
        const styles: Record<string, string> = {
            DRAFT: "bg-neutral-100 text-neutral-600 border-neutral-200",
            APPROVED: "bg-blue-100 text-blue-600 border-blue-200",
            PARTIALLY_PAID: "bg-orange-100 text-orange-600 border-orange-200",
            PAID: "bg-green-100 text-green-600 border-green-200",
        };

        return (
            <Badge variant="outline" className={`font-bold text-[10px] ${styles[status]}`}>
                {status}
            </Badge>
        );
    };

    return (
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
            <CardHeader className="space-y-4 px-6 pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="text-xl font-black uppercase tracking-tight">Salary Records</CardTitle>
                    <div className="flex items-center gap-2">
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-xl border border-primary/10 mr-2">
                                <span className="text-[10px] font-black uppercase text-primary">{selectedIds.length} Selected</span>
                                <Button size="sm" variant="ghost" className="h-7 px-2 font-black text-[10px] uppercase hover:bg-primary/10" onClick={() => setSelectedIds([])}>Clear</Button>
                                <div className="w-[1px] h-4 bg-primary/20" />
                                <Button size="sm" variant="default" className="h-7 px-3 font-black text-[10px] uppercase rounded-lg shadow-sm">
                                    <IconCheck className="h-3 w-3 mr-1" /> Approve
                                </Button>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="rounded-xl h-9 font-bold text-xs"
                        >
                            <IconFilter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => salariesQuery.refetch()} className="rounded-xl shadow-sm h-9 w-9">
                            <IconRefresh className={`h-4 w-4 ${salariesQuery.isFetching ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {showFilters && (
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 pt-4 border-t border-neutral-100">
                        <SalaryPeriodQuickSelect
                            companyId={companyId}
                            onRangeSelect={(start, end) => onFilterChange({ startDate: start, endDate: end })}
                            currentStart={filters.startDate}
                            currentEnd={filters.endDate}
                        />
                        <div className="w-full md:w-[200px]">
                            <SearchableEmployeeSelect
                                companyId={companyId}
                                value={filters.employeeId}
                                onSelect={(id) => onFilterChange({ employeeId: id })}
                                placeholder="Filter Employee"
                            />
                        </div>
                        <Select
                            value={filters.status || "ALL"}
                            onValueChange={(v) => onFilterChange({ status: v === "ALL" ? undefined : v })}
                        >
                            <SelectTrigger className="w-full md:w-[150px] rounded-xl h-9 font-medium text-xs">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                            </SelectContent>
                        </Select>

                        {(filters.employeeId || filters.status) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onFilterChange({ employeeId: undefined, status: undefined })}
                                className="h-9 px-3 text-neutral-400 hover:text-neutral-900 font-bold text-xs uppercase"
                            >
                                <IconX className="h-4 w-4 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-50/50 hover:bg-neutral-50/50 border-neutral-100">
                                <TableHead className="w-[50px] px-6">
                                    <Checkbox checked={selectedIds.length === salaries.length && salaries.length > 0} onCheckedChange={toggleSelectAll} className="rounded-md border-neutral-300" />
                                </TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-wider text-neutral-400">Employee</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-wider text-neutral-400">Period</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-wider text-neutral-400">Gross Salary</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-wider text-neutral-400">OT</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-wider text-neutral-400 text-right">No Pay</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-wider text-neutral-400 text-right">Deductions</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-wider text-neutral-400 text-right">Net Salary</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-wider text-neutral-400">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salariesQuery.isLoading ? (
                                [1, 2, 3].map((i: number) => (
                                    <TableRow key={i} className="animate-pulse border-neutral-50">
                                        <TableCell colSpan={9} className="h-16 bg-neutral-50/50" />
                                    </TableRow>
                                ))
                            ) : salaries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-32 text-center text-neutral-400 font-medium italic">No salary records found.</TableCell>
                                </TableRow>
                            ) : (
                                salaries.map((salary: Salary) => (
                                    <TableRow
                                        key={salary.id}
                                        className="group hover:bg-neutral-50 transition-all cursor-pointer border-neutral-100"
                                        onClick={() => setSelectedSalary(salary)}
                                    >
                                        <TableCell className="px-6" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox checked={selectedIds.includes(salary.id)} onCheckedChange={() => toggleSelect(salary.id)} className="rounded-md border-neutral-300" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[13px] uppercase tracking-tight text-neutral-900">{salary.employee?.fullName}</span>
                                                <span className="text-[10px] font-mono text-neutral-400">EMP-{salary.employee?.employeeNo}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-xs text-neutral-600">
                                                    {format(new Date(salary.periodStartDate), "MMM d")} - {format(new Date(salary.periodEndDate), "MMM d")}
                                                </span>
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                                    {format(new Date(salary.periodStartDate), "yyyy")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-black text-xs text-neutral-900">
                                                    {(salary.netSalary + salary.advanceDeduction + salary.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter italic">Total Earnings</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-xs text-blue-600">
                                            {salary.otAmount > 0 ? salary.otAmount.toLocaleString() : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-xs text-red-600">
                                            {salary.noPayAmount > 0 ? salary.noPayAmount.toLocaleString() : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-xs text-neutral-600">{salary.advanceDeduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter">Advance Recovery</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg font-black text-xs">
                                                {salary.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(salary.status)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {meta && lastPage > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-neutral-50/50 border-t border-neutral-100">
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Page {page} of {lastPage}</p>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <IconChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                disabled={page === lastPage}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <IconChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            <SalaryDetailsDialog
                open={!!selectedSalary}
                onOpenChange={(open) => !open && setSelectedSalary(null)}
                salary={selectedSalary}
            />
        </Card>
    );
}
