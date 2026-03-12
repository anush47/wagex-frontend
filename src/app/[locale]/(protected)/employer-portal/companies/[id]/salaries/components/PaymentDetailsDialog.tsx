"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
    IconCash, 
    IconCreditCard, 
    IconReceipt, 
    IconUser, 
    IconCalendar, 
    IconHash,
    IconFileText,
    IconBuildingBank,
    IconTrash
} from "@tabler/icons-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useState } from "react";

interface PaymentDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: any;
    onDelete?: (id: string) => void | Promise<void>;
    isDeleting?: boolean;
}

export function PaymentDetailsDialog({ open, onOpenChange, payment, onDelete, isDeleting }: PaymentDetailsDialogProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border border-border shadow-2xl bg-background">
                <div className="bg-primary/5 p-8 border-b border-border/50">
                    <DialogHeader className="flex flex-row justify-between items-start mb-6 -mt-2">
                        <div className="flex flex-col text-left">
                            <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">Transaction Receipt</span>
                            <DialogTitle className="text-3xl font-black tracking-tighter">
                                {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                <span className="text-muted-foreground text-lg ml-1 font-medium italic">LKR</span>
                            </DialogTitle>
                            <VisuallyHidden>
                                <DialogDescription>
                                    Details for transaction {payment.id}
                                </DialogDescription>
                            </VisuallyHidden>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className={`rounded-xl px-2 py-0.5 font-black uppercase text-[9px] ${payment.salaryId ? 'bg-primary/20 text-primary border-primary/20' : 'bg-orange-500/20 text-orange-500 border-orange-500/20'}`}>
                                {payment.salaryId ? 'Salary Payment' : 'Advance Issuance'}
                            </Badge>
                            <Badge variant="outline" className={`rounded-xl px-2 py-0.5 font-black uppercase text-[9px] ${payment.status === 'ACKNOWLEDGED' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'}`}>
                                {payment.status === 'PENDING_ACKNOWLEDGEMENT' ? 'Pending' : payment.status?.replace('_', ' ') || 'PENDING'}
                            </Badge>
                        </div>
                    </DialogHeader>

                    <div className="flex items-center gap-4 bg-background/50 rounded-2xl p-4 border border-border shadow-sm">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <IconUser className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg">{recipient?.fullName || "N/A"}</span>
                            <span className="text-muted-foreground text-xs font-medium font-mono">
                                {recipient?.employeeNo ? `ID: ${recipient.employeeNo}` : "Recipient Details"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <IconCalendar className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Payment Date</span>
                            </div>
                            <p className="font-bold">{format(new Date(payment.date), "MMMM d, yyyy")}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <IconBuildingBank className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Method</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {getMethodIcon(payment.paymentMethod)}
                                <p className="font-bold capitalize">{payment.paymentMethod.toLowerCase().replace('_', ' ')}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <IconHash className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Reference No</span>
                            </div>
                            <p className="font-bold font-mono text-sm">{payment.referenceNo || "---"}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <IconReceipt className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Transaction ID</span>
                            </div>
                            <p className="font-bold text-muted-foreground text-[10px] font-mono leading-none truncate">{payment.id}</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                            <IconFileText className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Remarks / Notes</span>
                        </div>
                        <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
                            <p className="text-sm text-muted-foreground leading-relaxed italic">
                                {payment.remarks || "No additional remarks recorded for this transaction."}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-muted/20 border-t flex flex-col md:flex-row gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="rounded-xl font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10 w-full md:w-auto text-left justify-start md:justify-center"
                        disabled={isDeleting}
                    >
                        <IconTrash className="h-4 w-4 mr-2" />
                        Delete Transaction
                    </Button>
                    <div className="hidden md:block flex-1" />
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl font-bold w-full md:w-32"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Transaction?"
                description="This will permanently delete this payment record and update the net balance for the recipient. This action cannot be undone."
                onAction={async () => {
                    const deletePromise = onDelete?.(payment.id);
                    if (deletePromise) {
                        toast.promise(deletePromise, {
                            loading: 'Deleting transaction...',
                            success: 'Transaction deleted successfully',
                            error: 'Failed to delete transaction',
                        });
                        await deletePromise;
                    }
                    setIsDeleteDialogOpen(false);
                    onOpenChange(false);
                }}
                actionLabel="Delete Transaction"
                cancelLabel="Cancel"
                icon={<IconTrash className="h-8 w-8" />}
                variant="destructive"
                loading={isDeleting}
            />
        </Dialog>
    );
}
