"use client";

import { useRef, useState } from "react";
import { IconPhotoPlus, IconX, IconUpload, IconCloudUpload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
    label?: string;
}

export function ImageUpload({ value, onChange, className, label = "Company Logo" }: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | undefined>(value);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let file: File | undefined;

        if ('files' in e.target && e.target.files) {
            file = e.target.files[0];
        } else if ('dataTransfer' in e && e.dataTransfer.files) {
            file = e.dataTransfer.files[0];
        }

        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onChange(objectUrl);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange(e);
    };

    const handleRemove = (e: React.MouseEvent) => {
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
                <label className="text-sm font-semibold tracking-tight text-neutral-500 dark:text-neutral-400 uppercase ml-1">
                    {label}
                </label>
            )}

            <div
                onClick={() => !preview && fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                    "relative group cursor-pointer transition-all duration-500 rounded-[2rem] overflow-hidden shadow-sm",
                    "border-2 border-dashed flex flex-col items-center justify-center min-h-[220px]",
                    isDragging
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-900",
                    preview && "border-none"
                )}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                {!preview ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
                        <div className="h-16 w-16 rounded-3xl bg-white dark:bg-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 ease-out">
                            <IconCloudUpload className="h-8 w-8 text-neutral-400 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-lg font-bold tracking-tight mb-1">Upload masterpiece</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[200px]">
                            Drag & drop or <span className="text-primary font-semibold">browse</span> your brand logo
                        </p>
                    </div>
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center bg-white dark:bg-neutral-950 p-6 min-h-[220px] transition-all duration-700 animate-in zoom-in-95">
                        <img
                            src={preview}
                            alt="Brand Identity"
                            className="max-h-[160px] max-w-full object-contain rounded-xl select-none"
                        />
                        <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm flex items-center justify-center gap-3">
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
                                variant="destructive"
                                size="icon"
                                className="h-10 w-10 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all"
                                onClick={handleRemove}
                            >
                                <IconX className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
