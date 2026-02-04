"use client";

import { useState } from "react";
import { Company, CompanyFile } from "@/types/company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconFile, IconX, IconEye, IconFileText, IconCheck, IconPencil, IconCheck as IconTick, IconPlus, IconCloudUpload, IconLoader2, IconSearch } from "@tabler/icons-react";
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

    const [searchQuery, setSearchQuery] = useState("");

    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <Card className="border-none shadow-none bg-muted/50 rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-4 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-inner">
                            <IconFile className="h-6 w-6" />
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="text-xl md:text-2xl font-black tracking-tight text-foreground">Active Documents</CardTitle>
                            <p className="text-xs md:text-sm text-muted-foreground font-medium">{filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'} found</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full xl:w-auto">
                        <div className="relative flex-1 xl:w-64">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-background border-transparent shadow-sm focus:border-primary/20 h-11 rounded-xl"
                            />
                        </div>

                        {!showUpload && (
                            <Button
                                onClick={() => setShowUpload(true)}
                                size="lg"
                                className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 active:scale-95 transition-all duration-300 gap-2 shrink-0"
                            >
                                <IconPlus className="h-5 w-5" />
                                <span className="hidden sm:inline">Upload</span>
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-8">
                    {filteredFiles.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <AnimatePresence mode="popLayout">
                                {filteredFiles.map((file) => (
                                    <motion.div
                                        key={file.key}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="group relative flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 gap-4"
                                    >
                                        <div className="flex items-center gap-4 overflow-hidden w-full">
                                            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 text-amber-500 shadow-inner transition-transform group-hover:scale-105">
                                                <IconFileText className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                {editingKey === file.key ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={tempName}
                                                            onChange={(e) => setTempName(e.target.value)}
                                                            className="h-10 text-base font-bold bg-background rounded-xl border-primary/20"
                                                            autoFocus
                                                            onKeyDown={(e) => e.key === 'Enter' && saveName(file.key)}
                                                        />
                                                        <Button
                                                            size="icon"
                                                            className="h-10 w-10 shrink-0 rounded-xl"
                                                            onClick={() => saveName(file.key)}
                                                        >
                                                            <IconTick className="h-5 w-5 font-bold" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-0.5">
                                                        <p className="font-bold text-sm md:text-base text-foreground truncate">{file.name}</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                                                                <IconCheck className="h-3 w-3" />
                                                                Ready
                                                            </span>
                                                            {file.size && (
                                                                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                                                    {file.size}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-border pt-3 sm:pt-0 mt-2 sm:mt-0">
                                            {editingKey !== file.key && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    onClick={() => startEditing(file)}
                                                >
                                                    <IconPencil className="h-5 w-5" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
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
                                                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
                        <div className="py-16 text-center border-2 border-dashed border-border rounded-[2rem] bg-card/50">
                            <div className="mx-auto h-20 w-20 rounded-[2rem] bg-muted/50 flex items-center justify-center text-muted-foreground/30 mb-6 scale-110">
                                <IconFile className="h-10 w-10" />
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-foreground mb-2">No documents found</h3>
                            <p className="text-xs md:text-sm text-muted-foreground font-medium mb-8 max-w-sm mx-auto">Upload important company documents, licenses, or tax forms.</p>
                            {!showUpload && (
                                <Button
                                    onClick={() => setShowUpload(true)}
                                    className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:bg-primary/90 transition-all"
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
