"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    IconUsers, 
    IconSearch,
    IconLoader2,
    IconChevronDown,
    IconChevronRight,
    IconBuildingSkyscraper,
    IconUser,
    IconMapPin,
    IconPhone,
    IconAlertTriangle
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { EmployeeService } from "@/services/employee.service";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Role mapping
const ROLES = ["EMPLOYER", "ADMIN", "EMPLOYEE"];

export default function UsersPage() {
    const t = useTranslations("Common");
    const [search, setSearch] = useState("");
    const [selectedRole, setSelectedRole] = useState("EMPLOYER");

    return (
        <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Admin Portal</p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
                        Users Management
                    </h1>
                    <p className="text-neutral-500 font-bold">
                        Approve registrations and manage platform access hierarchy.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="mb-8 p-1 bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                    <TabsTrigger value="pending" className="rounded-xl font-bold uppercase tracking-widest text-[10px]">
                        Pending Approvals
                    </TabsTrigger>
                    <TabsTrigger value="users" className="rounded-xl font-bold uppercase tracking-widest text-[10px]">
                        All Users
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-0">
                    <UsersPanel active={false} role={null} search={search} setSearch={setSearch} />
                </TabsContent>

                <TabsContent value="users" className="mt-0">
                    <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
                        {ROLES.map((role) => (
                            <Button 
                                key={role}
                                variant={selectedRole === role ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedRole(role)}
                                className={cn(
                                    "rounded-full font-black text-[10px] uppercase tracking-widest",
                                    selectedRole !== role && "text-neutral-500"
                                )}
                            >
                                {role}
                            </Button>
                        ))}
                    </div>
                    <UsersPanel active={null} role={selectedRole} search={search} setSearch={setSearch} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function UsersPanel({ active, role, search, setSearch }: { active: boolean | null, role: string | null, search: string, setSearch: (s: string) => void }) {
    const { data: usersResponse, isLoading } = useQuery({
        queryKey: ['admin-users', { active, role, search }],
        queryFn: async () => {
            const query: any = {};
            if (active !== null) query.active = active;
            if (role) query.role = role;
            if (search) query.search = search;
            return userService.getUsers(query);
        }
    });

    const users = usersResponse?.data?.data || [];

    return (
        <Card className="rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 overflow-hidden shadow-sm">
            <CardHeader className="p-8 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <IconUsers className="h-5 w-5" />
                        </div>
                        {active === false ? "Review Queue" : "Registered Accounts"}
                    </CardTitle>
                    <div className="relative w-full sm:w-72">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="pl-9 h-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm font-medium"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <IconLoader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center opacity-50 px-4">
                        <div className="h-16 w-16 rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                            <IconUsers className="h-8 w-8 text-neutral-400" />
                        </div>
                        <p className="text-sm font-black text-neutral-500 uppercase tracking-widest">No matching records found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                        {users.map((user: any) => (
                            <UserRow key={user.id} user={user} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function UserRow({ user }: { user: any }) {
    const [expanded, setExpanded] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const queryClient = useQueryClient();
    
    // Toggle active status wrapper
    const handleToggleStatus = async () => {
        const payload = { active: !user.active };
        const res = await userService.updateUser(user.id, payload);
        if (res.data) {
            toast.success(`User set to ${payload.active ? 'ACTIVE' : 'INACTIVE'}`);
            setShowStatusDialog(false);
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        } else {
            toast.error(res.error?.message || "Failed to update user status");
            setShowStatusDialog(false);
        }
    };

    return (
        <div className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
            <div 
                className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-14 w-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-black text-neutral-500 shrink-0 border border-neutral-200 dark:border-neutral-700">
                        {(user.fullName?.[0] || user.nameWithInitials?.[0] || user.email[0]).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                                {user.fullName || user.nameWithInitials || "Unnamed User"}
                            </h3>
                            <Badge className={cn("rounded-[4px] px-2 py-0 h-5 font-black text-[9px] uppercase tracking-widest border-none text-white", 
                                user.active ? "bg-emerald-500" : "bg-orange-500"
                            )}>
                                {user.active ? 'Active' : 'Pending'}
                            </Badge>
                        </div>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2 truncate">
                            {user.email}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            {user.phone && (
                                <div className="flex items-center gap-1.5 text-neutral-500">
                                    <IconPhone className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-medium">{user.phone}</span>
                                </div>
                            )}
                            {user.address && (
                                <div className="flex items-center gap-1.5 text-neutral-500 max-w-[200px] truncate">
                                    <IconMapPin className="h-3.5 w-3.5 shrink-0" />
                                    <span className="text-[10px] font-medium truncate">{user.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                    <Button 
                        variant={user.active ? "outline" : "default"} 
                        size="sm" 
                        onClick={() => setShowStatusDialog(true)}
                        className={cn("rounded-xl h-9 px-4 font-black text-[10px] uppercase tracking-wider",
                            !user.active && "bg-emerald-500 hover:bg-emerald-600 text-white"
                        )}
                    >
                        {user.active ? 'Suspend/Disable' : 'Approve Access'}
                    </Button>
                    <ConfirmationDialog 
                        open={showStatusDialog}
                        onOpenChange={setShowStatusDialog}
                        title="Change Access Level"
                        description={<span>You are about to change the active status for <strong>{user.email}</strong>. {user.active ? 'This will revoke their access to the platform immediately.' : 'This will grant them full access based on their role.'}</span>}
                        icon={<IconAlertTriangle className="h-8 w-8" />}
                        actionLabel="Confirm Action"
                        cancelLabel="Cancel"
                        onAction={handleToggleStatus}
                        variant={user.active ? "destructive" : "default"}
                    />
                    
                    {(user.role === 'EMPLOYER' && user.memberships?.length > 0) && (
                        <div className={cn("h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center transition-transform", expanded && "rotate-180")}>
                            <IconChevronDown className="h-4 w-4 text-neutral-500" />
                        </div>
                    )}
                </div>
            </div>
            
            <AnimatePresence>
                {expanded && (user.role === 'EMPLOYER' && user.memberships?.length > 0) && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/30 border-t border-neutral-100 dark:border-neutral-800/50"
                    >
                        <div className="p-6 md:p-8 pl-10 md:pl-24 space-y-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Managed Companies & Hierarchy</p>
                            {user.memberships?.length === 0 ? (
                                <p className="text-xs text-neutral-500 font-medium italic">No companies managed by this user yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {user.memberships.map((membership: any) => (
                                        <CompanyHierarchy key={membership.id} company={membership.company} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function CompanyHierarchy({ company }: { company: any }) {
    const { data: employeesResponse, isLoading } = useQuery({
        queryKey: ['company-employees', company.id],
        queryFn: () => EmployeeService.getEmployees({ companyId: company.id })
    });
    const employees = employeesResponse?.data?.data || [];

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-700/50 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <IconBuildingSkyscraper className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{company.name}</h4>
                <Badge variant="outline" className="ml-auto rounded-full font-black text-[8px] uppercase tracking-widest bg-white dark:bg-neutral-800">
                    {isLoading ? '...' : `${employees.length} Staff`}
                </Badge>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {isLoading ? (
                    <div className="col-span-full py-4 text-center">
                        <IconLoader2 className="h-4 w-4 text-neutral-400 animate-spin mx-auto" />
                    </div>
                ) : employees.length === 0 ? (
                    <div className="col-span-full py-4 text-center">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">No employees found.</p>
                    </div>
                ) : (
                    employees.map((emp: any) => (
                        <EmployeeCard key={emp.id} employee={emp} companyId={company.id} />
                    ))
                )}
            </div>
        </div>
    );
}

function EmployeeCard({ employee, companyId }: { employee: any, companyId: string }) {
    return (
        <Link 
            href={`/employer-portal/companies/${companyId}/employees/${employee.id}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group cursor-pointer bg-white dark:bg-transparent"
        >
            <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <IconUser className="h-4 w-4 text-neutral-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-neutral-900 dark:text-neutral-200 truncate">{employee.firstName} {employee.lastName}</p>
                <p className="text-[9px] font-black uppercase text-neutral-400 tracking-widest truncate">{employee.designation || "Staff"}</p>
            </div>
            <IconChevronRight className="h-4 w-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}
