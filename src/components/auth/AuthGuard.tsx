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
            const isRegisterPage = pathname.startsWith('/register');

            // 1. Check for missing profile
            // If authenticated but user is null, they MUST complete the profile step
            if (!user) {
                if (!isRegisterPage && !isSignOutPage) {
                    logger.warn("Authenticated user missing profile, redirecting to registration profile step");
                    router.replace("/register?step=profile");
                }
                return;
            }

            // 2. Check for inactive account
            // If user has a profile but is inactive, they MUST go to pending review
            if (user.active === false) {
                if (!isPendingReviewPage && !isSignOutPage) {
                    logger.warn("Inactive user attempted to access restricted route, redirecting to pending review", { path: pathname });
                    router.replace("/pending-review");
                }
                return;
            }

            // 3. Prevent active users from seeing the pending review page
            if (isPendingReviewPage) {
                logger.info("Active user attempted to access pending review page, redirecting to dashboard");
                if (user.role === 'ADMIN') {
                    router.replace("/admin-portal/dashboard");
                } else if (user.role === 'EMPLOYEE') {
                    router.replace("/employee-portal/dashboard");
                } else {
                    router.replace("/employer-portal/dashboard");
                }
                return;
            }

            // 4. Role-based portal protection
            const isEmployerPortal = pathname.startsWith('/employer-portal');
            const isEmployeePortal = pathname.startsWith('/employee-portal');
            const isAdminPortal = pathname.startsWith('/admin-portal');

            if (user.role === 'EMPLOYEE' && (isEmployerPortal || isAdminPortal)) {
                logger.warn("Employee attempted to access restricted portal, redirecting", { userId: user.id });
                router.replace("/employee-portal/dashboard");
            } else if (user.role === 'EMPLOYER' && (isEmployeePortal || isAdminPortal)) {
                logger.warn("Employer attempted to access restricted portal, redirecting", { userId: user.id });
                router.replace("/employer-portal/dashboard");
            } else if (user.role === 'ADMIN' && isEmployeePortal) {
                logger.warn("Admin attempted to access employee portal, redirecting", { userId: user.id });
                router.replace("/admin-portal/dashboard");
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

    // Additional Blocking logic to prevent content flash during transition
    if (isAuthenticated) {
        const isPendingReviewPage = pathname === '/pending-review' || pathname.startsWith('/pending-review/');
        const isSignOutPage = pathname === '/signout' || pathname.startsWith('/signout/');
        const isEmployerPortal = pathname.startsWith('/employer-portal');
        const isEmployeePortal = pathname.startsWith('/employee-portal');
        const isRegisterPage = pathname.startsWith('/register');

        // Missing profile: can only see register or signout
        if (!user && !isRegisterPage && !isSignOutPage) return null;

        // Inactive users can only see pending-review and signout
        if (user && user.active === false && !isPendingReviewPage && !isSignOutPage) return null;
        
        // Active users cannot see pending-review
        if (user && user.active !== false && isPendingReviewPage) return null;
        
        // Portal enforcement
        const isAdminPortal = pathname.startsWith('/admin-portal');

        if (user && user.role === 'EMPLOYEE' && (isEmployerPortal || isAdminPortal)) return null;
        if (user && user.role === 'EMPLOYER' && (isEmployeePortal || isAdminPortal)) return null;
        if (user && user.role === 'ADMIN' && isEmployeePortal) return null;
    }

    return <>{children}</>;
}
