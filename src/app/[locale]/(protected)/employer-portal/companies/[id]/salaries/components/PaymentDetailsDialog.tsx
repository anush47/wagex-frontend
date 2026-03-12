"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
    IconCash, 
    IconCreditCard, 
    IconReceipt, 
    IconUser, 
    IconCalendar, 
    IconHash,
    IconFileText,
    IconBuildingBank
} from "@tabler/icons-react";

interface PaymentDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: any;
}

export function PaymentDetailsDialog({ open, onOpenChange, payment }: PaymentDetailsDialogProps) {
    if (!payment) return null;

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'CASH': return <IconCash className="h-5 w-5 text-green-600" />;
            case 'BANK_TRANSFER': return <IconBuildingBank className="h-5 w-5 text-blue-600" />;
            default: return <IconReceipt className="h-5 w-5 text-neutral-500" />;
        }
    };

    const recipient = payment.salary?.employee || payment.advance?.employee;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 text-white">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col">
                            <span className="text-neutral-400 text-xs font-black uppercase tracking-widest mb-1">Transaction Receipt</span>
                            <h2 className="text-3xl font-black tracking-tighter">
                                {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                <span className="text-neutral-500 text-lg ml-1 font-medium">LKR</span>
                            </h2>
                        </div>
                        <Badge className={`rounded-xl px-3 py-1 font-black uppercase text-[10px] ${payment.salaryId ? 'bg-primary/20 text-primary border-primary/20' : 'bg-orange-500/20 text-orange-500 border-orange-500/20'}`}>
                            {payment.salaryId ? 'Salary Payment' : 'Advance Issuance'}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <IconUser className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-lg">{recipient?.fullName || "N/A"}</span>
                            <span className="text-neutral-400 text-xs font-medium font-mono">
                                {recipient?.employeeNo ? `ID: ${recipient.employeeNo}` : "Recipient Details"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-white space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-neutral-400">
                                <IconCalendar className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Payment Date</span>
                            </div>
                            <p className="font-bold text-neutral-800">{format(new Date(payment.date), "MMMM d, yyyy")}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-neutral-400">
                                <IconBuildingBank className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Method</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {getMethodIcon(payment.paymentMethod)}
                                <p className="font-bold text-neutral-800 capitalize">{payment.paymentMethod.toLowerCase().replace('_', ' ')}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-neutral-400">
                                <IconHash className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Reference No</span>
                            </div>
                            <p className="font-bold text-neutral-800 font-mono">{payment.referenceNo || "---"}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-neutral-400">
                                <IconReceipt className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Transaction ID</span>
                            </div>
                            <p className="font-bold text-neutral-500 text-xs font-mono">{payment.id}</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-neutral-100">
                        <div className="flex items-center gap-2 text-neutral-400 mb-2">
                            <IconFileText className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Remarks / Notes</span>
                        </div>
                        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                            <p className="text-sm text-neutral-600 leading-relaxed italic">
                                {payment.remarks || "No additional remarks recorded for this transaction."}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-neutral-50 border-t flex gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl font-bold border-neutral-200"
                        fullWidth
                    >
                        Close
                    </Button>
                    <Button 
                        className="rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                        fullWidth
                    >
                        Download PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
