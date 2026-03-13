"use client";

import React from "react";
import { IconReceiptTax } from "@tabler/icons-react";

export const TaxTab = () => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 text-left">
                <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight uppercase text-foreground/90">Tax Contributions (Payee)</h3>
                    <p className="text-neutral-500 font-medium text-xs">Manage monthly PAYE / APIT tax submissions</p>
                </div>
            </div>
            
            <div className="rounded-[2.5rem] border-2 border-dashed border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 p-24 flex flex-col items-center justify-center text-center gap-6">
                <div className="h-20 w-20 rounded-[2rem] bg-white dark:bg-neutral-800 shadow-xl flex items-center justify-center text-primary/20">
                    <IconReceiptTax className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Coming Soon</h4>
                    <p className="text-sm font-bold text-neutral-400 max-w-[280px]">
                        We are currently perfecting the tax management module to support PAYE and APIT calculations automatically.
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary/20 animate-pulse" />
                    <span className="h-2 w-2 rounded-full bg-primary/40 animate-pulse delay-75" />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-pulse delay-150" />
                </div>
            </div>
        </div>
    );
};
