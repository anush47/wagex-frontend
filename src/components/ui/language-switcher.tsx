"use client";

import { useLocale, useTranslations } from "next-intl";
import { routing, usePathname, useRouter } from "@/i18n/routing";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconLanguage } from "@tabler/icons-react";
import { useParams } from "next/navigation";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ showLabel = "always" }: { showLabel?: "always" | "never" | "responsive" }) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    
    // Optional sidebar context for standalone usage
    let sidebarContext;
    try {
        sidebarContext = useSidebar();
    } catch (e) {
        // Not in sidebar context
        sidebarContext = { open: true, setOpen: () => {}, animate: false };
    }
    const { open, setOpen, animate } = sidebarContext;

    const switchLocale = (nextLocale: string) => {
        router.replace(
            // @ts-ignore
            { pathname, params },
            { locale: nextLocale }
        );
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setOpen(false);
        }
    };

    const labels: Record<string, string> = {
        en: "English",
        si: "සිංහල",
        ta: "தமிழ்",
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size={showLabel === "always" ? "sm" : showLabel === "never" ? "icon" : "icon"} 
                    className={cn(
                        "rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors shadow-none border-none",
                        showLabel === "always" ? "w-full justify-start px-2 h-10 gap-2" : 
                        showLabel === "responsive" ? "md:w-auto md:px-3 md:h-10 md:gap-2 flex items-center justify-center h-9 w-9" : 
                        "flex items-center justify-center"
                    )}
                >
                    <IconLanguage className="h-5 w-5 text-neutral-500 shrink-0" />
                    {showLabel !== "never" && (
                        <span
                            className={cn(
                                "text-sm font-medium transition-opacity duration-200",
                                showLabel === "responsive" && "hidden md:block",
                                animate && !open ? "opacity-0 hidden" : "opacity-100"
                            )}
                        >
                            {labels[locale]}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
                {routing.locales.map((loc) => (
                    <DropdownMenuItem
                        key={loc}
                        onClick={() => switchLocale(loc)}
                        className="cursor-pointer font-medium"
                    >
                        {labels[loc]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
