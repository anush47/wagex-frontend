"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IconLoader2 } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface DataLoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

export function DataLoadingOverlay({ isLoading, message }: DataLoadingOverlayProps) {
    const t = useTranslations("Common");

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 dark:bg-neutral-950/40 backdrop-blur-[2px] rounded-[2rem] transition-all duration-300"
                >
                    <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-neutral-200 dark:border-neutral-800">
                        <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
                            {message || t("loading") || "Loading..."}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
