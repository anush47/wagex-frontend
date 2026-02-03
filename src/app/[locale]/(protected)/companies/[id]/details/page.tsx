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
import { PoliciesTab } from "./components/PoliciesTab";
import { PoliciesService } from "@/services/policy.service";
import { PolicySettings } from "@/types/policy";

export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const t = useTranslations("Companies");
    const common = useTranslations("Common");
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [originalData, setOriginalData] = useState<Company | null>(null);
    const [formData, setFormData] = useState<Company | null>(null);

    // Policy State
    const [originalPolicy, setOriginalPolicy] = useState<PolicySettings>({});
    const [policySettings, setPolicySettings] = useState<PolicySettings>({});

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Initialize tab from URL or default to general
    const initialTab = searchParams.get("tab") || "general";
    const [activeTab, setActiveTab] = useState(initialTab);
    const [pendingTab, setPendingTab] = useState<string | null>(null);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Sync activeTab with URL search params
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // Fetch Company and Policy in parallel
                const [companyRes, policyRes] = await Promise.all([
                    CompanyService.getCompany(id),
                    // We handle policy errors silently as 404 is expected for new companies
                    PoliciesService.getCompanyPolicy(id).catch(() => ({ data: null }))
                ]);

                // Handle Company Data
                const companyData = (companyRes.data as any)?.data || companyRes.data;
                if (companyData) {
                    setOriginalData(companyData);
                    setFormData(JSON.parse(JSON.stringify(companyData)));
                }

                // Handle Policy Data
                // policyRes structure: { data: { statusCode: 200, data: { settings: ... } } }
                const backendResponse = (policyRes as any)?.data;
                const policyResource = backendResponse?.data;
                const settings = policyResource?.settings || {};

                // MIGRATION: Handle legacy 'payroll' key from backend if it exists
                if ((settings as any).payroll) {
                    if (!settings.salaryComponents) {
                        settings.salaryComponents = (settings as any).payroll;
                    }
                    delete (settings as any).payroll;
                }

                setOriginalPolicy(JSON.parse(JSON.stringify(settings)));
                setPolicySettings(JSON.parse(JSON.stringify(settings)));

            } catch (error) {
                console.error("Failed to fetch data", error);
                toast.error("Failed to load company details");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (field: keyof Company, value: any) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });
    };

    const isCompanyDirty = JSON.stringify(originalData) !== JSON.stringify(formData);
    const isPolicyDirty = JSON.stringify(originalPolicy) !== JSON.stringify(policySettings);
    const isDirty = isCompanyDirty || isPolicyDirty;

    const handleSave = async () => {
        if (!formData || !id) return;
        setSaving(true);
        const toastId = toast.loading("Saving changes...");
        try {
            const promises = [];

            // 1. Save Company if dirty
            if (isCompanyDirty) {
                const { id: _id, createdAt, updatedAt, ...payload } = formData;
                promises.push(
                    CompanyService.updateCompany(id, payload as any)
                        .then(res => {
                            const data = (res.data as any)?.data || res.data;
                            if (data) {
                                setOriginalData(data);
                                setFormData(JSON.parse(JSON.stringify(data)));
                            }
                            return "Company details saved";
                        })
                );
            }

            // 2. Save Policy if dirty
            if (isPolicyDirty) {
                const payload = JSON.parse(JSON.stringify(policySettings));
                // Ensure legacy key is removed before sending to strict backend
                if ((payload as any).payroll) {
                    delete (payload as any).payroll;
                }

                promises.push(
                    PoliciesService.saveCompanyPolicy(id, payload)
                        .then(res => {
                            // Backend verification
                            const data = (res.data as any)?.data || res.data;
                            if (!data && (res as any)?.error) {
                                throw new Error((res as any).error.message || "Policy update failed");
                            }

                            // 400s might return as data if axios is configured not to throw, check for nestjs error structure
                            if ((data as any)?.statusCode && (data as any)?.statusCode >= 400) {
                                throw new Error((data as any).message || "Policy update failed");
                            }

                            const newSettings = data?.settings || policySettings;
                            setOriginalPolicy(newSettings);
                            setPolicySettings(JSON.parse(JSON.stringify(newSettings)));
                            return "Policies updated";
                        })
                );
            }

            await Promise.all(promises);
            toast.success("Changes saved successfully", { id: toastId });

        } catch (error) {
            console.error("Failed to update", error);
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
            setPolicySettings(JSON.parse(JSON.stringify(originalPolicy)));
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
                <TabsList className="w-full md:w-auto bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-2xl h-auto">
                    <TabsTrigger
                        value="general"
                        className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-neutral-900 data-[state=active]:text-white data-[state=active]:dark:bg-white data-[state=active]:dark:text-neutral-900 transition-all"
                    >
                        General
                    </TabsTrigger>
                    <TabsTrigger
                        value="policies"
                        className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-neutral-900 data-[state=active]:text-white data-[state=active]:dark:bg-white data-[state=active]:dark:text-neutral-900 transition-all"
                    >
                        Policies
                    </TabsTrigger>
                    <TabsTrigger
                        value="files"
                        className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-neutral-900 data-[state=active]:text-white data-[state=active]:dark:bg-white data-[state=active]:dark:text-neutral-900 transition-all"
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

                <TabsContent value="policies" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                    <PoliciesTab
                        settings={policySettings}
                        onChange={setPolicySettings}
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
