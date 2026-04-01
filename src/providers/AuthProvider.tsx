'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { logger } from '@/lib/utils/logger';

/**
 * Auth provider that initializes auth state
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
        // Initialize auth state
        logger.info('Initializing Auth Provider');
        initialize();
    }, [initialize]);

    return <>{children}</>;
}
