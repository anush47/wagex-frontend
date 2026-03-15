"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { IconAlertCircle, IconLogout, IconRefresh, IconLoader2 } from "@tabler/icons-react";

export default function PendingReviewPage() {
    const { user, signOut, fetchProfile } = useAuthStore();
    const [checking, setChecking] = useState(false);

    const handleCheckStatus = async () => {
        setChecking(true);
        try {
            await fetchProfile();
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 md:p-6 text-center">
            <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="h-20 w-20 md:h-24 md:w-24 bg-amber-500/10 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-8 text-amber-600 dark:text-amber-400">
                    <IconAlertCircle className="h-10 w-10 md:h-12 md:w-12" />
                </div>

                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3 md:mb-4 text-neutral-900 dark:text-white leading-tight">
                    Pending Review
                </h1>

                <p className="text-neutral-500 dark:text-neutral-400 font-medium text-base md:text-lg leading-relaxed mb-8 md:mb-10">
                    Thank you for signing up! Your account is currently <span className="text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wide">under review</span>.
                    An administrator will review and activate your account shortly.
                </p>

                <div className="space-y-3 md:space-y-4">
                    <Button
                        onClick={handleCheckStatus}
                        disabled={checking}
                        variant="outline"
                        className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl border-2 font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {checking ? (
                            <IconLoader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <IconRefresh className="w-5 h-5" />
                        )}
                        <span className="truncate">Check Status</span>
                    </Button>

                    <Button
                        onClick={() => signOut()}
                        className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                        <IconLogout className="w-5 h-5" />
                        Sign Out
                    </Button>

                    <p className="text-[10px] md:text-xs text-neutral-400 font-bold uppercase tracking-widest mt-4">
                        Logged in as <span className="block md:inline truncate max-w-full">{user?.email}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
