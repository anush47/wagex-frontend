"use client";

import { use, useEffect, useState } from "react";
import { CompanyService } from "@/services/company.service";
import { Company } from "@/types/company";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { IconDeviceFloppy, IconBuildingSkyscraper, IconMapPin, IconCalendar, IconId, IconLoader2 } from "@tabler/icons-react";
import { GeneralTab } from "./components/GeneralTab";
import { FilesTab } from "./components/FilesTab";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const t = useTranslations("Companies");
    const common = useTranslations("Common");

    const [originalData, setOriginalData] = useState<Company | null>(null);
    const [formData, setFormData] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [pendingTab, setPendingTab] = useState<string | null>(null);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchCompany = async () => {
            if (!id) return;
            try {
                const response = await CompanyService.getCompany(id);
                // Check if response.data has a nested data property (common API wrapper pattern)
                const companyData = (response.data as any)?.data || response.data;

                if (companyData) {
                    setOriginalData(companyData);
                    setFormData(JSON.parse(JSON.stringify(companyData))); // Deep copy
                }
            } catch (error) {
                console.error("Failed to fetch company", error);
                toast.error("Failed to load company details");
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [id]);

    const handleChange = (field: keyof Company, value: any) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });
    };

    const isDirty = JSON.stringify(originalData) !== JSON.stringify(formData);

    const handleSave = async () => {
        if (!formData || !id) return;
        setSaving(true);
        const toastId = toast.loading("Saving changes...");
        try {
            // Strip system fields that the backend rejects on update
            const { id: _id, createdAt, updatedAt, ...payload } = formData;

            const response = await CompanyService.updateCompany(id, payload as any);
            // Check for wrapper in update response too
            const companyData = (response.data as any)?.data || response.data;

            if (companyData) {
                setOriginalData(companyData);
                setFormData(JSON.parse(JSON.stringify(companyData)));
                toast.success("Changes saved successfully", { id: toastId });
            }
        } catch (error) {
            console.error("Failed to update company", error);
            toast.error("Failed to save changes", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setDeleting(true);
        const toastId = toast.loading("Deleting company...");
        try {
            await CompanyService.deleteCompany(id);
            toast.success("Company deleted successfully", { id: toastId });
            router.push("/companies");
        } catch (error) {
            console.error("Failed to delete company", error);
            toast.error("Failed to delete company", { id: toastId });
            setDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const handleTabChange = (value: string) => {
        if (isDirty) {
            setPendingTab(value);
            setShowUnsavedDialog(true);
        } else {
            setActiveTab(value);
        }
    };

    const confirmTabChange = () => {
        if (pendingTab) {
            setActiveTab(pendingTab);
            setFormData(JSON.parse(JSON.stringify(originalData))); // Reset changes on tab switch if confirmed? 
            // OR: keep changes? The user request said "no need to handle context between tabs if there is any unsaved change then just show a warning dialog... so we can have seperate files for tabs to keep the code clean"
            // This implies we should probably discard changes or force save. Discarding is safer behavior for "Warning: Unsaved changes".
            setPendingTab(null);
            setShowUnsavedDialog(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto py-6 space-y-8 animate-pulse">
                <div className="h-64 w-full bg-neutral-200 dark:bg-neutral-800 rounded-[2.5rem]" />
            </div>
        );
    }

    if (!formData || !originalData) {
        return <div className="p-10 text-center font-bold text-neutral-500">Company not found</div>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 relative pb-24">

            {/* Header Removed as per request */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{formData.name}</h1>
                {/* We can put the tabs list here or keep it below */}
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
                <TabsList className="w-full md:w-auto bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                    <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm">General</TabsTrigger>
                    <TabsTrigger value="files" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm">Files ({formData.files?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                    <GeneralTab
                        formData={formData}
                        handleChange={handleChange}
                        onDelete={() => setShowDeleteDialog(true)}
                    />
                </TabsContent>

                <TabsContent value="files" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                    <FilesTab formData={formData} handleChange={handleChange} />
                </TabsContent>
            </Tabs>

            {/* Floating Save Button */}
            <AnimatePresence>
                {isDirty && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 right-8 z-50"
                    >
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            size="lg"
                            className="rounded-full shadow-2xl px-8 h-14 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all text-base font-bold"
                        >
                            {saving ? (
                                <>
                                    <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <IconDeviceFloppy className="mr-2 h-5 w-5" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Separate Dialog Components */}
            <UnsavedChangesDialog
                open={showUnsavedDialog}
                onOpenChange={setShowUnsavedDialog}
                onConfirm={confirmTabChange}
            />

            <DeleteCompanyDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDelete}
                companyName={formData.name}
                loading={deleting}
            />
        </div>
    );
}

// Internal Helper Components
interface UnsavedChangesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

function UnsavedChangesDialog({ open, onOpenChange, onConfirm }: UnsavedChangesDialogProps) {
    return (
        <ConfirmationDialog
            open={open}
            onOpenChange={onOpenChange}
            variant="warning"
            title="Unsaved Changes"
            description="You have unsaved changes in this tab. Switching tabs will discard these changes. Are you sure you want to proceed?"
            icon={<IconCalendar className="h-8 w-8" />}
            actionLabel="Discard & Switch"
            cancelLabel="Keep Editing"
            onAction={onConfirm}
        />
    );
}

interface DeleteCompanyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    companyName: string;
    loading?: boolean;
}

function DeleteCompanyDialog({ open, onOpenChange, onConfirm, companyName, loading }: DeleteCompanyDialogProps) {
    return (
        <ConfirmationDialog
            open={open}
            onOpenChange={onOpenChange}
            variant="destructive"
            title="Delete Company?"
            description={
                <>
                    This will permanently remove <span className="font-bold text-neutral-900 dark:text-white">"{companyName}"</span> and all its data. This action is irreversible and final.
                </>
            }
            icon={<IconBuildingSkyscraper className="h-8 w-8" />}
            actionLabel="Yes, Delete Permanently"
            cancelLabel="Cancel"
            loading={loading}
            onAction={onConfirm}
        />
    );
}
