import { Department } from "@/types/department";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    IconFolder,
    IconFolderOpen,
    IconPlus,
    IconSettings,
    IconSitemap,
    IconTrash,
    IconUsers
} from "@tabler/icons-react";

interface DepartmentNodeProps {
    dept: Department;
    allDepartments: Department[];
    level?: number;
    onEdit: (dept: Department) => void;
    onDelete: (id: string, name: string) => void;
    onCreateSub: (parentId: string) => void;
}

export function DepartmentNode({
    dept,
    allDepartments,
    level = 0,
    onEdit,
    onDelete,
    onCreateSub
}: DepartmentNodeProps) {
    const children = allDepartments.filter(d => d.parentId === dept.id);
    const employeeCount = dept._count?.employees || 0;

    return (
        <div className="relative">
            {/* Connector lines for hierarchy */}
            {level > 0 && (
                <div className="hidden md:block absolute -left-6 top-7 w-6 h-[1px] bg-neutral-200 dark:bg-neutral-800" />
            )}

            <div
                className={cn(
                    "group flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all mb-4",
                    level > 0 && "ml-4 md:ml-12"
                )}
            >
                {/* Icon & Name */}
                <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                        "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-colors",
                        children.length > 0 ? "bg-primary/10 text-primary" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                    )}>
                        {children.length > 0 ? <IconFolderOpen className="w-5 h-5" /> : <IconFolder className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-base text-neutral-900 dark:text-neutral-100 truncate">{dept.name}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-neutral-500 uppercase tracking-widest mt-0.5">
                            {dept.head ? (
                                <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                                    <IconSitemap className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{dept.head.nameWithInitials}</span>
                                </span>
                            ) : (
                                <span className="text-neutral-300">No Head Assigned</span>
                            )}
                            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-neutral-300" />
                            <span className="flex items-center gap-1">
                                <IconUsers className="w-3 h-3 shrink-0" />
                                {employeeCount} Members
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto border-t sm:border-0 border-neutral-100 dark:border-neutral-800 pt-3 sm:pt-0 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-primary" onClick={() => onCreateSub(dept.id)} title="Add Sub-Department">
                        <IconPlus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900" onClick={() => onEdit(dept)}>
                        <IconSettings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600" onClick={() => onDelete(dept.id, dept.name)}>
                        <IconTrash className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Render children recursively */}
            <div className="relative">
                {/* Vertical line connecting children */}
                {children.length > 0 && <div className="absolute left-[22px] top-0 bottom-8 w-[1px] bg-neutral-200 dark:bg-neutral-800" />}
                <div className="space-y-0">
                    {children.map(child => (
                        <DepartmentNode
                            key={child.id}
                            dept={child}
                            allDepartments={allDepartments}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onCreateSub={onCreateSub}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
