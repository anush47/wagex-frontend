"use client";

import { use } from "react";
import { IconClipboardList } from "@tabler/icons-react";
import { PoliciesManagement } from "./components/PoliciesManagement";

export default function PoliciesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 md:space-y-10 relative pb-24 h-full flex flex-col">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                            <IconClipboardList className="h-5 w-5" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            Company Policies
                        </h1>
                    </div>
                    <p className="text-neutral-500 font-medium text-sm">
                        Manage your company's policy templates and automation rules.
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <PoliciesManagement companyId={id} />
            </div>
        </div>
    );
}
