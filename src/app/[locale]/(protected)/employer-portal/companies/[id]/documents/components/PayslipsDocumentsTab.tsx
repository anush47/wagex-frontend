import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconDownload, IconFileInvoice, IconSearch, IconUserCircle, IconLayoutGrid } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemplateEditor } from "./TemplateEditor";
import { DocumentType } from "@/types/template";
import { useParams } from "next/navigation";
import { useTemplates } from "@/hooks/use-templates";
import { useSalaries } from "@/hooks/use-salaries";
import { printDocument, bulkPrintDocuments } from "@/services/document-print.service";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export function PayslipsDocumentsTab() {
    const params = useParams();
    const companyId = params.id as string;
    const [isManagingTemplate, setIsManagingTemplate] = React.useState(false);
    
    // Filters
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [year, setYear] = React.useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = React.useState("");

    const { salariesQuery } = useSalaries({
        companyId,
        month,
        year,
    });

    const { templatesQuery } = useTemplates({ companyId, type: DocumentType.PAYSLIP, isActive: true });
    const [selectedTemplate, setSelectedTemplate] = React.useState<string>("");
    const [selectedSalaries, setSelectedSalaries] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (templatesQuery.data?.length > 0 && !selectedTemplate) {
            setSelectedTemplate(templatesQuery.data[0].id);
        }
    }, [templatesQuery.data, selectedTemplate]);

    const handlePrintIndividual = (salaryId: string) => {
        if (!selectedTemplate) return toast.error("Please select a template first");
        printDocument(selectedTemplate, salaryId);
    };

    const handleBulkPrint = () => {
        if (!selectedTemplate) return toast.error("Please select a template first");
        if (selectedSalaries.length === 0) return toast.error("Please select at least one employee");
        bulkPrintDocuments(selectedTemplate, selectedSalaries);
    };

    const toggleSalarySelection = (id: string) => {
        setSelectedSalaries(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        const allIds = salariesQuery.data?.items?.map((s: any) => s.id) || [];
        setSelectedSalaries(selectedSalaries.length === allIds.length ? [] : allIds);
    };

    if (isManagingTemplate) {
        return (
            <TemplateEditor 
                type={DocumentType.PAYSLIP}
                companyId={companyId}
                onCancel={() => setIsManagingTemplate(false)}
                onSave={() => setIsManagingTemplate(false)}
            />
        );
    }

    const filteredSalaries = (salariesQuery.data?.items || []).filter((s: any) => 
        s.employee?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.employee?.employeeNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Select Template</Label>
                    <select 
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="h-11 rounded-xl bg-white border border-neutral-100 shadow-sm px-4 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                        {templatesQuery.data?.map((t: any) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                        {(!templatesQuery.data || templatesQuery.data.length === 0) && (
                            <option disabled>No active templates found</option>
                        )}
                    </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Period</Label>
                    <div className="flex gap-2">
                        <select 
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="flex-1 h-11 rounded-xl bg-white border border-neutral-100 shadow-sm px-4 text-xs font-bold"
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>{format(new Date(2000, i), 'MMMM')}</option>
                            ))}
                        </select>
                        <select 
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="w-24 h-11 rounded-xl bg-white border border-neutral-100 shadow-sm px-4 text-xs font-bold"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-end gap-3">
                    <Button 
                        variant="outline" 
                        className="flex-1 h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-white shadow-sm border-neutral-100"
                        onClick={() => setIsManagingTemplate(true)}
                    >
                        <IconLayoutGrid className="mr-2 h-4 w-4 text-primary" />
                        Manage Template
                    </Button>
                </div>
            </div>

            <Card className="rounded-2xl border-none bg-white dark:bg-neutral-900 shadow-sm overflow-hidden border border-neutral-100">
                <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700/50 px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <IconFileInvoice className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold">Generate Payslips</CardTitle>
                                <p className="text-xs text-neutral-500 font-medium">Generate and email monthly payslips to staff members</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <Button 
                                variant="outline" 
                                className="h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-wider"
                                onClick={handleBulkPrint}
                                disabled={selectedSalaries.length === 0}
                             >
                                <IconDownload className="mr-2 h-4 w-4" />
                                Bulk Print ({selectedSalaries.length})
                             </Button>
                             <Button className="h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg bg-primary hover:bg-primary/90">
                                Email Batch
                             </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-4 px-6 border-b border-neutral-100 bg-white">
                        <div className="relative w-full max-w-sm">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input 
                                placeholder="Search employee..." 
                                className="pl-9 h-10 rounded-xl text-xs bg-neutral-50 border-none focus-visible:ring-1" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {salariesQuery.isLoading ? (
                        <div className="py-20 text-center text-neutral-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading Staff Records...</div>
                    ) : filteredSalaries.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="h-12 w-12 rounded-2xl bg-neutral-50 flex items-center justify-center mb-4">
                                <IconSearch className="h-6 w-6 text-neutral-300" />
                            </div>
                            <h3 className="font-bold text-sm">No Salaries Found</h3>
                            <p className="text-neutral-400 text-[11px] mt-1">Try adjusting your filters or period selection.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50/30">
                                        <th className="p-4 px-6 w-10">
                                            <Checkbox 
                                                checked={selectedSalaries.length === filteredSalaries.length && filteredSalaries.length > 0}
                                                onCheckedChange={toggleAll}
                                            />
                                        </th>
                                        <th className="p-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Employee</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Net Salary</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSalaries.map((s: any) => (
                                        <tr key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors group">
                                            <td className="p-4 px-6">
                                                <Checkbox 
                                                    checked={selectedSalaries.includes(s.id)}
                                                    onCheckedChange={() => toggleSalarySelection(s.id)}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">{s.employee?.fullName}</span>
                                                    <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-tighter">ID: {s.employee?.employeeNo}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-mono text-xs font-bold">LKR {s.netSalary?.toLocaleString()}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    className="h-8 w-8 p-0 rounded-lg group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
                                                    onClick={() => handlePrintIndividual(s.id)}
                                                >
                                                    <IconDownload className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
