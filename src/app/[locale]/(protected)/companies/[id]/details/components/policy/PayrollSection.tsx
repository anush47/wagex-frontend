
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
        const isAddition = comp.category === PayrollComponentCategory.ADDITION;

        // Format value: add comma separators
        const formattedValue = new Intl.NumberFormat('en-US').format(comp.value);

        return (
            <div key={comp.id} className="group relative flex items-center justify-between p-4 bg-muted/30 border border-transparent rounded-2xl hover:bg-card hover:border-border hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm transition-colors",
                        isAddition
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 group-hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 group-hover:bg-red-500/20"
                    )}>
                        {isPercentage ? <IconPercentage className="w-6 h-6" /> : <IconCoin className="w-6 h-6" />}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm md:text-base leading-tight flex items-center gap-2 text-foreground">
                            {comp.name}
                            {comp.isStatutory && <Badge variant="secondary" className="text-[9px] px-1.5 h-5 bg-background border-border">Statutory</Badge>}
                        </h4>
                        <p className="text-[10px] md:text-xs text-muted-foreground font-medium mt-1">
                            {comp.type === PayrollComponentType.FLAT_AMOUNT
                                ? `Fixed Amount`
                                : comp.type === PayrollComponentType.PERCENTAGE_BASIC
                                    ? `% of Basic Salary`
                                    : `% of Gross Salary`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className={cn(
                        "text-right mr-2 font-mono tracking-tight",
                        isAddition ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                        <span className="block text-lg md:text-xl font-black">
                            {isAddition ? '+' : '-'}{formattedValue}{isPercentage ? '%' : ''}
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-background" onClick={() => openEditDialog(comp)}>
                            <IconPencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10" onClick={() => handleDeleteComponent(comp.id)}>
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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Additions Column */}
                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-muted/50 rounded-3xl h-full">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <IconTrendingUp className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Additions</span>
                            </div>
                            <Button size="sm" onClick={() => openAddDialog(PayrollComponentCategory.ADDITION)} className="bg-primary text-primary-foreground rounded-xl font-bold h-8 text-xs hover:bg-primary/90">
                                <IconPlus className="w-3.5 h-3.5 mr-1.5" />
                                Add
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {additions.length === 0 && (
                            <div className="p-8 border-2 border-dashed border-border/50 rounded-3xl text-center text-muted-foreground flex flex-col items-center gap-2 bg-background/50">
                                <IconCoin className="w-8 h-8 opacity-20" />
                                <span className="text-sm font-bold">No additions configured</span>
                            </div>
                        )}
                        {additions.map(renderComponentCard)}
                    </CardContent>
                </Card>

                {/* Deductions Column */}
                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-muted/50 rounded-3xl h-full">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                    <IconTrendingDown className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Deductions</span>
                            </div>
                            <Button size="sm" onClick={() => openAddDialog(PayrollComponentCategory.DEDUCTION)} className="bg-primary text-primary-foreground rounded-xl font-bold h-8 text-xs hover:bg-primary/90">
                                <IconPlus className="w-3.5 h-3.5 mr-1.5" />
                                Add
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {deductions.length === 0 && (
                            <div className="p-8 border-2 border-dashed border-border/50 rounded-3xl text-center text-muted-foreground flex flex-col items-center gap-2 bg-background/50">
                                <IconCoin className="w-8 h-8 opacity-20" />
                                <span className="text-sm font-bold">No deductions configured</span>
                            </div>
                        )}
                        {deductions.map(renderComponentCard)}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
