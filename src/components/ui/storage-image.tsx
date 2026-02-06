"use client";

import { useState, useEffect } from "react";
import { IconPhoto, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useStorageUrl } from "@/hooks/use-storage";

interface StorageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    storageKey?: string;
    fallback?: React.ReactNode;
}

export function StorageImage({ storageKey, fallback, className, ...props }: StorageImageProps) {
    const { data: url, isLoading, isError, isFetching } = useStorageUrl(
        storageKey && !storageKey.startsWith('http') && !storageKey.startsWith('blob:') ? storageKey : null
    );

    // Handle direct URLs separately
    const directUrl = storageKey && (storageKey.startsWith('http') || storageKey.startsWith('blob:')) ? storageKey : null;
    const imageUrl = directUrl || url;

    if (isLoading || isFetching) {
        return (
            <div className={cn("flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 animate-pulse", className)}>
                <IconLoader2 className="h-4 w-4 animate-spin text-neutral-400" />
            </div>
        );
    }

    if (isError || !imageUrl) {
        return fallback || (
            <div className={cn("flex items-center justify-center bg-neutral-100 dark:bg-neutral-800", className)}>
                <IconPhoto className="h-4 w-4 text-neutral-400" />
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            className={className}
            {...props}
        />
    );
}
