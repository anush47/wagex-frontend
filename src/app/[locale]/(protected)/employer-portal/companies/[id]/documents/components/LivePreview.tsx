import React from "react";
import * as Handlebars from "handlebars";
import { cn } from "@/lib/utils";
import { IconFocusCentered, IconMinus, IconPlus } from "@tabler/icons-react";

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

export function LivePreview({ html, css, data, config = { paperSize: 'A4', orientation: 'portrait', perPage: 1 } }: LivePreviewProps) {
  const [rendered, setRendered] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [scale, setScale] = React.useState(0.8);
  const [isAutoFit, setIsAutoFit] = React.useState(true);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const paperConfig = React.useMemo(() => {
    const size = PAPER_SIZES[config.paperSize || 'A4'] || PAPER_SIZES['A4'];
    const isLandscape = config.orientation === 'landscape';
    return {
      width: isLandscape ? size.h : size.w,
      height: isLandscape ? size.w : size.h,
      unit: 'mm'
    };
  }, [config.paperSize, config.orientation]);

  React.useEffect(() => {
    try {
      if (!Handlebars.helpers.formatCurrency) {
        Handlebars.registerHelper('formatCurrency', (value) => {
          if (typeof value !== 'number') return value;
          return new Intl.NumberFormat('en-LK', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(value);
        });
      }

      if (!Handlebars.helpers.formatDate) {
        Handlebars.registerHelper('formatDate', (date) => {
          if (!date) return '';
          return new Date(date).toLocaleDateString();
        });
      }

      if (!Handlebars.helpers.eq) {
        Handlebars.registerHelper('eq', (a, b) => a === b);
      }

      const template = Handlebars.compile(html);
      setRendered(template(data));
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    }
  }, [html, data]);

  // Handle zoom to fit
  React.useEffect(() => {
    const updateScale = () => {
      if (isAutoFit && containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32;
        const containerHeight = containerRef.current.clientHeight - 32;
        const contentWidth = contentRef.current.scrollWidth;
        const contentHeight = contentRef.current.scrollHeight;

        const scaleX = containerWidth / contentWidth;
        const scaleY = containerHeight / contentHeight;
        const newScale = Math.min(scaleX, scaleY, 1.1);

        setScale(newScale);
      }
    };

    const timer = setTimeout(updateScale, 150); // Wait for render
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScale);
    };
  }, [rendered, config]);

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
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-neutral-100 dark:bg-neutral-900/40 relative">
      <div ref={containerRef} className="flex-1 overflow-auto p-4 flex items-center justify-center relative select-none custom-scrollbar">
        <div 
          ref={contentRef}
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
          className={cn(
             "preview-viewport transition-all duration-300 bg-neutral-200/50 p-px shadow-2xl shrink-0",
             config.perPage === 2 && "grid grid-cols-2 gap-1.5 p-1.5",
             config.perPage === 4 && "grid grid-cols-2 grid-rows-2 gap-1.5 p-1.5",
             config.perPage === 6 && "grid grid-cols-3 grid-rows-2 gap-1.5 p-1.5",
          )}
        >
            {/* Repeat the content based on perPage */}
            {Array.from({ length: config.perPage || 1 }).map((_, i) => (
                <div 
                    key={i} 
                    style={{ 
                        width: `${paperConfig.width}${paperConfig.unit}`, 
                        height: `${paperConfig.height}${paperConfig.unit}`,
                    }}
                    className={cn(
                        "bg-white relative overflow-hidden flex-shrink-0"
                    )}
                >
                    <style dangerouslySetInnerHTML={{ __html: css || "" }} />
                    <div 
                      className="preview-content h-full w-full"
                      style={{ boxSizing: 'border-box' }}
                      dangerouslySetInnerHTML={{ __html: rendered }} 
                    />
                </div>
            ))}
        </div>

        {/* Zoom Controls Bar - Docked Right */}
        <div className="absolute bottom-4 right-4 flex items-center gap-0.5 bg-neutral-900/95 dark:bg-neutral-800/90 backdrop-blur-md border border-neutral-800 dark:border-neutral-700 rounded-lg p-0.5 shadow-xl z-50 overflow-hidden ring-1 ring-white/5">
             <button 
                onClick={() => { setScale(s => Math.max(0.1, s - 0.1)); setIsAutoFit(false); }}
                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-neutral-800 transition-all text-neutral-400 hover:text-white"
             >
                <IconMinus className="h-3 w-3" />
             </button>
             
             <button 
                onClick={() => { setIsAutoFit(!isAutoFit); }}
                className={cn(
                    "h-6 px-2 flex items-center gap-1 rounded-md transition-all text-[8px] font-black uppercase tracking-tighter leading-none shadow-sm",
                    isAutoFit 
                      ? "bg-neutral-100 text-neutral-900" 
                      : "hover:bg-neutral-800 text-neutral-400 hover:text-white"
                )}
             >
                <IconFocusCentered className="h-2.5 w-2.5" />
                {Math.round(scale * 100)}%
             </button>

             <button 
                onClick={() => { setScale(s => Math.min(3, s + 0.1)); setIsAutoFit(false); }}
                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-neutral-800 transition-all text-neutral-400 hover:text-white"
             >
                <IconPlus className="h-3 w-3" />
             </button>
        </div>
      </div>
      
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-2 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            Logic Fault Detected: {error}
        </div>
      )}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; }
      `}</style>
    </div>
  );
}
