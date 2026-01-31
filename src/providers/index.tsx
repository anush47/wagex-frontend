'use client';

import { type ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';

/**
 * Root provider combining all context providers with theme support
 */
export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <QueryProvider>
                <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
        </ThemeProvider>
    );
}
