'use client';

import { LandingHeader } from '@/components/layout/LandingHeader';
import { Link } from '@/i18n/routing';

export function PrivacyContent() {
    return (
        <div className="space-y-10 text-sm leading-relaxed text-foreground/80">

            <section className="space-y-3">
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">1. Information We Collect</h2>
                <p>When you register and use WageX, we collect information you directly provide, including:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Account credentials (email address, password)</li>
                    <li>Business and company information (company name, registration numbers, address)</li>
                    <li>Employee records (names, NIC numbers, designations, salary information, attendance data)</li>
                    <li>Payroll data (salary components, EPF/ETF contributions, deductions)</li>
                    <li>Attendance events submitted via connected devices or manually entered</li>
                </ul>
                <p className="text-muted-foreground">We do not collect any data beyond what is necessary to operate the platform.</p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">2. How We Use Your Information</h2>
                <p>We use the information collected solely to:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Provide, operate, and maintain the WageX platform</li>
                    <li>Generate payslips, salary sheets, attendance reports, and statutory documents</li>
                    <li>Enable employee self-service functionality</li>
                    <li>Communicate service-related updates or critical notices</li>
                    <li>Improve platform functionality and user experience</li>
                </ul>
                <p className="text-muted-foreground">We do not sell, rent, trade, or share your data with any third party for marketing purposes.</p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">3. Data Storage and Security</h2>
                <p className="text-muted-foreground">
                    Your data is stored on secured servers. We implement reasonable technical and organisational measures to
                    protect your information against unauthorised access, loss, or misuse. However, <strong className="text-foreground">no
                    method of electronic storage or transmission over the internet is 100% secure</strong>. We cannot guarantee
                    absolute security, and you use the platform at your own risk.
                </p>
                <p className="text-muted-foreground">
                    You are solely responsible for maintaining the confidentiality of your account credentials and for all
                    activity that occurs under your account.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">4. Data Ownership</h2>
                <p className="text-muted-foreground">
                    All data you enter into WageX — including company data, employee records, and payroll information — remains
                    your data. WageX makes no claim of ownership over your data. You may export or request deletion of your
                    data at any time by contacting us.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">5. Third-Party Services</h2>
                <p className="text-muted-foreground">
                    WageX may use third-party services for infrastructure, hosting, or analytics. These services are
                    contractually bound to protect your data and are not permitted to use it for their own purposes.
                    We are not responsible for the privacy practices of any external sites or services linked to or from WageX.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">6. Cookies</h2>
                <p className="text-muted-foreground">
                    WageX uses essential cookies and session tokens necessary for the platform to function. We do not use
                    tracking cookies or advertising cookies of any kind.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">7. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Access the personal data we hold about you</li>
                    <li>Request correction of inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Withdraw consent at any time by ceasing use of the platform</li>
                </ul>
                <p className="text-muted-foreground">To exercise any of these rights, contact us at <a href="mailto:anushangasharada@gmail.com" className="underline hover:text-foreground">anushangasharada@gmail.com</a>.</p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">8. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                    To the maximum extent permitted by applicable law, WageX and its operators shall not be held liable for
                    any loss, damage, or claim arising from unauthorised access to your data, data breaches outside our
                    reasonable control, or misuse of the platform by you or any user on your account.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">9. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                    We may update this Privacy Policy from time to time. We will notify users of material changes by
                    updating the &quot;Last updated&quot; date at the top of this page. Continued use of the platform after
                    any changes constitutes your acceptance of the updated policy.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">10. Contact</h2>
                <p className="text-muted-foreground">
                    If you have any questions about this Privacy Policy, contact us at:<br />
                    <a href="mailto:anushangasharada@gmail.com" className="underline hover:text-foreground">anushangasharada@gmail.com</a><br />
                    <a href="tel:+94717539478" className="underline hover:text-foreground">+94 71 753 9478</a>
                </p>
            </section>

        </div>
    );
}

export default function PrivacyPage() {
    const lastUpdated = 'April 24, 2026';

    return (
        <div className="min-h-screen bg-background">
            <LandingHeader />

            <main className="container mx-auto max-w-3xl px-6 py-16 md:py-24">
                <div className="space-y-3 mb-12">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Last updated: {lastUpdated}</p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight italic">Privacy Policy</h1>
                    <p className="text-muted-foreground text-base leading-relaxed">
                        This Privacy Policy describes how WageX LK (&quot;WageX&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
                        collects, uses, and handles information when you use our platform. By using WageX, you agree to the terms of this policy.
                    </p>
                </div>

                <PrivacyContent />

                <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                    <Link href="/" className="text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}
