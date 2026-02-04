"use client";

import { useState } from "react";
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconMail, IconUserCheck, IconLoader2, IconAlertCircle, IconCheck, IconTrash, IconCopy, IconLock } from "@tabler/icons-react";
import { EmployeeService } from "@/services/employee.service";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

interface EmployeeAccountTabProps {
    formData: Employee;
    onChange: (field: keyof Employee, value: any) => void;
    onSave: () => Promise<void>;
    loading?: boolean;
}

export function EmployeeAccountTab({ formData, onChange, onSave, loading = false }: EmployeeAccountTabProps) {
    const [provisioning, setProvisioning] = useState(false);
    const [deprovisioning, setDeprovisioning] = useState(false);
    const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
    const [showCredentials, setShowCredentials] = useState(false);
    const [showDeprovisionDialog, setShowDeprovisionDialog] = useState(false);

    const handleProvision = async () => {
        if (!formData.email) {
            toast.error("Please provide an email address first");
            return;
        }

        setProvisioning(true);

        try {
            await onSave();

            const res = await EmployeeService.provisionUser(formData.id, formData.companyId);
            if (res.error) {
                toast.error(res.error.message || "Failed to provision user");
                return;
            }

            const data = (res.data as any)?.data || res.data;
            if (data?.password) {
                setCredentials({ email: formData.email, password: data.password });
                setShowCredentials(true);
                toast.success("User account created successfully");
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

    const handleDeprovision = async () => {
        // Renamed from handleDeprovision for clarity inside dialog callback
        setDeprovisioning(true);
        try {
            const res = await EmployeeService.deprovisionUser(formData.id, formData.companyId);
            if (res.error) {
                toast.error(res.error.message || "Failed to remove user access");
                return;
            }
            toast.success("User access removed successfully");
            onChange('userId', null);
            onChange('active', true); // Reset active state for next provisioning
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setDeprovisioning(false);
            setShowDeprovisionDialog(false);
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
                            <div className="flex-1">
                                <h4 className="text-lg font-bold mb-1">{isLinked ? 'Account Active' : 'No User Account'}</h4>
                                <p className="text-sm text-neutral-500 leading-relaxed max-w-lg mb-4">
                                    {isLinked
                                        ? "This employee has an active user account linked to the system."
                                        : "This employee does not have a user account yet. Provisioning an account will send login credentials."}
                                </p>

                                {isLinked && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowDeprovisionDialog(true)}
                                        disabled={deprovisioning || loading}
                                        className="rounded-xl h-10 px-6 font-bold uppercase tracking-wider text-xs"
                                    >
                                        {deprovisioning ? <IconLoader2 className="w-4 h-4 animate-spin mr-2" /> : <IconTrash className="w-4 h-4 mr-2" />}
                                        Remove Access
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Access Control */}
                    {isLinked && (
                        <div className="flex items-center justify-between p-6 bg-neutral-50 dark:bg-neutral-800/30 rounded-[2rem] border border-neutral-100 dark:border-neutral-800">
                            <div className="space-y-1">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <IconLock className="w-4 h-4 text-neutral-500" />
                                    Portal Access
                                </Label>
                                <p className="text-xs text-neutral-500 max-w-[250px]">
                                    If disabled, this user effectively loses access to this company's portal, but their account remains linked.
                                </p>
                            </div>
                            <Switch
                                // Use the local form state first, fall back to the nested user record
                                checked={(formData as any).active !== undefined ? (formData as any).active : formData.user?.active !== false}
                                onCheckedChange={(c) => onChange('active', c)}
                            />
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
                    </div>

                </CardContent>
            </Card>

            <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
                <DialogContent className="sm:max-w-md rounded-[2rem] p-8">
                    <DialogHeader>
                        <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                            <IconCheck className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-center text-xl font-black uppercase tracking-tight">Account Created</DialogTitle>
                        <DialogDescription className="text-center font-medium">
                            New user credentials have been generated.
                        </DialogDescription>
                    </DialogHeader>

                    {credentials && (
                        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800 space-y-4 my-2">
                            <div className="space-y-1">
                                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Email Address</div>
                                <div className="font-bold text-lg select-all">{credentials.email}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Temporary Password</div>
                                <div className="flex items-center justify-between bg-white dark:bg-black p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                    <code className="font-mono text-lg font-bold select-all tracking-wider">{credentials.password}</code>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                                        navigator.clipboard.writeText(credentials.password);
                                        toast.success("Password copied");
                                    }}>
                                        <IconCopy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-center">
                        <Button
                            className="w-full h-12 rounded-xl font-bold"
                            onClick={() => setShowCredentials(false)}
                        >
                            Done, I've copied it
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={showDeprovisionDialog}
                onOpenChange={setShowDeprovisionDialog}
                variant="destructive"
                title="Remove User Access?"
                description={
                    <>
                        This will <span className="font-bold">permanently delete</span> the user account associated with <span className="font-bold text-neutral-900 dark:text-white">{formData.fullName}</span>. They will no longer be able to log in to the portal.
                    </>
                }
                icon={<IconTrash className="h-8 w-8" />}
                actionLabel="Yes, Remove Access"
                cancelLabel="Cancel"
                loading={deprovisioning}
                onAction={handleDeprovision}
            />
        </div >
    );
}
