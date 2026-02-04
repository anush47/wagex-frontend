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

    // Strict Access Control for protected routes
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            const path = window.location.pathname;
            const isRestrictedPage = path.includes('/restricted');

            // 1. Check for missing profile
            if (!user) {
                logger.warn("Authenticated user missing profile, redirecting to registration");
                router.replace("/register?step=profile");
                return;
            }

            // 2. Check for inactive account
            if (user.active === false && !isRestrictedPage) {
                logger.warn("Inactive user attempted to access portal, redirecting to restricted page");
                router.replace("/restricted");
                return;
            }

            // 3. Prevent active users from seeing the restricted page
            if (user.active !== false && isRestrictedPage) {
                router.replace(user.role === 'EMPLOYEE' ? "/employee-portal/dashboard" : "/employer-portal/dashboard");
                return;
            }

            // 4. Role-based portal protection
            const isEmployerPortal = path.includes('/employer-portal');
            const isEmployeePortal = path.includes('/employee-portal');

            if (user.role === 'EMPLOYEE' && isEmployerPortal) {
                logger.warn("Employee attempted to access employer portal, redirecting", { userId: user.id });
                router.replace("/employee-portal/dashboard");
            } else if ((user.role === 'EMPLOYER' || user.role === 'ADMIN') && isEmployeePortal) {
                logger.warn("Employer/Admin attempted to access employee portal, redirecting", { userId: user.id });
                router.replace("/employer-portal/dashboard");
            }
        }
    }, [user, isAuthenticated, isLoading, router]);

    // BLOCKING: Don't render children until we're sure the state is settled and correct
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-neutral-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <>{children}</>;
}
