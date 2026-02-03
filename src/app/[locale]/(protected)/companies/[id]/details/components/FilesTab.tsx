"use client";

import { useState } from "react";
import { Company, CompanyFile } from "@/types/company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconFile, IconX, IconEye, IconFileText, IconCheck, IconPencil, IconCheck as IconTick, IconPlus, IconCloudUpload, IconLoader2 } from "@tabler/icons-react";
import { CompanyService } from "@/services/company.service";
import { StorageService } from "@/services/storage.service";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface FilesTabProps {
    formData: Company;
    handleChange: (field: keyof Company, value: any) => void;
}

export function FilesTab({ formData, handleChange }: FilesTabProps) {
    const files = formData.files || [];
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [tempName, setTempName] = useState("");
    const [showUpload, setShowUpload] = useState(false);
    const [viewingKeys, setViewingKeys] = useState<Set<string>>(new Set());

    const removeFile = (keyToRemove: string) => {
        const updatedFiles = files.filter(f => f.key !== keyToRemove);
        handleChange("files", updatedFiles);
        toast.success("Document removed from list");
    };

    const handleUpload = (newFile: CompanyFile) => {
        handleChange("files", [...files, newFile]);
        toast.success(`${newFile.name} added to list`);
        setShowUpload(false); // Auto-hide after successful upload
    };

    const startEditing = (file: CompanyFile) => {
        setEditingKey(file.key);
        setTempName(file.name);
    };

    const saveName = (key: string) => {
        if (!tempName.trim()) {
            toast.error("File name cannot be empty");
            return;
        }
        const updatedFiles = files.map(f =>
            f.key === key ? { ...f, name: tempName.trim() } : f
        );
        handleChange("files", updatedFiles);
        setEditingKey(null);
        toast.success("File renamed successfully");
    };

    const handleView = async (file: CompanyFile) => {
        if (viewingKeys.has(file.key)) return;

        setViewingKeys(prev => new Set(prev).add(file.key));
        try {
            const response = await StorageService.getUrl(file.key);
            const actualData = (response.data as any)?.data || response.data;

            if (actualData?.url) {
                // Open the signed URL in a new tab
                window.open(actualData.url, '_blank');
            } else {
                toast.error("Could not retrieve document link");
            }
        } catch (error) {
            console.error("View error:", error);
            toast.error("Failed to prepare document for viewing");
        } finally {
            setViewingKeys(prev => {
                const next = new Set(prev);
                next.delete(file.key);
                return next;
            });
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <AnimatePresence>
                {showUpload && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-none shadow-[0_20px_50px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgb(0,0,0,0.4)] bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden relative border-2 border-primary/10">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-6 right-6 h-12 w-12 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 z-10 transition-all active:scale-90"
                                onClick={() => setShowUpload(false)}
                            >
                                <IconX className="h-6 w-6 text-neutral-400" />
                            </Button>
                            <CardContent className="p-10">
                                <FileUpload onUpload={handleUpload} companyId={formData.id} />
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Files List Card */}
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgb(0,0,0,0.3)] bg-white dark:bg-neutral-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-inner">
                            <IconFile className="h-6 w-6" />
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="text-2xl font-black tracking-tight">Active Documents</CardTitle>
                            <p className="text-sm text-neutral-500 font-medium">{files.length} {files.length === 1 ? 'file' : 'files'} securely stored</p>
                        </div>
                    </div>

                    {!showUpload && (
                        <Button
                            onClick={() => setShowUpload(true)}
                            size="lg"
                            className="h-14 px-8 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-black font-black shadow-xl hover:-translate-y-1 active:translate-y-0.5 transition-all duration-300 gap-2 group shrink-0"
                        >
                            <IconPlus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />
                            Upload Document
                        </Button>
                    )}
                </CardHeader>

                <CardContent className="p-8">
                    {files.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnimatePresence mode="popLayout">
                                {files.map((file) => (
                                    <motion.div
                                        key={file.key}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 hover:shadow-xl transition-all duration-300 group gap-4"
                                    >
                                        <div className="flex items-center gap-4 overflow-hidden w-full">
                                            <div className="h-14 w-14 rounded-2xl bg-white dark:bg-neutral-900 flex items-center justify-center shrink-0 text-amber-500 shadow-sm transition-transform group-hover:scale-110">
                                                <IconFileText className="h-7 w-7" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                {editingKey === file.key ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={tempName}
                                                            onChange={(e) => setTempName(e.target.value)}
                                                            className="h-10 text-base font-bold bg-white dark:bg-neutral-900 rounded-xl border-primary/20"
                                                            autoFocus
                                                            onKeyDown={(e) => e.key === 'Enter' && saveName(file.key)}
                                                        />
                                                        <Button
                                                            size="icon"
                                                            variant="default"
                                                            className="h-10 w-10 shrink-0 rounded-xl"
                                                            onClick={() => saveName(file.key)}
                                                        >
                                                            <IconTick className="h-5 w-5 font-bold" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-0.5">
                                                        <p className="font-bold text-base text-neutral-900 dark:text-neutral-100 truncate group-hover:text-primary transition-colors pr-2">
                                                            {file.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-md">
                                                                <IconCheck className="h-3 w-3" />
                                                                Ready
                                                            </span>
                                                            <span className="text-[10px] font-bold text-neutral-400">{file.size || "Unknown size"}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 ml-auto sm:ml-0">
                                            {editingKey !== file.key && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-xl text-neutral-400 hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
                                                    onClick={() => startEditing(file)}
                                                >
                                                    <IconPencil className="h-5 w-5" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 rounded-xl text-neutral-400 hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
                                                onClick={() => handleView(file)}
                                                disabled={viewingKeys.has(file.key)}
                                            >
                                                {viewingKeys.has(file.key) ? (
                                                    <IconLoader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <IconEye className="h-5 w-5" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
                                                onClick={() => removeFile(file.key)}
                                            >
                                                <IconX className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-[2.5rem] bg-neutral-50/20 dark:bg-neutral-900/10 transition-all">
                            <div className="mx-auto h-20 w-20 rounded-[2rem] bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center text-neutral-200 mb-6 font-black scale-110">
                                <IconFile className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">No documents found</h3>
                            <p className="text-sm text-neutral-400 font-medium mb-10 max-w-sm mx-auto">Upload important company documents, licenses, or tax forms to keep them organized.</p>
                            {!showUpload && (
                                <Button
                                    onClick={() => setShowUpload(true)}
                                    className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
                                >
                                    Upload First Document
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
