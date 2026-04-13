"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Employee, EmployeeStatus } from "@/types/employee";
import { Card, CardContent } from "@/components/ui/card";
import {
    IconUser,
    IconMail,
    IconId,
    IconBriefcase,
    IconUserBolt,
    IconCalendar,
    IconCurrencyDollar,
    IconUsers,
    IconHeart,
    IconBuildingBank,
    IconPhone,
    IconGlobe,
    IconShieldCheck,
    IconCalendarStats,
    IconLoader2
} from "@tabler/icons-react";
import { MaritalStatus } from "@/types/policy";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Gender, EmploymentType } from "@/types/policy";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";
import { useCalendars } from "@/hooks/use-calendars";

interface EmployeeGeneralTabProps {
    formData: Employee;
    onChange: (field: keyof Employee, value: any) => void;
    onDetailChange: (field: string, value: any) => void;
    departments?: any[];
    isEmployee?: boolean;
}

export function EmployeeGeneralTab({ formData, onChange, onDetailChange, departments = [], isEmployee = false }: EmployeeGeneralTabProps) {
    const { data: calendars, isLoading: isCalendarsLoading } = useCalendars();

    const canSelfEdit = formData.canSelfEdit !== false;
    
    // Helper to determine if a field should be disabled for an employee
    const isFieldDisabled = (fieldName: string, isRestricted: boolean = false) => {
        if (!isEmployee) return false;
        if (isRestricted) return true; // Always disabled for employees (e.g. salary, designation)
        return !canSelfEdit; // Disabled only if self-edit is off
    };

    const getFieldClasses = (disabled: boolean = false) => cn(
        "h-14 rounded-2xl px-6 font-bold text-base transition-all duration-200 outline-none",
        !disabled
            ? "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10"
            : "bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 cursor-not-allowed shadow-none"
    );

    const ReadOnlyField = ({ value, className, icon: Icon }: { value: string | number | null | undefined, className?: string, icon?: any }) => (
        <div className={cn(
            "h-12 flex items-center font-black text-lg text-neutral-900 dark:text-white tracking-tight",
            className
        )}>
            {Icon && <Icon className="mr-3 h-5 w-5 text-primary shrink-0" />}
            <span className="truncate">{value || "—"}</span>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-10 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <IconUser className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight uppercase">Basic Identity</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Name with Initials</Label>
                                {isFieldDisabled('nameWithInitials') ? (
                                    <ReadOnlyField value={formData.nameWithInitials} />
                                ) : (
                                    <Input
                                        value={formData.nameWithInitials}
                                        onChange={e => onChange('nameWithInitials', e.target.value)}
                                        className={getFieldClasses(false)}
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Member Number</Label>
                                {isFieldDisabled('employeeNo', true) ? (
                                    <ReadOnlyField value={formData.employeeNo} className="font-black font-mono text-primary" />
                                ) : (
                                    <Input
                                        type="number"
                                        value={formData.employeeNo || ""}
                                        onChange={e => onChange('employeeNo', parseInt(e.target.value) || 0)}
                                        className={cn(getFieldClasses(false), "font-black font-mono text-primary")}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Full Legal Name</Label>
                            {isFieldDisabled('fullName') ? (
                                <ReadOnlyField value={formData.fullName} />
                            ) : (
                                <Input
                                    value={formData.fullName}
                                    onChange={e => onChange('fullName', e.target.value)}
                                    className={getFieldClasses(false)}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">NIC Number</Label>
                                {isFieldDisabled('nic') ? (
                                    <ReadOnlyField value={formData.nic} />
                                ) : (
                                    <Input
                                        value={formData.nic || ""}
                                        onChange={e => onChange('nic', e.target.value)}
                                        className={getFieldClasses(false)}
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Designation</Label>
                                {isFieldDisabled('designation', true) ? (
                                    <ReadOnlyField value={formData.designation} />
                                ) : (
                                    <Input
                                        value={formData.designation || ""}
                                        onChange={e => onChange('designation', e.target.value)}
                                        className={getFieldClasses(false)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Joined Date</Label>
                                {isFieldDisabled('joinedDate', true) ? (
                                    <ReadOnlyField value={formData.joinedDate ? new Date(formData.joinedDate).toLocaleDateString('en-US', { dateStyle: 'long' }) : ""} />
                                ) : (
                                    <Input
                                        type="date"
                                        value={formData.joinedDate ? new Date(formData.joinedDate).toISOString().split('T')[0] : ""}
                                        onChange={e => onChange('joinedDate', e.target.value)}
                                        className={getFieldClasses(false)}
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Resigned Date</Label>
                                {isFieldDisabled('resignedDate', true) ? (
                                    <ReadOnlyField value={formData.resignedDate ? new Date(formData.resignedDate).toLocaleDateString('en-US', { dateStyle: 'long' }) : ""} />
                                ) : (
                                    <Input
                                        type="date"
                                        value={formData.resignedDate ? new Date(formData.resignedDate).toISOString().split('T')[0] : ""}
                                        onChange={e => onChange('resignedDate', e.target.value)}
                                        className={getFieldClasses(false)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Phone Number</Label>
                            {isFieldDisabled('phone') ? (
                                <ReadOnlyField value={formData.phone} />
                            ) : (
                                <Input
                                    value={formData.phone || ""}
                                    onChange={e => onChange('phone', e.target.value)}
                                    className={getFieldClasses(false)}
                                />
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Home Address</Label>
                            {isFieldDisabled('address') ? (
                                <ReadOnlyField value={formData.address} />
                            ) : (
                                <Input
                                    value={formData.address || ""}
                                    onChange={e => onChange('address', e.target.value)}
                                    className={getFieldClasses(false)}
                                />
                            )}
                        </div>

                        {!isEmployee && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Remarks / Special Notes</Label>
                                <textarea
                                    rows={4}
                                    value={formData.remark || ""}
                                    onChange={e => onChange('remark', e.target.value)}
                                    className={cn(getFieldClasses(false), "w-full py-6 resize-none h-auto")}
                                    placeholder="Add any additional notes about the employee..."
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Gender</Label>
                                {isFieldDisabled('gender') ? (
                                    <ReadOnlyField value={formData.gender} />
                                ) : (
                                    <Select value={formData.gender} onValueChange={v => onChange('gender', v as any)}>
                                        <SelectTrigger className={getFieldClasses(false)}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value={Gender.MALE}>Male</SelectItem>
                                            <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Employment Type</Label>
                                {isFieldDisabled('employmentType', true) ? (
                                    <ReadOnlyField value={formData.employmentType} />
                                ) : (
                                    <Select value={formData.employmentType} onValueChange={v => onChange('employmentType', v as any)}>
                                        <SelectTrigger className={getFieldClasses(false)}>
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
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-10 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                <IconUsers className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight uppercase">Family & Personal</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Fathers Name</Label>
                                {isFieldDisabled('fathersName') ? (
                                    <ReadOnlyField value={formData.details?.fathersName} />
                                ) : (
                                    <Input
                                        value={formData.details?.fathersName || ""}
                                        onChange={e => onDetailChange('fathersName', e.target.value)}
                                        className={getFieldClasses(false)}
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Mothers Name</Label>
                                {isFieldDisabled('mothersName') ? (
                                    <ReadOnlyField value={formData.details?.mothersName} />
                                ) : (
                                    <Input
                                        value={formData.details?.mothersName || ""}
                                        onChange={e => onDetailChange('mothersName', e.target.value)}
                                        className={getFieldClasses(false)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Marital Status</Label>
                                {isFieldDisabled('maritalStatus') ? (
                                    <ReadOnlyField value={formData.details?.maritalStatus?.toLowerCase()} className="capitalize" />
                                ) : (
                                    <Select value={formData.details?.maritalStatus} onValueChange={v => onDetailChange('maritalStatus', v)}>
                                        <SelectTrigger className={getFieldClasses(false)}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value={MaritalStatus.SINGLE}>Single</SelectItem>
                                            <SelectItem value={MaritalStatus.MARRIED}>Married</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            {formData.details?.maritalStatus === MaritalStatus.MARRIED && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Spouse Name</Label>
                                    {isFieldDisabled('spouseName') ? (
                                        <ReadOnlyField value={formData.details?.spouseName} />
                                    ) : (
                                        <Input
                                            value={formData.details?.spouseName || ""}
                                            onChange={e => onDetailChange('spouseName', e.target.value)}
                                            className={getFieldClasses(false)}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Nationality</Label>
                            {isFieldDisabled('nationality') ? (
                                <ReadOnlyField 
                                    value={formData.details?.nationality} 
                                    icon={IconGlobe}
                                />
                            ) : (
                                <div className="relative">
                                    <IconGlobe className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                                    <Input
                                        value={formData.details?.nationality || ""}
                                        onChange={e => onDetailChange('nationality', e.target.value)}
                                        className={cn(getFieldClasses(false), "pl-16")}
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-10 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600">
                                <IconPhone className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight uppercase">Emergency Contact</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Contact Person Name</Label>
                                {isFieldDisabled('emergencyContactName') ? (
                                    <ReadOnlyField value={formData.details?.emergencyContactName} />
                                ) : (
                                    <Input
                                        value={formData.details?.emergencyContactName || ""}
                                        onChange={e => onDetailChange('emergencyContactName', e.target.value)}
                                        className={getFieldClasses(false)}
                                        placeholder="Full name of emergency contact"
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Contact Phone</Label>
                                {isFieldDisabled('emergencyContactPhone') ? (
                                    <ReadOnlyField value={formData.details?.emergencyContactPhone} />
                                ) : (
                                    <Input
                                        value={formData.details?.emergencyContactPhone || ""}
                                        onChange={e => onDetailChange('emergencyContactPhone', e.target.value)}
                                        className={getFieldClasses(false)}
                                        placeholder="+94"
                                    />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-10 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                <IconBriefcase className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight uppercase">Placement & Role</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Department</Label>
                                {isFieldDisabled('departmentId', true) ? (
                                    <ReadOnlyField value={formData.department?.name || "Unassigned"} />
                                ) : (
                                    <Select value={formData.departmentId || "unassigned"} onValueChange={v => onChange('departmentId', v === "unassigned" ? null : v)}>
                                        <SelectTrigger className={getFieldClasses(false)}>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {departments?.map(dept => (
                                                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Reporting Manager</Label>
                                {isFieldDisabled('managerId', true) ? (
                                    <ReadOnlyField value={formData.manager?.fullName} />
                                ) : (
                                    <>
                                        <SearchableEmployeeSelect
                                            companyId={formData.companyId}
                                            value={formData.managerId}
                                            onSelect={(id) => onChange('managerId', id)}
                                            excludeIds={[formData.id]}
                                            placeholder="Select Manager"
                                            className={getFieldClasses(false)}
                                        />
                                        {formData.managerId && !isEmployee && (
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() => onChange('managerId', null)}
                                                className="h-6 px-0 text-[10px] text-red-500 hover:text-red-600 uppercase font-black tracking-widest"
                                            >
                                                Clear Manager
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-10 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <IconCurrencyDollar className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight uppercase">Compensation</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {!isEmployee && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Basic Salary (LKR)</Label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-neutral-300">LKR</span>
                                        <Input
                                            type="text"
                                            value={formData.basicSalary?.toLocaleString() || '0'}
                                            onChange={e => {
                                                const value = e.target.value.replace(/,/g, '');
                                                onChange('basicSalary', parseFloat(value) || 0);
                                            }}
                                            className={cn(getFieldClasses(false), "pl-16 text-emerald-600 font-black text-xl")}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className={cn("space-y-2", isEmployee && "md:col-span-2")}>
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Bank Name</Label>
                                {isFieldDisabled('bankName') ? (
                                    <ReadOnlyField 
                                        value={formData.details?.bankName} 
                                        icon={IconBuildingBank}
                                    />
                                ) : (
                                    <div className="relative">
                                        <IconBuildingBank className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                                        <Input
                                            value={formData.details?.bankName || ""}
                                            onChange={e => onDetailChange('bankName', e.target.value)}
                                            className={cn(getFieldClasses(false), "pl-16")}
                                            placeholder="Bank Name"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Bank Branch</Label>
                                {isFieldDisabled('bankBranch') ? (
                                    <ReadOnlyField value={formData.details?.bankBranch} />
                                ) : (
                                    <Input
                                        value={formData.details?.bankBranch || ""}
                                        onChange={e => onDetailChange('bankBranch', e.target.value)}
                                        className={getFieldClasses(false)}
                                        placeholder="Branch Name"
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Account Number</Label>
                                {isFieldDisabled('accountNumber') ? (
                                    <ReadOnlyField value={formData.details?.accountNumber} className="font-mono" />
                                ) : (
                                    <Input
                                        value={formData.details?.accountNumber || ""}
                                        onChange={e => onDetailChange('accountNumber', e.target.value)}
                                        className={getFieldClasses(false)}
                                        placeholder="0000000000"
                                    />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-8">
                {!isEmployee && (
                    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-neutral-100 dark:bg-neutral-900/50 rounded-[2.5rem] p-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                                    formData.status === 'ACTIVE' ? "bg-emerald-500 text-white" : "bg-neutral-300 text-neutral-500"
                                )}>
                                    <IconUserBolt className="h-5 w-5" />
                                </div>
                                <Label className="text-lg font-bold">Account Status</Label>
                            </div>

                            <Select value={formData.status} onValueChange={v => onChange('status', v)}>
                                <SelectTrigger className={getFieldClasses(false)}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value={EmployeeStatus.ACTIVE}>Active</SelectItem>
                                    <SelectItem value={EmployeeStatus.INACTIVE}>Inactive</SelectItem>
                                    <SelectItem value={EmployeeStatus.SUSPENDED}>Suspended</SelectItem>
                                </SelectContent>
                            </Select>

                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                                {formData.status === 'ACTIVE'
                                    ? "Employee is eligible for payroll and attendance tracking."
                                    : "Employee is currently restricted from system activities."}
                            </p>

                            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
                                <div className="flex items-center justify-between bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center",
                                            (formData as any).active !== false ? "bg-blue-500/10 text-blue-600" : "bg-neutral-100 text-neutral-400"
                                        )}>
                                            <IconShieldCheck className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Portal Access</Label>
                                            <p className="text-[10px] text-neutral-400 font-medium">Portal login permission</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={(formData as any).active !== false}
                                        onCheckedChange={(checked) => onChange('active' as any, checked)}
                                        disabled={!formData.userId}
                                    />
                                </div>
                                {!formData.userId && (
                                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight px-1">
                                        * Login not provisioned for this employee.
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <IconId className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight uppercase">Identity</h3>
                        </div>

                        <ImageUpload
                            label="Profile Photo"
                            description="profile photo"
                            alt="Employee Identity"
                            companyId={formData.companyId}
                            value={formData.photo}
                            onChange={(key) => onChange('photo', key)}
                            disabled={isFieldDisabled('photo')}
                        />
                    </CardContent>
                </Card>

                <div className="p-8 bg-neutral-50 dark:bg-white/5 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Record Details</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-neutral-400 uppercase tracking-tighter">Joined Date</span>
                            <span className="font-black text-neutral-900 dark:text-white">
                                {formData.joinedDate ? new Date(formData.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-neutral-400 uppercase tracking-tighter">Last Update</span>
                            <span className="font-black text-neutral-900 dark:text-white">
                                {formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
