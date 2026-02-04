"use client";

import { useState } from "react";
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconMail, IconUserCheck, IconLoader2, IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { EmployeeService } from "@/services/employee.service";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface EmployeeAccountTabProps {
    formData: Employee;
    onChange: (field: keyof Employee, value: any) => void;
    onSave: () => Promise<void>;
    loading?: boolean;
}

export function EmployeeAccountTab({ formData, onChange, onSave, loading = false }: EmployeeAccountTabProps) {
    const [provisioning, setProvisioning] = useState(false);
    const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

    const handleProvision = async () => {
        if (!formData.email) {
            toast.error("Please provide an email address first");
            return;
        }

        setProvisioning(true);

        try {
            // Force save first to ensure email is updated in backend
            await onSave();

            const res = await EmployeeService.provisionUser(formData.id, formData.companyId);
            if (res.error) {
                toast.error(res.error.message || "Failed to provision user");
                return;
            }

            const data = (res.data as any)?.data || res.data;
            if (data?.password) {
                setCredentials({ email: formData.email, password: data.password });
                toast.success("User account created successfully");
                // Update local state to show linked
                onChange('userId', data.userId);
            } else {
                toast.success("User account linked successfully");
                if (data?.userId) onChange('userId', data.userId);
            }

        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setProvisioning(false);
        }
    };

    const isLinked = !!formData.userId;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-12 w-12 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <IconUserCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Account Access</CardTitle>
                            <CardDescription className="text-neutral-500 font-medium">Manage user account linkage and credentials</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 space-y-6">

                    {/* Status Banner */}
                    <div className={`p-6 rounded-[2rem] border ${isLinked ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'}`}>
                        <div className="flex items-start gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isLinked ? 'bg-emerald-500 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'}`}>
                                {isLinked ? <IconCheck className="w-6 h-6" /> : <IconAlertCircle className="w-6 h-6" />}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold mb-1">{isLinked ? 'Account Active' : 'No User Account'}</h4>
                                <p className="text-sm text-neutral-500 leading-relaxed max-w-lg">
                                    {isLinked
                                        ? "This employee has an active user account linked to the system."
                                        : "This employee does not have a user account yet. Provisioning an account will send login credentials."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Credential Display */}
                    {credentials && (
                        <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                            <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-xs">
                                <IconMail className="w-4 h-4" />
                                <span>New Credentials Generated</span>
                            </div>
                            <div className="bg-white dark:bg-black p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500 font-bold">Email:</span>
                                    <span className="font-mono bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded text-neutral-900 dark:text-neutral-100">{credentials.email}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500 font-bold">Password:</span>
                                    <span className="font-mono bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded text-neutral-900 dark:text-neutral-100 select-all">{credentials.password}</span>
                                </div>
                            </div>
                            <p className="text-xs text-indigo-600/80 font-medium">Please copy these credentials immediately. The password will not be shown again.</p>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="space-y-4 max-w-xl">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Professional Email</Label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <IconMail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                <Input
                                    value={formData.email || ""}
                                    onChange={(e) => onChange('email', e.target.value)}
                                    placeholder="employee@company.com"
                                    className="pl-12 h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl font-bold text-base shadow-inner"
                                    disabled={isLinked}
                                />
                            </div>

                            {!isLinked && (
                                <Button
                                    onClick={handleProvision}
                                    disabled={provisioning || !formData.email || loading}
                                    className="h-14 px-8 rounded-2xl font-black uppercase tracking-wider text-xs bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {provisioning ? <IconLoader2 className="w-4 h-4 animate-spin" /> : "Provision"}
                                </Button>
                            )}
                        </div>
                        {isLinked && (
                            <p className="text-xs text-neutral-500 ml-1 font-medium">
                                Account is active. To change email, the user must update it from their profile settings.
                            </p>
                        )}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
