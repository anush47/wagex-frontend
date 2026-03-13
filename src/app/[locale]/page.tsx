'use client';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { IconWallet, IconUsers, IconCalendarCheck, IconArrowRight, IconChecks } from '@tabler/icons-react';
import { useAuthStore } from '@/stores/auth.store';

export default function Home() {
    const t = useTranslations("Common");
    const { isAuthenticated, user } = useAuthStore();

    const portalHref = user?.role === 'EMPLOYEE' ? "/employee-portal/dashboard" : "/employer-portal/dashboard";

    const features = [
        {
            title: t("landing.features.payroll.title"),
            desc: t("landing.features.payroll.desc"),
            icon: <IconWallet className="h-6 w-6 text-primary" />,
            delay: 0.1
        },
        {
            title: t("landing.features.employees.title"),
            desc: t("landing.features.employees.desc"),
            icon: <IconUsers className="h-6 w-6 text-emerald-500" />,
            delay: 0.2
        },
        {
            title: t("landing.features.attendance.title"),
            desc: t("landing.features.attendance.desc"),
            icon: <IconCalendarCheck className="h-6 w-6 text-blue-500" />,
            delay: 0.3
        }
    ];

    return (
        <div className="min-h-screen bg-background selection:bg-primary/10">
            <LandingHeader />

            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-32 px-4">
                    {/* Background Blobs */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl -z-10" />

                    <div className="container mx-auto max-w-6xl text-center space-y-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6"
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                <IconChecks className="h-4 w-4" />
                                Smart Workforce Management
                            </span>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tight italic">
                                {t("landing.hero.title")}
                            </h1>
                            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                                {t("landing.hero.subtitle")}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            {isAuthenticated ? (
                                <Link href={portalHref}>
                                    <Button size="lg" className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all group">
                                        {t("landing.hero.cta_portal")}
                                        <IconArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/login">
                                    <Button size="lg" className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all group">
                                        {t("landing.hero.cta_login")}
                                        <IconArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            )}
                            <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 border-2">
                                Learn More
                            </Button>
                        </motion.div>

                        {/* Visual Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="relative mt-16 max-w-5xl mx-auto"
                        >
                            <div className="rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 p-2 md:p-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm shadow-2xl overflow-hidden group">
                                <div className="rounded-[1.25rem] overflow-hidden bg-neutral-100 dark:bg-neutral-800 aspect-video relative">
                                    <img
                                        src="/images/hero-visual.png"
                                        alt="WageX Dashboard"
                                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 px-4 bg-neutral-50/50 dark:bg-neutral-950/50 border-y border-neutral-200/50 dark:border-neutral-800/50">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase italic text-foreground">
                                {t("landing.features.title")}
                            </h2>
                            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: feature.delay }}
                                    className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 hover:shadow-xl hover:shadow-primary/5 transition-all group"
                                >
                                    <div className="h-14 w-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-primary/5">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-foreground italic">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-neutral-200/50 dark:border-neutral-800/50">
                <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm" />
                        <span className="font-black italic tracking-tighter text-xl">WageX</span>
                    </div>

                    <p className="text-muted-foreground text-sm">
                        &copy; {new Date().getFullYear()} WageX. {t("landing.footer.rights")}
                    </p>

                    <nav className="flex items-center gap-6">
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
