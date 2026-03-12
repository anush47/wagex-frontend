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
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { IconSeparator, IconTrash, IconCheck, IconFilter, IconChevronRight, IconChevronLeft, IconX, IconRefresh, IconWallet, IconCash } from "@tabler/icons-react";
import { useSalaries } from "@/hooks/use-salaries";
import { usePayments } from "@/hooks/use-payments";
import { SalaryStatus, Salary } from "@/types/salary";
import { format } from "date-fns";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [paymentSalary, setPaymentSalary] = useState<Salary | null>(null);

    const { salariesQuery, updateSalaryMutation, approveSalaryMutation, deleteSalaryMutation, createPaymentMutation } = useSalaries({
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
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle>Salary Records</CardTitle>
                        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
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
                                                            setPaymentSalary(payableSalaries[0]);
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
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 pt-4 border-t mt-4">
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
                                <SelectTrigger className="w-full md:w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                </SelectContent>
                            </Select>

                            {(filters.employeeId || filters.status || filters.startDate) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onFilterChange({ employeeId: undefined, status: undefined, startDate: undefined, endDate: undefined })}
                                    title="Clear filters"
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
                                        <TableHead>Gross</TableHead>
                                        <TableHead>OT</TableHead>
                                        <TableHead className="text-right">No Pay</TableHead>
                                        <TableHead className="text-right">Deductions</TableHead>
                                        <TableHead className="text-right">Net Salary</TableHead>
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
                                            <TableCell><div className="h-4 w-20 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-12 bg-neutral-100 dark:bg-neutral-800 rounded" /></TableCell>
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
                                        <TableHead>Basic</TableHead>
                                        <TableHead>Additions</TableHead>
                                        <TableHead>OT</TableHead>
                                        <TableHead className="text-right">Deductions</TableHead>
                                        <TableHead>Total Earnings</TableHead>
                                        <TableHead className="text-right">Net Salary</TableHead>
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
                                                    <span className="font-medium text-sm">{salary.employee?.fullName}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {salary.employee?.employeeNo && `(${salary.employee.employeeNo})`}
                                                    </span>
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
                                                            <span className="text-[8px] font-black uppercase bg-red-50 text-red-500 px-1 rounded shadow-sm border border-red-100">Overdue</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-medium text-muted-foreground/80">
                                                    {salary.basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const adds = (salary.components || [])
                                                        .filter(c => c.category === 'ADDITION')
                                                        .reduce((acc, c) => acc + c.amount, 0);
                                                    return adds > 0 ? (
                                                        <span className="text-green-600 font-medium text-sm">
                                                            +{adds.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    ) : "-";
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const otTotal = salary.otAmount + (salary.otAdjustment || 0);
                                                    return otTotal > 0 ? (
                                                        <span className="text-blue-600 font-bold text-sm">
                                                            +{otTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    ) : "-";
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {(() => {
                                                    const allDeductions = (salary.advanceDeduction || 0) + 
                                                                         (salary.taxAmount || 0) + 
                                                                         (salary.recoveryAdjustment || 0) + 
                                                                         (salary.noPayAmount || 0) +
                                                                         ((salary.components || []).filter(c => c.category === 'DEDUCTION').reduce((acc, c) => acc + c.amount, 0));
                                                    return allDeductions > 0 ? (
                                                        <span className="text-red-600 font-medium text-sm">
                                                            -{allDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    ) : "-";
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const epfAdditions = (salary.components || [])
                                                        .filter(c => c.category === 'ADDITION' && c.affectsTotalEarnings)
                                                        .reduce((acc, c) => acc + c.amount, 0);
                                                    const epfBase = salary.basicSalary + epfAdditions - (salary.noPayAmount || 0);
                                                    return (
                                                        <span className="font-bold text-sm text-foreground">
                                                            {epfBase.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-sm text-foreground">
                                                        {salary.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                    {(salary.status === 'APPROVED' || salary.status === 'PARTIALLY_PAID') && (
                                                        <span className="text-[10px] font-black text-orange-600 mt-0.5">
                                                            DUE: {(() => {
                                                                const paid = (salary.payments || []).reduce((sum, p) => sum + p.amount, 0);
                                                                return (salary.netSalary - paid).toLocaleString(undefined, { minimumFractionDigits: 2 });
                                                            })()}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(salary.status)}
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
                    setPaymentSalary(selectedSalary);
                    setIsPaymentDialogOpen(true);
                }}
                onDelete={() => setIsDeleteDialogOpen(true)}
            />

            <RecordPaymentDialog
                open={isPaymentDialogOpen}
                onOpenChange={setIsPaymentDialogOpen}
                salary={paymentSalary}
                isSubmitting={createPaymentMutation.isPending}
                onPay={(dto) => {
                    createPaymentMutation.mutate(dto, {
                        onSuccess: () => {
                            setIsPaymentDialogOpen(false);
                            setPaymentSalary(null);
                            setSelectedSalary(null);
                        }
                    });
                }}
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
        </>
    );
}
