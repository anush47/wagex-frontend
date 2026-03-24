import React from "react";
import * as Handlebars from "handlebars";

interface LivePreviewProps {
  html: string;
  css?: string;
  data: any;
}

export function LivePreview({ html, css, data }: LivePreviewProps) {
  const [rendered, setRendered] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      // Register helpers
      Handlebars.registerHelper('formatCurrency', (value) => {
        if (typeof value !== 'number') return value;
        return new Intl.NumberFormat('en-LK', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      });

      Handlebars.registerHelper('formatDate', (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString();
      });

      const template = Handlebars.compile(html);
      setRendered(template(data));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [html, data]);

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold font-mono">
        Template Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden flex flex-col shadow-inner">
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 p-3 flex items-center justify-between">
         <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest italic">Live Preview</span>
         <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <div className="h-2 w-2 rounded-full bg-green-400" />
         </div>
      </div>
      <div className="flex-1 overflow-auto bg-white p-8 group">
        <style dangerouslySetInnerHTML={{ __html: css || "" }} />
        <div 
          className="preview-container shadow-2xl mx-auto origin-top transition-transform"
          dangerouslySetInnerHTML={{ __html: rendered }} 
        />
      </div>
    </div>
  );
}
