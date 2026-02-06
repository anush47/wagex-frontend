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
    IconCurrencyDollar
} from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Gender, EmploymentType } from "@/types/policy";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";

interface EmployeeGeneralTabProps {
    formData: Employee;
    onChange: (field: keyof Employee, value: any) => void;
    departments?: any[];
}

export function EmployeeGeneralTab({ formData, onChange, departments = [] }: EmployeeGeneralTabProps) {
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
                                <Input
                                    value={formData.nameWithInitials}
                                    onChange={e => onChange('nameWithInitials', e.target.value)}
                                    className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Member Number</Label>
                                <Input
                                    type="number"
                                    value={formData.employeeNo || ""}
                                    onChange={e => onChange('employeeNo', parseInt(e.target.value) || 0)}
                                    className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-black font-mono text-base text-primary shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Full Legal Name</Label>
                            <Input
                                value={formData.fullName}
                                onChange={e => onChange('fullName', e.target.value)}
                                className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">NIC Number</Label>
                                <Input
                                    value={formData.nic || ""}
                                    onChange={e => onChange('nic', e.target.value)}
                                    className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Designation</Label>
                                <Input
                                    value={formData.designation || ""}
                                    onChange={e => onChange('designation', e.target.value)}
                                    className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Joined Date</Label>
                                <Input
                                    type="date"
                                    value={formData.joinedDate ? new Date(formData.joinedDate).toISOString().split('T')[0] : ""}
                                    onChange={e => onChange('joinedDate', e.target.value)}
                                    className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Resigned Date</Label>
                                <Input
                                    type="date"
                                    value={formData.resignedDate ? new Date(formData.resignedDate).toISOString().split('T')[0] : ""}
                                    onChange={e => onChange('resignedDate', e.target.value)}
                                    className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Phone Number</Label>
                            <Input
                                value={formData.phone || ""}
                                onChange={e => onChange('phone', e.target.value)}
                                className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Home Address</Label>
                            <Input
                                value={formData.address || ""}
                                onChange={e => onChange('address', e.target.value)}
                                className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Remarks / Special Notes</Label>
                            <textarea
                                rows={4}
                                value={formData.remark || ""}
                                onChange={e => onChange('remark', e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl p-6 font-medium text-base shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                placeholder="Add any additional notes about the employee..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Gender</Label>
                                <Select value={formData.gender} onValueChange={v => onChange('gender', v)}>
                                    <SelectTrigger className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value={Gender.MALE}>Male</SelectItem>
                                        <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Employment Type</Label>
                                <Select value={formData.employmentType} onValueChange={v => onChange('employmentType', v)}>
                                    <SelectTrigger className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner">
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
                                <Select value={formData.departmentId || "unassigned"} onValueChange={v => onChange('departmentId', v === "unassigned" ? null : v)}>
                                    <SelectTrigger className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner">
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {departments?.map(dept => (
                                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Reporting Manager</Label>
                                <SearchableEmployeeSelect
                                    companyId={formData.companyId}
                                    value={formData.managerId}
                                    onSelect={(id) => onChange('managerId', id)}
                                    excludeIds={[formData.id]}
                                    placeholder="Select Manager"
                                />
                                {formData.managerId && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => onChange('managerId', null)}
                                        className="h-6 px-0 text-[10px] text-red-500 hover:text-red-600 uppercase font-black tracking-widest"
                                    >
                                        Clear Manager
                                    </Button>
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
                                    className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl pl-16 pr-6 font-black text-xl shadow-inner text-emerald-600"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-8">
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
                            <SelectTrigger className="h-12 bg-white dark:bg-neutral-800 border-none rounded-xl px-4 font-bold shadow-sm">
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
                    </div>
                </Card>

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
                        />
                    </CardContent>
                </Card>

                <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Tenure Info</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-neutral-400 uppercase tracking-tighter">Joined Date</span>
                            <span className="font-black text-neutral-900 dark:text-white">
                                {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-neutral-400 uppercase tracking-tighter">Last Update</span>
                            <span className="font-black text-neutral-900 dark:text-white">
                                {formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
