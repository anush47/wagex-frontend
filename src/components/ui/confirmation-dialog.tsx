"use client";

import * as React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string | React.ReactNode;
    description: string | React.ReactNode;
    icon: React.ReactNode;
    actionLabel: string;
    cancelLabel: string;
    onAction: () => void;
    onCancel?: () => void;
    loading?: boolean;
    variant?: "default" | "warning" | "destructive";
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    icon,
    actionLabel,
    cancelLabel,
    onAction,
    onCancel,
    loading,
    variant = "default",
}: ConfirmationDialogProps) {

    const variantStyles = {
        default: {
            iconContainer: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
            title: "text-neutral-900 dark:text-white",
            action: "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-neutral-900/10 dark:shadow-white/10",
            border: "",
        },
        warning: {
            iconContainer: "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500",
            title: "text-neutral-900 dark:text-white",
            action: "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-neutral-900/10 dark:shadow-white/10",
            border: "",
        },
        destructive: {
            iconContainer: "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-50",
            title: "text-red-600 dark:text-red-500",
            action: "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20",
            border: "border-t-8 border-t-red-500",
        },
    };

    const currentStyles = variantStyles[variant];

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className={cn(
                "border-none shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl rounded-[2.5rem] p-10 max-w-lg overflow-hidden",
                currentStyles.border
            )}>
                <AlertDialogHeader className="space-y-4">
                    <div className={cn(
                        "h-16 w-16 rounded-3xl flex items-center justify-center mb-2",
                        currentStyles.iconContainer
                    )}>
                        {icon}
                    </div>
                    <AlertDialogTitle className={cn(
                        "text-3xl font-black tracking-tight",
                        currentStyles.title
                    )}>
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-lg text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-10 gap-4">
                    <AlertDialogCancel
                        disabled={loading}
                        onClick={onCancel}
                        className="h-14 rounded-2xl px-8 border-none bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-bold transition-all"
                    >
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onAction();
                        }}
                        disabled={loading}
                        className={cn(
                            "h-14 rounded-2xl px-8 font-bold transition-all shadow-xl",
                            currentStyles.action
                        )}
                    >
                        {loading ? "Processing..." : actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
