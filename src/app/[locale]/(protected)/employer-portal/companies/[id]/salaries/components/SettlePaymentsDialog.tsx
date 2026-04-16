"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Salary, PaymentMethod, SalaryStatus, SalaryAdvance, AdvanceStatus } from "@/types/salary";
import { IconCash, IconCheck, IconSearch, IconWallet, IconCalendarTime, IconUsers, IconUserCircle, IconReceipt, IconInfoCircle, IconLoader2, IconAlertCircle, IconX } from "@tabler/icons-react";
import { format } from "date-fns";
import { useSalaries } from "@/hooks/use-salaries";
import { useAdvances } from "@/hooks/use-advances";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SettlePaymentsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    initialSalaryIds?: string[];
    initialAdvanceIds?: string[];
}

const EMPTY_ARRAY: string[] = [];

interface SelectionItem {
    id: string;
    type: 'salary' | 'advance';
    empId: string;
}

export function SettlePaymentsDialog({
    open,
    onOpenChange,
    companyId,
    initialSalaryIds = EMPTY_ARRAY,
    initialAdvanceIds = EMPTY_ARRAY,
}: SettlePaymentsDialogProps) {
    const [selectionQueue, setSelectionQueue] = useState<SelectionItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    const selectedSalaryIds = useMemo(() => selectionQueue.filter(i => i.type === 'salary').map(i => i.id), [selectionQueue]);
    const selectedAdvanceIds = useMemo(() => selectionQueue.filter(i => i.type === 'advance').map(i => i.id), [selectionQueue]);

    // Internal state for disbursement details
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentDate, setPaymentDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);
    const [reference, setReference] = useState<string>("");
    const [remarks, setRemarks] = useState<string>("");

    const { salariesQuery, createPaymentMutation } = useSalaries({
        companyId,
        limit: 1000,
    });

    const { advancesQuery } = useAdvances({ companyId });

    const isDataLoading = salariesQuery.isLoading || advancesQuery.isLoading;
    
    const allSalaries = useMemo(() => {
        const data = salariesQuery.data as any;
        return Array.isArray(data) ? data : (data?.items || []);
    }, [salariesQuery.data]);

    const allAdvances = useMemo(() => {
        const data = advancesQuery.data as any;
        return Array.isArray(data) ? data : (data?.items || []);
    }, [advancesQuery.data]);

    // Grouping salaries and advances by employee
    const groupedDues = useMemo(() => {
        const map = new Map<string, { employee: any, records: Salary[], advances: SalaryAdvance[], totalBalance: number }>();
        
        allSalaries.forEach((s: Salary) => {
            if (s.status === SalaryStatus.APPROVED || s.status === SalaryStatus.PARTIALLY_PAID) {
                const empId = s.employee?.id || s.employeeId;
                if (!empId) return;

                const paid = s.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                const balance = s.netSalary - paid;
                
                if (balance <= 0.01) return;

                if (!map.has(empId)) {
                    map.set(empId, { employee: s.employee || { fullName: 'Unknown', employeeNo: 'N/A' }, records: [], advances: [], totalBalance: 0 });
                }
                const entry = map.get(empId)!;
                entry.records.push(s);
                entry.totalBalance += balance;
            }
        });

        allAdvances.forEach((adv: SalaryAdvance) => {
            if (adv.status === AdvanceStatus.APPROVED) {
                const empId = adv.employee?.id || adv.employeeId;
                if (!empId) return;

                const balance = adv.totalAmount; // Amount to pay OUT is total amount
                if (balance <= 0.01) return;

                if (!map.has(empId)) {
                    map.set(empId, { employee: adv.employee || { fullName: 'Unknown', employeeNo: 'N/A' }, records: [], advances: [], totalBalance: 0 });
                }
                const entry = map.get(empId)!;
                entry.advances.push(adv);
                entry.totalBalance += balance;
            }
        });

        return Array.from(map.values()).filter(group => 
            group.employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            group.employee.employeeNo?.toString().includes(searchTerm)
        ).sort((a, b) => b.totalBalance - a.totalBalance);
    }, [allSalaries, allAdvances, searchTerm]);

    // Handle initial selection when dialog opens
    useEffect(() => {
        if (open) {
            let newItems: SelectionItem[] = [];

            if (initialSalaryIds.length > 0) {
                const salaryItems: SelectionItem[] = initialSalaryIds.map(id => {
                    const s = allSalaries.find((r:any) => r.id === id);
                    return { id, type: 'salary' as const, empId: s?.employee?.id || s?.employeeId || '' };
                }).filter(i => i.empId !== '');
                newItems = [...newItems, ...salaryItems];
            }

            if (initialAdvanceIds.length > 0) {
                const advanceItems: SelectionItem[] = initialAdvanceIds.map(id => {
                    const adv = allAdvances.find((r:any) => r.id === id);
                    return { id, type: 'advance' as const, empId: adv?.employee?.id || adv?.employeeId || '' };
                }).filter(i => i.empId !== '');
                newItems = [...newItems, ...advanceItems];
            }

            if (newItems.length > 0) {
                // If there are multiple employees, only the first one's items should be selected
                const firstEmpId = newItems[0].empId;
                const filteredItems = newItems.filter(i => i.empId === firstEmpId);
                setSelectionQueue(filteredItems);
            }
        } else {
            setSelectionQueue([]);
            setSearchTerm("");
        }
    }, [open, initialSalaryIds, initialAdvanceIds, allSalaries.length, allAdvances.length]);

    // Identify which employee is currently 'active' for selection
    const activeEmployeeId = useMemo(() => {
        if (selectionQueue.length === 0) return null;
        return selectionQueue[0].empId;
    }, [selectionQueue]);

    const totalSelectedDue = useMemo(() => {
        let total = 0;
        selectionQueue.forEach(item => {
            if (item.type === 'salary') {
                const r = allSalaries.find((s:any) => s.id === item.id);
                if (r) {
                    const paid = r.payments?.reduce((pSum: number, p: any) => pSum + p.amount, 0) || 0;
                    total += (r.netSalary - paid);
                }
            } else {
                const adv = allAdvances.find((a:any) => a.id === item.id);
                if (adv) {
                    total += adv.totalAmount;
                }
            }
        });
        return total;
    }, [selectionQueue, allSalaries, allAdvances]);

    // Use a key to force reset of input when selection changes
    const selectionKey = useMemo(() => selectionQueue.map(i => i.id).sort().join(','), [selectionQueue]);

    useEffect(() => {
        setPaymentAmount(totalSelectedDue);
    }, [selectionKey, totalSelectedDue]);

    const handleSubmit = async () => {
        if (selectionQueue.length === 0 || paymentAmount <= 0) return;

        let remainingMoney = paymentAmount;
        const promises = [];

        // Iterate in the order of selection
        for (const item of selectionQueue) {
            if (remainingMoney <= 0) break;

            let balance = 0;
            if (item.type === 'salary') {
                const salary = allSalaries.find((r: any) => r.id === item.id);
                if (!salary) continue;
                const alreadyPaid = salary.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
                balance = salary.netSalary - alreadyPaid;
            } else {
                const adv = allAdvances.find((a: any) => a.id === item.id);
                if (!adv) continue;
                balance = adv.totalAmount;
            }
            
            const amountToPay = Math.min(remainingMoney, balance);
            remainingMoney -= amountToPay;

            const payload: any = {
                companyId,
                amount: amountToPay,
                date: new Date(paymentDate).toISOString(),
                paymentMethod: paymentMethod,
                referenceNo: reference,
                remarks: remarks,
            };

            if (item.type === 'salary') {
                payload.salaryId = item.id;
            } else {
                payload.advanceId = item.id;
            }

            promises.push(createPaymentMutation.mutateAsync(payload));
        }

        try {
            await Promise.all(promises);
            toast.success(`Payments recorded successfully`);
            setSelectionQueue([]);
            setReference("");
            setRemarks("");
        } catch (error) {
            toast.error("An error occurred during payment processing");
        }
    };

    const handleSelectItem = (id: string, type: 'salary' | 'advance', empId: string) => {
        if (activeEmployeeId && activeEmployeeId !== empId) {
            toast.warning("You can only settle one employee at a time.");
            return;
        }
        
        setSelectionQueue(prev => {
            const exists = prev.find(i => i.id === id && i.type === type);
            if (exists) {
                return prev.filter(i => !(i.id === id && i.type === type));
            } else {
                return [...prev, { id, type, empId }];
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[95vw] lg:max-w-[1100px] rounded-2xl md:rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden bg-background h-[95vh] md:h-[85vh] flex flex-col" showCloseButton={true}>
                <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden relative">
                    {/* Left Panel: Integrated Dues List */}
                    <div className="flex-none lg:flex-1 h-[350px] lg:h-auto flex flex-col bg-muted/5 border-b lg:border-b-0 lg:border-r border-border/50 overflow-hidden">
                        <div className="p-4 md:p-8 pb-2 md:pb-4 shrink-0 mt-4 md:mt-0">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 md:mb-6 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                                        <IconWallet className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-black uppercase tracking-tight leading-none">Settlement</DialogTitle>
                                        <DialogDescription className="text-[10px] font-bold uppercase text-muted-foreground mt-1 tracking-widest opacity-50">Select Cycles & Advances</DialogDescription>
                                    </div>
                                </div>
                                <div className="relative w-full md:w-64">
                                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                                    <Input 
                                        placeholder="Search staff..." 
                                        className="pl-9 h-9 rounded-xl bg-background border-none shadow-inner text-[11px] font-bold w-full"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 px-6 pb-6 mt-2">
                            <div className="space-y-4">
                                {isDataLoading ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-40">
                                        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : groupedDues.length > 0 ? (
                                    groupedDues.map((group) => {
                                        const empId = group.employee.id || group.records[0]?.employeeId || group.advances[0]?.employeeId;
                                        const isDisabled = activeEmployeeId !== null && activeEmployeeId !== empId;
                                        
                                        return (
                                            <div 
                                                key={empId} 
                                                className={cn(
                                                    "rounded-[1.75rem] border-2 transition-all overflow-hidden",
                                                    isDisabled ? "opacity-30 grayscale pointer-events-none" : "bg-background border-transparent"
                                                )}
                                            >
                                                <div className="flex items-center justify-between p-5 bg-muted/10">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
                                                            {group.employee.fullName.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black tracking-tight">{group.employee.fullName}</span>
                                                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">ID: {group.employee.employeeNo}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-lg font-black tabular-nums">{group.totalBalance.toLocaleString()}</span>
                                                        <span className="text-[8px] font-black uppercase text-primary tracking-widest ml-1">LKR</span>
                                                    </div>
                                                </div>

                                                <div className="p-3 space-y-2">
                                                    {/* Salary Records */}
                                                    {group.records.map((r) => {
                                                        const paid = r.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                                                        const balance = r.netSalary - paid;
                                                        const selectionIndex = selectionQueue.findIndex(i => i.id === r.id && i.type === 'salary');
                                                        const isSelected = selectionIndex !== -1;

                                                        return (
                                                            <div 
                                                                key={r.id}
                                                                onClick={() => handleSelectItem(r.id, 'salary', empId)}
                                                                className={cn(
                                                                    "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2",
                                                                    isSelected 
                                                                        ? "bg-primary/5 border-primary/30 shadow-sm" 
                                                                        : "bg-muted/5 border-transparent hover:bg-muted/10"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="relative">
                                                                        <Checkbox 
                                                                            checked={isSelected} 
                                                                            onCheckedChange={() => {}} 
                                                                            className="h-5 w-5 rounded-md border-2"
                                                                        />
                                                                        {isSelected && (
                                                                            <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[8px] font-black">
                                                                                {selectionIndex + 1}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[11px] font-bold">{format(new Date(r.periodStartDate), "MMMM yyyy")}</span>
                                                                            <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-tighter">Salary Cycle</span>
                                                                        </div>
                                                                        <div className="w-[1px] h-6 bg-border/40" />
                                                                        <div className="flex items-center gap-2">
                                                                             <div className="h-6 w-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                                                 <IconReceipt className="h-3 w-3 text-blue-500" />
                                                                             </div>
                                                                             <span className="text-[9px] font-black text-blue-600/60 uppercase tracking-tight">Salary</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-xs font-black tabular-nums">{balance.toLocaleString()}</span>
                                                                    <span className="text-[8px] font-black text-primary uppercase block tracking-tighter">LKR</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Advance Records */}
                                                    {group.advances.map((adv) => {
                                                        const selectionIndex = selectionQueue.findIndex(i => i.id === adv.id && i.type === 'advance');
                                                        const isSelected = selectionIndex !== -1;

                                                        return (
                                                            <div 
                                                                key={adv.id}
                                                                onClick={() => handleSelectItem(adv.id, 'advance', empId)}
                                                                className={cn(
                                                                    "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2",
                                                                    isSelected 
                                                                        ? "bg-amber-500/5 border-amber-500/30 shadow-sm" 
                                                                        : "bg-muted/5 border-transparent hover:bg-muted/10"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="relative">
                                                                        <Checkbox 
                                                                            checked={isSelected} 
                                                                            onCheckedChange={() => {}} 
                                                                            className="h-5 w-5 rounded-md border-2 border-amber-500/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                                                                        />
                                                                        {isSelected && (
                                                                            <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] font-black">
                                                                                {selectionIndex + 1}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[11px] font-bold">{format(new Date(adv.date), "MMM d, yyyy")}</span>
                                                                            <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-tighter">Advance Request</span>
                                                                        </div>
                                                                        <div className="w-[1px] h-6 bg-border/40" />
                                                                        <div className="flex items-center gap-2">
                                                                             <div className="h-6 w-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                                                                 <IconCash className="h-3 w-3 text-amber-500" />
                                                                             </div>
                                                                             <span className="text-[9px] font-black text-amber-600/70 uppercase tracking-tight">Advance</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-xs font-black tabular-nums text-amber-600">{adv.totalAmount.toLocaleString()}</span>
                                                                    <span className="text-[8px] font-black text-amber-600 uppercase block tracking-tighter">LKR</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-40 flex flex-col items-center justify-center text-muted-foreground opacity-20">
                                        <IconWallet className="h-16 w-16 mb-4" strokeWidth={1} />
                                        <h3 className="text-sm font-black uppercase tracking-widest">No Dues Found</h3>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Panel: Disbursement Configuration */}
                    <div className="w-full lg:w-[380px] bg-muted/10 flex flex-col border-t lg:border-t-0 lg:border-l border-border/50 overflow-visible lg:overflow-hidden shrink-0 lg:shrink">
                        <div className="p-4 md:p-8 flex-1 flex flex-col lg:overflow-y-auto pb-8">
                            <div className="mb-6 p-6 rounded-[1.75rem] bg-background shadow-xl shadow-primary/5 border border-primary/5">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Payment Amount</span>
                                        <Badge className="bg-primary/10 text-primary border-none rounded-lg px-2 py-0.5 font-black text-[8px]">
                                            {selectionQueue.length} ITEMS
                                        </Badge>
                                    </div>
                                    <div className="flex items-center bg-muted/30 rounded-2xl px-5 h-20 border-2 border-transparent focus-within:border-primary/20 focus-within:bg-background transition-all group">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-focus-within:bg-primary group-focus-within:text-white transition-colors">
                                            <IconCash className="h-6 w-6" />
                                        </div>
                                        <Input 
                                            key={selectionKey}
                                            type="number"
                                            min="0"
                                            defaultValue={totalSelectedDue}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setPaymentAmount(val < 0 ? 0 : val);
                                            }}
                                            className="flex-1 border-none bg-transparent h-full text-4xl font-black text-right focus-visible:ring-0 tabular-nums text-primary pr-2"
                                        />
                                        <div className="flex flex-col items-end justify-center ml-2 opacity-40">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">LKR</span>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-border/40 flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-muted-foreground uppercase opacity-40 italic">Selection creates recovery liability</span>
                                        <span className="font-black italic opacity-60 tabular-nums">{totalSelectedDue.toLocaleString()} LKR</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Date</Label>
                                        <div className="relative">
                                            <IconCalendarTime className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
                                            <Input 
                                                type="date" 
                                                value={paymentDate} 
                                                onChange={(e) => setPaymentDate(e.target.value)} 
                                                className="pl-10 h-11 rounded-xl bg-background border-none shadow-sm font-bold text-xs" 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Channel</Label>
                                        <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                                            <SelectTrigger className="h-11 rounded-xl bg-background border-none shadow-sm font-bold text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-none shadow-2xl p-1">
                                                <SelectItem value={PaymentMethod.BANK_TRANSFER} className="rounded-lg h-9 text-xs">Bank Transfer</SelectItem>
                                                <SelectItem value={PaymentMethod.CASH} className="rounded-lg h-9 text-xs">Cash</SelectItem>
                                                <SelectItem value={PaymentMethod.CHEQUE} className="rounded-lg h-9 text-xs">Cheque</SelectItem>
                                                <SelectItem value={PaymentMethod.OTHER} className="rounded-lg h-9 text-xs">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reference</Label>
                                        <Input 
                                            placeholder="TxID / Ref" 
                                            value={reference} 
                                            onChange={(e) => setReference(e.target.value)} 
                                            className="h-11 rounded-xl bg-background border-none shadow-sm font-bold text-xs" 
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Notes</Label>
                                        <textarea 
                                            className="w-full rounded-xl p-3 bg-background border-none shadow-sm text-xs font-medium resize-none h-24 focus:ring-1 ring-primary/20 outline-none transition-all" 
                                            placeholder="..."
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Sticky Footer */}
                <div className="min-h-[4rem] py-4 md:py-0 px-4 md:px-10 bg-muted/20 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 z-10 shrink-0">
                    <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-start">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1 opacity-50">Settlement Amount</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl md:text-2xl font-black tabular-nums text-primary">{paymentAmount.toLocaleString()}</span>
                                <span className="text-[10px] font-black text-primary/40 uppercase tracking-tighter">LKR</span>
                            </div>
                        </div>
                        <div className="w-[1px] h-10 bg-border/50 hidden md:block" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1 opacity-50">Payload Status</span>
                            <div className="flex items-center gap-2">
                                <span className="text-base md:text-lg font-black text-foreground">{selectionQueue.length} <span className="text-[10px] md:text-xs opacity-40 uppercase font-bold tracking-tight">Items</span></span>
                                {selectionQueue.length > 0 && <IconCheck className="h-4 w-4 text-green-500" />}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                        {selectionQueue.length > 0 && (
                            <Button 
                                variant="outline" 
                                className="h-12 px-4 md:px-6 rounded-[1rem] md:rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-muted/10 border-muted-foreground/10 w-1/3 md:w-auto"
                                onClick={() => setSelectionQueue([])}
                            >
                                ResetSelection
                            </Button>
                        )}
                        <Button 
                            onClick={handleSubmit} 
                            disabled={selectionQueue.length === 0 || paymentAmount <= 0 || createPaymentMutation.isPending}
                            className="flex-1 md:flex-none h-12 md:h-14 px-6 md:px-12 rounded-[1rem] md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all bg-foreground text-background"
                        >
                            {createPaymentMutation.isPending ? "Processing..." : "Confirm Payment"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
