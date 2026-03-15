"use client";

import React, { useState } from "react";
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
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { SalaryService } from "@/services/salary.service";
import { EpfService } from "@/services/epf.service";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { toast } from "sonner";
import { useEpf } from "@/hooks/use-statutory";
import { useCompany } from "@/hooks/use-companies";
import { PaymentMethod } from "@/types/salary";
import { 
    IconArrowRight, 
    IconArrowLeft, 
    IconCheck, 
    IconInfoCircle,
    IconCurrencyDollar,
    IconCalendarStats,
    IconRefresh,
    IconBuildingBank
} from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { PayrollComponentSystemType } from "@/types/policy";
import { formatCurrency } from "@/lib/utils";

const steps = ["Period", "Selection", "Preview"];
const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
];

export const GenerateEpfDialog = ({ 
    open, 
    onOpenChange, 
    companyId 
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    companyId: string;
}) => {
    const [step, setStep] = useState(0);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedSalaryIds, setSelectedSalaryIds] = useState<string[]>([]);
    const [remarks, setRemarks] = useState("");
    const [referenceNo, setReferenceNo] = useState("");
    const [surcharge, setSurcharge] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);
    const [bankName, setBankName] = useState("");
    const [bankBranch, setBankBranch] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [branchCode, setBranchCode] = useState("");
    const [chequeNo, setChequeNo] = useState("");

    const { createEpfMutation } = useEpf({ companyId });
    const { data: company } = useCompany(companyId);

    // Sync from company defaults
    React.useEffect(() => {
        if (company) {
            if (company.defaultStatutoryPaymentMethod) setPaymentMethod(company.defaultStatutoryPaymentMethod);
            if (company.statutoryBankName) setBankName(company.statutoryBankName);
            if (company.statutoryBankBranch) setBankBranch(company.statutoryBankBranch);
            if (company.statutoryBankCode) setBankCode(company.statutoryBankCode);
            if (company.statutoryBranchCode) setBranchCode(company.statutoryBranchCode);
        }
    }, [company, open]);

    // Fetch PAID salaries for the selected month
    const salariesQuery = useQuery({
        queryKey: ['salaries-for-epf', companyId, month, year],
        queryFn: async () => {
            const startDate = new Date(year, month - 1, 1).toISOString();
            const endDate = new Date(year, month - 1, 31).toISOString();
            const response = await SalaryService.getSalaries({ 
                companyId, 
                startDate, 
                endDate,
                excludeEpf: true
            });
            if (response.error) throw new Error(response.error.message);
            return (response.data as any)?.data?.items || response.data?.items || [];
        },
        enabled: open && step >= 1,
    });

    const salaries = salariesQuery.data || [];

    // Filter salaries that have EPF components
    const epfSalaries = salaries.filter((s: any) => {
        const components = s.components || [];
        return components.some((c: any) => 
            c.systemType === 'EPF_EMPLOYEE' || c.systemType === 'EPF_EMPLOYER'
        );
    });

    // Default selection
    React.useEffect(() => {
        if (salariesQuery.isSuccess && step === 1 && selectedSalaryIds.length === 0) {
            setSelectedSalaryIds(epfSalaries.map((s: any) => s.id));
        }
    }, [salariesQuery.isSuccess, step]);

    // Preview logic
    const previewQuery = useQuery({
        queryKey: ['epf-preview', companyId, month, year, selectedSalaryIds],
        queryFn: async () => {
            const response = await EpfService.generatePreview(companyId, {
                month,
                year,
                salaryIds: selectedSalaryIds,
            });
            if (response.error) throw new Error(response.error.message);
            return (response.data as any)?.data || response.data;
        },
        enabled: open && step === 2 && selectedSalaryIds.length > 0,
    });

    const preview = previewQuery.data;

    // Check if record already exists for this month/year
    const { data: existingRecords } = useEpf({ companyId, month, year }).epfRecordsQuery;
    const isDuplicate = (existingRecords?.items?.length || 0) > 0;

    // Sync referenceNo with preview
    React.useEffect(() => {
        if (preview?.referenceNo && !referenceNo) {
            setReferenceNo(preview.referenceNo);
        }
    }, [preview]);

    const handleNext = () => {
        if (step < steps.length - 1) setStep(step + 1);
        else handleSave();
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleSave = () => {
        if (!preview) return;
        createEpfMutation.mutate({
            companyId,
            month,
            year,
            salaryIds: selectedSalaryIds,
            totalContribution: (preview.totalContribution || 0) + (surcharge || 0),
            surcharge: surcharge || 0,
            referenceNo: referenceNo || undefined,
            remarks: remarks || undefined,
            paymentMethod,
            bankName: bankName || undefined,
            bankBranch: bankBranch || undefined,
            bankCode: bankCode || undefined,
            branchCode: branchCode || undefined,
            chequeNo: chequeNo || undefined,
        }, {
            onSuccess: () => {
                onOpenChange(false);
                setStep(0);
                setSelectedSalaryIds([]);
                setRemarks("");
                setReferenceNo("");
                setSurcharge(0);
                setChequeNo("");
            }
        });
    };

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-2xl rounded-[2rem] overflow-hidden border-0 p-0 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-primary/5 p-6 sm:p-8 border-b border-primary/10 flex-shrink-0">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                <IconCalendarStats className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Generate EPF</DialogTitle>
                                <DialogDescription className="text-xs font-bold uppercase text-primary/60 tracking-wider">
                                    Step {step + 1}: {steps[step]}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-grow">
                    {step === 0 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Month</label>
                                    <Select 
                                        value={month.toString()} 
                                        onValueChange={(v) => setMonth(parseInt(v))}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm focus:ring-primary/20 font-bold">
                                            <SelectValue placeholder="Month" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-neutral-100 dark:border-neutral-800 shadow-xl">
                                            {months.map((m) => (
                                                <SelectItem key={m.value} value={m.value.toString()} className="font-bold rounded-xl py-3 focus:bg-primary/5 focus:text-primary">
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Year</label>
                                    <Select 
                                        value={year.toString()} 
                                        onValueChange={(v) => setYear(parseInt(v))}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm focus:ring-primary/20 font-bold">
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-neutral-100 dark:border-neutral-800 shadow-xl">
                                            {years.map((y) => (
                                                <SelectItem key={y} value={y.toString()} className="font-bold rounded-xl py-3 focus:bg-primary/5 focus:text-primary">
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {isDuplicate && (
                                <div className="mt-8 p-6 rounded-[2rem] bg-orange-50 border border-orange-100 dark:bg-orange-900/10 dark:border-orange-800/30 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="h-10 w-10 rounded-2xl bg-orange-100 dark:bg-orange-800 text-orange-600 flex items-center justify-center shrink-0 shadow-sm">
                                        <IconInfoCircle className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1 pt-1">
                                        <h4 className="text-sm font-black text-orange-800 dark:text-orange-400 uppercase tracking-tight">Record Already Generated</h4>
                                        <p className="text-xs font-bold text-orange-700/70 dark:text-orange-500/70 leading-relaxed">
                                            An EPF submission for {months.find(m => m.value === month)?.label} {year} already exists for this company. 
                                            You must delete the existing record if you wish to re-generate it.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 flex items-center gap-3 border border-neutral-100 dark:border-neutral-800">
                                <IconInfoCircle className="h-5 w-5 text-primary" />
                                <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                                    Selecting {salaries.length} salaries for {months[month-1].label}. 
                                    Defaulting selection to employees with EPF in their policy.
                                </p>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {salariesQuery.isLoading ? (
                                    <div className="py-20 flex justify-center"><IconRefresh className="h-8 w-8 animate-spin text-primary/20" /></div>
                                ) : salaries.length === 0 ? (
                                    <p className="text-center py-10 text-sm font-bold text-neutral-400">No salaries found for this period.</p>
                                ) : (
                                    salaries.map((salary: any) => (
                                        <div 
                                            key={salary.id}
                                            className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer group"
                                            onClick={() => {
                                                if (selectedSalaryIds.includes(salary.id)) {
                                                    setSelectedSalaryIds(prev => prev.filter(id => id !== salary.id));
                                                } else {
                                                    setSelectedSalaryIds(prev => [...prev, salary.id]);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <Checkbox 
                                                    checked={selectedSalaryIds.includes(salary.id)}
                                                    onCheckedChange={() => {}} // Handled by div click
                                                    className="rounded-lg h-5 w-5 border-neutral-300 data-[state=checked]:bg-primary transition-all"
                                                />
                                                <div>
                                                    <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{salary.employee?.fullName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold text-neutral-400">Net: {formatCurrency(salary.netSalary)}</span>
                                                        <span className="h-1 w-1 rounded-full bg-neutral-300" />
                                                        <span className="text-[10px] font-bold text-primary/60">
                                                            Tot. Earn.: {(() => {
                                                                const epfComp = (salary.components || []).find((c: any) => c.systemType === 'EPF_EMPLOYEE');
                                                                if (epfComp && epfComp.value > 0) {
                                                                    return formatCurrency(epfComp.amount / (epfComp.value / 100));
                                                                }
                                                                return formatCurrency(salary.basicSalary);
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {salary.components?.some((c: any) => c.systemType === 'EPF_EMPLOYEE') ? (
                                                    <span className="text-[8px] font-black uppercase bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">EPF Eligible</span>
                                                ) : (
                                                    <span className="text-[8px] font-black uppercase bg-neutral-100 text-neutral-400 px-2 py-0.5 rounded-full">No EPF</span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            {previewQuery.isLoading ? (
                                <div className="py-20 flex justify-center"><IconRefresh className="h-8 w-8 animate-spin text-primary/20" /></div>
                            ) : preview ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800">
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                            <IconInfoCircle className="h-5 w-5" />
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest italic leading-tight">Reference Number</p>
                                                    </div>
                                                    <Input 
                                                        value={referenceNo}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferenceNo(e.target.value)}
                                                        className="h-12 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm focus-visible:ring-primary/20 font-bold text-sm"
                                                        placeholder="Enter Reference No"
                                                    />
                                                </div>
                                            </div>

                                            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800">
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                                            <IconCurrencyDollar className="h-5 w-5" />
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest italic leading-tight">Surcharge (Optional)</p>
                                                    </div>
                                                    <Input 
                                                        type="number"
                                                        value={surcharge || ""}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSurcharge(parseFloat(e.target.value) || 0)}
                                                        className="h-12 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm focus-visible:ring-primary/20 font-bold text-sm"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    <IconBuildingBank className="h-5 w-5" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest italic leading-tight">Payment Details</p>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Payment Method</Label>
                                                    <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                                                        <SelectTrigger className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-2xl border-neutral-100 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-900">
                                                            <SelectItem value={PaymentMethod.CASH} className="font-bold py-3">Cash</SelectItem>
                                                            <SelectItem value={PaymentMethod.BANK_TRANSFER} className="font-bold py-3">Bank Transfer</SelectItem>
                                                            <SelectItem value={PaymentMethod.CHEQUE} className="font-bold py-3">Cheque</SelectItem>
                                                            <SelectItem value={PaymentMethod.OTHER} className="font-bold py-3">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {(paymentMethod === PaymentMethod.BANK_TRANSFER || paymentMethod === PaymentMethod.CHEQUE) && (
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Bank Name</Label>
                                                        <Input 
                                                            value={bankName}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankName(e.target.value)}
                                                            className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold"
                                                            placeholder="e.g. BOC"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {(paymentMethod === PaymentMethod.BANK_TRANSFER || paymentMethod === PaymentMethod.CHEQUE) && (
                                                <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Bank Code</Label>
                                                        <Input 
                                                            value={bankCode}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankCode(e.target.value)}
                                                            className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold"
                                                            placeholder="0000"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Branch Name</Label>
                                                        <Input 
                                                            value={bankBranch}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankBranch(e.target.value)}
                                                            className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold"
                                                            placeholder="e.g. Colombo"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Branch Code</Label>
                                                        <Input 
                                                            value={branchCode}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBranchCode(e.target.value)}
                                                            className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold"
                                                            placeholder="000"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {paymentMethod === PaymentMethod.CHEQUE && (
                                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                    <Label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Cheque No</Label>
                                                    <Input 
                                                        value={chequeNo}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChequeNo(e.target.value)}
                                                        className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm font-bold"
                                                        placeholder="Enter cheque number"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="p-5 rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 flex flex-col gap-1">
                                                <span className="text-[9px] font-black uppercase text-primary-foreground/70 tracking-widest italic">Total Contribution</span>
                                                <span className="text-2xl font-black italic tracking-tighter">
                                                    {formatCurrency((preview.totalContribution || 0) + (surcharge || 0))}
                                                </span>
                                            </div>
                                            <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 flex flex-col gap-1">
                                                <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest italic">Employee</span>
                                                <span className="text-2xl font-black italic tracking-tighter text-foreground">
                                                    {formatCurrency(preview.items?.reduce((sum: number, item: any) => sum + item.employeeContribution, 0) || 0)}
                                                </span>
                                            </div>
                                            <div className="p-5 rounded-3xl bg-primary/10 dark:bg-primary/20 border border-primary/20 flex flex-col gap-1">
                                                <span className="text-[9px] font-black uppercase text-primary tracking-widest italic">Employer</span>
                                                <span className="text-2xl font-black italic tracking-tighter text-primary">
                                                    {formatCurrency(preview.items?.reduce((sum: number, item: any) => sum + item.employerContribution, 0) || 0)}
                                                </span>
                                            </div>
                                        </div>

                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest italic px-1">Breakdown</h4>
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                            {preview.items?.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
                                                    <div>
                                                        <p className="text-xs font-black">{item.employeeName}</p>
                                                        <p className="text-[9px] font-bold text-neutral-400">Liable: {formatCurrency(item.liableEarnings)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center justify-end gap-4">
                                                            <div>
                                                                <p className="text-[9px] font-bold text-neutral-400">8% (Emp)</p>
                                                                <p className="text-sm font-bold text-neutral-600 dark:text-neutral-300">{formatCurrency(item.employeeContribution)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-bold text-neutral-400">12% (Comp)</p>
                                                                <p className="text-sm font-bold text-primary">{formatCurrency(item.employerContribution)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-1 pt-1 border-t border-border/50">
                                                            <p className="text-[9px] font-black text-neutral-400 uppercase">Total: {formatCurrency(item.totalContribution)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Remarks (Optional)</label>
                                        <textarea
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            placeholder="Add any notes or comments for this EPF contribution..."
                                            className="w-full min-h-[80px] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center py-10 font-bold text-red-500 italic">Failed to load preview. Please try again.</p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 sm:p-8 bg-neutral-50/50 dark:bg-neutral-800/30 border-t border-neutral-100 dark:border-neutral-800 flex flex-row justify-between items-center gap-4 flex-shrink-0">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 0}
                        className="rounded-xl font-black text-[10px] uppercase tracking-wider h-11 px-6 group"
                    >
                        <IconArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={(step === 1 && selectedSalaryIds.length === 0) || previewQuery.isLoading || createEpfMutation.isPending || (step === 0 && isDuplicate)}
                        className="rounded-xl font-black text-[10px] uppercase tracking-wider h-11 px-8 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {step === steps.length - 1 ? (
                            createEpfMutation.isPending ? "Generating..." : "Save Submission"
                        ) : (
                            "Next Phase"
                        )}
                        {step < steps.length - 1 && <IconArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                        {step === steps.length - 1 && !createEpfMutation.isPending && <IconCheck className="ml-2 h-4 w-4" />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
