"use client";

import React from "react";
import Handlebars from "handlebars";
import { cn } from "@/lib/utils";
import { IconFocusCentered, IconMinus, IconPlus, IconFileDescription } from "@tabler/icons-react";

interface LivePreviewProps {
  html: string;
  css?: string;
  data: any;
  config?: {
    paperSize?: string;
    orientation?: 'portrait' | 'landscape';
    perPage?: number;
  };
}

const PAPER_SIZES: Record<string, { w: number, h: number }> = {
  'A4': { w: 210, h: 297 },
  'A5': { w: 148, h: 210 },
  'A3': { w: 297, h: 420 },
  'LETTER': { w: 215.9, h: 279.4 },
};

const MM_TO_PX = 3.7795275591;

export function LivePreview({ html, css, data, config = { paperSize: 'A4', orientation: 'portrait', perPage: 1 } }: LivePreviewProps) {
  const [rendered, setRendered] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [scale, setScale] = React.useState(0.8);
  const [isAutoFit, setIsAutoFit] = React.useState(true);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const paperConfig = React.useMemo(() => {
    const size = PAPER_SIZES[config.paperSize || 'A4'] || PAPER_SIZES['A4'];
    const isLandscape = config.orientation === 'landscape';
    return {
      widthPx: Math.round((isLandscape ? size.h : size.w) * MM_TO_PX),
      heightPx: Math.round((isLandscape ? size.w : size.h) * MM_TO_PX),
    };
  }, [config.paperSize, config.orientation]);

  React.useEffect(() => {
    try {
      if (!html) {
        setRendered("");
        setError(null);
        return;
      }

      const engine = Handlebars.create();

      engine.registerHelper('formatCurrency', (value) => {
        if (typeof value !== 'number') return value;
        return new Intl.NumberFormat('en-LK', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      });

      engine.registerHelper('formatDate', (date) => {
        if (!date || (typeof date !== 'string' && typeof date !== 'number' && !(date instanceof Date))) return '';
        try { return new Date(date).toLocaleDateString(); } catch { return date; }
      });

      engine.registerHelper('eq', (a, b) => a === b);

      engine.registerHelper('add', (a, b) => (Number(a) || 0) + (Number(b) || 0));

      engine.registerHelper('chunk', function(array, size) {
        if (!Array.isArray(array)) return [];
        const chunkSize = typeof size === 'number' ? size : 20;
        const result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
          result.push(array.slice(i, i + chunkSize));
        }
        return result;
      });

      engine.registerHelper('getAmount', function(items, name) {
        if (!Array.isArray(items)) return 0;
        const searchName = typeof name === 'string' ? name : null;
        if (!searchName) return 0;
        const item = items.find((i: any) => i.name === searchName);
        return item ? item.amount : 0;
      });

      engine.registerHelper('getCustomTotal', function(totals, name) {
        if (!totals || typeof totals !== 'object') return 0;
        const searchName = typeof name === 'string' ? name : null;
        if (!searchName) return 0;
        return (totals as any)[searchName] || 0;
      });

      const template = engine.compile(html);
      const result = template(data || {});
      setRendered(result);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Layout Fault');
    }
  }, [html, data]);

  React.useEffect(() => {
    const updateScale = () => {
      if (isAutoFit && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 80;
        const contentWidth = paperConfig.widthPx;
        setScale(Math.min(containerWidth / contentWidth, 1.0));
      }
    };
    const timer = setTimeout(updateScale, 150);
    window.addEventListener('resize', updateScale);
    return () => { clearTimeout(timer); window.removeEventListener('resize', updateScale); };
  }, [rendered, isAutoFit, paperConfig.widthPx]);

  if (error) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="p-6 rounded-3xl bg-rose-50/[0.03] border-2 border-rose-500/20 text-rose-500 text-[11px] font-mono shadow-2xl backdrop-blur-xl">
           <div className="flex items-center gap-3 mb-2 font-black uppercase tracking-widest italic">
              <span className="h-5 w-5 bg-rose-500 text-white rounded flex items-center justify-center not-italic">!</span>
              Layout Error
           </div>
           <p className="pl-8 opacity-70 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-100 dark:bg-neutral-900/60 relative overflow-hidden">
      <div ref={containerRef} className="flex-1 overflow-auto p-12 custom-scrollbar relative">
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          className="flex flex-col items-center gap-12 shrink-0 pb-32"
        >
          {/* Main Template Content */}
          <div className="preview-content-wrapper">
             <style dangerouslySetInnerHTML={{ __html: css || "" }} />
             {/* 
                Industry Standard Preview Simulation:
                Since the HTML now contains explicit <div class="report-page"> blocks,
                we just render it all and let the CSS handle the shadow/card look in preview mode.
             */}
             <div dangerouslySetInnerHTML={{ __html: rendered }} />
          </div>
        </div>

        {/* Floating Zoom Controls */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-neutral-900/90 dark:bg-neutral-800/90 backdrop-blur-xl border border-neutral-800 dark:border-neutral-700 rounded-2xl p-1.5 shadow-2xl z-50 ring-1 ring-white/10">
          <button
            onClick={() => { setScale(s => Math.max(0.1, s - 0.1)); setIsAutoFit(false); }}
            className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-neutral-800 transition-all text-neutral-300 hover:text-white"
          >
            <IconMinus className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => { setIsAutoFit(!isAutoFit); if (!isAutoFit) setScale(0.8); }}
            className={cn(
              "h-9 px-4 flex items-center gap-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest leading-none",
              isAutoFit ? "bg-white text-black shadow-lg" : "hover:bg-neutral-800 text-neutral-400 hover:text-white"
            )}
          >
            <IconFocusCentered className="h-3 w-3" />
            {Math.round(scale * 100)}%
          </button>

          <button
            onClick={() => { setScale(s => Math.min(3, s + 0.1)); setIsAutoFit(false); }}
            className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-neutral-800 transition-all text-neutral-300 hover:text-white"
          >
            <IconPlus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
        
        /* Preview-specific overrides for .report-page */
        .preview-content-wrapper .report-page {
          margin: 0 auto;
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.2), 0 20px 40px -10px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.05);
          position: relative;
        }
        .preview-content-wrapper .report-page:not(:last-child) {
          margin-bottom: 40px;
        }

        /* Portrait/Landscape handled by paper config inside the template css but we ensure preview matches */
        .preview-content-wrapper .report-page {
            max-width: ${paperConfig.widthPx}px;
            width: ${paperConfig.widthPx}px;
            height: ${paperConfig.heightPx}px;
            overflow: hidden;
        }
      `}</style>
    </div>
  );
}
