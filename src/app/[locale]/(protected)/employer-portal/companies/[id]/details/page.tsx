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
import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCompany, useCompanyMutations } from "@/hooks/use-companies";
import { PolicySettings } from "@/types/policy";
import { useStorageUrl } from "@/hooks/use-storage";

export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const t = useTranslations("Companies");
    const common = useTranslations("Common");
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // React Query Hooks
    const { data: companyData, isLoading: compLoading } = useCompany(id);
    const { updateCompany, deleteCompany } = useCompanyMutations();

    // Local Form State
    const [formData, setFormData] = useState<Company | null>(null);

    // Sync with React Query
    useEffect(() => {
        if (companyData) {
            setFormData(JSON.parse(JSON.stringify(companyData)));
        }
    }, [companyData]);


    const loading = compLoading;
    const originalData = companyData;

    // Initialize tab from URL or default to general
    const initialTab = searchParams.get("tab") || "general";
    const [activeTab, setActiveTab] = useState(initialTab);
    const [pendingTab, setPendingTab] = useState<string | null>(null);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Sync activeTab with URL search params
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleChange = (field: keyof Company, value: any) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });
    };

    const isCompanyDirty = JSON.stringify(originalData) !== JSON.stringify(formData);
    const isDirty = isCompanyDirty;

    const handleSave = async () => {
        if (!formData || !id) return;

        if (isCompanyDirty) {
            const { id: _id, createdAt, updatedAt, ...payload } = formData;
            await updateCompany.mutateAsync({ id, data: payload as any });
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        await deleteCompany.mutateAsync(id);
        router.push("/employer-portal/companies");
    };

    const saving = updateCompany.isPending;
    const deleting = deleteCompany.isPending;

    const updateTabUrl = (tab: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set("tab", tab);
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleTabChange = (value: string) => {
        if (isDirty) {
            setPendingTab(value);
            setShowUnsavedDialog(true);
        } else {
            setActiveTab(value);
            updateTabUrl(value);
        }
    };

    const confirmTabChange = () => {
        if (pendingTab) {
            setActiveTab(pendingTab);
            updateTabUrl(pendingTab);
            updateTabUrl(pendingTab);
            setFormData(JSON.parse(JSON.stringify(originalData)));
            setPendingTab(null);
            setShowUnsavedDialog(false);
        }
    };

    // Resolve Logo URL using the storage hook
    const { data: logoUrl } = useStorageUrl(formData?.logo || null);


    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto py-6 space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col gap-4">
                    <div className="h-8 w-8 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                    <div className="h-4 w-48 bg-neutral-100 dark:bg-neutral-900 rounded-lg" />
                </div>

                {/* Tabs Skeleton */}
                <div className="flex gap-2 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="h-10 w-24 bg-neutral-100 dark:bg-neutral-900 rounded-xl" />
                    <div className="h-10 w-24 bg-neutral-100 dark:bg-neutral-900 rounded-xl" />
                    <div className="h-10 w-24 bg-neutral-100 dark:bg-neutral-900 rounded-xl" />
                </div>

                {/* Content Area Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="h-32 w-full bg-neutral-100 dark:bg-neutral-900 rounded-[2rem]" />
                        <div className="h-64 w-full bg-neutral-100 dark:bg-neutral-900 rounded-[2rem]" />
                    </div>
                    <div className="space-y-6">
                        <div className="h-96 w-full bg-neutral-100 dark:bg-neutral-900 rounded-[2rem]" />
                    </div>
                </div>
            </div>
        );
    }

    if (!formData || !originalData) {
        return <div className="p-10 text-center font-bold text-neutral-500">Company not found</div>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 md:space-y-10 relative pb-24">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                            <IconBuildingSkyscraper className="h-5 w-5" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            Company Profile
                        </h1>
                    </div>
                    <p className="text-neutral-500 font-medium text-sm">
                        Manage settings, policies, and files.
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
                <TabsList className="w-full flex flex-wrap !h-auto gap-2 bg-transparent p-0 justify-start border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
                    <TabsTrigger
                        value="general"
                        className="rounded-xl px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 data-[state=active]:border-primary bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                    >
                        General
                    </TabsTrigger>
                    <TabsTrigger
                        value="files"
                        className="rounded-xl px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 data-[state=active]:border-primary bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                    >
                        Files ({formData.files?.length || 0})
                    </TabsTrigger>
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
