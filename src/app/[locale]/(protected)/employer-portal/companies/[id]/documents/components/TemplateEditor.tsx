import React from "react";
import { useTranslations } from "next-intl";
import { 
  IconCheck, 
  IconX, 
  IconDeviceFloppy, 
  IconCode, 
  IconSettings, 
  IconLayersIntersect,
  IconArrowLeft
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { VariableList } from "./VariableList";
import { LivePreview } from "./LivePreview";
import { DocumentType, DocumentTemplate, TemplateStatus } from "@/types/template";
import { useTemplates } from "@/hooks/use-templates";
import { toast } from "sonner";

interface TemplateEditorProps {
  template?: DocumentTemplate;
  type: DocumentType;
  companyId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export function TemplateEditor({ template, type, companyId, onSave, onCancel }: TemplateEditorProps) {
  const [name, setName] = React.useState(template?.name || `New ${type.replace('_', ' ')} Template`);
  const [html, setHtml] = React.useState(template?.html || getDefaultHtml(type));
  const [css, setCss] = React.useState(template?.css || getDefaultCss());
  const [config, setConfig] = React.useState(template?.config || { paperSize: "A4", orientation: "portrait" });
  
  const { createTemplateMutation, updateTemplateMutation, variablesQuery } = useTemplates();
  const { data: sampleData, isLoading: isLoadingVariables } = variablesQuery(type);

  const handleSave = async (status: TemplateStatus = TemplateStatus.DRAFT) => {
    const data = {
      name,
      type,
      html,
      css,
      config,
      companyId,
      status,
      isActive: status === TemplateStatus.APPROVED, 
    };

    try {
      if (template?.id) {
        await updateTemplateMutation.mutateAsync({ id: template.id, data });
        toast.success(status === TemplateStatus.PENDING ? "Template submitted for approval" : "Draft saved successfully");
      } else {
        await createTemplateMutation.mutateAsync(data);
        toast.success(status === TemplateStatus.PENDING ? "Template created and submitted" : "New draft created");
      }
      onSave?.();
    } catch (e) {
      toast.error(`Failed to ${status === TemplateStatus.PENDING ? "submit" : "save"} template`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-8 antialiased">
      {/* Header */}
      <div className="flex items-start justify-between pb-8">
        <div className="flex items-center gap-8 flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            className="h-12 w-12 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm hover:scale-110 transition-all group"
          >
            <IconArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          </Button>
          
          <div className="flex flex-col gap-2 flex-1 max-w-sm">
            <h1 className="text-2xl font-black uppercase tracking-tighter dark:text-neutral-50 leading-none">
              {template?.id ? "Edit Custom Layout" : "Create New Template"}
            </h1>
            <Badge variant="outline" className="w-fit text-[9px] font-black tracking-widest uppercase py-1 px-3 rounded-lg bg-primary/5 text-primary border-primary/20">
               {type.replace('_', ' ')} Layout
            </Badge>
          </div>

          <div className="flex items-center gap-6 flex-1 max-w-xl">
             <div className="flex flex-col gap-1.5 flex-1">
                <Label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-[0.2em] pl-1 h-3">Template Name</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-sm font-bold bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 focus:border-primary/50 transition-all rounded-[1rem] dark:text-neutral-100 shadow-sm"
                  placeholder="Enter a descriptive name..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-[0.2em] pl-1 h-3">Status</Label>
                <div className={`h-12 flex items-center px-5 rounded-[1rem] border-2 text-[10px] font-black uppercase tracking-widest leading-none shadow-sm ${
                  template?.status === TemplateStatus.APPROVED ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50" :
                  template?.status === TemplateStatus.PENDING ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50" :
                  "bg-neutral-50 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 border-neutral-100 dark:border-neutral-800"
                }`}>
                  {template?.status || TemplateStatus.DRAFT}
                </div>
              </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline"
            className="rounded-2xl h-14 px-10 font-bold text-xs uppercase tracking-[0.15em] border-2 border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all shadow-xl dark:text-neutral-300" 
            onClick={() => handleSave(TemplateStatus.DRAFT)}
            disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
          >
            <IconDeviceFloppy className="h-4 w-4 mr-3 stroke-[2.5]" /> Save Draft
          </Button>
          <Button 
            className="rounded-2xl h-14 px-10 font-black text-xs uppercase tracking-[0.15em] bg-primary text-white shadow-2xl shadow-primary/30 hover:scale-[1.05] active:scale-95 transition-all" 
            onClick={() => handleSave(TemplateStatus.PENDING)}
            disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
          >
            <IconCheck className="h-5 w-5 mr-3 stroke-[3]" /> Submit Layout
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0 overflow-hidden">
        {/* Left Side: Editor */}
        <div className="w-[45%] flex flex-col gap-8 min-h-0 overflow-hidden">
            <Tabs defaultValue="html" className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <TabsList className="bg-neutral-100 dark:bg-neutral-800/40 p-2 h-14 rounded-[1.5rem] w-max border-neutral-200 dark:border-neutral-700/30 border">
                    <TabsTrigger value="html" className="rounded-[1rem] px-8 h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-2xl data-[state=active]:text-primary transition-all">
                        <IconCode className="h-4 w-4 mr-2.5" /> HTML
                    </TabsTrigger>
                    <TabsTrigger value="css" className="rounded-[1rem] px-8 h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-2xl data-[state=active]:text-primary transition-all">
                        <IconLayersIntersect className="h-4 w-4 mr-2.5" /> CSS
                    </TabsTrigger>
                    <TabsTrigger value="config" className="rounded-[1rem] px-8 h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-2xl data-[state=active]:text-primary transition-all">
                        <IconSettings className="h-4 w-4 mr-2.5" /> Layout
                    </TabsTrigger>
                </TabsList>
                
                <div className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden border-2 border-neutral-100 dark:border-neutral-800 rounded-[2.5rem] bg-white dark:bg-neutral-950/40 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] ring-1 ring-neutral-100 dark:ring-neutral-900/50">
                    <TabsContent value="html" className="flex-1 mt-0 outline-none flex flex-col min-h-0 overflow-hidden">
                        <Textarea 
                          value={html}
                          onChange={(e) => setHtml(e.target.value)}
                          className="flex-1 font-mono text-[13px] p-8 leading-relaxed bg-transparent border-none focus-visible:ring-0 resize-none overflow-y-auto dark:text-neutral-300 custom-scrollbar"
                          spellCheck={false}
                        />
                    </TabsContent>
                    <TabsContent value="css" className="flex-1 mt-0 outline-none flex flex-col min-h-0 overflow-hidden">
                         <Textarea 
                          value={css}
                          onChange={(e) => setCss(e.target.value)}
                          className="flex-1 font-mono text-[13px] p-8 leading-relaxed bg-transparent border-none focus-visible:ring-0 resize-none overflow-y-auto dark:text-neutral-300 custom-scrollbar"
                          spellCheck={false}
                        />
                    </TabsContent>
                    <TabsContent value="config" className="flex-1 mt-0 outline-none p-10 space-y-10 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-[0.2em] pl-1">Paper Size</Label>
                                <select 
                                    value={config.paperSize} 
                                    onChange={(e) => setConfig({...config, paperSize: e.target.value})}
                                    className="w-full h-14 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 text-sm font-bold px-5 dark:text-neutral-100 shadow-sm focus:border-primary/50 transition-all outline-none"
                                >
                                    <option value="A4">A4 (Standard)</option>
                                    <option value="A5">A5</option>
                                    <option value="A3">A3 (Large Report)</option>
                                    <option value="LETTER">Letter</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-[0.2em] pl-1">Orientation</Label>
                                <select 
                                    value={config.orientation} 
                                    onChange={(e) => setConfig({...config, orientation: e.target.value})}
                                    className="w-full h-14 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 text-sm font-bold px-5 dark:text-neutral-100 shadow-sm focus:border-primary/50 transition-all outline-none"
                                >
                                    <option value="portrait">Portrait</option>
                                    <option value="landscape">Landscape</option>
                                </select>
                            </div>
                            {(type === DocumentType.PAYSLIP || type === DocumentType.ATTENDANCE_REPORT) && (
                                <div className="space-y-3 col-span-2">
                                    <Label className="text-[11px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-[0.2em] pl-1">Documents Per Page</Label>
                                    <select 
                                        value={config.perPage || 1} 
                                        onChange={(e) => setConfig({...config, perPage: parseInt(e.target.value)})}
                                        className="w-full h-14 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 text-sm font-bold px-5 dark:text-neutral-100 shadow-sm focus:border-primary/50 transition-all outline-none"
                                    >
                                        <option value={1}>1 Per Page (Standard)</option>
                                        <option value={2}>2 Per Page</option>
                                        <option value={4}>4 Per Page</option>
                                        <option value={6}>6 Per Page</option>
                                    </select>
                                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold tracking-wider pl-1 italic uppercase pt-1">Note: Grid layout is only applied during bulk printing.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
            
            {/* Variable Info Section */}
            <div className="h-[300px] flex flex-col gap-5 overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/30 rounded-[2.5rem] p-8 border-2 border-neutral-100 dark:border-neutral-800 shadow-inner">
                <VariableList variables={sampleData || {}} />
                {isLoadingVariables && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-neutral-300 dark:text-neutral-600 animate-pulse">
                        <div className="h-8 w-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        Discerning Data Structure...
                    </div>
                )}
            </div>
        </div>

        {/* Right Side: Preview */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden border-2 border-neutral-100 dark:border-neutral-800 rounded-[3rem] bg-white dark:bg-neutral-900 p-2 shadow-2xl ring-1 ring-neutral-100 dark:ring-neutral-900/50">
             <LivePreview html={html} css={css} data={sampleData || {}} />
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

function getDefaultHtml(type: DocumentType) {
    if (type === DocumentType.PAYSLIP) {
        return `
<div class="payslip-wrapper">
  <div class="header">
    <h1>PAYSLIP</h1>
    <p>{{employee.company.name}}</p>
  </div>
  
  <div class="employee-info">
    <div><strong>Employee:</strong> {{employee.fullName}}</div>
    <div><strong>ID:</strong> {{employee.employeeNo}}</div>
    <div><strong>Designation:</strong> {{employee.designation}}</div>
    <div><strong>Period:</strong> {{formatDate periodStartDate}} to {{formatDate periodEndDate}}</div>
  </div>

  <table class="salary-table">
    <thead>
      <tr>
        <th>Earnings</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Basic Salary</td>
        <td>{{formatCurrency basicSalary}}</td>
      </tr>
      {{#each components}}
      {{#if (eq category 'ADDITION')}}
      <tr>
        <td>{{name}}</td>
        <td>{{formatCurrency amount}}</td>
      </tr>
      {{/if}}
      {{/each}}
    </tbody>
  </table>

  <div class="footer">
     <div class="net-pay">NET PAY: {{formatCurrency netSalary}}</div>
  </div>
</div>`;
    }
    return `<div>Template for ${type}</div>`;
}

function getDefaultCss() {
    return `
.payslip-wrapper {
  font-family: 'Helvetica', sans-serif;
  color: #333;
  padding: 40px;
  background: white;
  width: 210mm; /* A4 width */
  margin: auto;
}
.header { text-align: right; border-bottom: 2px solid #333; padding-bottom: 10px; }
.header h1 { font-size: 24px; margin: 0; color: #000; }
.employee-info { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin: 30px 0; font-size: 14px; }
.salary-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
.salary-table th { background: #f5f5f5; text-align: left; padding: 10px; border: 1px solid #ddd; font-size: 12px; }
.salary-table td { padding: 10px; border: 1px solid #ddd; font-size: 13px; }
.footer { margin-top: 50px; text-align: right; }
.net-pay { font-size: 20px; font-weight: bold; background: #000; color: #fff; padding: 15px 30px; display: inline-block; }
`;
}
