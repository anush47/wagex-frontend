import React from "react";
import { Badge } from "@/components/ui/badge";
import { IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";

interface Variable {
  path: string;
  description?: string;
  example?: any;
}

export function VariableList({ variables }: { variables: any }) {
  const flattened = React.useMemo(() => {
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

  const copyToClipboard = (path: string) => {
    const tag = `{{${path}}}`;
    navigator.clipboard.writeText(tag);
    toast.success(`Copied ${tag} to clipboard`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest italic px-1">Available Variables</h3>
      <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto no-scrollbar p-1">
        {flattened.map((v) => (
          <div
            key={v.path}
            onClick={() => copyToClipboard(v.path)}
            className="group flex items-center justify-between p-2 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all"
          >
            <div className="flex flex-col">
              <code className="text-[11px] font-bold text-primary group-hover:text-primary transition-colors italic">
                {`{{${v.path}}}`}
              </code>
              <span className="text-[9px] text-neutral-400 font-medium truncate max-w-[150px]">
                Ex: {JSON.stringify(v.example)}
              </span>
            </div>
            <IconCopy className="h-3 w-3 text-neutral-300 group-hover:text-primary transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}
