import { useEffect } from "react";
import { CreateDepartmentDto, Department } from "@/types/department";
import { Employee } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    IconHierarchy,
    IconPlus,
    IconSettings,
    IconUser
} from "@tabler/icons-react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";

interface DepartmentFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingDept: Department | null;
    formData: CreateDepartmentDto;
    setFormData: React.Dispatch<React.SetStateAction<CreateDepartmentDto>>;
    onSubmit: () => void;
    submitting: boolean;
    allDepartments: Department[];
    employees: Employee[];
}

export function DepartmentFormDialog({
    open,
    onOpenChange,
    editingDept,
    formData,
    setFormData,
    onSubmit,
    submitting,
    allDepartments,
    employees
}: DepartmentFormDialogProps) {

    const handleChange = (field: keyof CreateDepartmentDto, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    // Important: If the current parentId is not in the list of available departments,
    // we should sync the formData state to clear it, otherwise the backend will error on save.
    // Use an effect to ensure state consistency before submission.
    useEffect(() => {
        if (formData.parentId && !allDepartments.some(d => d.id === formData.parentId)) {
            setFormData(prev => ({ ...prev, parentId: null }));
        }
    }, [formData.parentId, allDepartments, setFormData]);

    // Helper to get all descendant IDs to prevent circular hierarchy
    const getDescendantIds = (deptId: string): string[] => {
        const descendants: string[] = [];
        const children = allDepartments.filter(d => d.parentId === deptId);
        children.forEach(child => {
            descendants.push(child.id);
            descendants.push(...getDescendantIds(child.id));
        });
        return descendants;
    };

    const excludedIds = editingDept ? [editingDept.id, ...getDescendantIds(editingDept.id)] : [];

    // Ensure parentId is valid or fallback to root
    const currentParentId = formData.parentId && allDepartments.some(d => d.id === formData.parentId)
        ? formData.parentId
        : "root";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[2rem] bg-white dark:bg-neutral-900 shadow-2xl">
                <div className="p-8 pb-0">
                    <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            {editingDept ? <IconSettings className="h-5 w-5" /> : <IconPlus className="h-5 w-5" />}
                        </div>
                        {editingDept ? "Edit Department" : "New Department"}
                    </DialogTitle>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="uppercase text-[10px] font-black tracking-widest text-neutral-400">Department Name</Label>
                        <Input
                            value={formData.name}
                            onChange={e => handleChange('name', e.target.value)}
                            placeholder="e.g. Engineering"
                            className="h-12 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-none font-bold shadow-inner"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="uppercase text-[10px] font-black tracking-widest text-neutral-400">Description</Label>
                        <Input
                            value={formData.description || ""}
                            onChange={e => handleChange('description', e.target.value)}
                            placeholder="Optional description"
                            className="h-12 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-none font-medium shadow-inner"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="uppercase text-[10px] font-black tracking-widest text-neutral-400">Head of Department</Label>
                        <SearchableEmployeeSelect
                            companyId={formData.companyId}
                            value={formData.headId}
                            onSelect={(id) => handleChange('headId', id)}
                            placeholder="Search and select department head..."
                        />
                        {formData.headId && (
                            <Button
                                variant="link"
                                size="sm"
                                onClick={() => handleChange('headId', null)}
                                className="h-6 px-0 text-[10px] text-red-500 hover:text-red-600 uppercase font-black tracking-widest"
                            >
                                Clear Head Assignment
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="uppercase text-[10px] font-black tracking-widest text-neutral-400">Parent Department</Label>
                        <Select
                            value={currentParentId}
                            onValueChange={(val) => handleChange('parentId', val === "root" ? null : val)}
                        >
                            <SelectTrigger className="h-12 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-none font-bold shadow-inner focus:ring-primary/20">
                                <SelectValue placeholder="Select parent department" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                                <SelectItem value="root" className="font-bold text-primary italic text-xs uppercase tracking-tight">
                                    Top Level (Root)
                                </SelectItem>
                                {allDepartments
                                    .filter(d => !excludedIds.includes(d.id))
                                    .map(dept => (
                                        <SelectItem key={dept.id} value={dept.id} className="font-medium">
                                            {dept.name}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">
                            Current: <span className="text-primary italic">
                                {currentParentId !== "root"
                                    ? allDepartments.find(d => d.id === currentParentId)?.name
                                    : "No Parent (Root)"}
                            </span>
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-8 pt-0 bg-transparent">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-12 px-6 font-bold text-neutral-500 hover:bg-neutral-100">Cancel</Button>
                    <Button
                        onClick={onSubmit}
                        disabled={submitting}
                        className="rounded-xl h-12 px-8 font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        {submitting ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
