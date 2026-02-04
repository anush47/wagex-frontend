"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { logger } from "@/lib/utils/logger";

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading, user, signOut } = useAuthStore();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            logger.warn("Unauthenticated access attempt, redirecting to login");
            router.push("/");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900 dark:border-white"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    // Strict Access Control
    if (user && user.active === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6">
                <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-10 text-center shadow-2xl">
                    <div className="h-20 w-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                            <path d="M12 9v4" />
                            <path d="M12 16v.01" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight mb-3">Access Denied</h1>
                    <p className="text-neutral-500 font-medium mb-8">
                        Your account has been disabled. Please contact your administrator for assistance.
                    </p>
                    <button
                        onClick={() => signOut()}
                        className="w-full py-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
