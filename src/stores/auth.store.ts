import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';
import { authService } from '@/services/auth.service';
import { logger } from '@/lib/utils/logger';
import { backendApiClient } from '@/lib/api/client';
import type { LoginCredentials, UserProfile } from '@/types/user';

/**
 * Authentication store state interface
 */
interface AuthState {
    user: UserProfile | null;
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
    setSession: (session: Session | null, user: UserProfile | null) => void;
    getAccessToken: () => string | null;
    initialize: () => Promise<void>;
    fetchProfile: () => Promise<void>;
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
                        backendApiClient.setAuthToken(session.access_token);

                        // Fetch backend profile data
                        const profileResult = await authService.getProfile();

                        let userProfile: UserProfile | null = null;

                        if (profileResult.data) {
                            userProfile = profileResult.data;
                            logger.info('Auth initialized with existing session and profile');
                        } else if (profileResult.error) {
                            // Handle inactive user error (401)
                            if (profileResult.error.statusCode === 401 && profileResult.error.message === 'User inactive') {
                                logger.warn('Inactive user session detected');
                                userProfile = {
                                    id: session.user.id,
                                    email: session.user.email!,
                                    active: false,
                                    role: 'EMPLOYEE' as any
                                };
                            } else {
                                logger.error('Failed to fetch profile during store initialization', profileResult.error);
                            }
                        }

                        set({
                            session,
                            user: userProfile,
                            isAuthenticated: !!session,
                            isLoading: false,
                        });
                    } else {
                        set({ ...initialState, isLoading: false });
                        backendApiClient.setAuthToken(null);
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

                    const { user: sbUser, profile, session, error } = await authService.signIn(credentials);

                    if (error) {
                        set({
                            error: error.message,
                            isLoading: false,
                            isAuthenticated: false,
                        });
                        throw error;
                    }

                    set({
                        user: profile,
                        session,
                        isAuthenticated: !!session,
                        isLoading: false,
                        error: null,
                    });

                    if (session) {
                        backendApiClient.setAuthToken(session.access_token);
                    }
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
                    backendApiClient.setAuthToken(null);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            /**
             * Set session manually (for auth state changes)
             */
            setSession: (session: Session | null, user: UserProfile | null) => {
                set({
                    session,
                    user,
                    isAuthenticated: !!session,
                });

                backendApiClient.setAuthToken(session?.access_token || null);
            },

            /**
             * Get current access token
             */
            getAccessToken: () => {
                const { session } = get();
                return session?.access_token || null;
            },

            /**
             * Fetch latest profile from backend
             */
            fetchProfile: async () => {
                const { session } = get();
                if (!session) return;

                try {
                    const profileResult = await authService.getProfile();
                    if (profileResult.data) {
                        set({ user: profileResult.data });
                    } else if (profileResult.error) {
                        // Handle inactive user error (401)
                        if (profileResult.error.statusCode === 401 && profileResult.error.message === 'User inactive') {
                            set({
                                user: {
                                    id: session.user.id,
                                    email: session.user.email!,
                                    active: false,
                                    role: 'EMPLOYEE' as any
                                }
                            });
                        }
                    }
                } catch (error) {
                    logger.error('Failed to fetch profile', error);
                }
            },
        }),
        { name: 'AuthStore' }
    )
);

