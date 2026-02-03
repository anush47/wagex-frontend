'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen bg-background py-12 px-4 flex flex-col items-center justify-center">
            <div className="max-w-4xl mx-auto space-y-8 text-center">
                <h1 className="text-6xl font-bold text-foreground tracking-tight">
                    WageX
                </h1>
                <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                    Simplifying payroll and workforce management.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link href="/dev/authtoken">
                        <Button size="lg" variant="outline">
                            Go to Dev Auth Consoles
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
