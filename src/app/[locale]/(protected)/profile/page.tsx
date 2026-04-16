"use client";

import React, { useState } from "react";
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
    IconShieldLock,
    IconUserCircle
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function ProfilePage() {
    const { user, updateProfile, isProfileLoading } = useAuthStore();
    const t = useTranslations("Common");
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || user?.nameWithInitials || "",
        address: user?.address || "",
        phone: user?.phone || ""
    });

    const isEmployerOrAdmin = user?.role === "EMPLOYER" || user?.role === "ADMIN";

    const handleSave = async () => {
        const payload: any = { fullName: formData.fullName, nameWithInitials: formData.fullName };
        if (isEmployerOrAdmin) {
            payload.address = formData.address;
            payload.phone = formData.phone;
        }
        const success = await updateProfile(payload);
        if (success) {
            setIsEditing(false);
        }
    };

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
            label: "Email",
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
            label: "Joined",
            value: user.created_at ? format(new Date(user.created_at), "MMMM yyyy") : "N/A",
            color: "text-pink-500 bg-pink-500/10"
        }
    ];

    return (
        <div className="w-full max-w-5xl mx-auto py-6 space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconUserCircle className="h-5 w-5" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            My Profile
                        </h1>
                    </div>
                    <p className="text-neutral-500 font-medium text-sm">
                        Manage your account information and security settings.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* User Identity Card */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border border-neutral-200 dark:border-white/10 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-neutral-900/50 p-8 text-center space-y-6 h-fit shadow-neutral-200/50 dark:shadow-none">
                        <div className="relative mx-auto w-32 h-32">
                            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative h-32 w-32 rounded-[2rem] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-5xl font-black text-primary border-4 border-background shadow-xl">
                                {(user.fullName?.[0] || user.nameWithInitials?.[0] || user.email?.[0] || "U").toUpperCase()}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight truncate">
                                {user.fullName || user.nameWithInitials || "Account User"}
                            </h2>
                            <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest opacity-60">
                                {user.role}
                            </p>
                        </div>
                        <Badge variant="outline" className="rounded-full px-4 py-1 font-black text-[10px] uppercase border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
                            Active Account
                        </Badge>
                    </Card>

                    <Card className="border border-neutral-200 dark:border-white/10 rounded-[2rem] p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                                <IconShieldLock className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight">Security</h3>
                                <p className="text-[10px] text-neutral-500 font-medium leading-none">Password & Access</p>
                            </div>
                        </div>
                        <p className="text-xs text-neutral-500 font-medium">Keep your account secure by regularly updating your password.</p>
                        <Button 
                            onClick={() => setShowPasswordDialog(true)}
                            className="w-full rounded-xl h-11 font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/10 hover:scale-[1.02] transition-transform"
                        >
                            Change Password
                        </Button>
                    </Card>
                </div>

                {/* Details Section */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="border border-neutral-200 dark:border-white/10 shadow-sm rounded-[2.5rem] bg-white dark:bg-neutral-900/50 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <IconUser className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight">Personal Details</CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isProfileLoading}>
                                                Cancel
                                            </Button>
                                            <Button size="sm" onClick={handleSave} disabled={isProfileLoading}>
                                                {isProfileLoading ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button variant="outline" size="sm" onClick={() => {
                                            setFormData({
                                                fullName: user?.fullName || user?.nameWithInitials || "",
                                                address: user?.address || "",
                                                phone: user?.phone || ""
                                            });
                                            setIsEditing(true);
                                        }}>
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            {isEditing ? (
                                <div className="space-y-4 max-w-md mt-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Name</label>
                                        <Input 
                                            value={formData.fullName} 
                                            onChange={e => setFormData(f => ({ ...f, fullName: e.target.value }))}
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    {isEmployerOrAdmin && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Address</label>
                                                <Input 
                                                    value={formData.address} 
                                                    onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                                                    placeholder="Your Address"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Phone</label>
                                                <Input 
                                                    value={formData.phone} 
                                                    onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                                                    placeholder="Your Phone Number"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {infoItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-100/50 dark:bg-white/5 border border-transparent hover:border-neutral-200 dark:hover:border-white/10 transition-all group">
                                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", item.color)}>
                                                {item.icon}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-black uppercase text-neutral-400 tracking-widest mb-0.5">{item.label}</p>
                                                <div className="flex items-center gap-2">
                                                    {item.badge ? (
                                                        <Badge className="h-5 font-black text-[9px] uppercase bg-primary/10 text-primary border-none">
                                                            {item.value}
                                                        </Badge>
                                                    ) : (
                                                        <p className="text-sm font-bold truncate text-neutral-700 dark:text-neutral-200">{item.value}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
            
            <ChangePasswordDialog 
                open={showPasswordDialog} 
                onOpenChange={setShowPasswordDialog} 
            />
        </div>
    );
}
