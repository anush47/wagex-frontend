"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Salary, PaymentMethod } from "@/types/salary";
import { IconCash, IconCreditCard, IconReceipt, IconCheck } from "@tabler/icons-react";
import { format } from "date-fns";

interface RecordPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    salary: Salary | null;
    onPay: (dto: any) => void;
    isSubmitting: boolean;
}

export function RecordPaymentDialog({
    open,
    onOpenChange,
    salary,
    onPay,
    isSubmitting
}: RecordPaymentDialogProps) {
    const totalPaid = salary?.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const balanceDue = (salary?.netSalary || 0) - totalPaid;

    const [amount, setAmount] = useState<number>(0);
    const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);
    const [reference, setReference] = useState<string>("");
    const [remarks, setRemarks] = useState<string>("");

    useEffect(() => {
        if (open && salary) {
            setAmount(balanceDue > 0 ? balanceDue : 0);
            setDate(format(new Date(), "yyyy-MM-dd"));
            setMethod(PaymentMethod.BANK_TRANSFER);
            setReference("");
            setRemarks("");
        }
    }, [open, salary, balanceDue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!salary) return;

        onPay({
            companyId: salary.companyId,
            salaryId: salary.id,
            amount: Number(amount),
            date: new Date(date).toISOString(),
            paymentMethod: method,
            referenceNo: reference,
            remarks: remarks,
        });
    };

    if (!salary) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-12 w-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                            <IconCash className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">Record Payment</DialogTitle>
                            <DialogDescription className="text-sm font-medium">
                                For {salary.employee?.fullName} • {format(new Date(salary.periodStartDate), "MMM yyyy")}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-neutral-400">Total Net Salary</span>
                            <span className="text-lg font-black">{salary.netSalary.toLocaleString()}</span>
                        </div>
                        <div className="h-8 w-px bg-neutral-200" />
                        <div className="flex flex-col items-end text-orange-600">
                            <span className="text-[10px] font-black uppercase opacity-60">Balance Due</span>
                            <span className="text-lg font-black">{balanceDue.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-xs font-black uppercase ml-1">Payment Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="h-12 rounded-xl font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-xs font-black uppercase ml-1">Payment Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="h-12 rounded-xl font-bold"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="method" className="text-xs font-black uppercase ml-1">Payment Method</Label>
                            <Select value={method} onValueChange={(v: any) => setMethod(v)}>
                                <SelectTrigger className="h-12 rounded-xl font-bold">
                                    <SelectValue placeholder="Select Method" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-xl">
                                    <SelectItem value={PaymentMethod.BANK_TRANSFER} className="rounded-xl">Bank Transfer</SelectItem>
                                    <SelectItem value={PaymentMethod.CASH} className="rounded-xl">Cash</SelectItem>
                                    <SelectItem value={PaymentMethod.CHEQUE} className="rounded-xl">Cheque</SelectItem>
                                    <SelectItem value={PaymentMethod.OTHER} className="rounded-xl">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reference" className="text-xs font-black uppercase ml-1">Reference No.</Label>
                            <Input
                                id="reference"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="Ref # / Trans ID"
                                className="h-12 rounded-xl font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="remarks" className="text-xs font-black uppercase ml-1">Remarks (Optional)</Label>
                            <Textarea
                                id="remarks"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="rounded-xl resize-none min-h-[80px]"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="h-14 px-8 font-bold rounded-2xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || amount <= 0}
                            className="h-14 px-10 font-bold rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                        >
                            {isSubmitting ? "Processing..." : "Confirm Payment"}
                            {!isSubmitting && <IconCheck className="ml-2 h-5 w-5" />}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
