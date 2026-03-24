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
    const recurse = (obj: any, path: string = "") => {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          recurse(obj[key], currentPath);
        } else {
          res.push({ path: currentPath, example: obj[key] });
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
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-widest italic flex items-center gap-2">
          <IconVariable className="h-3 w-3" /> Available Variables
        </h3>
        <Badge variant="secondary" className="bg-primary/10 text-primary dark:bg-primary/20 text-[9px] font-black tracking-widest uppercase py-0.5 px-2 rounded-lg">
          {filtered.length} Total
        </Badge>
      </div>

      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
        <Input 
          placeholder="Filter variables..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 text-xs font-bold bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700/50 focus:bg-neutral-50 dark:focus:bg-neutral-800 transition-all rounded-xl dark:text-neutral-200"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="h-10 w-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
               <IconVariable className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />
            </div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest">
              {search ? "No matching variables" : "No variables discovered"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {filtered.map((v) => (
              <div
                key={v.path}
                onClick={() => copyToClipboard(v.path)}
                className="group flex items-center justify-between p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800/50 bg-white dark:bg-neutral-900/50 hover:border-primary/30 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 cursor-pointer transition-all shadow-sm"
              >
                <div className="flex flex-col gap-1 overflow-hidden">
                  <code className="text-[11px] font-bold text-primary group-hover:text-primary transition-colors italic leading-tight">
                    {`{{${v.path}}}`}
                  </code>
                  <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium truncate max-w-[180px]">
                    Ex: {typeof v.example === 'object' ? JSON.stringify(v.example) : String(v.example)}
                  </span>
                </div>
                <IconCopy className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            ))}
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
