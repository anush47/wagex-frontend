import React from "react";
import { Badge } from "@/components/ui/badge";
import { IconCopy, IconSearch, IconVariable } from "@tabler/icons-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface Variable {
  path: string;
  description?: string;
  example?: any;
}

export function VariableList({ variables }: { variables: any }) {
  const [search, setSearch] = React.useState("");

  const flattened = React.useMemo(() => {
    if (!variables || Object.keys(variables).length === 0) return [];
    
    const res: Variable[] = [];
    const visited = new Set();

    const recurse = (obj: any, path: string = "", depth = 0) => {
      // Safety break for extremely deep objects
      if (depth > 10) return;
      if (obj === null || obj === undefined) return;
      
      // Tracking visited objects to prevent infinite loops if circular
      if (typeof obj === 'object' && obj !== null) {
          if (visited.has(obj)) return;
          visited.add(obj);
      }

      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        const val = obj[key];
        
        if (Array.isArray(val)) {
            // Add array itself
            res.push({ 
                path: currentPath, 
                description: `List (${val.length} items)`, 
                example: `Array` 
            });
            // recurse into the first item of the array if it exists as an example of structure
            if (val.length > 0) {
               recurse(val[0], `${currentPath}.[0]`, depth + 1);
            }
        } else if (val && typeof val === "object" && !(val instanceof Date)) {
            // Recurse into objects
            recurse(val, currentPath, depth + 1);
        } else {
            // Leaf node
            res.push({ path: currentPath, example: val });
        }
      }
    };

    recurse(variables);
    return res;
  }, [variables]);

  const filtered = flattened.filter(v => 
    v.path.toLowerCase().includes(search.toLowerCase())
  );

  const copyToClipboard = (path: string) => {
    const tag = `{{${path}}}`;
    navigator.clipboard.writeText(tag);
    toast.success(`Copied ${tag} to clipboard`);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between px-1 shrink-0">
        <h3 className="text-[9px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-widest italic flex items-center gap-1.5">
          <IconVariable className="h-2.5 w-2.5" /> Data Fields
        </h3>
        <Badge variant="secondary" className="bg-primary/5 text-primary text-[8px] font-black tracking-widest uppercase py-0 px-1.5 rounded-md border-none">
          {filtered.length}
        </Badge>
      </div>

      <div className="relative shrink-0">
        <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400" />
        <Input 
          placeholder="Search fields..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 pl-8 text-[10px] font-bold bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus:bg-neutral-50 dark:focus:bg-neutral-800 transition-all rounded-lg dark:text-neutral-200"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-white/50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <div className="h-10 w-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
               <IconVariable className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />
            </div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest">
              {search ? "No matches found" : "Waiting for schema..."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            <div className="space-y-3">
                <div className="text-[8px] font-black uppercase text-primary/60 tracking-[0.2em] pl-1">Primary</div>
                <div className="flex flex-col gap-2">
                    {filtered.filter(v => !v.path.includes('.')).map((v) => (
                        <VariableItem key={v.path} v={v} onCopy={() => copyToClipboard(v.path)} />
                    ))}
                </div>

                {filtered.some(v => v.path.includes('.')) && (
                    <>
                        <div className="text-[8px] font-black uppercase text-primary/60 tracking-[0.2em] pl-1 pt-1">Nested</div>
                        <div className="flex flex-col gap-2">
                            {filtered.filter(v => v.path.includes('.')).map((v) => (
                                <VariableItem key={v.path} v={v} onCopy={() => copyToClipboard(v.path)} />
                            ))}
                        </div>
                    </>
                )}

                <div className="text-[8px] font-black uppercase text-amber-500/60 tracking-[0.2em] pl-1 pt-2">Calculation Totals</div>
                <div className="flex flex-col gap-2">
                    {['basicSalary', 'grossSalary', 'netSalary', 'totalAdditions', 'totalDeductions'].map(f => (
                        <div 
                            key={f} 
                            onClick={() => copyToClipboard(f)}
                            className="text-[10px] font-black text-amber-700 dark:text-amber-500 bg-amber-500/5 dark:bg-amber-500/10 px-4 py-2.5 rounded-xl border border-amber-500/10 cursor-pointer hover:bg-amber-100/50 transition-all active:scale-95 flex justify-between items-center group"
                        >
                            <span>{`{{${f}}}`}</span>
                            <IconCopy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>

                <div className="text-[8px] font-black uppercase text-indigo-500/60 tracking-[0.2em] pl-1 pt-2">Helpers</div>
                <div className="flex flex-col gap-2">
                    {[
                        { tag: '{{formatCurrency v}}', desc: 'LKR Format' },
                        { tag: '{{formatDate d}}', desc: 'Date Format' },
                        { tag: '{{#each arr}}', desc: 'Loop Handler' }
                    ].map(h => (
                        <div 
                            key={h.tag} 
                            onClick={() => {
                                navigator.clipboard.writeText(h.tag);
                                toast.success(`Copied ${h.tag}`);
                            }}
                            className="flex justify-between items-center bg-indigo-500/5 dark:bg-indigo-500/10 px-3 py-2.5 rounded-xl border border-indigo-500/10 cursor-pointer hover:bg-indigo-100/50 transition-all"
                        >
                            <code className="text-[10px] font-black text-indigo-700">{h.tag}</code>
                            <span className="text-[8px] font-black text-indigo-400 uppercase shrink-0 pl-2">{h.desc}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}
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
          background: #333;
        }
      `}</style>
    </div>
  );
}
function VariableItem({ v, onCopy }: { v: Variable; onCopy: () => void }) {
  return (
    <div
      onClick={onCopy}
      className="group flex items-center justify-between px-2.5 py-2 rounded-lg border border-neutral-100 dark:border-neutral-800/50 bg-white dark:bg-neutral-900/50 hover:border-primary/30 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-sm"
    >
      <div className="flex flex-col gap-0.5 overflow-hidden">
        <code className="text-[9px] font-black text-primary group-hover:text-primary transition-colors leading-tight">
          {`{{${v.path}}}`}
        </code>
        <span className="text-[8px] text-neutral-400 font-medium truncate max-w-[120px] italic">
          {typeof v.example === 'object' ? '{...}' : String(v.example || 'Empty')}
        </span>
      </div>
      <IconCopy className="h-2.5 w-2.5 text-neutral-300 group-hover:text-primary transition-colors flex-shrink-0" />
    </div>
  );
}
