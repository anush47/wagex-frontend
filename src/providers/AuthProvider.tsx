'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { getSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

/**
 * Auth provider that initializes auth state and listens to auth changes
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const initialize = useAuthStore((state) => state.initialize);
    const setSession = useAuthStore((state) => state.setSession);

    useEffect(() => {
        // Initialize auth state
        initialize();

        // Listen to auth state changes
        const supabase = getSupabaseClient();
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            logger.debug('Auth state changed', { event });
            setSession(session, session?.user || null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [initialize, setSession]);

    return <>{children}</>;
}
