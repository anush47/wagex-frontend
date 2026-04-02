"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { 
  IconLayoutGrid,
  IconVariable,
  IconDeviceFloppy,
  IconCheck,
  IconArrowLeft,
  IconChevronUp,
  IconChevronDown
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTemplates, useTemplateLiveData } from "@/hooks/use-templates";
import { getDefaultHtml } from "../templates/defaults/default-html";
import { getDefaultCss } from "../templates/defaults/default-css";
import { getDefaultHelpers } from "../templates/defaults/default-helpers";
import { getDefaultConfig } from "../templates/defaults/default-config";
import { getSampleData } from "../templates/defaults/sample-data";
import { DocumentType, DocumentTemplate, TemplateStatus } from "@/types/template";
import { toast } from "sonner";
import { LivePreview } from "./LivePreview";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-javascript";
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
  const [css, setCss] = React.useState(template?.css || getDefaultCss(type));
  const [helpers, setHelpers] = React.useState(template?.helpers || getDefaultHelpers());
  const [config, setConfig] = React.useState(template?.config || getDefaultConfig(type));
  const [dataJson, setDataJson] = React.useState("");
  const [dataError, setDataError] = React.useState<string | null>(null);
  const [dataSearch, setDataSearch] = React.useState("");
  const [dataMatchIdx, setDataMatchIdx] = React.useState(0);
  const dataMatchRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [liveResourceId, setLiveResourceId] = React.useState("");

  const { createTemplateMutation, updateTemplateMutation } = useTemplates();
  const { refetch: fetchLive } = useTemplateLiveData(type, liveResourceId);

  const handleFetchLive = async () => {
    if (!liveResourceId.trim()) {
        toast.error("Please enter a resource ID (e.g. Salary ID)");
        return;
    }
    try {
        const { data } = await fetchLive();
        if (data) {
            setDataJson(JSON.stringify(data, null, 2));
            toast.success("Live data loaded from server");
        }
    } catch (e: any) {
        toast.error(e.message || "Failed to fetch live data");
    }
  };

  // Seed sample data from backend once on mount
  React.useEffect(() => {
    getSampleData(type).then(data => {
        setDataJson(JSON.stringify(data, null, 2));
    }).catch(err => {
        toast.error("Failed to fetch template variables from backend.");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Parse the user's JSON for preview
  const templateData = React.useMemo(() => {
    if (!dataJson) return {};
    try {
      const parsed = JSON.parse(dataJson);
      setDataError(null);
      return parsed;
    } catch (e: any) {
      setDataError(e.message);
      return {};
    }
  }, [dataJson]);

  // Scroll to first match whenever search changes
  React.useEffect(() => {
    setDataMatchIdx(0);
    if (dataSearch) {
      setTimeout(() => {
        dataMatchRefs.current[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [dataSearch]);

  // Scroll to current match index
  React.useEffect(() => {
    dataMatchRefs.current[dataMatchIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [dataMatchIdx]);

  const isApproved = template?.status === TemplateStatus.APPROVED;

  const handleSave = async (publish = false) => {
        if (!name.trim()) {
            toast.error("Template name is required");
            return;
        }

        const basePayload = {
            name,
            description,
            type,
            html,
            css,
            helpers,
            config,
            status: publish ? TemplateStatus.PENDING : (template?.status || TemplateStatus.DRAFT),
        };

        let saveAction;

        if (template?.id) {
            // Update: Omit immutable fields (type, companyId) + status/isActive if not publishing
            const { type: _, ...updatePayload } = basePayload;
            saveAction = updateTemplateMutation.mutateAsync({ id: template.id, data: updatePayload as any });
        } else {
            // Create: Include basics, status will be handled by logic above
            // Backend will infer companyId for Employers with a single membership
            saveAction = createTemplateMutation.mutateAsync(basePayload as any);
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
            <LivePreview html={html} css={css} data={templateData} config={config} />
        </div>

        {/* Row 2: Tabs (Full Width) */}
        <div className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
                <Tabs defaultValue="html" className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1 h-9 rounded-xl w-max border-none shadow-inner">
                        <TabsTrigger value="html" className="rounded-lg px-6 h-full font-bold text-[10px] uppercase tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                            HTML
                        </TabsTrigger>
                        <TabsTrigger value="css" className="rounded-lg px-6 h-full font-bold text-[10px] uppercase tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                            CSS
                        </TabsTrigger>
                        <TabsTrigger value="helpers" className="rounded-lg px-6 h-full font-bold text-[10px] uppercase tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all flex items-center gap-1.5">
                            <IconVariable className="h-3.5 w-3.5" />
                            Functions
                        </TabsTrigger>
                        <TabsTrigger value="data" className="rounded-lg px-6 h-full font-bold text-[10px] uppercase tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all flex items-center gap-1.5">
                            Data
                            {dataError && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
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
                                style={{ fontFamily: '"Fira Code", "Fira Mono", monospace', outline: 'none' }}
                            />
                        </TabsContent>
                        <TabsContent value="css" className="flex-1 mt-0 outline-none overflow-y-auto custom-scrollbar bg-neutral-50 dark:bg-neutral-900/40">
                            <Editor
                                value={css}
                                onValueChange={code => setCss(code)}
                                highlight={code => highlight(code, languages.css, 'css')}
                                padding={20}
                                className="font-mono text-[11px] leading-relaxed min-h-full dark:text-neutral-300"
                                style={{ fontFamily: '"Fira Code", "Fira Mono", monospace', outline: 'none' }}
                            />
                        </TabsContent>
                        <TabsContent value="helpers" className="flex-1 mt-0 outline-none overflow-y-auto custom-scrollbar bg-neutral-50 dark:bg-neutral-900/40 relative">
                             <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-neutral-900/10 border-b border-neutral-200 dark:border-neutral-800 backdrop-blur-md">
                                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest leading-none">Javascript (Handlebars Helpers)</span>
                                <Badge variant="secondary" className="text-[9px] font-bold">Safe Runtime</Badge>
                             </div>
                             <Editor
                                value={helpers}
                                onValueChange={code => setHelpers(code)}
                                highlight={code => highlight(code, languages.javascript, 'javascript')}
                                padding={20}
                                className="font-mono text-[11px] leading-relaxed min-h-full dark:text-neutral-300"
                                style={{ fontFamily: '"Fira Code", "Fira Mono", monospace', outline: 'none' }}
                            />
                        </TabsContent>
                        <TabsContent value="data" className="flex-1 mt-0 outline-none flex flex-col min-h-0 bg-neutral-50 dark:bg-neutral-950">
                             <div className="flex items-center justify-between gap-4 px-6 py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                                <div className="flex items-center gap-3 grow max-w-2xl">
                                     <div className="relative grow">
                                        <IconVariable className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                                        <input 
                                            placeholder="SEARCH SCHEMA FIELDS..."
                                            value={dataSearch}
                                            onChange={e => setDataSearch(e.target.value.toUpperCase())}
                                            className="w-full h-8 pl-9 pr-3 bg-neutral-100 dark:bg-white/5 rounded-lg text-[10px] font-mono tracking-widest outline-none border border-neutral-200 dark:border-neutral-800 focus:border-primary/50 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-neutral-100"
                                        />
                                     </div>
                                     {dataSearch && (() => {
                                        const json = dataJson;
                                        const lines = json.split('\n');
                                        let matchCount = 0;
                                        lines.forEach(l => { if (l.toUpperCase().includes(dataSearch)) matchCount++; });

                                        return (
                                            <div className="flex items-center gap-2 shrink-0 px-2 bg-neutral-50 dark:bg-white/5 rounded-md border border-neutral-200 dark:border-neutral-800 h-8">
                                                <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 tabular-nums uppercase tracking-widest">
                                                    {matchCount > 0 ? dataMatchIdx + 1 : 0} / {matchCount}
                                                </span>
                                                <div className="flex items-center gap-1 border-l border-neutral-200 dark:border-neutral-800 pl-1 ml-1">
                                                    <button 
                                                        onClick={() => setDataMatchIdx(prev => (prev - 1 + matchCount) % matchCount)}
                                                        className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-primary transition-colors disabled:opacity-20"
                                                        disabled={matchCount === 0}
                                                    >
                                                        <IconChevronUp className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDataMatchIdx(prev => (prev + 1) % matchCount)}
                                                        className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-primary transition-colors disabled:opacity-20"
                                                        disabled={matchCount === 0}
                                                    >
                                                        <IconChevronDown className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                                {dataSearch && (
                                    <button onClick={() => setDataSearch('')} className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 hover:text-rose-500 transition-all uppercase tracking-widest pl-2">Reset</button>
                                )}
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="text-[9px] font-black border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 tracking-[0.2em]">SCHEMA VIEW</Badge>
                                </div>
                            </div>
                            {dataError && (
                                <div className="flex items-center gap-2 px-6 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-500 text-[9px] font-black uppercase tracking-[0.2em] leading-none shrink-0">
                                    <span>FATAL JSON ERROR: {dataError}</span>
                                </div>
                            )}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-white dark:bg-[#0d1117]">
                                {dataSearch ? (() => {
                                    const json = dataJson;
                                    const lines = json.split('\n');
                                    const matchIndices = new Set<number>();
                                    const contextIndices = new Set<number>();

                                    lines.forEach((line, i) => {
                                        if (line.toUpperCase().includes(dataSearch)) {
                                            matchIndices.add(i);
                                        }
                                    });

                                    matchIndices.forEach(ind => {
                                        const line = lines[ind];
                                        const indent = line.search(/\S/); 
                                        contextIndices.add(ind);

                                        const needed = new Set<number>();
                                        for (let i = 0; i < indent; i += 2) needed.add(i);

                                        for (let i = ind - 1; i >= 0; i--) {
                                            if (needed.size === 0) break;
                                            const l = lines[i];
                                            const ind = l.search(/\S/);
                                            if (needed.has(ind) && lines[i].trim()) {
                                                contextIndices.add(i);
                                                needed.delete(ind);
                                            }
                                        }
                                    });

                                    const visible = Array.from(contextIndices).sort((a, b) => a - b);
                                    let matchCount = -1;
                                    dataMatchRefs.current = [];

                                    if (matchIndices.size === 0) return (
                                        <div className="flex items-center justify-center h-32 text-[10px] font-black uppercase text-neutral-400 tracking-widest">No matches</div>
                                    );

                                    let prevIdx = -1;
                                    return (
                                        <div className="font-mono text-[11px] leading-relaxed p-5" style={{ fontFamily: '"Fira Code", "Fira Mono", monospace' }}>
                                            {visible.map((idx) => {
                                                const line = lines[idx];
                                                const isMatch = matchIndices.has(idx);
                                                if (isMatch) matchCount++;
                                                const isCurrent = isMatch && matchCount === dataMatchIdx;
                                                const showEllipsis = prevIdx !== -1 && idx > prevIdx + 1 && !isMatch;
                                                prevIdx = idx;
                                                return (
                                                    <React.Fragment key={idx}>
                                                        {showEllipsis && (
                                                            <div className="text-neutral-300 dark:text-neutral-700 select-none py-0.5 pl-1">⋯</div>
                                                        )}
                                                        <div
                                                            ref={isMatch ? el => { dataMatchRefs.current[matchCount] = el; } : undefined}
                                                            className={isCurrent
                                                                ? 'bg-amber-300/80 dark:bg-amber-500/30 -mx-5 px-5 rounded-sm ring-1 ring-amber-400 dark:ring-amber-500/50 transition-all'
                                                                : isMatch
                                                                    ? 'bg-amber-100/60 dark:bg-amber-500/10 -mx-5 px-5 rounded-sm'
                                                                    : 'text-neutral-400 dark:text-neutral-600'}
                                                        >
                                                            <span className={isMatch ? 'text-neutral-900 dark:text-neutral-100 font-semibold' : ''}>
                                                                {line || ' '}
                                                            </span>
                                                        </div>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    );
                                })() : (
                                    <Editor
                                        value={dataJson}
                                        onValueChange={(code) => setDataJson(code)}
                                        highlight={code => highlight(code, languages.json, 'json')}
                                        padding={20}
                                        className="font-mono text-[11px] leading-relaxed min-h-full dark:text-neutral-300"
                                        style={{ fontFamily: '"Fira Code", "Fira Mono", monospace', outline: 'none' }}
                                    />
                                )}
                            </div>
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
