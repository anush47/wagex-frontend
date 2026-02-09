"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX, IconChevronRight } from "@tabler/icons-react";
import { Link, usePathname } from "@/i18n/routing";

interface Links {
    label: string;
    href: string;
    icon: React.JSX.Element | React.ReactNode;
    exactMatch?: boolean;
}

interface SidebarContextProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
    undefined
);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

export const SidebarProvider = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    animate = true,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    const [openState, setOpenState] = useState(false);

    const open = openProp !== undefined ? openProp : openState;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const Sidebar = ({
    children,
    open,
    setOpen,
    animate,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    return (
        <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
            {children}
        </SidebarProvider>
    );
};

export const SidebarBody = ({ mobileBranding, ...props }: React.ComponentProps<typeof motion.div> & { mobileBranding?: React.ReactNode }) => {
    return (
        <>
            <DesktopSidebar {...(props as any)} />
            <MobileSidebar {...(props as any)} branding={mobileBranding} />
        </>
    );
};

export const DesktopSidebar = ({
    className,
    children,
    ...props
}: Omit<React.ComponentProps<typeof motion.div>, "children"> & { children?: React.ReactNode }) => {
    const { open, setOpen, animate } = useSidebar();
    return (
        <>
            <motion.div
                className={cn(
                    "h-full px-3 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 shrink-0 relative border-r border-neutral-200 dark:border-neutral-800",
                    className
                )}
                animate={{
                    width: animate ? (open ? "280px" : "72px") : "280px",
                }}
                {...props}
            >
                {/* Manual Toggle Button */}
                <button
                    onClick={() => setOpen(!open)}
                    className={cn(
                        "absolute -right-4 top-16 z-50 h-8 w-8 rounded-full border-2 border-primary bg-white dark:bg-neutral-900 flex items-center justify-center shadow-xl hover:shadow-primary/20 transition-all duration-300 outline-none hover:scale-110 active:scale-95 group/toggle"
                    )}
                >
                    <IconChevronRight className={cn(
                        "h-5 w-5 text-primary transition-transform duration-500",
                        open ? "rotate-180" : "rotate-0"
                    )} />
                </button>
                {children}
            </motion.div>
        </>
    );
};

export const MobileSidebar = ({
    className,
    children,
    branding,
    ...props
}: React.ComponentProps<"div"> & { branding?: React.ReactNode }) => {
    const { open, setOpen } = useSidebar();

    // Destructure children out of props to prevent double-rendering in the header
    const { children: _, ...restProps } = props as any;

    return (
        <>
            <div
                className={cn(
                    "h-16 px-6 flex flex-row md:hidden items-center justify-between bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 w-full z-50 sticky top-0"
                )}
                {...restProps}
            >
                <div className="flex justify-start z-20">
                    {branding}
                </div>
                <div className="flex justify-end z-20">
                    <div
                        className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
                        onClick={() => setOpen(!open)}
                    >
                        <IconMenu2 className="text-neutral-800 dark:text-neutral-200 h-5 w-5" />
                    </div>
                </div>
                <AnimatePresence>
                    {open && (
                        <>
                            {/* Backdrop Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setOpen(false)}
                                className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[90]"
                            />

                            {/* Sidebar Panel */}
                            <motion.div
                                initial={{ x: "-100%", opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: "-100%", opacity: 0 }}
                                transition={{
                                    duration: 0.3,
                                    ease: "easeInOut",
                                }}
                                className={cn(
                                    "fixed h-[100dvh] w-[85%] max-w-[320px] inset-y-0 left-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl p-6 pt-20 z-[100] flex flex-col border-r border-neutral-200/50 dark:border-neutral-800/50 shadow-2xl",
                                    className
                                )}
                            >
                                <div
                                    className="absolute right-4 top-4 z-[110] p-2 rounded-xl bg-neutral-100/50 dark:bg-neutral-800/50 cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors"
                                    onClick={() => setOpen(!open)}
                                >
                                    <IconX className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                                </div>
                                <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4">
                                    {children}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};


export const SidebarLink = ({
    link,
    className,
    ...props
}: {
    link: Links;
    className?: string;
}) => {
    const { open, setOpen, animate } = useSidebar();
    const pathname = usePathname();
    const isActive = link.exactMatch
        ? pathname === link.href
        : (pathname === link.href || pathname?.startsWith(`${link.href}/`));

    const handleClick = () => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setOpen(false);
        }
    };

    return (
        <Link
            href={link.href as any}
            onClick={handleClick}
            className={cn(
                "flex items-center gap-4 group/sidebar py-2.5 px-3 rounded-xl transition-all",
                isActive
                    ? "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground font-bold shadow-lg shadow-primary/20"
                    : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50",
                className
            )}
            {...props}
        >
            <div className={cn("shrink-0 flex items-center justify-center w-6 h-6")}>
                {React.cloneElement(link.icon as React.ReactElement<any>, {
                    className: cn((link.icon as any).props.className, isActive ? "!text-primary-foreground" : "text-neutral-500 group-hover/sidebar:text-primary transition-colors")
                })}
            </div>

            <motion.span
                animate={{
                    display: animate ? (open ? "inline-block" : "none") : "inline-block",
                    opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className={cn(
                    "text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0",
                    isActive ? "text-primary-foreground font-bold" : "text-neutral-700 dark:text-neutral-200 font-medium"
                )}
            >
                {link.label}
            </motion.span>
        </Link>
    );
};
