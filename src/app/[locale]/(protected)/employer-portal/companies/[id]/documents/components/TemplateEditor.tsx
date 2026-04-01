"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { 
  IconLayoutGrid,
  IconVariable,
  IconDeviceFloppy,
  IconCheck,
  IconArrowLeft
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTemplates, useTemplateVariables } from "@/hooks/use-templates";
import { DocumentType, DocumentTemplate, TemplateStatus } from "@/types/template";
import { toast } from "sonner";
import { LivePreview } from "./LivePreview";
import { VariableList } from "./VariableList";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/themes/prism.css";

interface TemplateEditorProps {
  type: DocumentType;
  companyId: string;
  template?: Partial<DocumentTemplate>;
  onSave?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
}

export function TemplateEditor({ type, companyId, template, onSave, onBack, onCancel }: TemplateEditorProps) {
  const [name, setName] = React.useState(template?.name || `New ${type.replace('_', ' ')} Template`);
  const [description, setDescription] = React.useState(template?.description || "");
  const [html, setHtml] = React.useState(template?.html || getDefaultHtml(type));
  const [css, setCss] = React.useState(template?.css || getDefaultCss());
  const [config, setConfig] = React.useState(template?.config || { paperSize: "A4", orientation: "portrait" });
  
  const { createTemplateMutation, updateTemplateMutation } = useTemplates();
  const { data: sampleData, isLoading: isLoadingVariables } = useTemplateVariables(type);

  const isApproved = template?.status === TemplateStatus.APPROVED;

  const handleSave = async (publish = false) => {
        if (!name.trim()) {
            toast.error("Template name is required");
            return;
        }

        const payload = {
            name,
            description,
            type,
            companyId,
            html,
            css,
            config,
            status: publish ? TemplateStatus.PENDING : (template?.status || TemplateStatus.DRAFT),
        };

        let saveAction;

        if (template?.id) {
            // Update: Omit immutable fields (type, companyId) + status/isActive if not publishing
            const { type: _, companyId: __, ...updatePayload } = payload;
            saveAction = updateTemplateMutation.mutateAsync({ id: template.id, data: updatePayload as any });
        } else {
            // Create: Include basics, status will be handled by logic above
            saveAction = createTemplateMutation.mutateAsync(payload);
        }

        toast.promise(saveAction, {
            loading: template?.id ? 'Updating layout...' : 'Finalizing designer layout...',
            success: () => {
                onSave?.();
                return template?.id ? 'Template layout updated' : 'New template layout published';
            },
            error: (err: any) => {
                console.error(err);
                return err.message || 'Failed to save template layout';
            }
        });
    };

  return (
    <div className="flex flex-col w-full gap-8 antialiased pb-20">
      {/* Header - Designer UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-2">
        <div className="flex items-center gap-6 flex-1">
          <Button variant="ghost" size="icon" onClick={onBack || onCancel} className="rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
            <IconArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5 text-primary">
                <div className="h-7 w-7 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                    <IconLayoutGrid className="h-4.5 w-4.5" />
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tight italic leading-none">
                  Layout Designer
                </h1>
            </div>
            <div className="flex items-center gap-2 pl-0.5">
                <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase py-0.5 px-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-none">
                   {type.replace('_', ' ')}
                </Badge>
                <div className="h-1 w-1 rounded-full bg-neutral-300" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    Build 2.0.4
                </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 pr-2 border-r border-neutral-100 dark:border-neutral-800 h-6">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  template?.status === TemplateStatus.APPROVED ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                )} />
                <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-none">
                   {template?.status || "Draft State"}
                </span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={isApproved || createTemplateMutation.isPending || updateTemplateMutation.isPending}
                className="h-11 px-6 rounded-xl font-black border-2 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-all text-[10px] uppercase tracking-widest flex items-center gap-2 bg-transparent shadow-sm disabled:opacity-50"
            >
                Save Draft
            </Button>
            <Button 
                onClick={() => handleSave(true)}
                disabled={isApproved || createTemplateMutation.isPending || updateTemplateMutation.isPending}
                className="h-11 px-8 rounded-xl font-black bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:opacity-90 active:scale-[0.98] transition-all text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl disabled:opacity-50"
            >
                <IconCheck className="h-5 w-5 stroke-[3]" /> {isApproved ? 'Approved' : 'Publish Layout'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl shadow-sm">
           <div className="flex-1 w-full max-w-sm">
              <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-400 dark:text-neutral-500 ml-1 mb-1.5 block">Layout Name</Label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter unique layout name..."
                className="h-10 text-[11px] font-black uppercase tracking-widest bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 rounded-xl focus:bg-white dark:focus:bg-neutral-900 transition-all placeholder:text-neutral-400"
              />
           </div>
           <div className="flex-1 w-full max-w-2xl">
              <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-400 dark:text-neutral-500 ml-1 mb-1.5 block">Context/Description</Label>
              <Input 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly explain the purpose of this layout..."
                className="h-10 text-[11px] font-bold bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 rounded-xl focus:bg-white dark:focus:bg-neutral-900 transition-all placeholder:text-neutral-400"
              />
           </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden gap-6">
        {/* Row 1: Preview (Full Width) */}
        <div className="h-[75vh] min-h-[600px] flex flex-col min-h-0 overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-[2rem] bg-white dark:bg-neutral-950 shadow-sm relative shrink-0">
            <LivePreview html={html} css={css} data={sampleData || {}} config={config} />
        </div>

        {/* Row 2: Editor (2/3) & Variables (1/3) */}
        <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch h-screen max-h-[100vh] min-h-[800px]">
            {/* Left: Editor (2/3) */}
            <div className="w-full lg:w-[68%] flex flex-col">
                <Tabs defaultValue="html" className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1 h-9 rounded-xl w-max border-none shadow-inner">
                        <TabsTrigger value="html" className="rounded-lg px-6 h-full font-bold text-[10px] uppercase tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                            HTML
                        </TabsTrigger>
                        <TabsTrigger value="css" className="rounded-lg px-6 h-full font-bold text-[10px] uppercase tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                            CSS
                        </TabsTrigger>
                        <TabsTrigger value="config" className="rounded-lg px-6 h-full font-bold text-[10px] uppercase tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                            Canvas
                        </TabsTrigger>
                    </TabsList>
                    
                    <div className="mt-3 flex-1 flex flex-col min-h-0 overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 shadow-sm relative">
                        <TabsContent value="html" className="flex-1 mt-0 outline-none overflow-y-auto custom-scrollbar bg-neutral-50 dark:bg-neutral-900/40">
                            <Editor
                                value={html}
                                onValueChange={code => setHtml(code)}
                                highlight={code => highlight(code, languages.markup, 'markup')}
                                padding={20}
                                className="font-mono text-[11px] leading-relaxed min-h-full dark:text-neutral-300"
                                style={{
                                    fontFamily: '"Fira Code", "Fira Mono", monospace',
                                    outline: 'none',
                                }}
                            />
                        </TabsContent>
                        <TabsContent value="css" className="flex-1 mt-0 outline-none overflow-y-auto custom-scrollbar bg-neutral-50 dark:bg-neutral-900/40">
                            <Editor
                                value={css}
                                onValueChange={code => setCss(code)}
                                highlight={code => highlight(code, languages.css, 'css')}
                                padding={20}
                                className="font-mono text-[11px] leading-relaxed min-h-full dark:text-neutral-300"
                                style={{
                                    fontFamily: '"Fira Code", "Fira Mono", monospace',
                                    outline: 'none',
                                }}
                            />
                        </TabsContent>
                        <TabsContent value="config" className="flex-1 mt-0 outline-none p-6 space-y-6 overflow-y-auto custom-scrollbar bg-neutral-50/30 dark:bg-transparent">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-[0.2em] pl-1">Paper Canvas</Label>
                                    <select 
                                        value={config.paperSize} 
                                        onChange={(e) => setConfig({...config, paperSize: e.target.value})}
                                        className="w-full h-10 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] font-black uppercase tracking-wider px-3 dark:text-neutral-100 shadow-sm focus:border-primary transition-all outline-none"
                                    >
                                        <option value="A4">A4 Standard</option>
                                        <option value="A5">A5 Small</option>
                                        <option value="A3">A3 Presentation</option>
                                        <option value="LETTER">US Letter</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-[0.2em] pl-1">Page Flow</Label>
                                    <select 
                                        value={config.orientation} 
                                        onChange={(e) => setConfig({...config, orientation: e.target.value})}
                                        className="w-full h-10 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] font-black uppercase tracking-wider px-3 dark:text-neutral-100 shadow-sm focus:border-primary transition-all outline-none"
                                    >
                                        <option value="portrait">Portrait</option>
                                        <option value="landscape">Landscape</option>
                                    </select>
                                </div>
                                {(type === DocumentType.PAYSLIP || type === DocumentType.ATTENDANCE_REPORT) && (
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-[0.2em] pl-1">Density (Items per Sheet)</Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[1, 2, 4, 6].map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => setConfig({...config, perPage: val})}
                                                    className={cn(
                                                        "h-10 rounded-lg border font-black text-[10px] transition-all uppercase tracking-widest",
                                                        config.perPage === val || (!config.perPage && val === 1)
                                                            ? "bg-white dark:bg-white text-black dark:text-black border-white shadow-xl shadow-white/10 scale-[1.05]"
                                                            : "bg-neutral-100/50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-primary/50"
                                                    )}
                                                >
                                                    {val === 1 ? 'Solo' : `${val} Grid`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* Right: Variables (1/3) */}
            <div className="w-full lg:flex-1 flex flex-col gap-3 min-h-0 overflow-hidden bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm relative">
                <VariableList variables={sampleData || {}} />
                {isLoadingVariables && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300 dark:text-neutral-600 animate-pulse">
                        <div className="h-4 w-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                        Analyzing Structure...
                    </div>
                )}
            </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #262626;
        }
      `}</style>
    </div>
  );
}

function getDefaultHtml(type: DocumentType): string {
  if (type === DocumentType.PAYSLIP) {
    return `
<div class="payslip-wrapper">
  <div class="header">
    <div class="company-info">
      <h1>PAYSLIP</h1>
      <h2>{{company.name}}</h2>
      <p>{{company.address}}</p>
    </div>
  </div>
  
  <div class="employee-info">
    <div class="info-group">
      <div><strong>Employee:</strong> {{employee.fullName}}</div>
      <div><strong>ID / Member No:</strong> {{employee.employeeNo}}</div>
      <div><strong>NIC:</strong> {{employee.nic}}</div>
      <div><strong>EPF No:</strong> {{employee.epfNo}}</div>
    </div>
    <div class="info-group">
      <div><strong>Period:</strong> {{formatDate periodStartDate}} - {{formatDate periodEndDate}}</div>
      <div><strong>Designation:</strong> {{employee.designation}}</div>
      <div><strong>Department:</strong> {{employee.department.name}}</div>
      <div><strong>Pay Date:</strong> {{formatDate payDate}}</div>
    </div>
  </div>

  <div class="salary-details">
    <div class="earnings">
      <h3>EARNINGS</h3>
      <table class="salary-table">
        <tr>
          <td>Basic Salary</td>
          <td>{{formatCurrency basicSalary}}</td>
        </tr>
        {{#if otPay}}
        <tr>
          <td>Overtime Pay</td>
          <td>{{formatCurrency otPay}}</td>
        </tr>
        {{/if}}
        {{#if holidayPay}}
        <tr>
          <td>Holiday Pay</td>
          <td>{{formatCurrency holidayPay}}</td>
        </tr>
        {{/if}}
        {{#each additions}}
        <tr>
          <td>{{name}}</td>
          <td>{{formatCurrency amount}}</td>
        </tr>
        {{/each}}
        <tr class="total-row">
          <td><strong>Gross Earnings</strong></td>
          <td><strong>{{formatCurrency grossSalary}}</strong></td>
        </tr>
      </table>
    </div>

    <div class="deductions">
      <h3>DEDUCTIONS</h3>
      <table class="salary-table">
        <tr>
          <td>EPF (Employee 8%)</td>
          <td>{{formatCurrency epfEmployee}}</td>
        </tr>
        {{#if advanceDeduction}}
        <tr>
          <td>Advance Recovery</td>
          <td>{{formatCurrency advanceDeduction}}</td>
        </tr>
        {{/if}}
        {{#if noPay}}
        <tr>
          <td>No Pay Deduction</td>
          <td>{{formatCurrency noPay}}</td>
        </tr>
        {{/if}}
        {{#if lateDeduction}}
        <tr>
          <td>Late Deduction</td>
          <td>{{formatCurrency lateDeduction}}</td>
        </tr>
        {{/if}}
        {{#if taxAmount}}
        <tr>
          <td>Payee Tax</td>
          <td>{{formatCurrency taxAmount}}</td>
        </tr>
        {{/if}}
        {{#each deductions}}
        <tr>
          <td>{{name}}</td>
          <td>{{formatCurrency amount}}</td>
        </tr>
        {{/each}}
        <tr class="total-row">
          <td><strong>Total Deductions</strong></td>
          <td><strong>{{formatCurrency totalDeductions}}</strong></td>
        </tr>
      </table>
    </div>
  </div>

  <div class="footer">
    <div class="net-pay-box">
      <span class="label">NET SALARY</span>
      <span class="amount">{{formatCurrency netSalary}}</span>
    </div>
    
    <div class="statutory-info">
      <p>Employer EPF (12%): {{formatCurrency epfEmployer}} | Employer ETF (3%): {{formatCurrency etfEmployer}}</p>
    </div>
    
    <div class="signatures">
      <div class="sig">Employer Signature</div>
      <div class="sig">Employee Signature</div>
    </div>
  </div>
</div>`;
  }
  
  if (type === DocumentType.SALARY_SHEET) {
    return `
<div class="salary-sheet">
  <div class="header">
    <h1>SALARY SHEET - {{month}}/{{year}}</h1>
    <h2>{{company.name}}</h2>
  </div>

  <table class="sheet-table">
    <thead>
      <tr>
        <th>Employee</th>
        <th>Basic</th>
        <th>OT</th>
        <th>Holiday</th>
        {{#each additionColumns}}
        <th>{{this}}</th>
        {{/each}}
        <th class="gross-col">Gross</th>
        <th>EPF 8%</th>
        <th>Tax</th>
        <th>Other Ded.</th>
        <th>Net Salary</th>
      </tr>
    </thead>
    <tbody>
      {{#each salaries}}
      <tr class="employee-row">
        <td class="name-cell">{{employee.memberNo}} - {{employee.fullName}}</td>
        <td>{{formatCurrency basicSalary}}</td>
        <td>{{formatCurrency otPay}}</td>
        <td>{{formatCurrency holidayPay}}</td>
        {{#each ../additionColumns}}
        <td>{{formatCurrency (getAmount ../additions this)}}</td>
        {{/each}}
        <td class="gross-col">{{formatCurrency grossSalary}}</td>
        <td>{{formatCurrency epfEmployee}}</td>
        <td>{{formatCurrency taxAmount}}</td>
        <td>{{formatCurrency totalDeductions}}</td>
        <td class="net-col">{{formatCurrency netSalary}}</td>
      </tr>
      {{/each}}
      
      <tr class="totals-row">
        <td>GRAND TOTAL</td>
        <td>{{formatCurrency totals.basicSalary}}</td>
        <td>{{formatCurrency totals.otPay}}</td>
        <td>{{formatCurrency totals.holidayPay}}</td>
        {{#each additionColumns}}
        <td>{{formatCurrency (getCustomTotal ../totals.customAdditions this)}}</td>
        {{/each}}
        <td class="gross-col">{{formatCurrency totals.grossSalary}}</td>
        <td>{{formatCurrency totals.epfEmployee}}</td>
        <td>{{formatCurrency totals.taxAmount}}</td>
        <td>{{formatCurrency totals.totalDeductions}}</td>
        <td class="net-col">{{formatCurrency totals.netSalary}}</td>
      </tr>
    </tbody>
  </table>
</div>`;

  }
  return '<div class="document"><h1>New Document</h1></div>';
}

function getDefaultCss(): string {
  return `
/* PAYSLIP STYLES */
.payslip-wrapper {
  padding: 40px;
  font-family: sans-serif;
  color: #333;
}
.header { border-bottom: 2px solid #000; margin-bottom: 20px; }
.header h1 { margin: 0; color: #000; font-size: 24px; }
.employee-info { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px; line-height: 1.6; }
.salary-details { display: flex; gap: 40px; }
.earnings, .deductions { flex: 1; }
.salary-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.salary-table td { padding: 8px 0; border-bottom: 1px solid #eee; }
.salary-table td:last-child { text-align: right; }
.total-row td { border-top: 1px solid #000; padding-top: 10px; font-size: 14px; }
.net-pay-box { background: #f8f8f8; padding: 20px; text-align: center; border: 1px solid #ddd; margin: 30px 0; }
.net-pay-box .label { display: block; font-size: 12px; font-weight: bold; color: #666; margin-bottom: 5px; }
.net-pay-box .amount { font-size: 24px; font-weight: bold; color: #000; }
.statutory-info { font-size: 11px; color: #777; text-align: center; font-style: italic; }
.signatures { display: flex; justify-content: space-between; margin-top: 60px; }
.sig { border-top: 1px solid #ccc; width: 200px; text-align: center; padding-top: 5px; font-size: 12px; }

/* SALARY SHEET STYLES */
.salary-sheet { padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #000; background: #fff; }
.salary-sheet .header h1 { margin: 0; color: #000; }
.salary-sheet .header h2 { margin: 0; color: #666; font-size: 14px; }
.sheet-table { width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed; color: #000; }
.sheet-table th, .sheet-table td { border: 1px solid #ccc; padding: 6px 4px; text-align: right; overflow: hidden; color: #000; }
.sheet-table th { background: #f0f0f0; font-weight: bold; }
.sheet-table td.name-cell { text-align: left; font-weight: 500; }
.gross-col, .net-col { background: #f9f9f9; font-weight: bold; }
.totals-row td { background: #333; color: #fff; font-weight: bold; border-color: #333; }
.page-break { page-break-after: always; }
.page-footer { text-align: center; font-size: 9px; margin-top: 10px; color: #666; }
thead { display: table-header-group; }
tr.employee-row { page-break-inside: avoid; }
`;
}

