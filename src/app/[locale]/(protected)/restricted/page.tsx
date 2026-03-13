"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { IconAlertCircle, IconLogout, IconRefresh, IconLoader2 } from "@tabler/icons-react";

export default function RestrictedPage() {
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
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6 text-center">
            <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-12 shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="h-24 w-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-red-600 dark:text-red-400">
                    <IconAlertCircle className="h-12 w-12" />
                </div>

                <h1 className="text-3xl font-black uppercase tracking-tight mb-4 text-neutral-900 dark:text-white">
                    Access Denied
                </h1>

                <p className="text-neutral-500 dark:text-neutral-400 font-medium text-lg leading-relaxed mb-10">
                    Your account is currently <span className="text-red-600 dark:text-red-400 font-bold">inactive</span>.
                    Please contact your organization administrator to reactivate your portal access.
                </p>

                <div className="space-y-4">
                    <Button
                        onClick={handleCheckStatus}
                        disabled={checking}
                        variant="outline"
                        className="w-full h-14 rounded-2xl border-2 font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {checking ? (
                            <IconLoader2 className="w-5 h-5 mr-3 animate-spin" />
                        ) : (
                            <IconRefresh className="w-5 h-5 mr-3" />
                        )}
                        Check Approval Status
                    </Button>

                    <Button
                        onClick={() => signOut()}
                        className="w-full h-14 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                    >
                        <IconLogout className="w-5 h-5 mr-3" />
                        Sign Out
                    </Button>

                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
                        Logged in as {user?.email}
                    </p>
                </div>
            </div>
        </div>
    );
}
