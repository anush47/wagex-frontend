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
            logger.debug('Auth state changed', { event, userId: session?.user?.id });

            if (event === 'SIGNED_OUT') {
                setSession(null, null);
            } else if (session) {
                // IMPORTANT: Do NOT blindly overwrite our backend profile with the Supabase one
                // The backend profile contains critical fields like 'active' status.
                // We keep the existing profile if we have one for the same user.
                const currentState = useAuthStore.getState();
                const currentProfile = currentState.user;
                
                if (!currentProfile || currentProfile.id !== session.user.id) {
                    // Profile is missing or user changed, trigger a fetch
                    // but set the session immediately so isAuthenticated becomes true
                    setSession(session, currentProfile?.id === session.user.id ? currentProfile : null);
                    currentState.fetchProfile();
                } else {
                    // Just update session (token etc.) but keep the profile
                    setSession(session, currentProfile);
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [initialize, setSession]);

    return <>{children}</>;
}
