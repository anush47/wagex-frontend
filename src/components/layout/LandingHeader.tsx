"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useAuthStore } from "@/stores/auth.store";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Logo } from "./DashboardLayout";
import { motion } from "motion/react";

export function LandingHeader() {
    const { isAuthenticated, user } = useAuthStore();
    const t = useTranslations("Common");

    const portalHref = user?.role === 'EMPLOYEE' ? "/employee-portal/dashboard" : "/employer-portal/dashboard";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-xl">
            <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <Logo />
                    <nav className="hidden lg:flex items-center gap-6">
                        <Link href="#features" className="text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors uppercase tracking-wider">
                            Features
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <div className="flex items-center gap-0 border-r border-neutral-200 dark:border-neutral-800 pr-1 md:pr-4">
                        <LanguageSwitcher showLabel="responsive" />
                        <ThemeToggle showLabel="responsive" />
                    </div>

                    {isAuthenticated ? (
                        <Link href={portalHref}>
                            <Button className="rounded-full px-3 md:px-6 h-9 md:h-11 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                {t("landing.hero.cta_portal")}
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button className="rounded-full px-3 md:px-6 h-9 md:h-11 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                {t("landing.hero.cta_login")}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
