
import { useState } from "react";
import { SalaryComponentsConfig, PayrollComponent, PayrollComponentCategory, PayrollComponentType } from "@/types/policy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconPlus, IconPencil, IconTrash, IconTrendingUp, IconTrendingDown, IconPercentage, IconCoin } from "@tabler/icons-react";
import { PayrollComponentDialog } from "./PayrollComponentDialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PayrollSectionProps {
    value: SalaryComponentsConfig;
    onChange: (val: SalaryComponentsConfig) => void;
}

export function PayrollSection({ value, onChange }: PayrollSectionProps) {
    const components = value.components || [];

    const [editingComponent, setEditingComponent] = useState<PayrollComponent | undefined>(undefined);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<PayrollComponentCategory>(PayrollComponentCategory.ADDITION);

    const handleSaveComponent = (newComp: PayrollComponent) => {
        let updatedList: PayrollComponent[];
        const exists = components.find(c => c.id === newComp.id);

        if (exists) {
            updatedList = components.map(c => c.id === newComp.id ? newComp : c);
        } else {
            updatedList = [...components, newComp];
        }

        onChange({ ...value, components: updatedList });
    };

    const handleDeleteComponent = (id: string) => {
        const updatedList = components.filter(c => c.id !== id);
        onChange({ ...value, components: updatedList });
    };

    const openAddDialog = (category: PayrollComponentCategory) => {
        setEditingComponent(undefined);
        setActiveCategory(category);
        setDialogOpen(true);
    };

    const openEditDialog = (comp: PayrollComponent) => {
        setEditingComponent(comp);
        setActiveCategory(comp.category);
        setDialogOpen(true);
    };

    const additions = components.filter(c => c.category === PayrollComponentCategory.ADDITION);
    const deductions = components.filter(c => c.category === PayrollComponentCategory.DEDUCTION);

    const renderComponentCard = (comp: PayrollComponent) => {
        const isPercentage = comp.type !== PayrollComponentType.FLAT_AMOUNT;

        return (
            <div key={comp.id} className="group relative flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-inner",
                        comp.category === PayrollComponentCategory.ADDITION
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                    )}>
                        {isPercentage ? <IconPercentage className="w-5 h-5" /> : <IconCoin className="w-5 h-5" />}
                    </div>
                    <div>
                        <h4 className="font-bold text-base leading-tight flex items-center gap-2">
                            {comp.name}
                            {comp.isStatutory && <Badge variant="secondary" className="text-[9px] px-1.5 h-4">Statutory</Badge>}
                        </h4>
                        <p className="text-xs text-neutral-500 font-medium mt-0.5">
                            {comp.type === PayrollComponentType.FLAT_AMOUNT
                                ? `Fixed Amount`
                                : comp.type === PayrollComponentType.PERCENTAGE_BASIC
                                    ? `% of Basic Salary`
                                    : `% of Gross Salary`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right mr-2">
                        <span className="block text-lg font-black font-mono tracking-tight">
                            {comp.value}{isPercentage ? '%' : ''}
                        </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => openEditDialog(comp)}>
                            <IconPencil className="h-4 w-4 text-neutral-500" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteComponent(comp.id)}>
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <PayrollComponentDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                category={activeCategory}
                initialData={editingComponent}
                onSave={handleSaveComponent}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Additions Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                <IconTrendingUp className="w-4 h-4" />
                            </div>
                            <h3 className="text-xl font-black">Additions</h3>
                        </div>
                        <Button size="sm" onClick={() => openAddDialog(PayrollComponentCategory.ADDITION)} className="bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold h-9">
                            <IconPlus className="w-3.5 h-3.5 mr-1.5" />
                            Add New
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {additions.length === 0 && (
                            <div className="p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl text-center text-neutral-400 flex flex-col items-center gap-2">
                                <IconCoin className="w-8 h-8 opacity-20" />
                                <span className="text-sm font-bold">No additions configured</span>
                            </div>
                        )}
                        {additions.map(renderComponentCard)}
                    </div>
                </div>

                {/* Deductions Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                <IconTrendingDown className="w-4 h-4" />
                            </div>
                            <h3 className="text-xl font-black">Deductions</h3>
                        </div>
                        <Button size="sm" onClick={() => openAddDialog(PayrollComponentCategory.DEDUCTION)} className="bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold h-9">
                            <IconPlus className="w-3.5 h-3.5 mr-1.5" />
                            Add New
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {deductions.length === 0 && (
                            <div className="p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl text-center text-neutral-400 flex flex-col items-center gap-2">
                                <IconCoin className="w-8 h-8 opacity-20" />
                                <span className="text-sm font-bold">No deductions configured</span>
                            </div>
                        )}
                        {deductions.map(renderComponentCard)}
                    </div>
                </div>
            </div>
        </div>
    );
}
