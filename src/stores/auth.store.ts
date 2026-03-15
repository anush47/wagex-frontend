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
    isLoading: boolean; // Main initialization/auth loading
    isProfileLoading: boolean; // Just for background profile fetching
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
    isProfileLoading: false,
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
                // Register global API error interceptor once
                backendApiClient.addErrorInterceptor(async (error) => {
                    if (error.statusCode === 401) {
                        if (error.message === 'User inactive') {
                            logger.warn('API returned 401 User Inactive, updating store state');
                            const { session, user } = get();
                            if (session && user?.active !== false) {
                                set({
                                    user: {
                                        ...(user || {}),
                                        id: session.user.id,
                                        email: session.user.email || user?.email || '',
                                        active: false,
                                        role: user?.role || 'EMPLOYEE' as any
                                    } as UserProfile
                                });
                            }
                        } else {
                            // Only sign out if we are not already in the middle of a sign-in or initialized
                            // and the error is a genuine session expiration
                            logger.error('API returned 401 Unauthorized, signing out');
                            get().signOut();
                        }
                    }
                });

                try {
                    set({ isLoading: true, error: null });
                    const session = await authService.getSession();

                    if (session) {
                        backendApiClient.setAuthToken(session.access_token);

                        // Fetch backend profile data
                        const profileResult = await authService.getProfile();

                        let userProfile: UserProfile | null = null;

                        if (profileResult.data) {
                            userProfile = {
                                ...profileResult.data,
                                email: profileResult.data.email || session.user.email || ''
                            };
                            logger.info('Auth initialized with existing session and profile');
                        } else if (profileResult.error) {
                            // Handle inactive user error (401)
                            if (profileResult.error.statusCode === 401 && profileResult.error.message === 'User inactive') {
                                logger.warn('Inactive user session detected');
                                // The backend now allows /users/me for inactive users
                                const freshProfile = await authService.getProfile();
                                userProfile = freshProfile.data;

                                // Fallback: if freshProfile failed but we know user is inactive
                                if (!userProfile) {
                                    userProfile = {
                                        id: session.user.id,
                                        email: session.user.email!,
                                        active: false,
                                        role: 'EMPLOYEE' as any // Default role, will be corrected on next fetch if possible
                                    };
                                }
                            } else {
                                logger.error('Failed to fetch profile during store initialization', profileResult.error);
                            }
                        }

                        set({
                            session,
                            user: userProfile,
                            isAuthenticated: !!session,
                            isLoading: false,
                            isProfileLoading: false,
                        });
                    } else {
                        set({ ...initialState, isLoading: false, isProfileLoading: false });
                        backendApiClient.setAuthToken(null);
                        logger.info('No existing session found');
                    }
                } catch (error) {
                    logger.error('Auth initialization failed', error);
                    set({ ...initialState, isLoading: false, isProfileLoading: false });
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
                        // Check if this is an inactive user who actually got signed in but profile fetch failed with 401
                        // This case is actually handled inside authService.signIn now, returning error: null and profile.
                        // But we should double check here.
                        set({
                            error: error.message,
                            isLoading: false,
                            isAuthenticated: false,
                        });
                        throw error;
                    }

                    // Extra check: if we have a session but profile is still null, it might be an inactive user
                    let finalProfile = profile;
                    if (session && !finalProfile) {
                         // This shouldn't happen with the new authService but as a failsafe:
                         finalProfile = {
                             id: session.user.id,
                             email: session.user.email!,
                             active: false,
                             role: 'EMPLOYEE' as any
                         };
                    }

                    set({
                        user: finalProfile,
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
                const currentSession = get().session;
                
                // If the user changed, we should probably set isProfileLoading if we don't have a profile yet
                const userChanged = session?.user.id !== currentSession?.user.id;
                
                set((state) => ({
                    session,
                    user: user || (userChanged ? null : state.user),
                    isAuthenticated: !!session,
                    // If we have a session but no profile and user changed, it's effectively profile-loading
                    isProfileLoading: !!session && !user && userChanged ? true : state.isProfileLoading,
                }));

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
                    set({ isProfileLoading: true });
                    const profileResult = await authService.getProfile();
                    if (profileResult.data) {
                        set({ 
                            user: {
                                ...profileResult.data,
                                // Fallback to session email if backend doesn't have it (though it should)
                                email: profileResult.data.email || session.user.email || ''
                            }, 
                            isProfileLoading: false 
                        });
                    } else if (profileResult.error) {
                        // Handle inactive user error (401)
                        if (profileResult.error.statusCode === 401 && profileResult.error.message === 'User inactive') {
                            set({
                                isProfileLoading: false,
                                user: {
                                    id: session.user.id,
                                    email: session.user.email!,
                                    active: false,
                                    role: 'EMPLOYEE' as any
                                }
                            });
                        } else {
                            set({ isProfileLoading: false });
                        }
                    } else {
                        set({ isProfileLoading: false });
                    }
                } catch (error) {
                    logger.error('Failed to fetch profile', error);
                    set({ isProfileLoading: false });
                }
            },
        }),
        { name: 'AuthStore' }
    )
);

