"use client";

import { useState, useEffect } from "react";
import { StorageService } from "@/services/storage.service";
import { IconPhoto, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface StorageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    storageKey?: string;
    fallback?: React.ReactNode;
}

export function StorageImage({ storageKey, fallback, className, ...props }: StorageImageProps) {
    const [url, setUrl] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const resolve = async () => {
            if (!storageKey) {
                setUrl(undefined);
                return;
            }

            if (storageKey.startsWith('http') || storageKey.startsWith('blob:')) {
                setUrl(storageKey);
                return;
            }

            setLoading(true);
            setError(false);
            try {
                const response = await StorageService.getUrl(storageKey);
                const actualData = (response.data as any)?.data || response.data;

                if (actualData?.url) {
                    setUrl(actualData.url);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("StorageImage error:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        resolve();
    }, [storageKey]);

    if (loading) {
        return (
            <div className={cn("flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 animate-pulse", className)}>
                <IconLoader2 className="h-4 w-4 animate-spin text-neutral-400" />
            </div>
        );
    }

    if (error || !url) {
        return fallback || (
            <div className={cn("flex items-center justify-center bg-neutral-100 dark:bg-neutral-800", className)}>
                <IconPhoto className="h-4 w-4 text-neutral-400" />
            </div>
        );
    }

    return (
        <img
            src={url}
            className={className}
            {...props}
        />
    );
}
