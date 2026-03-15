"use client"

import * as React from "react"
import { IconMoon, IconSun } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

import { useSidebar } from "@/components/ui/sidebar"

export function ThemeToggle({ showLabel = "always" }: { showLabel?: "always" | "never" | "responsive" }) {
    // Optional sidebar context for standalone usage
    let sidebarContext;
    try {
        sidebarContext = useSidebar();
    } catch (e) {
        // Not in sidebar context
        sidebarContext = { open: true, setOpen: () => {}, animate: false };
    }
    const { open, setOpen, animate } = sidebarContext;
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const handleToggle = () => {
        setTheme(theme === "light" ? "dark" : "light")
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setOpen(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size={showLabel === "always" ? "sm" : showLabel === "never" ? "icon" : "icon"}
            className={cn(
                "rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors shadow-none border-none",
                showLabel === "always" ? "w-full justify-start px-2 h-10 gap-2" : 
                showLabel === "responsive" ? "md:w-auto md:px-3 md:h-10 md:gap-2 flex items-center justify-center h-9 w-9" : 
                "flex items-center justify-center"
            )}
            onClick={handleToggle}
        >
            <IconSun className="h-5 w-5 dark:hidden text-neutral-500 shrink-0" />
            <IconMoon className="h-5 w-5 hidden dark:block text-neutral-500 shrink-0" />
            {showLabel !== "never" && (
                <span
                    className={cn(
                        "text-sm font-medium transition-opacity duration-200",
                        showLabel === "responsive" && "hidden md:block",
                        animate && !open ? "opacity-0 hidden" : "opacity-100"
                    )}
                >
                    {mounted ? (theme === "light" ? "Light Mode" : "Dark Mode") : "Theme"}
                </span>
            )}
        </Button>
    )
}
