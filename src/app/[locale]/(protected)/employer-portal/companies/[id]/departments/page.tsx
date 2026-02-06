"use client";

import { use } from "react";
import { useCompany } from "@/hooks/use-companies";
import { DepartmentsTab } from "../details/components/DepartmentsTab";

export default function DepartmentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: company, isLoading } = useCompany(id);

    if (isLoading || !company) return null;

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 relative pb-24">
            <DepartmentsTab company={company} />
        </div>
    );
}
