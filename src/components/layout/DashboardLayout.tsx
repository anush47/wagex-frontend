"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
    IconBrandTabler,
    IconSettings,
    IconUserBolt,
    IconBuildingSkyscraper,
} from "@tabler/icons-react";
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
    IconCalendarTime
} from "@tabler/icons-react";
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
                <SidebarBody className="justify-between gap-10">
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
                        <SidebarLink
                            link={{
                                label: user?.email || "User",
                                href: user?.role === 'EMPLOYEE' ? "/employee-portal/profile" : "/profile",
                                icon: (
                                    <div className="h-7 w-7 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-500 dark:text-neutral-300">
                                        {user?.email?.[0]?.toUpperCase() || "U"}
                                    </div>
                                ),
                            }}
                        />
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

export const Logo = () => {
    return (
        <Link
            href="/"
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
    return (
        <Link
            href="/"
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
