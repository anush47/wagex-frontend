import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import { authService } from '@/services/auth.service';
import { logger } from '@/lib/utils/logger';
import type { LoginCredentials } from '@/types/auth';

/**
 * Authentication store state interface
 */
interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

/**
 * Authentication store actions interface
 */
interface AuthActions {
    signIn: (credentials: LoginCredentials) => Promise<void>;
    signOut: () => Promise<void>;
    setSession: (session: Session | null, user: User | null) => void;
    getAccessToken: () => string | null;
    initialize: () => Promise<void>;
}

/**
 * Combined auth store type
 */
type AuthStore = AuthState & AuthActions;

/**
 * Initial state
 */
const initialState: AuthState = {
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
};

/**
 * Zustand auth store with devtools
 */
export const useAuthStore = create<AuthStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            /**
             * Initialize auth state from existing session
             */
            initialize: async () => {
                try {
                    set({ isLoading: true, error: null });
                    const session = await authService.getSession();

                    if (session) {
                        set({
                            session,
                            user: session.user,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                        logger.info('Auth initialized with existing session');
                    } else {
                        set({ ...initialState, isLoading: false });
                        logger.info('No existing session found');
                    }
                } catch (error) {
                    logger.error('Auth initialization failed', error);
                    set({ ...initialState, isLoading: false });
                }
            },

            /**
             * Sign in with credentials
             */
            signIn: async (credentials: LoginCredentials) => {
                try {
                    set({ isLoading: true, error: null });

                    const { user, session, error } = await authService.signIn(credentials);

                    if (error) {
                        set({
                            error: error.message,
                            isLoading: false,
                            isAuthenticated: false,
                        });
                        throw error;
                    }

                    set({
                        user,
                        session,
                        isAuthenticated: !!session,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            /**
             * Sign out current user
             */
            signOut: async () => {
                try {
                    set({ isLoading: true, error: null });

                    const { error } = await authService.signOut();

                    if (error) {
                        set({ error: error.message, isLoading: false });
                        throw error;
                    }

                    set({ ...initialState, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            /**
             * Set session manually (for auth state changes)
             */
            setSession: (session: Session | null, user: User | null) => {
                set({
                    session,
                    user,
                    isAuthenticated: !!session,
                });
            },

            /**
             * Get current access token
             */
            getAccessToken: () => {
                const { session } = get();
                return session?.access_token || null;
            },
        }),
        { name: 'AuthStore' }
    )
);
