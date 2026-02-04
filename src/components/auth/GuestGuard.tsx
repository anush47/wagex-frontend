"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { logger } from "@/lib/utils/logger";

interface GuestGuardProps {
    children: React.ReactNode;
}

/**
 * GuestGuard prevents authenticated users from accessing guest-only routes (login, register).
 * Redirects to the dashboard if already logged in.
 */
export function GuestGuard({ children }: GuestGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading, user } = useAuthStore();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            // Half-registered: Logged in via Supabase but no backend profile
            if (!user) {
                const isRegisterPage = pathname.includes("/register");
                const isProfileStep = searchParams.get("step") === "profile";

                if (!(isRegisterPage && isProfileStep)) {
                    logger.info("Authenticated user missing profile, forcing to registration profile step");
                    router.replace("/register?step=profile");
                }
                return;
            }

            // Fully registered: Dashboard
            // If inactive, AuthGuard on the protected route will show Access Denied.
            // We redirect them to their respective portal dashboard
            logger.info("Registered user attempting to access guest route, redirecting to appropriate portal", { role: user.role });

            if (user.role === 'EMPLOYEE') {
                router.replace("/employee-portal/dashboard");
            } else {
                router.replace("/employer-portal/dashboard");
            }
        }
    }, [isAuthenticated, isLoading, user, router, pathname, searchParams]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900 dark:border-white"></div>
            </div>
        );
    }

    // Allow rendering the guest route if:
    // 1. Unauthenticated (Standard case for login/register)
    // 2. Authenticated but missing profile AND specifically on the registration profile step
    const isRegisterPage = pathname.includes("/register");
    const isProfileStep = searchParams.get("step") === "profile";
    const isHalfRegistered = isAuthenticated && !user;

    const canRender = !isAuthenticated || (isHalfRegistered && isRegisterPage && isProfileStep);

    if (!canRender) {
        return null;
    }

    return <>{children}</>;
}
