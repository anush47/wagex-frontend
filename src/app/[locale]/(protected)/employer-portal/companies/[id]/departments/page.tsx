"use client";

import { use } from "react";
import { useCompany } from "@/hooks/use-companies";
import { DepartmentsTab } from "../details/components/DepartmentsTab";

export default function DepartmentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: company, isLoading } = useCompany(id);

    if (isLoading || !company) {
        return (
            <div className="w-full max-w-7xl mx-auto py-6 space-y-8 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                    <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                </div>
                <div className="space-y-4">
                    <div className="h-20 w-full bg-neutral-100 dark:bg-neutral-900 rounded-[1.5rem]" />
                    <div className="h-20 w-full bg-neutral-100 dark:bg-neutral-900 rounded-[1.5rem]" />
                    <div className="h-20 w-full bg-neutral-100 dark:bg-neutral-900 rounded-[1.5rem]" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 relative pb-24">
            <DepartmentsTab company={company} />
        </div>
    );
}
