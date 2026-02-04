"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconUserPlus, IconLoader2, IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { Link } from "@/i18n/routing";
import { Role } from "@/types/user";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<"auth" | "profile">("auth");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        role: Role.EMPLOYER,
    });

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (authData.password !== authData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const { user, session, error: signUpError } = await authService.signUp({
                email: authData.email,
                password: authData.password,
            });

            if (signUpError) {
                setError(signUpError.message || "Failed to create account");
                return;
            }

            if (user && session) {
                // Move to profile step
                setStep("profile");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

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

            // Registration complete, redirect to companies
            router.push("/companies");
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 p-6">
            <Card className="w-full max-w-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-primary/5 bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 space-y-8">
                    {/* Header */}
                    <div className="space-y-3 text-center">
                        <div className="flex justify-center">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <IconUserPlus className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            {step === "auth" ? "Create Account" : "Complete Your Profile"}
                        </h1>
                        <p className="text-neutral-500 font-medium text-sm">
                            {step === "auth"
                                ? "Get started by creating your account credentials."
                                : "Tell us a bit more about yourself to complete registration."}
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2">
                        <div className={`flex-1 h-2 rounded-full ${step === "auth" ? "bg-primary" : "bg-emerald-500"}`} />
                        <div className={`flex-1 h-2 rounded-full ${step === "profile" ? "bg-primary" : "bg-neutral-200 dark:bg-neutral-800"}`} />
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3">
                            <IconAlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-destructive">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Auth */}
                    {step === "auth" && (
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
                    {step === "profile" && (
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

                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setStep("auth")}
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
                    {step === "auth" && (
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
