"use client";

import React, { useState, useEffect } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
    IconX, 
    IconFileText, 
    IconCalendar, 
    IconBuildingBank, 
    IconDeviceFloppy,
    IconDownload,
    IconPaperclip,
    IconArrowRight,
    IconCurrencyDollar,
    IconTrash,
    IconUsers,
    IconChevronRight,
    IconRefresh
} from "@tabler/icons-react";
import { SalaryDetailsDialog } from "../../salaries/components/SalaryDetailsDialog";
import { Salary } from "@/types/salary";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { EpfRecord } from "@/types/statutory";
import { PaymentMethod } from "@/types/salary";
import { FileUpload } from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { useEpf } from "@/hooks/use-statutory";
import { useStorageUrl } from "@/hooks/use-storage";
import { toast } from "sonner";

export const EpfDetailsDialog = ({ 
    open, 
    onOpenChange, 
    record,
    onDelete
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    record: EpfRecord | null;
    onDelete?: (id: string) => void;
}) => {
    const { updateEpfMutation, epfRecordQuery } = useEpf({ companyId: record?.companyId || "" });
    
    // Fetch detailed record with salaries
    const { data: fullRecord, isLoading: isFetchingFull } = epfRecordQuery(record?.id);

    const [formData, setFormData] = useState<Partial<EpfRecord>>({});
    const [showUpload, setShowUpload] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);

    const { data: resolvedSlipUrl } = useStorageUrl(
        formData.slipUrl && !formData.slipUrl.startsWith('http') && !formData.slipUrl.startsWith('blob:') 
            ? formData.slipUrl 
            : null
    );

    const slipUrl = formData.slipUrl && (formData.slipUrl.startsWith('http') || formData.slipUrl.startsWith('blob:'))
        ? formData.slipUrl
        : resolvedSlipUrl;

    useEffect(() => {
        if (record) {
            setFormData({
                referenceNo: record.referenceNo || "",
                paidDate: record.paidDate ? format(new Date(record.paidDate), "yyyy-MM-dd") : "",
                paymentMethod: record.paymentMethod || PaymentMethod.CASH,
                bankName: record.bankName || "",
                bankBranch: record.bankBranch || "",
                bankCode: record.bankCode || "",
                branchCode: record.branchCode || "",
                chequeNo: record.chequeNo || "",
                surcharge: record.surcharge || 0,
                remarks: record.remarks || "",
                slipUrl: record.slipUrl || "",
            });
        }
    }, [record]);

    if (!record) return null;

    const handleSave = () => {
        updateEpfMutation.mutate({
            id: record.id,
            data: {
                ...formData,
                paidDate: formData.paidDate ? new Date(formData.paidDate).toISOString() : null,
                surcharge: parseFloat(formData.surcharge?.toString() || "0"),
            }
        }, {
            onSuccess: () => {
                onOpenChange(false);
            }
        });
    };

    const isPaid = !!record.paidDate || !!formData.paidDate;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-3xl rounded-[2rem] overflow-hidden border-0 p-0 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-primary/5 p-6 sm:p-8 border-b border-primary/10 flex-shrink-0">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                    <IconFileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">
                                        EPF - {format(new Date(record.year, record.month - 1), "MMMM yyyy")}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs font-bold uppercase text-primary/60 tracking-wider">
                                        Submission Details & Payment
                                    </DialogDescription>
                                </div>
                            </div>
                            <Badge 
                                variant="outline" 
                                className={cn(
                                    "font-black uppercase text-[10px] tracking-widest px-3 py-1 rounded-xl",
                                    isPaid ? "bg-green-50 text-green-600 border-green-200" : "bg-orange-50 text-orange-600 border-orange-200"
                                )}
                            >
                                {isPaid ? "Paid" : "Unpaid"}
                            </Badge>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Summary Section */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 flex flex-col gap-1 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <IconCurrencyDollar className="h-12 w-12" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-primary-foreground/70 tracking-widest italic z-10">Total Contribution</span>
                                <span className="text-3xl font-black italic tracking-tighter z-10">
                                    LKR {record.totalContribution.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                                {fullRecord && (
                                    <div className="mt-3 flex gap-4 pt-3 border-t border-primary-foreground/10 z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase text-primary-foreground/60 tracking-widest leading-none">Employee Total</span>
                                            <span className="text-xs font-black">
                                                LKR {fullRecord.salaries?.reduce((sum: number, salary: any) => {
                                                    const epfComp = (salary.components || []).find((c: any) => c.systemType === 'EPF_EMPLOYEE' || (c.name.toLowerCase().includes('epf') && c.category === 'DEDUCTION'));
                                                    return sum + (epfComp?.amount || 0);
                                                }, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex flex-col border-l pl-4 border-primary-foreground/10">
                                            <span className="text-[8px] font-black uppercase text-primary-foreground/60 tracking-widest leading-none">Employer Total</span>
                                            <span className="text-xs font-black">
                                                LKR {fullRecord.salaries?.reduce((sum: number, salary: any) => {
                                                    const epfEmployerComp = (salary.components || []).find((c: any) => c.systemType === 'EPF_EMPLOYER' || (c.name.toLowerCase().includes('epf') && c.employerAmount > 0));
                                                    return sum + (epfEmployerComp?.employerAmount || 0);
                                                }, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest italic px-1">Submission Information</h4>
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Reference Number</Label>
                                        <Input 
                                            value={formData.referenceNo} 
                                            onChange={(e) => setFormData(prev => ({ ...prev, referenceNo: e.target.value }))}
                                            placeholder="Enter EPF Reference No"
                                            className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Surcharge (if any)</Label>
                                        <Input 
                                            type="number"
                                            value={formData.surcharge} 
                                            onChange={(e) => setFormData(prev => ({ ...prev, surcharge: parseFloat(e.target.value) }))}
                                            className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className="space-y-6 text-left">
                            <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest italic px-1">Payment Details</h4>
                            <div className="space-y-4">
                                <div className="space-y-2 text-left">
                                    <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Paid Date</Label>
                                    <Input 
                                        type="date"
                                        value={formData.paidDate} 
                                        onChange={(e) => setFormData(prev => ({ ...prev, paidDate: e.target.value }))}
                                        className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold"
                                    />
                                </div>

                                <div className="space-y-2 text-left">
                                    <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Payment Method</Label>
                                    <Select 
                                        value={formData.paymentMethod} 
                                        onValueChange={(v) => setFormData(prev => ({ ...prev, paymentMethod: v as PaymentMethod }))}
                                    >
                                        <SelectTrigger className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold">
                                            <SelectValue placeholder="Method" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-neutral-100 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-900">
                                            <SelectItem value={PaymentMethod.CASH} className="font-bold py-3">Cash</SelectItem>
                                            <SelectItem value={PaymentMethod.BANK_TRANSFER} className="font-bold py-3">Bank Transfer</SelectItem>
                                            <SelectItem value={PaymentMethod.CHEQUE} className="font-bold py-3">Cheque</SelectItem>
                                            <SelectItem value={PaymentMethod.OTHER} className="font-bold py-3">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {(formData.paymentMethod === PaymentMethod.BANK_TRANSFER || formData.paymentMethod === PaymentMethod.CHEQUE) && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 text-left">
                                                <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Bank Name</Label>
                                                <Input 
                                                    value={formData.bankName} 
                                                    onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                                                    className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold"
                                                    placeholder="e.g. BOC"
                                                />
                                            </div>
                                            <div className="space-y-2 text-left">
                                                <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Bank Code</Label>
                                                <Input 
                                                    value={formData.bankCode} 
                                                    onChange={(e) => setFormData(prev => ({ ...prev, bankCode: e.target.value }))}
                                                    className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold"
                                                    placeholder="0000"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 text-left">
                                                <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Bank Branch</Label>
                                                <Input 
                                                    value={formData.bankBranch} 
                                                    onChange={(e) => setFormData(prev => ({ ...prev, bankBranch: e.target.value }))}
                                                    className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold"
                                                    placeholder="e.g. Colombo 01"
                                                />
                                            </div>
                                            <div className="space-y-2 text-left">
                                                <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Branch Code</Label>
                                                <Input 
                                                    value={formData.branchCode} 
                                                    onChange={(e) => setFormData(prev => ({ ...prev, branchCode: e.target.value }))}
                                                    className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold"
                                                    placeholder="000"
                                                />
                                            </div>
                                        </div>

                                        {formData.paymentMethod === PaymentMethod.CHEQUE && (
                                            <div className="space-y-2 text-left">
                                                <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Cheque No</Label>
                                                <Input 
                                                    value={formData.chequeNo} 
                                                    onChange={(e) => setFormData(prev => ({ ...prev, chequeNo: e.target.value }))}
                                                    className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold"
                                                    placeholder="Enter cheque number"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest italic">Payment Slip</h4>
                            {formData.slipUrl ? (
                                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-primary" onClick={() => setShowUpload(true)}>
                                    Replace Slip
                                </Button>
                            ) : (
                                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-primary" onClick={() => setShowUpload(true)}>
                                    Upload Slip
                                </Button>
                            )}
                        </div>
                        
                        {showUpload ? (
                            <FileUpload 
                                companyId={record.companyId}
                                folder="statutory/epf"
                                onUpload={(file) => {
                                    setFormData(prev => ({ ...prev, slipUrl: file.url }));
                                    setShowUpload(false);
                                    toast.success("Slip uploaded successfully. Click Save to persist changes.");
                                }}
                            />
                        ) : formData.slipUrl ? (
                            <div className="p-6 rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm">
                                        <IconPaperclip className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-primary">Payment Slip Uploaded</p>
                                        <p className="text-[10px] font-bold text-neutral-400">Click to view or replace the document</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="icon" className="rounded-xl" asChild>
                                    <a href={slipUrl || "#"} target="_blank" rel="noopener noreferrer">
                                        <IconDownload className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        ) : (
                            <div className="p-8 rounded-3xl border-2 border-dashed border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-col items-center justify-center text-center gap-2">
                                <p className="text-xs font-bold text-neutral-400 italic">No payment slip attached to this submission.</p>
                                <Button variant="link" className="text-primary font-black uppercase text-[10px]" onClick={() => setShowUpload(true)}>
                                    Attach Document
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 space-y-2 text-left">
                        <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Remarks</Label>
                        <textarea 
                            value={formData.remarks} 
                            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                            placeholder="Add any internal notes..."
                            className="w-full h-24 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold p-4 text-sm focus:ring-primary/20 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <IconUsers className="h-4 w-4" />
                                <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest italic">Included Salaries</h4>
                            </div>
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                {(fullRecord?.salaries?.length || 0)} Employees
                            </span>
                        </div>

                        <div className="bg-background rounded-3xl border border-neutral-100 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-50 dark:divide-neutral-800">
                            {isFetchingFull ? (
                                <div className="p-8 flex justify-center">
                                    <IconRefresh className="h-5 w-5 animate-spin text-primary/20" />
                                </div>
                            ) : fullRecord?.salaries?.length === 0 ? (
                                <p className="p-8 text-center text-xs font-bold text-neutral-400 italic">No salaries linked to this record.</p>
                            ) : (
                                fullRecord?.salaries?.map((salary) => (
                                    <div 
                                        key={salary.id}
                                        className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors group"
                                        onClick={() => setSelectedSalary(salary)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-black text-[10px]">
                                                {salary.employee?.employeeNo}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                                                    {salary.employee?.fullName}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-neutral-400 italic">Net: LKR {salary.netSalary.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">Employee (8%)</p>
                                                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                                        LKR {(() => {
                                                            const epfComp = (salary.components || []).find((c: any) => c.systemType === 'EPF_EMPLOYEE' || (c.name.toLowerCase().includes('epf') && c.category === 'DEDUCTION'));
                                                            return (epfComp?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
                                                        })()}
                                                    </p>
                                                </div>
                                                <div className="text-right border-l pl-4 border-neutral-100 dark:border-neutral-800">
                                                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">Employer (12%)</p>
                                                    <p className="text-xs font-semibold text-primary/80">
                                                        LKR {(() => {
                                                            const epfEmployerComp = (salary.components || []).find((c: any) => c.systemType === 'EPF_EMPLOYER' || (c.name.toLowerCase().includes('epf') && c.employerAmount > 0));
                                                            return (epfEmployerComp?.employerAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
                                                        })()}
                                                    </p>
                                                </div>
                                                <div className="text-right border-l pl-4 border-neutral-100 dark:border-neutral-800">
                                                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">Total EPF (20%)</p>
                                                    <p className="text-sm font-black text-primary">
                                                        LKR {(() => {
                                                            const epfComp = (salary.components || []).find((c: any) => c.systemType === 'EPF_EMPLOYEE' || (c.name.toLowerCase().includes('epf') && c.category === 'DEDUCTION'));
                                                            const epfEmployerComp = (salary.components || []).find((c: any) => c.systemType === 'EPF_EMPLOYER' || (c.name.toLowerCase().includes('epf') && c.employerAmount > 0));
                                                            return ((epfComp?.amount || 0) + (epfEmployerComp?.employerAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 });
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                            <IconChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <SalaryDetailsDialog 
                        open={!!selectedSalary}
                        onOpenChange={(open) => !open && setSelectedSalary(null)}
                        salary={selectedSalary}
                    />
                </div>

                <DialogFooter className="p-6 sm:p-8 bg-neutral-50/50 dark:bg-neutral-800/30 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4 flex-shrink-0">
                    <Button
                        variant="ghost"
                        onClick={() => onDelete?.(record.id)}
                        className="rounded-xl font-black text-[10px] uppercase tracking-wider h-11 px-6 text-red-500 hover:bg-red-50"
                    >
                        <IconTrash className="mr-2 h-4 w-4" />
                        Delete Record
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl font-black text-[10px] uppercase tracking-wider h-11 px-8"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={updateEpfMutation.isPending}
                            className="rounded-xl font-black text-[10px] uppercase tracking-wider h-11 px-8 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {updateEpfMutation.isPending ? "Saving..." : "Save Changes"}
                            <IconDeviceFloppy className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
