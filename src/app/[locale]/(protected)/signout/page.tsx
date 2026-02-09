"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";
import { IconLogout, IconArrowLeft, IconMoodSad } from "@tabler/icons-react";
import { motion } from "framer-motion";

export default function SignoutPage() {
    // const t = useTranslations("Auth"); 
    const router = useRouter();
    const { signOut } = useAuthStore();
    const { user } = useAuthStore();

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] w-full p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-2xl bg-white dark:bg-neutral-900 rounded-[2rem] overflow-hidden">
                    <CardContent className="p-0">
                        <div className="relative h-32 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-grid-black/[0.05] dark:bg-grid-white/[0.05]" />
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <IconMoodSad className="w-20 h-20 text-neutral-300 dark:text-neutral-600" stroke={1.5} />
                            </motion.div>
                        </div>

                        <div className="p-8 md:p-10 space-y-8 text-center">
                            <div className="space-y-3">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-neutral-900 dark:text-white">
                                    Leaving so soon?
                                </h1>
                                <p className="text-neutral-500 dark:text-neutral-400 font-medium text-lg max-w-xs mx-auto leading-relaxed">
                                    We'll miss you, <span className="font-bold text-neutral-800 dark:text-neutral-200">{user?.email?.split('@')[0]}</span>! Are you sure you want to sign out?
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <Button
                                    variant="destructive"
                                    size="lg"
                                    className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg hover:translate-y-0.5 active:translate-y-1 transition-all"
                                    onClick={handleSignOut}
                                >
                                    <IconLogout className="w-6 h-6 mr-3" />
                                    Yes, Sign Me Out
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full h-14 rounded-2xl font-bold text-lg border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                                    onClick={() => router.back()}
                                >
                                    <IconArrowLeft className="w-5 h-5 mr-3" />
                                    No, Take Me Back
                                </Button>
                            </div>

                            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                                Hope to see you back soon
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
