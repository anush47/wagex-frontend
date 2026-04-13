"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    IconLock, 
    IconEye, 
    IconEyeOff, 
    IconLoader2, 
    IconShieldLock,
    IconCheck
} from "@tabler/icons-react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const isMatch = formData.newPassword === formData.confirmPassword;
    const isLengthValid = formData.newPassword.length >= 6;
    const canSubmit = isMatch && isLengthValid && formData.currentPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        try {
            const { success } = await authService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (success) {
                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                onOpenChange(false);
            }
        } catch (error) {
            // Error already handled by authService
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
                <DialogHeader className="p-8 pb-4 bg-primary/5">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <IconShieldLock className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-black tracking-tighter uppercase">Security Update</DialogTitle>
                    <DialogDescription className="font-medium text-neutral-500">
                        Update your account password. We recommend choosing a strong, unique password.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">
                                Current Password
                            </Label>
                            <div className="relative group">
                                <Input
                                    type={showPasswords ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="h-12 bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800 rounded-xl px-4 pl-10 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                />
                                <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">
                                New Password
                            </Label>
                            <div className="relative group">
                                <Input
                                    type={showPasswords ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className={cn(
                                        "h-12 bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800 rounded-xl px-4 pl-10 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all",
                                        formData.newPassword && !isLengthValid && "border-red-500/50 focus:ring-red-500/20"
                                    )}
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                                <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors"
                                >
                                    {showPasswords ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                                </button>
                            </div>
                            {formData.newPassword && !isLengthValid && (
                                <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">Must be at least 6 characters</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">
                                Confirm New Password
                            </Label>
                            <div className="relative group">
                                <Input
                                    type={showPasswords ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className={cn(
                                        "h-12 bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800 rounded-xl px-4 pl-10 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all",
                                        formData.confirmPassword && !isMatch && "border-red-500/50 focus:ring-red-500/20"
                                    )}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                                <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                            </div>
                            {formData.confirmPassword && !isMatch && (
                                <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">Passwords do not match</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={loading || !canSubmit}
                            className="h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {loading ? (
                                <>
                                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating Security...
                                </>
                            ) : (
                                <>
                                    <IconCheck className="mr-2 h-4 w-4" />
                                    Change Password
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="h-12 rounded-xl font-bold text-xs uppercase tracking-widest text-neutral-400"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
