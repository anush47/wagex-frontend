import React from "react";
import { useTranslations } from "next-intl";
import { IconCheck, IconX, IconDeviceFloppy, IconAppWindow, IconCode, IconExternalLink, IconSettings, IconEye, IconLayersIntersect } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VariableList } from "./VariableList";
import { LivePreview } from "./LivePreview";
import { DocumentType, DocumentTemplate } from "@/types/template";
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
  const { data: sampleData } = variablesQuery(type);

  const handleSave = async () => {
    const data = {
      name,
      type,
      html,
      css,
      config,
      companyId,
      isActive: false, // Explicitly false for user submissions
    };

    try {
      if (template?.id) {
        await updateTemplateMutation.mutateAsync({ id: template.id, data });
        toast.success("Template updated and submitted for approval");
      } else {
        await createTemplateMutation.mutateAsync(data);
        toast.success("New template created and submitted for approval");
      }
      onSave?.();
    } catch (e) {
      toast.error("Failed to save template");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex flex-col gap-1 flex-1 max-w-md">
            <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Template Name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-sm font-bold bg-neutral-50 border-neutral-200 focus:bg-white transition-all rounded-xl"
              placeholder="Enter a descriptive name..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Status</Label>
            <div className="h-10 flex items-center px-4 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 text-[10px] font-black uppercase tracking-widest leading-none">
              Pending Approval
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="rounded-xl h-11 px-6 font-bold text-xs uppercase tracking-widest" onClick={onCancel}>
            <IconX className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button 
            className="rounded-xl h-11 px-8 font-black text-xs uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform" 
            onClick={handleSave}
            disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
          >
            <IconDeviceFloppy className="h-4 w-4 mr-2" /> Save & Submit
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Side: Editor */}
        <div className="w-[45%] flex flex-col gap-6 overflow-hidden">
            <Tabs defaultValue="html" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="bg-neutral-100 p-1 h-11 rounded-2xl w-max">
                    <TabsTrigger value="html" className="rounded-xl px-6 h-full font-bold text-xs uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <IconCode className="h-3.5 w-3.5 mr-2" /> HTML
                    </TabsTrigger>
                    <TabsTrigger value="css" className="rounded-xl px-6 h-full font-bold text-xs uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <IconLayersIntersect className="h-3.5 w-3.5 mr-2" /> CSS
                    </TabsTrigger>
                    <TabsTrigger value="config" className="rounded-xl px-6 h-full font-bold text-xs uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <IconSettings className="h-3.5 w-3.5 mr-2" /> Layout
                    </TabsTrigger>
                </TabsList>
                
                <div className="mt-4 flex-1 flex flex-col overflow-hidden border border-neutral-100 rounded-2xl bg-white p-2">
                    <TabsContent value="html" className="flex-1 mt-0 outline-none flex flex-col">
                        <Textarea 
                          value={html}
                          onChange={(e) => setHtml(e.target.value)}
                          className="flex-1 font-mono text-xs p-4 leading-relaxed bg-neutral-50/50 border-none focus-visible:ring-0 resize-none no-scrollbar"
                          spellCheck={false}
                        />
                    </TabsContent>
                    <TabsContent value="css" className="flex-1 mt-0 outline-none flex flex-col">
                         <Textarea 
                          value={css}
                          onChange={(e) => setCss(e.target.value)}
                          className="flex-1 font-mono text-xs p-4 leading-relaxed bg-neutral-50/50 border-none focus-visible:ring-0 resize-none no-scrollbar"
                          spellCheck={false}
                        />
                    </TabsContent>
                    <TabsContent value="config" className="flex-1 mt-0 outline-none p-4 space-y-6 overflow-y-auto no-scrollbar">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Paper Size</Label>
                                <select 
                                    value={config.paperSize} 
                                    onChange={(e) => setConfig({...config, paperSize: e.target.value})}
                                    className="w-full h-11 rounded-xl bg-neutral-50 border-neutral-100 text-sm font-bold px-4"
                                >
                                    <option value="A4">A4 (Standard)</option>
                                    <option value="A5">A5</option>
                                    <option value="A3">A3 (Large Report)</option>
                                    <option value="LETTER">Letter</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Orientation</Label>
                                <select 
                                    value={config.orientation} 
                                    onChange={(e) => setConfig({...config, orientation: e.target.value})}
                                    className="w-full h-11 rounded-xl bg-neutral-50 border-neutral-100 text-sm font-bold px-4"
                                >
                                    <option value="portrait">Portrait</option>
                                    <option value="landscape">Landscape</option>
                                </select>
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
            
            {/* Variable Info Section */}
            <div className="h-[250px] overflow-hidden">
                <VariableList variables={sampleData || {}} />
            </div>
        </div>

        {/* Right Side: Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
             <LivePreview html={html} css={css} data={sampleData || {}} />
        </div>
      </div>
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
