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

      Handlebars.registerHelper('eq', (a, b) => a === b);

      const template = Handlebars.compile(html);
      setRendered(template(data));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [html, data]);

  if (error) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="p-6 rounded-[2rem] bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-black font-mono shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-5 w-5 rounded-lg bg-red-500 text-white flex items-center justify-center">!</div>
            <h4 className="uppercase tracking-widest italic tracking-tighter">Template Schema Error</h4>
          </div>
          <p className="pl-8 opacity-80 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900/60 rounded-[2rem] border-2 border-neutral-100 dark:border-neutral-800 overflow-hidden flex flex-col shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-500">
      <div className="bg-white/80 dark:bg-neutral-950/40 backdrop-blur-2xl border-b border-neutral-100 dark:border-neutral-800 p-6 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-lg bg-primary/20 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            </div>
            <span className="text-[11px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-[0.2em] italic">Live Preview Engine v1.0</span>
         </div>
         <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-3 w-3 rounded-full bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-3 w-3 rounded-full bg-neutral-100 dark:bg-neutral-800" />
         </div>
      </div>
      <div className="flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-900/30 p-12 custom-scrollbar flex flex-col items-center">
        <style dangerouslySetInnerHTML={{ __html: css || "" }} />
        <div 
          className="preview-container bg-white text-neutral-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] mx-auto p-1 origin-top transition-all duration-700 hover:scale-[1.01]"
          dangerouslySetInnerHTML={{ __html: rendered }} 
        />
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; }
      `}</style>
    </div>
  );
}
