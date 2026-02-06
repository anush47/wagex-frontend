"use client";

import { use, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { EmployeeService } from "@/services/employee.service";
import { EmploymentType, Gender } from "@/types/policy";
import { EmployeeStatus } from "@/types/employee";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    IconUserPlus,
    IconArrowLeft,
    IconCheck,
    IconInfoCircle
} from "@tabler/icons-react";
import { Link } from "@/i18n/routing";

export default function NewEmployeePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: companyId } = use(params);
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        nameWithInitials: "",
        fullName: "",
        designation: "",
        employeeNo: 0,
        nic: "",
        joinedDate: new Date().toISOString().split('T')[0],
        resignedDate: "",
        remark: "",
        address: "",
        phone: "",
        gender: Gender.MALE,
        employmentType: EmploymentType.PERMANENT,
        basicSalary: 0,
        companyId,
        status: EmployeeStatus.ACTIVE
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Remove status from the payload as it's not in CreateEmployeeDto
            const { status, ...employeeData } = formData;

            // Capitalize names
            if (employeeData.nameWithInitials) {
                employeeData.nameWithInitials = employeeData.nameWithInitials.toUpperCase();
            }
            if (employeeData.fullName) {
                employeeData.fullName = employeeData.fullName.toUpperCase();
            }

            await EmployeeService.createEmployee(employeeData);
            router.push(`/employer-portal/companies/${companyId}/employees`);
        } catch (error) {
            console.error("Failed to create employee", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-10 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Breadcrumb / Back */}
            <Link
                href={`/employer-portal/companies/${companyId}/employees`}
                className="flex items-center gap-2 text-neutral-400 hover:text-foreground transition-colors group group-hover:-translate-x-1"
            >
                <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center transition-transform group-hover:-translate-x-1">
                    <IconArrowLeft className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest pt-0.5">Back to Employees</span>
            </Link>

            <div className="space-y-2">
                <div className="flex items-center gap-4 text-primary">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <IconUserPlus className="h-7 w-7" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight uppercase">Add Employee</h1>
                </div>
                <p className="text-neutral-500 font-medium text-lg max-w-xl leading-relaxed">
                    Add a new employee to your company's workforce strategy.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-primary/5 bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-8 md:p-12 space-y-10">
                        {/* Section 1: Identity */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-neutral-400">
                                <IconInfoCircle className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Basic Identification</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">Name with Initials</Label>
                                    <Input
                                        required
                                        placeholder="e.g. J. Doe"
                                        className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                        value={formData.nameWithInitials}
                                        onChange={e => updateField('nameWithInitials', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">Full Legal Name</Label>
                                    <Input
                                        required
                                        placeholder="e.g. Johnathan Samuel Doe"
                                        className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                        value={formData.fullName}
                                        onChange={e => updateField('fullName', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">NIC Number</Label>
                                    <Input
                                        required
                                        placeholder="e.g. 199512345678"
                                        className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                        value={formData.nic}
                                        onChange={e => updateField('nic', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">Designation</Label>
                                    <Input
                                        placeholder="e.g. Senior Software Engineer"
                                        className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                        value={formData.designation}
                                        onChange={e => updateField('designation', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">Joined Date</Label>
                                    <Input
                                        type="date"
                                        className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                        value={formData.joinedDate}
                                        onChange={e => updateField('joinedDate', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">Member ID (Number)</Label>
                                    <Input
                                        required
                                        type="number"
                                        placeholder="1001"
                                        className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-black font-mono text-base text-primary shadow-inner"
                                        value={formData.employeeNo || ""}
                                        onChange={e => updateField('employeeNo', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">Phone Number</Label>
                                    <Input
                                        placeholder="+94 77 XXX XXXX"
                                        className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                        value={formData.phone}
                                        onChange={e => updateField('phone', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">Home Address</Label>
                                <Input
                                    placeholder="No. 123, Street name, City"
                                    className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                    value={formData.address}
                                    onChange={e => updateField('address', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">Remarks / Special Notes</Label>
                                <textarea
                                    rows={4}
                                    placeholder="Add any additional notes about the employee..."
                                    className="w-full bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl p-6 font-medium text-base shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    value={formData.remark}
                                    onChange={e => updateField('remark', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Section 2: Attributes */}
                        <div className="space-y-6 pt-10 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center gap-2 text-neutral-400">
                                <IconInfoCircle className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Employment Details</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">Gender</Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={v => updateField('gender', v)}
                                    >
                                        <SelectTrigger className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner uppercase tracking-wider">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value={Gender.MALE}>Male</SelectItem>
                                            <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">Employment Type</Label>
                                    <Select
                                        value={formData.employmentType}
                                        onValueChange={v => updateField('employmentType', v)}
                                    >
                                        <SelectTrigger className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner uppercase tracking-wider">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value={EmploymentType.PERMANENT}>Permanent</SelectItem>
                                            <SelectItem value={EmploymentType.PROBATION}>Probation</SelectItem>
                                            <SelectItem value={EmploymentType.CONTRACT}>Contract</SelectItem>
                                            <SelectItem value={EmploymentType.INTERN}>Intern</SelectItem>
                                            <SelectItem value={EmploymentType.TEMPORARY}>Temporary</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">Base Remuneration (Basic LKR)</Label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-neutral-300">LKR</div>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl pl-16 pr-6 font-black text-lg shadow-inner"
                                        value={formData.basicSalary}
                                        onChange={e => updateField('basicSalary', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-4 p-4">
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-2xl h-14 px-8 font-bold text-sm uppercase tracking-widest hover:bg-neutral-100"
                        onClick={() => router.push(`/employer-portal/companies/${companyId}/employees`)}
                        disabled={submitting}
                    >
                        Discard
                    </Button>
                    <Button
                        type="submit"
                        className="rounded-2xl h-14 px-12 font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        disabled={submitting}
                    >
                        {submitting ? "Processing..." : (
                            <div className="flex items-center gap-2">
                                <IconCheck className="h-5 w-5" />
                                Create Employee
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
