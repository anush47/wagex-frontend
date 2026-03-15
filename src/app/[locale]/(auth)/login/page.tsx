"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/stores/auth.store";
import { logger } from "@/lib/utils/logger";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconLogin, IconLoader2, IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { motion } from "motion/react";
import { Link } from "@/i18n/routing";
import { Role } from "@/types/user";

export default function LoginPage() {
    const router = useRouter();
    const { signIn, user: storeUser, fetchProfile } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [needsRegistration, setNeedsRegistration] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [profileData, setProfileData] = useState({
        nameWithInitials: "",
        fullName: "",
        address: "",
        phone: "",
        role: Role.EMPLOYER,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signIn(formData);

            // Get the user from the store *after* successful sign in
            // Wait, we can also get it from the store state if we use a selector or just the reactive hook
            // But since we are in an async handler, we might need the latest state.
            // Actually, in Zustand, we can just use the storeUser from the hook if it's reactive.
        } catch (signInError: any) {
            if (signInError.message === "REGISTRATION_REQUIRED") {
                setNeedsRegistration(true);
                setLoading(false);
                return;
            }
            setError(signInError.message || "Failed to sign in");
            setLoading(false);
            return;
        } finally {
            setLoading(false);
        }
    };

    // We no longer need the local redirection Effect here as GuestGuard and AuthGuard 
    // provide the centralized and robust routing once the session/user is set in store.

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { success, error: registerError } = await authService.register(profileData);

            if (registerError || !success) {
                setError(registerError?.message || "Failed to create profile");
                return;
            }

            // Registration complete, refresh the store profile
            await fetchProfile();
            const user = useAuthStore.getState().user;

            if (user?.active === false) {
                router.push("/pending-review");
            } else {
                router.push(user?.role === 'EMPLOYEE' ? "/employee-portal/dashboard" : "/employer-portal/dashboard");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 p-6">
            <Card className="w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-primary/5 bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 space-y-8">
                    {/* Header */}
                    <div className="space-y-6 text-center">
                        <div className="flex justify-center">
                            <Link
                                href="/"
                                className="font-normal flex space-x-3 items-center text-2xl text-black py-1 relative z-20 group"
                            >
                                <div className="h-8 w-10 bg-black dark:bg-white rounded-br-2xl rounded-tr-md rounded-tl-2xl rounded-bl-md flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500" />
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="font-black text-black dark:text-white whitespace-pre tracking-tighter italic"
                                >
                                    WageX
                                </motion.span>
                            </Link>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black tracking-tight uppercase">
                                {needsRegistration ? "Complete Your Profile" : "Sign In"}
                            </h1>
                            <p className="text-neutral-500 font-medium text-sm">
                                {needsRegistration
                                    ? "We need a bit more information to complete your registration."
                                    : "Welcome back! Enter your credentials to continue."}
                            </p>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3">
                            <IconAlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-destructive">{error}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    {!needsRegistration && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">
                                    Email Address
                                </Label>
                                <Input
                                    type="email"
                                    required
                                    placeholder="you@company.com"
                                    className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">
                                    Password
                                </Label>
                                <Input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-2xl h-14 font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <IconLoader2 className="h-5 w-5 animate-spin" />
                                        Signing In...
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Profile Completion Form */}
                    {needsRegistration && (
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">
                                        Name with Initials
                                    </Label>
                                    <Input
                                        required
                                        placeholder="J. Doe"
                                        className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                        value={profileData.nameWithInitials}
                                        onChange={(e) => setProfileData({ ...profileData, nameWithInitials: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">
                                        Full Name
                                    </Label>
                                    <Input
                                        required
                                        placeholder="Johnathan Doe"
                                        className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                        value={profileData.fullName}
                                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">
                                        Phone Number
                                    </Label>
                                    <Input
                                        placeholder="+94 77 XXX XXXX"
                                        className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">
                                        Role
                                    </Label>
                                    <Select
                                        value={profileData.role}
                                        onValueChange={(v) => setProfileData({ ...profileData, role: v as Role })}
                                    >
                                        <SelectTrigger className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value={Role.EMPLOYER}>Employer</SelectItem>
                                            <SelectItem value={Role.EMPLOYEE}>Employee</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">
                                    Address
                                </Label>
                                <Input
                                    placeholder="123 Main St, City"
                                    className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-2xl h-14 font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <IconLoader2 className="h-5 w-5 animate-spin" />
                                        Completing...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <IconCheck className="h-5 w-5" />
                                        Complete Registration
                                    </div>
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Footer */}
                    {!needsRegistration && (
                        <div className="text-center space-y-3">
                            <p className="text-sm text-neutral-500">
                                Don't have an account?{" "}
                                <Link href="/register" className="font-bold text-primary hover:underline">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
