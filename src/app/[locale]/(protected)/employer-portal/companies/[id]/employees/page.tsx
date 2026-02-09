"use client";

import { use, useEffect, useState } from "react";
import { EmployeeService, EmployeeQuery } from "@/services/employee.service";
import { Employee, EmployeeStatus } from "@/types/employee";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";
import {
    IconUsers,
    IconPlus,
    IconFilter,
    IconSortAscending,
    IconId,
    IconMail,
    IconBuildingSkyscraper,
    IconBriefcase,
    IconUserBolt,
    IconChevronRight,
    IconX,
} from "@tabler/icons-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { DataLoadingOverlay } from "@/components/ui/data-loading-overlay";

import { useEmployees, useEmployee } from "@/hooks/use-employees";

export default function EmployeesListPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: companyId } = use(params);
    const t = useTranslations("Common");
    const [query, setQuery] = useState<EmployeeQuery>({
        companyId,
        status: "ACTIVE",
        sortBy: "employeeNo",
        sortOrder: "asc",
        search: ""
    });

    const {
        data: resp,
        isLoading,
        isFetching
    } = useEmployees(query);

    // Handle paginated response structure
    const employees = (resp as any)?.data || (Array.isArray(resp) ? resp : []);
    const meta = (resp as any)?.meta;

    const displayEmployees = employees;

    const updateQuery = (updates: Partial<EmployeeQuery>) => {
        setQuery(prev => ({ ...prev, ...updates }));
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconUsers className="h-5 w-5" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            Employees
                        </h1>
                    </div>
                    <p className="text-neutral-500 font-medium text-sm">
                        Manage your employees, roles, and employment configurations.
                    </p>
                </div>

                <Link href={`/employer-portal/companies/${companyId}/employees/new`} className="w-full md:w-auto">
                    <Button className="w-full md:w-auto rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <IconPlus className="mr-2 h-5 w-5" />
                        Add Employee
                    </Button>
                </Link>
            </div>

            {/* Search & Filter Bar */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:max-w-md">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                            <IconUsers className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or member ID..."
                            value={query.search || ""}
                            onChange={(e) => updateQuery({ search: e.target.value })}
                            className="w-full h-11 pl-11 pr-11 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                        />
                        {query.search && (
                            <button
                                onClick={() => updateQuery({ search: "" })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 transition-colors"
                            >
                                <IconX className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 items-center w-full md:w-auto ml-auto">
                        <Select
                            value={query.status}
                            onValueChange={(val) => updateQuery({ status: val })}
                        >
                            <SelectTrigger className="h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-neutral-200 dark:border-neutral-800">
                                <SelectItem value="ACTIVE">Active Only</SelectItem>
                                <SelectItem value="INACTIVE">Inactive Only</SelectItem>
                                <SelectItem value="SUSPENDED">Suspended Only</SelectItem>
                                <SelectItem value="ALL">All Employees</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={`${query.sortBy}-${query.sortOrder}`}
                            onValueChange={(val) => {
                                const [sortBy, sortOrder] = val.split('-');
                                updateQuery({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
                            }}
                        >
                            <SelectTrigger className="h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-neutral-200 dark:border-neutral-800">
                                <SelectItem value="employeeNo-asc">Member No (0-9)</SelectItem>
                                <SelectItem value="employeeNo-desc">Member No (9-0)</SelectItem>
                                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="relative min-h-[400px]">
                <DataLoadingOverlay isLoading={isFetching} />

                {isLoading && displayEmployees.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 p-6 space-y-6 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
                                    <div className="space-y-2 flex-1 pt-1">
                                        <div className="h-5 w-3/4 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                                        <div className="flex gap-2">
                                            <div className="h-4 w-16 bg-neutral-50 dark:bg-neutral-800/50 rounded-md" />
                                            <div className="h-4 w-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-md" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="h-2 w-16 bg-neutral-50 dark:bg-neutral-800/50 rounded" />
                                        <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-16 bg-neutral-50 dark:bg-neutral-800/50 rounded" />
                                        <div className="h-4 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between">
                                    <div className="h-4 w-32 bg-neutral-50 dark:bg-neutral-800/50 rounded-md" />
                                    <div className="h-8 w-8 rounded-full bg-neutral-50 dark:bg-neutral-800/50" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={cn(
                        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500",
                        isFetching && "blur-[1.5px] grayscale-[0.1]"
                    )}>
                        {displayEmployees.map((emp: Employee) => (
                            <Link key={emp.id} href={`/employer-portal/companies/${companyId}/employees/${emp.id}`}>
                                <Card className="group border border-neutral-200/50 dark:border-neutral-800/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgb(0,0,0,0.22)] bg-white/70 dark:bg-neutral-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-primary/20">
                                    <CardContent className="p-0">
                                        <div className="p-6 space-y-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4">
                                                    <div className="h-14 w-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl font-black text-neutral-400 group-hover:scale-110 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500">
                                                        {emp.nameWithInitials?.split(' ').map(n => n?.[0]).join('').slice(0, 2).toUpperCase() || "??"}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="font-black text-lg tracking-tight line-clamp-1">{emp.nameWithInitials || "Unnamed Employee"}</h3>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="h-5 rounded-lg font-mono text-[9px] uppercase tracking-tighter border-neutral-200 dark:border-neutral-800">
                                                                ID: {emp.employeeNo}
                                                            </Badge>
                                                            <Badge className={cn(
                                                                "h-5 rounded-lg text-[9px] uppercase tracking-tighter px-2 border-none font-bold",
                                                                emp.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600" : "bg-neutral-100 text-neutral-400"
                                                            )}>
                                                                {emp.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Designation / Role</p>
                                                    <div className="flex items-center gap-1.5 font-bold text-xs truncate max-w-full">
                                                        <IconBriefcase className="h-3 w-3 text-neutral-300 flex-shrink-0" />
                                                        <span className="truncate">{emp.designation || emp.employmentType}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Gender</p>
                                                    <div className="flex items-center gap-1.5 font-bold text-xs uppercase">
                                                        <IconUserBolt className="h-3 w-3 text-neutral-300" />
                                                        <span>{emp.gender}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-neutral-400">
                                                    <IconMail className="h-3.5 w-3.5" />
                                                    <span className="text-[10px] font-medium truncate max-w-[140px]">{emp.email || 'No email provided'}</span>
                                                </div>
                                                <div className="h-8 w-8 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center transition-transform group-hover:translate-x-1 duration-300">
                                                    <IconChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-primary transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}

                        {employees.length === 0 && !isLoading && (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[3rem]">
                                <div className="p-6 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-6">
                                    <IconUsers className="h-10 w-10 text-neutral-300" />
                                </div>
                                <h3 className="text-xl font-bold mb-1">No Employees Found</h3>
                                <p className="text-neutral-500 text-sm max-w-xs text-center font-medium">Try adjusting your filters or search query to find who you're looking for.</p>
                                <Button variant="ghost" className="mt-8 rounded-xl font-bold text-xs h-11 px-8 hover:bg-neutral-100" onClick={() => setQuery({ ...query, search: "", status: "ALL" })}>
                                    Clear All Filters
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}
