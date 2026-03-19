import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconDownload, IconReceiptTax, IconSearch, IconAdjustments } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";

export function EpfDocumentsTab() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 max-w-md w-full">
                    <div className="relative w-full">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                        <Input placeholder="Search EPF filings..." className="pl-9 h-11 rounded-xl" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-wider">
                        <IconAdjustments className="mr-2 h-4 w-4" />
                        Contribution Filters
                    </Button>
                </div>
            </div>

            <Card className="rounded-2xl border-none bg-neutral-50 dark:bg-neutral-900 shadow-none overflow-hidden">
                <CardHeader className="bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700/50 px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <IconReceiptTax className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold">EPF Form C Reports</CardTitle>
                                <p className="text-xs text-neutral-500 font-medium">Generate EPF C and C3 forms for bank submission</p>
                            </div>
                        </div>
                        <Button className="h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg bg-primary hover:bg-primary/90">
                            Download Forms
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="h-16 w-16 rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                        <IconDownload className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h3 className="font-bold text-lg">EPF Data Unavailable</h3>
                    <p className="text-neutral-500 text-sm max-w-xs mx-auto mt-2 font-medium">
                        Please ensure salary calculations for the selected month are completed first.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
