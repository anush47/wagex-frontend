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
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-white/20 dark:bg-neutral-950/20 backdrop-blur-md rounded-[2.5rem] overflow-hidden"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="relative">
                            {/* Animated Rings */}
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="absolute inset-[-12px] rounded-full bg-primary/20 blur-xl"
                            />
                            <div className="relative h-16 w-16 rounded-full bg-white dark:bg-neutral-900 border border-primary/20 shadow-2xl flex items-center justify-center overflow-hidden">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                    className="absolute inset-1 border-2 border-transparent border-t-primary rounded-full"
                                />
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                            </div>
                        </div>

                        {message !== null && (
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <span className="text-sm font-black uppercase tracking-widest text-primary/80">
                                    {message || t("loading") || "Processing"}
                                </span>
                                <div className="flex gap-1">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ opacity: [0.2, 1, 0.2] }}
                                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                            className="h-1 w-1 rounded-full bg-primary"
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
