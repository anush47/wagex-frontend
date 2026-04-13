"use client";

import { useRef, useState, useEffect } from "react";
import { IconPhotoPlus, IconX, IconUpload, IconCloudUpload, IconLoader2, IconEye } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StorageService } from "@/services/storage.service";
import { toast } from "sonner";
import { useStorageUrl } from "@/hooks/use-storage";

interface ImageUploadProps {
    value?: string;
    companyId?: string;
    onChange: (value: string) => void;
    className?: string;
    label?: string;
    description?: string;
    alt?: string;
}

export function ImageUpload({
    value,
    companyId,
    onChange,
    className,
    label = "Company Logo",
    description = "brand logo",
    alt = "Brand Identity",
    disabled = false
}: ImageUploadProps & { disabled?: boolean }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | undefined>();
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Use the storage hook to resolve the key to a signed URL
    const { data: resolvedUrl, isLoading } = useStorageUrl(
        value && !value.startsWith('http') && !value.startsWith('blob:') ? value : null
    );

    // Determine if we're currently resolving the URL
    const resolving = isLoading;

    // Update preview when resolved URL changes or when value is a direct URL
    // But only update if we're not currently uploading
    useEffect(() => {
        if (uploading) {
            // Don't update preview while uploading to preserve the local preview
            return;
        }

        if (value && (value.startsWith('http') || value.startsWith('blob:'))) {
            setPreview(value);
        } else {
            setPreview(resolvedUrl || undefined);
        }
    }, [value, resolvedUrl, uploading]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        if (disabled) return;
        let file: File | undefined;

        if ('files' in e.target && e.target.files) {
            file = e.target.files[0];
        } else if ('dataTransfer' in e && e.dataTransfer.files) {
            file = e.dataTransfer.files[0];
        }

        if (file) {
            setUploading(true);
            const objectUrl = URL.createObjectURL(file);

            try {
                // Real upload
                const response = await StorageService.upload({
                    file,
                    companyId: companyId || 'temp', // Fallback for new company creation
                    folder: 'logos'
                });

                if (response.error || !response.data) {
                    toast.error(response.error?.message || "Upload failed");
                    return;
                }

                const uploadData = response.data;

                // Show immediate preview (optimistic/local)
                setPreview(objectUrl);
                // Return the key to the form
                onChange(uploadData.key);
                toast.success("Logo uploaded successfully");
            } catch (error) {
                console.error("Logo upload error:", error);
                toast.error("Failed to upload logo");
            } finally {
                setUploading(false);
            }
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        setIsDragging(false);
        handleFileChange(e);
    };

    const handleRemove = (e: React.MouseEvent) => {
        if (disabled) return;
        e.stopPropagation();
        setPreview(undefined);
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {label && (
                <label className="text-sm font-semibold tracking-tight text-neutral-500 dark:text-neutral-400 uppercase ml-1 block mb-2">
                    {label}
                </label>
            )}

            <div
                onClick={() => !preview && !uploading && !disabled && fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                    "relative group transition-all duration-500 rounded-[2rem] overflow-hidden shadow-sm",
                    "border-2 border-dashed flex flex-col items-center justify-center min-h-[220px]",
                    !disabled && "cursor-pointer",
                    isDragging
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-900",
                    (preview || uploading || resolving) && "border-none",
                    disabled && !preview && "opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800/20"
                )}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                {uploading || resolving ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-neutral-900 absolute inset-0 z-10">
                        <IconLoader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-sm font-bold text-neutral-500">{uploading ? "Uploading..." : "Loading logo..."}</p>
                    </div>
                ) : null}

                {!preview && !uploading && !resolving ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
                        <div className={cn(
                            "h-16 w-16 rounded-3xl bg-white dark:bg-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 ease-out",
                            disabled && "group-hover:scale-100"
                        )}>
                            <IconCloudUpload className={cn("h-8 w-8 text-neutral-400 transition-colors", !disabled && "group-hover:text-primary")} />
                        </div>
                        <p className="text-lg font-bold tracking-tight mb-1">{disabled ? "No image uploaded" : "Upload image"}</p>
                        {!disabled && (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[200px]">
                                Drag & drop or <span className="text-primary font-semibold">browse</span> your {description}
                            </p>
                        )}
                    </div>
                ) : preview && !uploading && !resolving ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-white dark:bg-neutral-950 p-6 min-h-[220px] transition-all duration-700 animate-in zoom-in-95">
                        <img
                            src={preview}
                            alt={alt}
                            className="max-h-[160px] max-w-full object-contain rounded-xl select-none"
                        />
                        {!disabled && (
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-full px-6 font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
                                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                >
                                    Change
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="h-10 w-10 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all"
                                    onClick={(e) => { e.stopPropagation(); window.open(preview, '_blank'); }}
                                >
                                    <IconEye className="h-5 w-5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-10 w-10 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all"
                                    onClick={handleRemove}
                                >
                                    <IconX className="h-5 w-5" />
                                </Button>
                            </div>
                        )}
                        {disabled && (
                             <div className="absolute right-4 top-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="h-10 w-10 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all bg-white/50 backdrop-blur-sm"
                                    onClick={(e) => { e.stopPropagation(); window.open(preview, '_blank'); }}
                                >
                                    <IconEye className="h-5 w-5 text-neutral-900" />
                                </Button>
                             </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
