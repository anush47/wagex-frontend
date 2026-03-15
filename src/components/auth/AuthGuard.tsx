"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useAuthStore } from "@/stores/auth.store";
import { logger } from "@/lib/utils/logger";

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading, isProfileLoading, user, signOut } = useAuthStore();

    useEffect(() => {
        if (!isLoading && !isProfileLoading && !isAuthenticated) {
            logger.warn("Unauthenticated access attempt, redirecting to login");
            router.push("/");
        }
    }, [isAuthenticated, isLoading, isProfileLoading, router]);

    const pathname = usePathname();

    // Strict Access Control for protected routes
    useEffect(() => {
        // Wait for all loading states to finish before making routing decisions
        if (isLoading || isProfileLoading) return;

        if (isAuthenticated) {
            const isPendingReviewPage = pathname === '/pending-review' || pathname.startsWith('/pending-review/');
            const isSignOutPage = pathname === '/signout' || pathname.startsWith('/signout/');

            // 1. Check for missing profile
            if (!user) {
                logger.warn("Authenticated user missing profile, redirecting to registration profile step");
                router.replace("/register?step=profile");
                return;
            }

            // 2. Check for inactive account
            if (user.active === false) {
                if (!isPendingReviewPage && !isSignOutPage) {
                    logger.warn("Inactive user attempted to access restricted route, redirecting to pending review", { path: pathname });
                    router.replace("/pending-review");
                }
                return;
            }

            // 3. Prevent active users from seeing the pending review page
            // Logic narrowing: we know user.active is NOT false here
            if (isPendingReviewPage) {
                logger.info("Active user attempted to access pending review page, redirecting to dashboard");
                router.replace(user.role === 'EMPLOYEE' ? "/employee-portal/dashboard" : "/employer-portal/dashboard");
                return;
            }

            // 4. Role-based portal protection
            const isEmployerPortal = pathname.startsWith('/employer-portal');
            const isEmployeePortal = pathname.startsWith('/employee-portal');

            if (user.role === 'EMPLOYEE' && isEmployerPortal) {
                logger.warn("Employee attempted to access employer portal, redirecting", { userId: user.id });
                router.replace("/employee-portal/dashboard");
            } else if ((user.role === 'EMPLOYER' || user.role === 'ADMIN') && isEmployeePortal) {
                logger.warn("Employer/Admin attempted to access employee portal, redirecting", { userId: user.id });
                router.replace("/employer-portal/dashboard");
            }
        }
    }, [user, isAuthenticated, isLoading, isProfileLoading, router, pathname]);

    // BLOCKING: Don't render children until we're sure the state is settled and correct
    if (isLoading || (isProfileLoading && !user)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-neutral-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    // Additional Blocking logic
    if (isAuthenticated) {
        if (!user) return null;

        const isPendingReviewPage = pathname === '/pending-review' || pathname.startsWith('/pending-review/');
        const isSignOutPage = pathname === '/signout' || pathname.startsWith('/signout/');
        const isEmployerPortal = pathname.startsWith('/employer-portal');
        const isEmployeePortal = pathname.startsWith('/employee-portal');

        // Inactive users can only see pending-review and signout
        if (user.active === false && !isPendingReviewPage && !isSignOutPage) return null;
        
        // Active users cannot see pending-review
        if (user.active !== false && isPendingReviewPage) return null;
        
        // Portal enforcement
        if (user.role === 'EMPLOYEE' && isEmployerPortal) return null;
        if ((user.role === 'EMPLOYER' || user.role === 'ADMIN') && isEmployeePortal) return null;
    }

    return <>{children}</>;
}
