"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { IconLoader2, IconCheck } from "@tabler/icons-react";
import Image from "next/image";
import { motion } from "motion/react";
import { useAuthStore } from "@/stores/auth.store";
import { logger } from "@/lib/utils/logger";
import { Link } from "@/i18n/routing";
import { Role } from "@/types/user";
import { toast } from "sonner";

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStep = (searchParams.get("step") as "auth" | "profile") || "auth";
    const { fetchProfile, signUp: storeSignUp } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    const [authData, setAuthData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [profileData, setProfileData] = useState({
        nameWithInitials: "",
        fullName: "",
        address: "",
        phone: "",
        // Role is handled by backend (EMPLOYER by default)
    });

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const session = await authService.getSession();

                if (!session && currentStep === "profile") {
                    // Unauthenticated user trying to access profile step
                    logger.warn("Unauthenticated attempt to access profile step, redirecting to auth step");
                    router.replace("/register?step=auth");
                    return;
                }

                if (session) {
                    // Check if profile is already complete
                    const profile = await authService.getProfile({ suppressToast: true });
                    if (profile.data && profile.data.fullName) {
                        // Profile complete, let AuthGuard handle the rest (dashboard or pending-review)
                        if (profile.data.active === false) {
                            router.replace("/pending-review");
                        } else {
                            router.replace(profile.data.role === 'EMPLOYEE' ? "/employee-portal/dashboard" : "/employer-portal/dashboard");
                        }
                        return;
                    }

                    // User is authenticated but profile incomplete, redirect to profile step if not already there
                    if (currentStep !== "profile") {
                        router.replace("/register?step=profile");
                    }
                }
            } catch (err) {
                console.error("Session check failed", err);
            } finally {
                setCheckingSession(false);
            }
        };
        checkSession();
    }, [currentStep, router]);

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (authData.password !== authData.confirmPassword) {
            toast.error("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            await storeSignUp({
                email: authData.email,
                password: authData.password,
            });

            // Move to profile step via URL
            router.push("/register?step=profile");
        } catch (err: any) {
            // Already handled by AuthStore and AuthService
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { success, error: registerError } = await authService.register(profileData);

            if (registerError || !success) {
                // Error is already toasted by authService
                return;
            }

            // Registration complete, refresh the store profile
            await fetchProfile();
            const user = useAuthStore.getState().user;

            // Since all new registrations are forced to inactive/employer by backend:
            if (user?.active === false) {
                router.push("/pending-review");
            } else {
                // This branch usually won't be hit immediately after registration due to forced inactivity
                router.push(user?.role === 'EMPLOYEE' ? "/employee-portal/dashboard" : "/employer-portal/dashboard");
            }
        } catch (err: any) {
            // Error is likely already toasted
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
                <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 p-6">
            <Card className="w-full max-w-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-primary/5 bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 space-y-8">
                    {/* Header */}
                    <div className="space-y-6 text-center">
                        <div className="flex justify-center">
                            <Link href="/" className="relative z-20">
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Image
                                        src="/images/wagex_logo_transparent.png"
                                        alt="WageX"
                                        width={160}
                                        height={68}
                                        className="object-contain dark:invert"
                                        priority
                                    />
                                </motion.div>
                            </Link>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black tracking-tight uppercase">
                                {currentStep === "auth" ? "Create Account" : "Complete Your Profile"}
                            </h1>
                            <p className="text-neutral-500 font-medium text-sm">
                                {currentStep === "auth"
                                    ? "Get started by creating your account credentials."
                                    : "Tell us a bit more about yourself to complete registration."}
                            </p>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2">
                        <div className={`flex-1 h-2 rounded-full ${currentStep === "auth" ? "bg-primary" : "bg-emerald-500"}`} />
                        <div className={`flex-1 h-2 rounded-full ${currentStep === "profile" ? "bg-primary" : "bg-neutral-200 dark:bg-neutral-800"}`} />
                    </div>

                    {/* Step 1: Auth */}
                    {currentStep === "auth" && (
                        <form onSubmit={handleAuthSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">
                                    Email Address
                                </Label>
                                <Input
                                    type="email"
                                    required
                                    placeholder="you@company.com"
                                    className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                    value={authData.email}
                                    onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">
                                        Password
                                    </Label>
                                    <Input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                        value={authData.password}
                                        onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wider">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                        value={authData.confirmPassword}
                                        onChange={(e) => setAuthData({ ...authData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-2xl h-14 font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <IconLoader2 className="h-5 w-5 animate-spin" />
                                        Creating Account...
                                    </div>
                                ) : (
                                    "Continue"
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Step 2: Profile */}
                    {currentStep === "profile" && (
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
                                    Address
                                </Label>
                                <Input
                                    placeholder="123 Main St, City"
                                    className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-2xl px-6 font-bold text-base shadow-inner"
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.push("/register?step=auth")}
                                    className="flex-1 rounded-2xl h-14 font-bold text-sm uppercase tracking-widest"
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 rounded-2xl h-14 font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
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
                            </div>
                        </form>
                    )}

                    {/* Footer */}
                    {currentStep === "auth" && (
                        <div className="text-center space-y-3">
                            <p className="text-sm text-neutral-500">
                                Already have an account?{" "}
                                <Link href="/login" className="font-bold text-primary hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
