"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { EpfTab } from "./components/EpfTab";
import { EtfTab } from "./components/EtfTab";
import { TaxTab } from "./components/TaxTab";

export default function StatutoryPage() {
    const t = useTranslations("Common");
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const currentTab = searchParams.get("tab") || "epf";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Statutory</h1>
                <p className="text-muted-foreground">
                    Manage EPF, ETF and Tax contributions for your employees.
                </p>
            </div>

            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                    <TabsTrigger value="epf">EPF</TabsTrigger>
                    <TabsTrigger value="etf">ETF</TabsTrigger>
                    <TabsTrigger value="tax">Tax</TabsTrigger>
                </TabsList>
                <div className="mt-6">
                    <TabsContent value="epf">
                        <EpfTab />
                    </TabsContent>
                    <TabsContent value="etf">
                        <EtfTab />
                    </TabsContent>
                    <TabsContent value="tax">
                        <TaxTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
