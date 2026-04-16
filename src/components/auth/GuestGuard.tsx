"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
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
    const { isAuthenticated, isLoading, isProfileLoading, user } = useAuthStore();

    useEffect(() => {
        if (isLoading || isProfileLoading) return;

        if (isAuthenticated) {
            // Half-registered: Logged in but no backend profile OR incomplete profile
            const isIncomplete = !user || !user.fullName;
            if (isIncomplete) {
                const isRegisterPage = pathname === '/register' || pathname.startsWith('/register/');
                const isProfileStep = searchParams.get("step") === "profile";

                if (!(isRegisterPage && isProfileStep)) {
                    logger.info("Authenticated user missing/incomplete profile, forcing to registration profile step");
                    router.replace("/register?step=profile");
                }
                return;
            }

            // Inactive account: Pending Review (only if profile is complete)
            if (user.active === false && user.fullName) {
                logger.info("Inactive user with complete profile attempting to access guest route, redirecting to pending review");
                router.replace("/pending-review");
                return;
            }

            // Fully registered: Dashboard
            logger.info("Registered user attempting to access guest route, redirecting to appropriate portal", { role: user.role });

            if (user.role === 'EMPLOYEE') {
                router.replace("/employee-portal/dashboard");
            } else {
                router.replace("/employer-portal/dashboard");
            }
        }
    }, [isAuthenticated, isLoading, isProfileLoading, user, router, pathname, searchParams]);

    if (isLoading || (isProfileLoading && isAuthenticated)) {
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
    const isHalfRegistered = isAuthenticated && (!user || !user.fullName);

    const canRender = !isAuthenticated || (isHalfRegistered && isRegisterPage && isProfileStep);

    if (!canRender) {
        return null;
    }

    return <>{children}</>;
}
