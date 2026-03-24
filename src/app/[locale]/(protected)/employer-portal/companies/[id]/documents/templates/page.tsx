"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { TemplatesGallery } from "../components/TemplatesGallery";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";

export default function TemplatesPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  return (
    <div className="w-full flex flex-col min-h-screen bg-white dark:bg-neutral-950 p-6 space-y-6 antialiased">
      {/* Slim Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="rounded-none h-8 px-0 text-neutral-400 hover:text-black dark:hover:text-primary flex items-center gap-2"
            >
                <IconArrowLeft className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
            </Button>
            <div className="h-4 w-px bg-neutral-200 dark:border-neutral-800" />
            <h1 className="text-xs font-bold uppercase tracking-widest text-foreground opacity-60">Layout Library</h1>
        </div>
      </div>

      <TemplatesGallery companyId={companyId} />
    </div>
  );
}
