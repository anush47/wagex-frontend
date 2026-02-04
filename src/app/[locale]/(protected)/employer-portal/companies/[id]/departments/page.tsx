"use client";

import { use } from "react";
import { DepartmentsTab } from "../details/components/DepartmentsTab";
import { CompanyService } from "@/services/company.service";
import { useEffect, useState } from "react";
import { Company } from "@/types/company";

export default function DepartmentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [company, setCompany] = useState<Company | null>(null);

    useEffect(() => {
        if (id) {
            CompanyService.getCompany(id).then(res => {
                const data = (res.data as any)?.data || res.data;
                if (data) setCompany(data);
            });
        }
    }, [id]);

    if (!company) return null;

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 relative pb-24">
            <DepartmentsTab company={company} />
        </div>
    );
}
