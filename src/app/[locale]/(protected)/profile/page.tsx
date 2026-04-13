"use client";

import React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    IconUser, 
    IconMail, 
    IconShieldCheck, 
    IconCalendarMonth,
    IconMapPin,
    IconPhone,
    IconShieldLock
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";
import { useState } from "react";

export default function ProfilePage() {
    const { user } = useAuthStore();
    const t = useTranslations("Common");
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);

    if (!user) {
        return (
            <div className="flex items-center justify-center p-20 font-bold text-muted-foreground animate-pulse">
                {t("loading")}
            </div>
        );
    }

    const infoItems = [
        {
            icon: <IconMail className="h-5 w-5" />,
            label: "Email Address",
            value: user.email,
            color: "text-blue-500 bg-blue-500/10"
        },
        {
            icon: <IconShieldCheck className="h-5 w-5" />,
            label: "Role",
            value: user.role || "N/A",
            badge: true,
            color: "text-purple-500 bg-purple-500/10"
        },
        {
            icon: <IconMapPin className="h-5 w-5" />,
            label: "Address",
            value: user.address || "Not provided",
            color: "text-orange-500 bg-orange-500/10"
        },
        {
            icon: <IconPhone className="h-5 w-5" />,
            label: "Phone",
            value: user.phone || "Not provided",
            color: "text-emerald-500 bg-emerald-500/10"
        },
        {
            icon: <IconCalendarMonth className="h-5 w-5" />,
            label: "Member Since",
            value: user.created_at ? format(new Date(user.created_at), "MMMM yyyy") : "N/A",
            color: "text-pink-500 bg-pink-500/10"
        }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto py-10 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header Section */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-neutral-900 p-10 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                    <div className="h-28 w-28 rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-5xl font-black text-primary border-4 border-background shadow-xl">
                        {(user.fullName?.[0] || user.nameWithInitials?.[0] || user.email?.[0] || "U").toUpperCase()}
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tighter uppercase">
                                {user.fullName || user.nameWithInitials || "Account Profile"}
                            </h1>
                            <Badge className={cn(
                                "mx-auto md:mx-0 h-6 rounded-lg text-[10px] uppercase font-bold border-none",
                                user.active !== false ? "bg-emerald-500/10 text-emerald-600" : "bg-neutral-100 text-neutral-400"
                            )}>
                                {user.active !== false ? "Active Session" : "Inactive"}
                            </Badge>
                        </div>
                        <p className="text-neutral-500 font-bold text-sm tracking-widest uppercase">
                            Global Identification Passport
                        </p>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
                <Card className="md:col-span-2 border-none shadow-none bg-transparent">
                    <CardHeader className="px-0">
                        <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-neutral-400">
                            <IconUser className="h-5 w-5" />
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {infoItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 hover:shadow-lg hover:shadow-primary/5 transition-all group overflow-hidden relative">
                                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", item.color)}>
                                    {item.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">{item.label}</p>
                                    {item.badge ? (
                                        <Badge variant="outline" className="mt-1 font-black text-[10px] uppercase bg-primary/5 text-primary border-primary/20">
                                            {item.value}
                                        </Badge>
                                    ) : (
                                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{item.value}</p>
                                    )}
                                </div>
                                <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                    {React.cloneElement(item.icon as React.ReactElement, { className: "h-24 w-24" })}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-none shadow-none bg-transparent">
                    <CardHeader className="px-0">
                        <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-neutral-400">
                            <IconShieldCheck className="h-5 w-5" />
                            Security & Access
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                            <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700">
                                <IconShieldLock className="h-48 w-48" />
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-[1.5rem] bg-orange-500/10 flex items-center justify-center">
                                    <IconShieldLock className="h-8 w-8 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tight">Account Password</h3>
                                    <p className="text-xs text-neutral-500 font-medium">Reset your secure password to keep your account safe.</p>
                                </div>
                            </div>
                            <Button 
                                onClick={() => setShowPasswordDialog(true)}
                                className="w-full md:w-auto rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/10 hover:scale-[1.05] transition-transform"
                            >
                                Change Password
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <ChangePasswordDialog 
                open={showPasswordDialog} 
                onOpenChange={setShowPasswordDialog} 
            />
            
            {/* Footer Notice */}
            <div className="text-center p-8 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-700">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                    WageX Identity Management Systems
                </p>
            </div>
        </div>
    );
}
