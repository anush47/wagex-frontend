"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
    IconBrandTabler,
    IconSettings,
    IconUserBolt,
    IconBuildingSkyscraper,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/routing";
import { useAuthStore } from "@/stores/auth.store";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import {
    IconUsers,
    IconArrowLeft,
    IconSitemap,
    IconChartBar,
    IconCalendarTime,
    IconCalendarCheck,
    IconLogout,
    IconWallet,
    IconClipboardList
} from "@tabler/icons-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CompanyService } from "@/services/company.service";
import { Company } from "@/types/company";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations("Common");
    const { user } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [company, setCompany] = useState<Company | null>(null);
    const pathname = usePathname();
    const params = useParams();

    React.useEffect(() => {
        // Initially expand sidebar on desktop screens
        if (window.innerWidth >= 768) {
            setOpen(true);
        }
    }, []);

    // Check if we are in a company details context
    // Pattern: /employer-portal/companies/[id] where id is not 'new'
    const isCompanyContext = pathname.startsWith('/employer-portal/companies/') &&
        !pathname.endsWith('/companies/new') &&
        pathname.split('/').length > 3;

    const companyId = params?.id as string;

    React.useEffect(() => {
        const fetchCompany = async () => {
            if (isCompanyContext && companyId) {
                try {
                    const response = await CompanyService.getCompany(companyId);
                    // Handle double-wrapped response: response.data (from ApiClient) -> .data (from Backend)
                    if (response.data) {
                        const companyData = (response.data as any).data || response.data;
                        setCompany(companyData);
                    }
                } catch (error) {
                    console.error("Failed to fetch company for sidebar", error);
                }
            } else {
                setCompany(null);
            }
        };

        fetchCompany();
    }, [isCompanyContext, companyId]);

    const mainLinks = [
        {
            label: t("dashboard"),
            href: user?.role === 'EMPLOYEE' ? "/employee-portal/dashboard" : "/employer-portal/dashboard",
            icon: (
                <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
        },
        ...(user?.role === 'EMPLOYER' || user?.role === 'ADMIN' || pathname.includes('/employer-portal') ? [
            {
                label: t("companies"),
                href: "/employer-portal/companies",
                icon: (
                    <IconBuildingSkyscraper className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ),
            }
        ] : []),
        {
            label: t("profile"),
            href: user?.role === 'EMPLOYEE' ? "/employee-portal/profile" : "/profile",
            icon: (
                <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
        },
        {
            label: t("settings"),
            href: "/settings",
            icon: (
                <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
        },
    ];

    const companyLinks = [
        {
            label: "Overview", // TODO: Add translation key
            href: `/employer-portal/companies/${companyId}`,
            exactMatch: true,
            icon: (
                <IconChartBar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
        },
        {
            label: "Details",
            href: `/employer-portal/companies/${companyId}/details`,
            icon: (
                <IconBuildingSkyscraper className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
        },
        {
            label: "Policies",
            href: `/employer-portal/companies/${companyId}/policies`,
            icon: (
                <IconClipboardList className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
        },
        {
            label: t("employees"),
            href: `/employer-portal/companies/${companyId}/employees`,
            icon: (
                <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
        },
        {
            label: "Departments", // TODO: Add translation key
            href: `/employer-portal/companies/${companyId}/departments`,
            icon: (
                <IconSitemap className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
        },
        {
            label: "Leaves", // TODO: Add translation key
            href: `/employer-portal/companies/${companyId}/leaves`,
            icon: (
                <IconCalendarTime className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
        },
        {
            label: "Attendance", // TODO: Add translation key
            href: `/employer-portal/companies/${companyId}/attendance`,
            icon: (
                <IconCalendarCheck className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
        },
        {
            label: "Salaries",
            href: `/employer-portal/companies/${companyId}/salaries`,
            icon: (
                <IconWallet className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
        },
        {
            label: t("settings"),

            href: `/employer-portal/companies/${companyId}/settings`,
            icon: (
                <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
        },
        {
            label: t("back"),
            href: "/employer-portal/companies",
            exactMatch: true,
            icon: (
                <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
        },
    ];

    const links = isCompanyContext ? companyLinks : mainLinks;

    return (
        <div
            className={cn(
                "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-900 w-full flex-1 mx-auto overflow-hidden",
                "h-[100dvh]"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody
                    className="justify-between gap-10"
                    mobileBranding={
                        <div className="flex items-center gap-3">
                            <Logo />
                            {isCompanyContext && company && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                                >
                                    <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 truncate max-w-[120px]">
                                        {company.name}
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    }
                >
                    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                        <div className="flex flex-col gap-1">
                            {open ? <Logo /> : <LogoIcon />}
                            {isCompanyContext && company && open && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-2"
                                >
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 truncate">
                                            {company.name}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                        <ThemeToggle />
                        <LanguageSwitcher />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full flex justify-start gap-2 h-10 px-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                                    <div className="shrink-0 flex items-center justify-center w-5 h-5">
                                        <div className="h-6 w-6 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-500 dark:text-neutral-300">
                                            {user?.email?.[0]?.toUpperCase() || "U"}
                                        </div>
                                    </div>
                                    <span
                                        className={cn(
                                            "text-sm font-medium transition-opacity duration-200 text-neutral-700 dark:text-neutral-200",
                                            !open ? "opacity-0 hidden" : "opacity-100"
                                        )}
                                    >
                                        {user?.email || "User"}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={user?.role === 'EMPLOYEE' ? "/employee-portal/profile" : "/profile"} className="cursor-pointer">
                                        <IconUserBolt className="mr-2 h-4 w-4" />
                                        <span>{t("profile")}</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/signout" className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 w-full flex items-center">
                                        <IconLogout className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </SidebarBody>
            </Sidebar>
            <div className="flex flex-1 h-full min-h-0 overflow-hidden">
                <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-4 md:p-10 bg-white dark:bg-neutral-900 md:rounded-tl-2xl border-t md:border-l border-neutral-200 dark:border-neutral-700">
                    {children}
                </main>
            </div>
        </div>
    );
}

import { useSidebar } from "@/components/ui/sidebar";

export const Logo = () => {
    const { setOpen } = useSidebar();
    const handleClick = () => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setOpen(false);
        }
    };

    return (
        <Link
            href="/"
            onClick={handleClick}
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-black text-black dark:text-white whitespace-pre tracking-tighter italic"
            >
                WageX
            </motion.span>
        </Link>
    );
};

export const LogoIcon = () => {
    const { setOpen } = useSidebar();
    const handleClick = () => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setOpen(false);
        }
    };

    return (
        <Link
            href="/"
            onClick={handleClick}
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
        </Link>
    );
};

const Dashboard = ({ content }: { content: React.ReactNode }) => {
    return (
        <div className="flex flex-1">
            <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-4 md:p-10 dark:border-neutral-700 dark:bg-neutral-900 overflow-y-auto">
                {content}
            </div>
        </div>
    );
};
