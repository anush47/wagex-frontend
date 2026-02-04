"use client";

import { useRef, useState } from "react";
import { IconX, IconUpload, IconCloudUpload, IconFileText, IconCheck, IconLoader2, IconCheck as IconTick } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CompanyFile } from "@/types/company";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { StorageService } from "@/services/storage.service";

interface FileUploadProps {
    onUpload: (file: CompanyFile) => void;
    companyId: string;
    employeeId?: string;
    folder?: string;
    className?: string;
}

export function FileUpload({ onUpload, companyId, employeeId, folder = "general", className }: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    // States for the name request step
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [customName, setCustomName] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let file: File | undefined;

        if ('files' in e.target && e.target.files) {
            file = e.target.files[0];
        } else if ('dataTransfer' in e && e.dataTransfer.files) {
            file = e.dataTransfer.files[0];
        }

        if (file) {
            setPendingFile(file);
            setCustomName(file.name); // Default to original filename
        }
    };

    const confirmUpload = async () => {
        if (!pendingFile || !customName.trim()) return;

        setUploading(true);
        const fileToUpload = pendingFile;
        const nameToUse = customName.trim();

        // Reset name step states
        setPendingFile(null);
        setCustomName("");

        // Real upload using StorageService
        try {
            const response = await StorageService.upload({
                file: fileToUpload,
                companyId,
                employeeId,
                folder,
                customFilename: nameToUse
            });

            if (response.error) {
                toast.error(response.error.message || "Upload failed");
                return;
            }

            const uploadData = (response.data as any)?.data || response.data;

            const formatSize = (bytes: number) => {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            };

            const newFile: CompanyFile = {
                key: uploadData.key,
                name: nameToUse,
                url: uploadData.key, // We store the key, components will resolve it to a signed URL
                size: formatSize(uploadData.size || fileToUpload.size)
            };

            onUpload(newFile);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("An unexpected error occurred during upload");
        } finally {
            setUploading(false);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const cancelSelection = () => {
        setPendingFile(null);
        setCustomName("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
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

    return (
        <div className={cn("w-full", className)}>
            <div
                onClick={() => !uploading && !pendingFile && fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                    "relative group transition-all duration-500 rounded-[2rem] overflow-hidden shadow-sm",
                    "border-2 border-dashed flex flex-col items-center justify-center min-h-[200px]",
                    !pendingFile && "cursor-pointer",
                    isDragging
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30",
                    !pendingFile && !uploading && "hover:bg-neutral-50 dark:hover:bg-neutral-900",
                    uploading && "pointer-events-none opacity-80"
                )}
            >
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                <AnimatePresence mode="wait">
                    {uploading ? (
                        <motion.div
                            key="uploading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
                                <IconLoader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                            <p className="text-lg font-bold tracking-tight">Finishing upload...</p>
                            <p className="text-sm text-neutral-500">Processing your document</p>
                        </motion.div>
                    ) : pendingFile ? (
                        <motion.div
                            key="naming"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center p-8 w-full max-w-md text-center"
                        >
                            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 text-amber-600">
                                <IconFileText className="h-7 w-7" />
                            </div>
                            <h3 className="text-lg font-black tracking-tight mb-4">Name your document</h3>
                            <div className="flex gap-2 w-full mb-6 text-left">
                                <Input
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    placeholder="Enter file name..."
                                    className="h-12 text-base font-bold bg-white dark:bg-neutral-900 rounded-xl"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && confirmUpload()}
                                />
                            </div>
                            <div className="flex gap-3 w-full">
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="flex-1 h-12 rounded-xl font-bold"
                                    onClick={cancelSelection}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
                                    onClick={confirmUpload}
                                    disabled={!customName.trim()}
                                >
                                    Upload
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="h-16 w-16 rounded-3xl bg-white dark:bg-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 ease-out">
                                <IconCloudUpload className="h-8 w-8 text-neutral-400 group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-lg font-bold tracking-tight mb-1">Upload Documents</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[240px]">
                                Drag & drop or <span className="text-primary font-semibold font-bold">browse</span> contracts, licenses, or tax forms
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
