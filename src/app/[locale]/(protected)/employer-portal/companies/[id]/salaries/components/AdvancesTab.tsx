"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdvances } from "@/hooks/use-advances";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { IconCash, IconCalendarRepeat, IconAlertCircle, IconPlus, IconWallet, IconHistory, IconChevronRight, IconTrendingUp, IconCheck, IconTrash } from "@tabler/icons-react";
import { IssueAdvanceDialog } from "./IssueAdvanceDialog";
import { AdvanceDetailsDialog } from "./AdvanceDetailsDialog";
import { SettlePaymentsDialog } from "./SettlePaymentsDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatCurrency } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export function AdvancesTab({ companyId }: { companyId: string }) {
    const queryClient = useQueryClient();
    const { advancesQuery, createAdvanceMutation, approveAdvanceMutation, deleteAdvanceMutation } = useAdvances({ companyId });
    const data = advancesQuery.data as any;
    const advances = Array.isArray(data) ? data : (data?.items || []);
    const [isIssueOpen, setIsIssueOpen] = React.useState(false);
    const [selectedAdvance, setSelectedAdvance] = React.useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
    const [isPaymentsOpen, setIsPaymentsOpen] = React.useState(false);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [initialPayIds, setInitialPayIds] = React.useState<string[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isSingleDeleteDialogOpen, setIsSingleDeleteDialogOpen] = React.useState(false);
    const [advanceToDelete, setAdvanceToDelete] = React.useState<string | null>(null);

    const totalOutstanding = advances.reduce((sum: number, adv: any) => sum + (adv.remainingAmount || 0), 0);
    const totalDisbursed = advances.reduce((sum: number, adv: any) => sum + (adv.totalAmount || 0), 0);
    const activeAdvances = advances.filter((adv: any) => adv.remainingAmount > 0).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Main Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight uppercase text-foreground/90">Advances & Recoveries</h3>
                    <p className="text-neutral-500 font-medium text-xs">Manage employee loans and salary advance schedules</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setIsDeleteDialogOpen(true)}
                                variant="outline"
                                className="rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-wider text-red-500 border-red-200 hover:bg-red-50 shadow-xl shadow-red-500/10 transition-all"
                            >
                                <IconTrash className="mr-2 h-5 w-5" />
                                Delete ({selectedIds.length})
                            </Button>
                            <Button
                                onClick={() => {
                                    setInitialPayIds(selectedIds);
                                    setIsPaymentsOpen(true);
                                }}
                                className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-wider bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <IconCash className="mr-2 h-5 w-5" />
                                Pay Selected ({selectedIds.length})
                            </Button>
                        </div>
                    )}
                    <Button
                        onClick={() => setIsIssueOpen(true)}
                        className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <IconPlus className="mr-2 h-5 w-5" />
                        Issue Advance
                    </Button>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm bg-blue-500/5 border border-blue-500/30 rounded-[2rem]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-blue-500">
                            <IconTrendingUp className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Total Issued</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-foreground tabular-nums">
                                {formatCurrency(totalDisbursed)}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Lifetime Issuance</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm bg-amber-500/5 border border-amber-500/30 rounded-[2rem]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-amber-500">
                            <IconWallet className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Outstanding Liability</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-foreground tabular-nums">
                                {formatCurrency(totalOutstanding)}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                                {activeAdvances} Active Recovery Plans
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm bg-primary/5 border border-primary/30 rounded-[2rem]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-primary">
                            <IconCalendarRepeat className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Next Recovery Run</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-foreground tabular-nums">
                                {formatCurrency(advances.reduce((sum: number, adv: any) => {
                                    const nextDeduction = adv.deductionSchedule?.find((s: any) => !s.isDeducted);
                                    return sum + (nextDeduction?.amount || 0);
                                }, 0))}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                                Estimated from active schedules
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border border-neutral-200 dark:border-white/20 shadow-sm bg-background dark:bg-neutral-900/50 overflow-hidden rounded-[2rem]">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <IconCash className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight text-foreground">Recovery Plans</CardTitle>
                                <p className="text-xs font-medium text-muted-foreground">Manage ongoing employee salary advances and recoveries.</p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox 
                                            checked={selectedIds.length === advances.length && advances.length > 0}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedIds(advances.map((a:any) => a.id));
                                                } else {
                                                    setSelectedIds([]);
                                                }
                                            }}
                                        />
                                    </TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Employee</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-center">Progress</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {advancesQuery.isLoading ? (
                                    [1, 2, 3].map(i => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell className="py-5 pl-6"><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                                            <TableCell className="py-5"><div className="h-4 w-32 bg-muted rounded" /></TableCell>
                                            <TableCell className="py-5"><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                                            <TableCell className="py-5"><div className="h-6 w-40 bg-muted rounded-full" /></TableCell>
                                            <TableCell className="py-5"><div className="h-6 w-16 bg-muted rounded-full" /></TableCell>
                                            <TableCell className="py-5 pr-6"><div className="h-4 w-16 bg-muted rounded ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : advances.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-medium">No active advances found.</TableCell>
                                    </TableRow>
                                ) : (
                                    advances.map((advance: any) => {
                                        const recovered = (advance.totalAmount || 0) - (advance.remainingAmount || 0);
                                        const progress = advance.totalAmount > 0 ? (recovered / advance.totalAmount) * 100 : 0;
                                        const isSettled = advance.remainingAmount <= 0;

                                        return (
                                            <TableRow 
                                                key={advance.id} 
                                                className="hover:bg-muted/50 transition-colors cursor-pointer"
                                                onClick={() => {
                                                    setSelectedAdvance(advance);
                                                    setIsDetailsOpen(true);
                                                }}
                                            >
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox 
                                                        checked={selectedIds.includes(advance.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedIds([...selectedIds, advance.id]);
                                                            } else {
                                                                setSelectedIds(selectedIds.filter(id => id !== advance.id));
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium text-sm">
                                                    {format(new Date(advance.date), "MMM d, yyyy")}
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{advance.employee?.fullName}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            {advance.employee?.employeeNo && `(${advance.employee.employeeNo})`}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(advance.totalAmount)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-black tabular-nums">{progress.toFixed(0)}%</span>
                                                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter opacity-50">
                                                            {formatCurrency(advance.remainingAmount)} LKR REM.
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "font-bold text-[10px] uppercase",
                                                            advance.status === 'RECOVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                advance.status === 'PAID' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                        )}
                                                    >
                                                        {advance.status === 'APPROVED' ? 'UNPAID' : advance.status?.replace('_', ' ') || 'PENDING'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {!isSettled ? (
                                                            <div className="flex flex-col items-end mr-1">
                                                                <span className="text-sm font-bold text-foreground tabular-nums">
                                                                    {formatCurrency(advance.remainingAmount)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-end gap-1.5 text-green-600 font-black text-[9px] uppercase tracking-widest bg-green-500/5 px-4 py-2 rounded-2xl border border-green-500/10 shadow-sm shadow-green-500/5">
                                                                <IconCheck className="h-3.5 w-3.5" />
                                                                Settled
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-end gap-2">
                                                        {advance.status === 'APPROVED' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 rounded-xl font-bold text-[10px] uppercase bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 border-none"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setInitialPayIds([advance.id]);
                                                                    setIsPaymentsOpen(true);
                                                                }}
                                                            >
                                                                Pay
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <IssueAdvanceDialog
                open={isIssueOpen}
                onOpenChange={setIsIssueOpen}
                companyId={companyId}
                onSubmit={async (dto) => {
                    await createAdvanceMutation.mutateAsync(dto);
                    setIsIssueOpen(false);
                }}
                isSubmitting={createAdvanceMutation.isPending}
            />

            <AdvanceDetailsDialog 
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                advance={selectedAdvance}
                onPay={(id: string) => {
                    setInitialPayIds([id]);
                    setIsPaymentsOpen(true);
                }}
                onDelete={(id: string) => {
                    setAdvanceToDelete(id);
                    setIsSingleDeleteDialogOpen(true);
                }}
            />

            <SettlePaymentsDialog
                open={isPaymentsOpen}
                onOpenChange={setIsPaymentsOpen}
                companyId={companyId}
                initialAdvanceIds={initialPayIds}
            />

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title={`Delete ${selectedIds.length} Advance Record${selectedIds.length > 1 ? 's' : ''}`}
                description="This action cannot be undone. Only advances that have not been paid or partially recovered will be deleted."
                icon={<IconTrash className="h-8 w-8" />}
                actionLabel="Delete"
                cancelLabel="Cancel"
                onAction={async () => {
                    await deleteAdvanceMutation.mutateAsync(selectedIds);
                    setIsDeleteDialogOpen(false);
                    setSelectedIds([]);
                }}
                variant="destructive"
                loading={deleteAdvanceMutation.isPending}
            />

            <ConfirmationDialog
                open={isSingleDeleteDialogOpen}
                onOpenChange={setIsSingleDeleteDialogOpen}
                title="Delete Advance Record"
                description="This action cannot be undone. Only advances that have not been paid or partially recovered will be deleted."
                icon={<IconTrash className="h-8 w-8" />}
                actionLabel="Delete"
                cancelLabel="Cancel"
                onAction={async () => {
                    if (advanceToDelete) {
                        await deleteAdvanceMutation.mutateAsync(advanceToDelete);
                        setIsSingleDeleteDialogOpen(false);
                        setIsDetailsOpen(false);
                        setAdvanceToDelete(null);
                    }
                }}
                variant="destructive"
                loading={deleteAdvanceMutation.isPending}
            />
        </div>
    );
}
