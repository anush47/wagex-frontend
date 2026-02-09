"use client";

import React from "react";
import { useStorageUrl } from "@/hooks/use-storage";
import { cn } from "@/lib/utils";

interface EmployeeAvatarProps {
    photo?: string | null;
    name?: string | null;
    className?: string;
    skipUrl?: boolean;
}

export function EmployeeAvatar({ photo, name, className, skipUrl }: EmployeeAvatarProps) {
    const { data: url, isLoading } = useStorageUrl(skipUrl ? null : (photo || null));

    const defaultClassName = cn(
        "bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-black text-neutral-400 overflow-hidden shadow-inner border border-neutral-200 dark:border-neutral-700",
        className || "h-10 w-10 rounded-xl text-lg"
    );

    if (isLoading) {
        return (
            <div className={cn(defaultClassName, "animate-pulse font-mono")}>
                ...
            </div>
        );
    }

    const initials = name
        ? name.split(' ').map(n => n?.[0]).join('').slice(0, 2).toUpperCase()
        : "?";

    return (
        <div className={defaultClassName}>
            {url && typeof url === 'string' ? (
                <img src={url} alt={name || "Avatar"} className="h-full w-full object-cover" />
            ) : (
                initials
            )}
        </div>
    );
}
