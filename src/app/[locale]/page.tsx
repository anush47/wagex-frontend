'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import {
    IconWallet, IconArrowRight, IconChecks,
    IconFingerprint, IconShieldCheck, IconCash,
    IconCalendarTime, IconUserCircle, IconX,
    IconMail, IconPhone,
} from '@tabler/icons-react';
import { useAuthStore } from '@/stores/auth.store';

export default function Home() {
    const t = useTranslations("Common");
    const { isAuthenticated, user } = useAuthStore();

    const isInactive = isAuthenticated && user?.active === false;
    const portalHref = isInactive
        ? "/pending-review"
        : (user?.role === 'EMPLOYEE' ? "/employee-portal/dashboard" : "/employer-portal/dashboard");

    const problems = [
        t("landing.problems.p1"),
        t("landing.problems.p2"),
        t("landing.problems.p3"),
        t("landing.problems.p4"),
        t("landing.problems.p5"),
        t("landing.problems.p6"),
    ];

    const features = [
        {
            icon: <IconWallet className="h-6 w-6" />,
            title: t("landing.features.payroll.title"),
            desc: t("landing.features.payroll.desc"),
            delay: 0.05,
        },
        {
            icon: <IconFingerprint className="h-6 w-6" />,
            title: t("landing.features.attendance.title"),
            desc: t("landing.features.attendance.desc"),
            delay: 0.1,
        },
        {
            icon: <IconUserCircle className="h-6 w-6" />,
            title: t("landing.features.selfservice.title"),
            desc: t("landing.features.selfservice.desc"),
            delay: 0.15,
        },
        {
            icon: <IconShieldCheck className="h-6 w-6" />,
            title: t("landing.features.statutory.title"),
            desc: t("landing.features.statutory.desc"),
            delay: 0.2,
        },
        {
            icon: <IconCash className="h-6 w-6" />,
            title: t("landing.features.advances.title"),
            desc: t("landing.features.advances.desc"),
            delay: 0.25,
        },
        {
            icon: <IconCalendarTime className="h-6 w-6" />,
            title: t("landing.features.leaves.title"),
            desc: t("landing.features.leaves.desc"),
            delay: 0.3,
        },
    ];

    return (
        <div className="min-h-screen bg-background selection:bg-primary/10">
            <LandingHeader />

            <main>
                {/* ── Hero ─────────────────────────────────────────────── */}
                <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-28 px-4">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl -z-10" />

                    <div className="container mx-auto max-w-5xl text-center space-y-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6"
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                <IconChecks className="h-4 w-4" />
                                Built for Sri Lankan Businesses
                            </span>
                            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tight italic leading-[1.1]">
                                {t("landing.hero.title")}
                            </h1>
                            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
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
                                    <Button size="lg" className="rounded-full h-14 px-10 text-base shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all group">
                                        {t("landing.hero.cta_portal")}
                                        <IconArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/register">
                                    <Button size="lg" className="rounded-full h-14 px-10 text-base shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all group">
                                        {t("landing.hero.cta_login")}
                                        <IconArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            )}
                            <a href="#contact">
                                <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-base hover:bg-neutral-50 dark:hover:bg-neutral-900 border-2">
                                    {t("landing.contact.title")}
                                </Button>
                            </a>
                        </motion.div>

                        {/* Dashboard preview */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="relative mt-8 md:mt-16 max-w-5xl mx-auto px-2 sm:px-4"
                        >
                            <div className="rounded-2xl md:rounded-[2.5rem] border border-neutral-200/50 dark:border-neutral-800/50 p-1.5 md:p-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm shadow-2xl overflow-hidden group">
                                <div className="rounded-xl md:rounded-[1.5rem] overflow-hidden bg-neutral-100 dark:bg-neutral-800 aspect-[16/10] sm:aspect-video relative">
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

                {/* ── Diagonal separator: hero → problems ──────────────── */}
                <div className="overflow-hidden leading-none -mb-px">
                    <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="block w-full h-12 md:h-14 fill-neutral-100 dark:fill-neutral-900">
                        <polygon points="0,56 1440,0 1440,56" />
                    </svg>
                </div>

                {/* ── Problems ─────────────────────────────────────────── */}
                <section className="py-16 pb-24 px-4 bg-neutral-100 dark:bg-neutral-900">
                    <div className="container mx-auto max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-10 space-y-3"
                        >
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight italic text-foreground">
                                {t("landing.problems.title")}
                            </h2>
                            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
                                {t("landing.problems.subtitle")}
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {problems.map((problem, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: idx % 2 === 0 ? -12 : 12 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: idx * 0.07 }}
                                    className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm"
                                >
                                    <IconX className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                                    <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">{problem}</p>
                                </motion.div>
                            ))}
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="text-center text-muted-foreground text-sm mt-8 font-medium"
                        >
                            WageX solves every single one of these.
                        </motion.p>
                    </div>
                </section>

                {/* ── Diagonal separator: problems → features ───────────── */}
                <div className="overflow-hidden leading-none -mt-px">
                    <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="block w-full h-12 md:h-14 fill-neutral-50/50 dark:fill-neutral-950/50">
                        <polygon points="0,0 1440,56 0,56" />
                    </svg>
                </div>

                {/* ── Features ─────────────────────────────────────────── */}
                <section id="features" className="py-16 pb-24 px-4 bg-neutral-50/50 dark:bg-neutral-950/50">
                    <div className="container mx-auto max-w-6xl">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16 space-y-4"
                        >
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase italic text-foreground">
                                {t("landing.features.title")}
                            </h2>
                            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                                {t("landing.features.subtitle")}
                            </p>
                            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((f, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: f.delay }}
                                    className="p-7 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group"
                                >
                                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5 bg-neutral-100 dark:bg-neutral-800 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                        {f.icon}
                                    </div>
                                    <h3 className="text-base font-bold mb-2 text-foreground">
                                        {f.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {f.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Diagonal separator: features → contact ────────────── */}
                <div className="overflow-hidden leading-none -mb-px">
                    <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="block w-full h-12 md:h-14 fill-neutral-100 dark:fill-neutral-900">
                        <polygon points="0,56 1440,0 1440,56" />
                    </svg>
                </div>

                {/* ── Let's Talk ───────────────────────────────────────── */}
                <section id="contact" className="py-16 pb-24 px-4 bg-neutral-100 dark:bg-neutral-900">
                    <div className="container mx-auto max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-center space-y-6"
                        >
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight italic text-foreground">
                                {t("landing.contact.title")}
                            </h2>
                            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                                {t("landing.contact.subtitle")}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                                <a
                                    href="mailto:anushangasharada@gmail.com"
                                    className="flex items-center gap-3 px-7 py-4 rounded-2xl bg-white dark:bg-neutral-800 text-foreground font-bold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors w-full sm:w-auto justify-center shadow-sm"
                                >
                                    <IconMail className="h-5 w-5 shrink-0 text-primary" />
                                    <div className="text-left">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{t("landing.contact.email_label")}</div>
                                        <div>anushangasharada@gmail.com</div>
                                    </div>
                                </a>
                                <a
                                    href="tel:+94717539478"
                                    className="flex items-center gap-3 px-7 py-4 rounded-2xl bg-white dark:bg-neutral-800 text-foreground font-bold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors w-full sm:w-auto justify-center shadow-sm"
                                >
                                    <IconPhone className="h-5 w-5 shrink-0 text-primary" />
                                    <div className="text-left">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{t("landing.contact.phone_label")}</div>
                                        <div>+94 71 753 9478</div>
                                    </div>
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* ── Footer ───────────────────────────────────────────────── */}
            <footer className="relative border-t border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-50/80 dark:bg-neutral-950/80">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="container mx-auto max-w-6xl px-6 py-8 md:py-10">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                        <Link href="/">
                            <Image
                                src="/images/wagex_logo_transparent.png"
                                alt="WageX"
                                width={300}
                                height={128}
                                className="object-contain dark:invert"
                            />
                        </Link>
                        <div className="flex flex-col items-center md:items-end gap-3">
                            <nav className="flex items-center gap-8">
                                <Link href="/privacy" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
                                    Privacy
                                </Link>
                                <Link href="/terms" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
                                    Terms
                                </Link>
                            </nav>
                            <p className="text-neutral-400 dark:text-neutral-600 text-[11px] font-bold uppercase tracking-[0.18em]">
                                &copy; {new Date().getFullYear()} WageX. {t("landing.footer.rights")}
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
