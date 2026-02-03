'use client';

import { type ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from "@/components/ui/sonner";

/**
 * Root provider combining all context providers with theme support
 */
export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <QueryProvider>
                <AuthProvider>
                    {children}
                    <Toaster position="top-right" expand={false} richColors />
                </AuthProvider>
            </QueryProvider>
        </ThemeProvider>
    );
}
