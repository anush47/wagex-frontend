'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ReactNode } from 'react';

/**
 * Theme provider for dark mode support using next-themes
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </NextThemesProvider>
    );
}
