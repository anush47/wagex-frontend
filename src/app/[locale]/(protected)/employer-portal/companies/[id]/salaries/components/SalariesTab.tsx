"use client";

import React, { useState, useEffect } from "react";
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
import { SettlePaymentsDialog } from "./SettlePaymentsDialog";
import { toast } from "sonner";
import { printDocument } from "@/services/document-print.service";
import { useTemplates } from "@/hooks/use-templates";
import { DocumentType } from "@/types/template";
import {
    IconSeparator,
    IconTrash,
    IconCheck,
    IconFilter,
    IconChevronRight,
    IconChevronLeft,
    IconX,
    IconRefresh,
    IconWallet,
    IconCash,
    IconPlus,
    IconCalendarTime,
    IconSearch,
    IconFileSpreadsheet
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { useSalaries } from "@/hooks/use-salaries";
import { usePayments } from "@/hooks/use-payments";
import { SalaryStatus, Salary } from "@/types/salary";
import { format } from "date-fns";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { SalaryDetailsDialog } from "./SalaryDetailsDialog";
import { SalaryPeriodQuickSelect } from "@/components/attendance/SalaryPeriodQuickSelect";

export function SalariesTab({
    companyId,
    filters,
    onFilterChange,
    onGenerateClick
}: {
    companyId: string;
    filters: any;
    onFilterChange: (f: any) => void;
    onGenerateClick: () => void;
}) {
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [initialPayIds, setInitialPayIds] = useState<string[]>([]);
    const [localSearch, setLocalSearch] = useState(filters.search || "");
    const [localYear, setLocalYear] = useState(filters.year || "");
    const [localMonth, setLocalMonth] = useState(filters.month || "ALL");

    // Sync local state with incoming filters (for reset or external changes)
    useEffect(() => {
        setLocalSearch(filters.search || "");
    }, [filters.search]);

    useEffect(() => {
        setLocalYear(filters.year || "");
    }, [filters.year]);

    useEffect(() => {
        setLocalMonth(filters.month || "ALL");
    }, [filters.month]);

    // Debounce search update
    useEffect(() => {
        if (localSearch === (filters.search || "")) return;
        const timer = setTimeout(() => {
            onFilterChange({ search: localSearch || undefined });
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearch]);

    // Debounce year update
    useEffect(() => {
        if (localYear === (filters.year || "")) return;
        const timer = setTimeout(() => {
            onFilterChange({ 
                year: localYear || undefined,
                startDate: undefined,
                endDate: undefined
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [localYear]);

    const { salariesQuery, updateSalaryMutation, approveSalaryMutation, deleteSalaryMutation, createPaymentMutation } = useSalaries({
        companyId,
        ...filters,
        page: page || 1,
        limit: 20,
    });

    const { deletePaymentMutation } = usePayments({ companyId });

    const salaries = (salariesQuery.data as any)?.items || [];
    const meta = salariesQuery.data as any;
    const lastPage = meta?.lastPage || (meta?.total ? Math.ceil(meta.total / (meta.limit || 20)) : 1);

    const { templatesQuery } = useTemplates({ companyId, type: DocumentType.SALARY_SHEET, isActive: true });
    const activeSheetTemplate = templatesQuery.data?.[0];

    const handlePrintSheet = () => {
        if (!activeSheetTemplate) {
            toast.error("No active salary sheet template found. Please create and approve one in Documents.");
            return;
        }
        
        const monthVal = (filters.month && filters.month !== "ALL") ? filters.month : (new Date().getMonth() + 1).toString();
        const yearVal = filters.year || new Date().getFullYear().toString();
        const resourceId = `${companyId}_${monthVal}_${yearVal}`;
        printDocument(activeSheetTemplate.id, resourceId, { ids: selectedIds });
    };

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
            DRAFT: "bg-neutral-100 text-neutral-700 hover:bg-neutral-100 border-neutral-200",
            APPROVED: "bg-green-50 text-green-700 hover:bg-green-50 border-green-200",
            PARTIALLY_PAID: "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200",
            PAID: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
        };

        return (
            <Badge variant="outline" className={`font-bold ${styles[status]}`}>
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight uppercase text-foreground/90">Salaries & Payroll</h3>
                    <p className="text-neutral-500 font-medium text-xs">Review and approve employee payroll entries</p>
                </div>
                <Button
                    onClick={onGenerateClick}
                    className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <IconPlus className="mr-2 h-5 w-5" />
                    Generate Salaries
                </Button>
            </div>

            <Card className="border border-neutral-200 dark:border-white/20 shadow-sm bg-background dark:bg-neutral-900/50 overflow-hidden rounded-[2rem]">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <IconCalendarTime className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight text-foreground">Salary Records</CardTitle>
                                <p className="text-xs font-medium text-muted-foreground">Detailed payroll breakdown for the current period.</p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-xl border border-primary/10 mr-2">
                                    <span className="text-[10px] font-black uppercase text-primary">{selectedIds.length} Selected</span>
                                    <Button size="sm" variant="ghost" className="h-7 px-2 font-black text-[10px] uppercase hover:bg-primary/10" onClick={() => setSelectedIds([])}>Clear</Button>

                                    {(() => {
                                        const selectedDrafts = salaries.filter((s: any) =>
                                            selectedIds.includes(s.id) && s.status === 'DRAFT'
                                        );

                                        if (selectedDrafts.length > 0) {
                                            return (
                                                <>
                                                    <div className="w-[1px] h-4 bg-primary/20" />
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="h-7 px-3 font-black text-[10px] uppercase rounded-lg shadow-sm"
                                                        onClick={() => {
                                                            // For now we just show the logic is there
                                                            // In a real scenario we'd call a bulk approval mutation
                                                            selectedDrafts.forEach((s: any) => approveSalaryMutation.mutate(s.id));
                                                            setSelectedIds([]);
                                                        }}
                                                    >
                                                        <IconCheck className="h-3 w-3 mr-1" /> Approve {selectedDrafts.length > 1 ? `(${selectedDrafts.length})` : ''}
                                                    </Button>
                                                </>
                                            );
                                        }
                                        return null;
                                    })()}
                                    {(() => {
                                        const payableSalaries = salaries.filter((s: any) =>
                                            selectedIds.includes(s.id) && (s.status === 'APPROVED' || s.status === 'PARTIALLY_PAID')
                                        );

                                        if (payableSalaries.length > 0) {
                                            return (
                                                <>
                                                    <div className="w-[1px] h-4 bg-primary/20" />
                                                    <Button
                                                        size="sm"
                                                        className="h-7 px-3 font-black text-[10px] uppercase rounded-lg shadow-sm bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => {
                                                            setInitialPayIds(payableSalaries.map((s: any) => s.id));
                                                            setIsPaymentDialogOpen(true);
                                                        }}
                                                    >
                                                        <IconCash className="h-3 w-3 mr-1" /> Pay {payableSalaries.length > 1 ? `(${payableSalaries.length})` : ''}
                                                    </Button>
                                                </>
                                            );
                                        }
                                        return null;
                                    })()}

                                    <div className="w-[1px] h-4 bg-primary/20" />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-3 font-black text-[10px] uppercase text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                        onClick={() => setIsBulkDeleteDialogOpen(true)}
                                    >
                                        <IconTrash className="h-3 w-3 mr-1" /> Delete
                                    </Button>

                                    <div className="w-[1px] h-4 bg-primary/20" />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-3 font-black text-[10px] uppercase rounded-lg shadow-sm border-primary/20 text-primary hover:bg-primary/5"
                                        onClick={handlePrintSheet}
                                    >
                                        <IconFileSpreadsheet className="h-3 w-3 mr-1" /> Print Sheet
                                    </Button>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className={showFilters ? "bg-muted" : ""}
                            >
                                <IconFilter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => salariesQuery.refetch()} disabled={salariesQuery.isFetching}>
                                <IconRefresh className={`h-4 w-4 ${salariesQuery.isFetching ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="flex flex-col md:flex-row items-center gap-3 pt-4 border-t mt-4 overflow-x-auto pb-2 no-scrollbar p-1">
                                <div className="relative w-full md:w-[280px] shrink-0">
                                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <Input 
                                        placeholder="Search remarks, employee..." 
                                        className="pl-10 h-10 rounded-xl border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 focus:ring-primary/20 font-bold text-xs"
                                        value={localSearch}
                                        onChange={(e) => setLocalSearch(e.target.value)}
                                    />
                                    {localSearch && (
                                        <button 
                                            onClick={() => {
                                                setLocalSearch("");
                                                onFilterChange({ search: undefined });
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                        >
                                            <IconX className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                                <div className="w-full md:w-[180px] shrink-0">
                                    <SearchableEmployeeSelect
                                        companyId={companyId}
                                        value={filters.employeeId}
                                        onSelect={(id) => onFilterChange({ employeeId: id })}
                                        placeholder="Employee"
                                    />
                                </div>
                                <Select
                                    value={filters.status || "ALL"}
                                    onValueChange={(v) => onFilterChange({ status: v === "ALL" ? undefined : v })}
                                >
                                    <SelectTrigger className="w-full md:w-[130px] h-10 rounded-xl border-neutral-200 dark:border-neutral-800 font-bold text-xs bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="ALL" className="font-bold text-xs font-bold">All Status</SelectItem>
                                        <SelectItem value="DRAFT" className="font-bold text-xs">Draft</SelectItem>
                                        <SelectItem value="APPROVED" className="font-bold text-xs">Approved</SelectItem>
                                        <SelectItem value="PARTIALLY_PAID" className="font-bold text-xs">Partially Paid</SelectItem>
                                        <SelectItem value="PAID" className="font-bold text-xs">Paid</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="h-6 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1 hidden md:block shrink-0" />

                                <Select 
                                    value={localMonth} 
                                    onValueChange={(v) => {
                                        const targetYear = localYear || new Date().getFullYear().toString();
                                        setLocalMonth(v);
                                        if (!localYear) setLocalYear(targetYear);
                                        onFilterChange({ 
                                            month: v, 
                                            year: targetYear,
                                            startDate: undefined,
                                            endDate: undefined
                                        });
                                    }}
                                >
                                    <SelectTrigger className="h-10 w-full md:w-[120px] rounded-xl border-neutral-200 dark:border-neutral-800 font-bold text-xs bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="ALL" className="font-bold text-xs">All Months</SelectItem>
                                        <SelectItem value="1" className="font-bold text-xs">January</SelectItem>
                                        <SelectItem value="2" className="font-bold text-xs">February</SelectItem>
                                        <SelectItem value="3" className="font-bold text-xs">March</SelectItem>
                                        <SelectItem value="4" className="font-bold text-xs">April</SelectItem>
                                        <SelectItem value="5" className="font-bold text-xs">May</SelectItem>
                                        <SelectItem value="6" className="font-bold text-xs">June</SelectItem>
                                        <SelectItem value="7" className="font-bold text-xs">July</SelectItem>
                                        <SelectItem value="8" className="font-bold text-xs">August</SelectItem>
                                        <SelectItem value="9" className="font-bold text-xs">September</SelectItem>
                                        <SelectItem value="10" className="font-bold text-xs">October</SelectItem>
                                        <SelectItem value="11" className="font-bold text-xs">November</SelectItem>
                                        <SelectItem value="12" className="font-bold text-xs">December</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="relative w-full md:w-[90px] shrink-0">
                                    <Input
                                        type="number"
                                        placeholder="Year"
                                        min={1900}
                                        max={2500}
                                        className="h-10 rounded-xl border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 focus:ring-primary/20 font-bold text-xs"
                                        value={localYear}
                                        onChange={(e) => setLocalYear(e.target.value)}
                                    />
                                </div>

                                {(filters.employeeId || filters.status || filters.search || (filters.month && filters.month !== "ALL") || (filters.year && filters.year !== new Date().getFullYear().toString())) && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setLocalSearch("");
                                            setLocalYear("");
                                            setLocalMonth("ALL");
                                            onFilterChange({ 
                                                employeeId: undefined, 
                                                status: undefined, 
                                                search: undefined,
                                                month: undefined,
                                                year: undefined
                                            });
                                        }}
                                        title="Clear filters"
                                        className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl shrink-0"
                                    >
                                        <IconX className="h-4 w-4" />
                                    </Button>
                                )}
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    {salariesQuery.isLoading ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]"><div className="h-4 w-4 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableHead>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead className="text-right">Tot. Earnings</TableHead>
                                        <TableHead className="text-right">Additions</TableHead>
                                        <TableHead className="text-right">OT</TableHead>
                                        <TableHead className="text-right">Deductions</TableHead>
                                        <TableHead className="text-right whitespace-nowrap">Net Pay</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell><div className="h-4 w-4 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-800 rounded" />
                                                    <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-800/50 rounded" />
                                                </div>
                                            </TableCell>
                                            <TableCell><div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-12 bg-neutral-100 dark:bg-neutral-800 rounded ml-auto" /></TableCell>
                                            <TableCell><div className="h-4 w-12 bg-neutral-100 dark:bg-neutral-800 rounded ml-auto" /></TableCell>
                                            <TableCell><div className="h-4 w-12 bg-neutral-100 dark:bg-neutral-800 rounded ml-auto" /></TableCell>
                                            <TableCell><div className="h-4 w-12 bg-neutral-100 dark:bg-neutral-800 rounded ml-auto" /></TableCell>
                                            <TableCell><div className="h-4 w-16 bg-neutral-100 dark:bg-neutral-800 rounded ml-auto" /></TableCell>
                                            <TableCell><div className="h-6 w-16 bg-neutral-100 dark:bg-neutral-800 rounded-full" /></TableCell>
                                            <TableCell><div className="h-8 w-8 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : salaries.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">No salary records found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedIds.length === salaries.length && salaries.length > 0}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead className="text-right">Tot. Earnings</TableHead>
                                        <TableHead className="text-right">Additions</TableHead>
                                        <TableHead className="text-right">OT</TableHead>
                                        <TableHead className="text-right">Deductions</TableHead>
                                        <TableHead className="text-right whitespace-nowrap">Net Pay</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {salaries.map((salary: Salary) => (
                                        <TableRow
                                            key={salary.id}
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => setSelectedSalary(salary)}
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedIds.includes(salary.id)}
                                                    onCheckedChange={() => toggleSelect(salary.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-foreground">{salary.employee?.fullName}</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-muted-foreground font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                                                            {salary.employee?.employeeNo || 'N/A'}
                                                        </span>
                                                        <Badge variant="secondary" className="text-[8px] h-4 px-1 font-black uppercase bg-accent-foreground/5 text-accent-foreground/60 border-none">
                                                            {salary.employee?.policy?.settings?.payrollConfiguration?.frequency || 'MONTHLY'}
                                                        </Badge>
                                                        <span className="text-[10px] font-bold text-neutral-400 italic">
                                                            Ref: {formatCurrency(salary.employee?.basicSalary || 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs space-y-0.5">
                                                    <span className="font-medium text-muted-foreground whitespace-nowrap">
                                                        {format(new Date(salary.periodStartDate), "MMM d")} - {format(new Date(salary.periodEndDate), "MMM d")}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`font-bold text-[10px] ${new Date(salary.payDate) < new Date() && salary.status !== 'PAID' ? 'text-red-600' : 'text-neutral-400'}`}>
                                                            Pay: {format(new Date(salary.payDate), "MMM d")}
                                                        </span>
                                                        {new Date(salary.payDate) < new Date() && salary.status !== 'PAID' && (
                                                            <span className="text-[8px] font-black uppercase bg-red-50 text-red-500 px-1 rounded shadow-sm border border-red-100 italic">Overdue</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-black text-sm text-foreground">
                                                        {(() => {
                                                            const epfComp = (salary.components || []).find((c: any) => c.systemType === 'EPF_EMPLOYEE');
                                                            if (epfComp && epfComp.value > 0) {
                                                                return formatCurrency(epfComp.amount / (epfComp.value / 100));
                                                            }
                                                            return formatCurrency(salary.basicSalary);
                                                        })()}
                                                    </span>
                                                    {salary.employee?.policy?.settings?.payrollConfiguration?.frequency !== 'MONTHLY' && (
                                                        <div className="flex flex-col items-end mt-0.5">
                                                            <span className="text-[9px] font-medium text-muted-foreground bg-neutral-50 dark:bg-neutral-800/50 px-1 rounded">
                                                                Period: {formatCurrency(salary.basicSalary)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {(() => {
                                                    const additions = (salary.components || [])
                                                        .filter(c => c.category === 'ADDITION')
                                                        .reduce((acc, c) => acc + c.amount, 0);
                                                    return additions > 0 ? (
                                                        <span className="font-bold text-sm text-green-600">{formatCurrency(additions)}</span>
                                                    ) : <span className="text-neutral-300">---</span>;
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {salary.otAmount > 0 ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-sm text-foreground">{formatCurrency(salary.otAmount)}</span>
                                                        {salary.otBreakdown && salary.otBreakdown.length > 0 && (
                                                            <span className="text-[9px] font-bold text-neutral-400 uppercase">
                                                                {salary.otBreakdown.reduce((sum: number, b: any) => sum + b.hours, 0)} hrs
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : <span className="text-neutral-300">---</span>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-sm text-red-500">
                                                        {(() => {
                                                            const compDeductions = (salary.components || [])
                                                                .filter(c => c.category === 'DEDUCTION')
                                                                .reduce((acc, c) => acc + c.amount, 0);
                                                            const total = compDeductions + salary.noPayAmount + salary.taxAmount;
                                                            return formatCurrency(total);
                                                        })()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-black text-sm text-foreground">
                                                        {(() => {
                                                            const additions = (salary.components || [])
                                                                .filter(c => c.category === 'ADDITION')
                                                                .reduce((acc, c) => acc + c.amount, 0);
                                                            const deductions = (salary.components || [])
                                                                .filter(c => c.category === 'DEDUCTION')
                                                                .reduce((acc, c) => acc + c.amount, 0) + salary.noPayAmount + salary.taxAmount;
                                                            
                                                            const gross = salary.basicSalary + salary.otAmount + additions;
                                                            const net = gross - deductions - salary.advanceDeduction;
                                                            
                                                            const paid = (salary.payments || []).reduce((sum, p) => sum + p.amount, 0);
                                                            return formatCurrency(net - paid);
                                                        })()}
                                                    </span>
                                                    <div className="flex flex-col items-end mt-1 space-y-0.5">
                                                        {(() => {
                                                            const additions = (salary.components || [])
                                                                .filter(c => c.category === 'ADDITION')
                                                                .reduce((acc, c) => acc + c.amount, 0);
                                                            const deductions = (salary.components || [])
                                                                .filter(c => c.category === 'DEDUCTION')
                                                                .reduce((acc, c) => acc + c.amount, 0) + salary.noPayAmount + salary.taxAmount;
                                                            
                                                            const gross = salary.basicSalary + salary.otAmount + additions;
                                                            const net = gross - deductions - salary.advanceDeduction;
                                                            const paid = (salary.payments || []).reduce((sum, p) => sum + p.amount, 0);

                                                            return (
                                                                <>
                                                                    {paid > 0 && (
                                                                        <span className="text-[10px] font-bold text-neutral-400">
                                                                            Tot: {formatCurrency(net)}
                                                                        </span>
                                                                    )}
                                                                    {salary.advanceDeduction > 0 && (
                                                                        <div className="flex items-center gap-1 mt-0.5">
                                                                            <span className="text-[9px] font-black text-orange-600/60 uppercase">Advance:</span>
                                                                            <span className="text-[10px] font-black text-orange-600">{formatCurrency(salary.advanceDeduction)}</span>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    {getStatusBadge(salary.status)}
                                                    <div className="flex items-center gap-1">
                                                        {(salary.epfRecords?.length || 0) > 0 && (
                                                            <div className="flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 text-[8px] font-black uppercase tracking-tighter leading-none h-4">
                                                                EPF
                                                            </div>
                                                        )}
                                                        {(salary.etfRecords?.length || 0) > 0 && (
                                                            <div className="flex items-center px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200 text-[8px] font-black uppercase tracking-tighter leading-none h-4">
                                                                ETF
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
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

                    {meta && lastPage > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <p className="text-xs text-muted-foreground">Page {page} of {lastPage}</p>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    <IconChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={page === lastPage}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    <IconChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <SalaryDetailsDialog
                open={!!selectedSalary}
                onOpenChange={(open) => !open && setSelectedSalary(null)}
                salary={selectedSalary}
                isSaving={updateSalaryMutation.isPending}
                isApproving={approveSalaryMutation.isPending}
                isDeleting={deleteSalaryMutation.isPending}
                onSave={(data) => {
                    if (selectedSalary) {
                        updateSalaryMutation.mutate({ id: selectedSalary.id, data }, {
                            onSuccess: () => {
                                setSelectedSalary(null);
                            }
                        });
                    }
                }}
                onApprove={() => {
                    if (selectedSalary) {
                        approveSalaryMutation.mutate(selectedSalary.id, {
                            onSuccess: () => {
                                setSelectedSalary(null);
                            }
                        });
                    }
                }}
                onPay={() => {
                    if (selectedSalary) {
                        setInitialPayIds([selectedSalary.id]);
                        setIsPaymentDialogOpen(true);
                    }
                }}
                onDelete={() => setIsDeleteDialogOpen(true)}
                onDeletePayment={async (id) => {
                    await deletePaymentMutation.mutateAsync(id);
                }}
                isDeletingPayment={deletePaymentMutation.isPending}
            />

            <SettlePaymentsDialog
                open={isPaymentDialogOpen}
                onOpenChange={setIsPaymentDialogOpen}
                companyId={companyId}
                initialSalaryIds={initialPayIds}
            />

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Salary Record"
                description="This action cannot be undone. Any linked attendance sessions will be unprocessed and become available for future payroll runs."
                icon={<IconTrash className="h-8 w-8" />}
                actionLabel="Delete Salary"
                cancelLabel="Cancel"
                onAction={() => {
                    if (selectedSalary) {
                        deleteSalaryMutation.mutate(selectedSalary.id, {
                            onSuccess: () => {
                                setIsDeleteDialogOpen(false);
                                setSelectedSalary(null);
                            }
                        });
                    }
                }}
                variant="destructive"
                loading={deleteSalaryMutation.isPending}
            />

            <ConfirmationDialog
                open={isBulkDeleteDialogOpen}
                onOpenChange={setIsBulkDeleteDialogOpen}
                title={`Delete ${selectedIds.length} Salary Records`}
                description="This will permanently delete all selected records. Linked attendance sessions will be made available for reprocessing."
                icon={<IconTrash className="h-8 w-8" />}
                actionLabel="Delete Records"
                cancelLabel="Cancel"
                onAction={() => {
                    selectedIds.forEach(id => deleteSalaryMutation.mutate(id));
                    setIsBulkDeleteDialogOpen(false);
                    setSelectedIds([]);
                }}
                variant="destructive"
                loading={deleteSalaryMutation.isPending}
            />
        </div>
    );
}
