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

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const { open, setOpen, animate } = useSidebar();

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
                <Button variant="ghost" size="sm" className="w-full flex justify-start gap-2 h-10 px-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                    <IconLanguage className="h-5 w-5 text-neutral-500" />
                    <span
                        className={cn(
                            "text-sm font-medium transition-opacity duration-200",
                            animate && !open ? "opacity-0 hidden" : "opacity-100"
                        )}
                    >
                        {labels[locale]}
                    </span>
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
