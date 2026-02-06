import { useState } from "react";
import { Department, CreateDepartmentDto } from "@/types/department";
import { Company } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    IconHierarchy,
    IconPlus,
    IconSitemap
} from "@tabler/icons-react";
import { toast } from "sonner";
import { DepartmentNode } from "./DepartmentNode";
import { DepartmentFormDialog } from "./DepartmentFormDialog";
import { useDepartments, useDepartmentMutations } from "@/hooks/use-departments";
import { useEmployees } from "@/hooks/use-employees";

interface DepartmentsTabProps {
    company: Company;
}

export function DepartmentsTab({ company }: DepartmentsTabProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);

    // Form State
    const [formData, setFormData] = useState<CreateDepartmentDto>({
        name: "",
        companyId: company.id,
        parentId: undefined,
        headId: undefined
    });

    // React Query Hooks
    const { data: resp, isLoading: loading } = useDepartments(company.id);
    const { data: empsResp } = useEmployees({ companyId: company.id, status: "ACTIVE" });
    const { createDepartment, updateDepartment, deleteDepartment } = useDepartmentMutations();

    const departments = (resp as any)?.data || (Array.isArray(resp) ? resp : []);
    const employees = (empsResp as any)?.data || (Array.isArray(empsResp) ? empsResp : []);

    const handleOpenCreate = (parentId?: string) => {
        setEditingDept(null);
        setFormData({
            name: "",
            description: "",
            companyId: company.id,
            parentId: parentId || undefined,
            headId: undefined
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (dept: Department) => {
        setEditingDept(dept);
        setFormData({
            name: dept.name,
            description: dept.description,
            companyId: dept.companyId,
            parentId: dept.parentId,
            headId: dept.headId
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name) return toast.error("Department Name is required");

        try {
            if (editingDept) {
                await updateDepartment.mutateAsync({ id: editingDept.id, data: formData });
            } else {
                await createDepartment.mutateAsync(formData);
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Save failed", error);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        await deleteDepartment.mutateAsync({ id, companyId: company.id });
    };

    const submitting = createDepartment.isPending || updateDepartment.isPending;

    // Root departments (those without parent)
    const rootDepartments = departments.filter((d: Department) => !d.parentId);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconHierarchy className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">Departments</h1>
                    </div>
                    <p className="text-neutral-500 font-medium text-sm">
                        Define hierarchy, roles, and reporting lines.
                    </p>
                </div>
                <Button
                    onClick={() => handleOpenCreate()}
                    className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <IconPlus className="mr-2 h-5 w-5" />
                    Create Department
                </Button>
            </div>

            {/* Tree View */}
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-20 text-center animate-pulse">
                            <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-800 rounded-full mx-auto mb-4" />
                            <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-full mx-auto" />
                        </div>
                    ) : rootDepartments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] bg-neutral-50/50 dark:bg-neutral-900/50">
                            <div className="h-20 w-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
                                <IconSitemap className="h-10 w-10 text-neutral-300" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">No Structure defined yet</h3>
                            <p className="text-neutral-500 max-w-sm mb-8">Start by creating your main departments (e.g., HR, Engineering, Sales).</p>
                            <Button onClick={() => handleOpenCreate()} variant="outline" className="rounded-full">
                                Initialize Structure
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rootDepartments.map((dept: Department) => (
                                <DepartmentNode
                                    key={dept.id}
                                    dept={dept}
                                    allDepartments={departments}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onCreateSub={handleOpenCreate}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <DepartmentFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                editingDept={editingDept}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                submitting={submitting}
                allDepartments={departments}
                employees={employees}
            />
        </div>
    );
}
