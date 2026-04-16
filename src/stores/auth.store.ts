import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { authService } from '@/services/auth.service';
import { logger } from '@/lib/utils/logger';
import { backendApiClient } from '@/lib/api/client';
import type { LoginCredentials, UserProfile } from '@/types/user';

/**
 * Authentication store state interface
 */
interface AuthState {
    user: UserProfile | null;
    session: any | null;
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
    signUp: (credentials: LoginCredentials) => Promise<void>;
    signOut: () => Promise<void>;
    setSession: (session: any | null, user: UserProfile | null) => void;
    getAccessToken: () => string | null;
    initialize: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
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
                        // Use case-insensitive check and substring matching for robustness
                        const msg = error.message?.toLowerCase() || '';
                        if (msg.includes('inactive') || msg.includes('pending')) {
                            logger.warn('API returned 401 User Inactive, updating store state');
                            const { session, user } = get();
                            if (session && user?.active !== false) {
                                set({
                                    user: {
                                        ...(user || {}),
                                        id: session.userId || user?.id || '',
                                        email: user?.email || session.user?.email || '',
                                        active: false,
                                        role: user?.role || 'EMPLOYER' as any
                                    } as UserProfile
                                });
                            }
                        } else {
                            logger.error('API returned 401 Unauthorized, signing out', { message: error.message });
                            // Avoid signing out if we are just loading
                            if (!get().isLoading) {
                                get().signOut();
                            }
                        }
                    }
                });

                try {
                    set({ isLoading: true, error: null });
                    const session = await authService.getSession();

                    if (session) {
                        const token = session.token || session.sessionToken;
                        if (token) {
                            backendApiClient.setAuthToken(token);
                        }

                        // Fetch backend profile data (suppress toast)
                        const profileResult = await authService.getProfile({ suppressToast: true });

                        let userProfile: UserProfile | null = null;

                        if (profileResult.data) {
                            userProfile = {
                                ...profileResult.data,
                                email: profileResult.data.email || session.user?.email || ''
                            };
                            logger.info('Auth initialized with existing session and profile');
                        } else if (profileResult.error) {
                            // Handle incomplete profile (403)
                            if (profileResult.error.statusCode === 403 && profileResult.error.message === 'PROFILE_INCOMPLETE') {
                                logger.info('User authenticated but profile incomplete');
                                userProfile = null; // Forces AuthGuard to registration step
                            }
                            // Handle inactive but complete user (401)
                            else if (profileResult.error.statusCode === 401) {
                                const msg = profileResult.error.message?.toLowerCase() || '';
                                if (msg.includes('inactive')) {
                                    logger.info('Inactive user session detected during initialization');
                                    userProfile = {
                                        id: session.userId || session.user?.id || '',
                                        email: session.user?.email || '',
                                        active: false,
                                        role: 'EMPLOYER' as any
                                    };
                                }
                            }
                        }

                        set({
                            session,
                            user: userProfile,
                            isAuthenticated: true, // If session exists, we are authenticated
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

                    const { user: authUser, profile, session, error } = await authService.signIn(credentials);

                    if (error) {
                        // Special handling for incomplete profiles: we ARE authenticated in the auth system, 
                        // just missing the backend profile. Setting isAuthenticated ensures the GuestGuard 
                        // picks up the change and redirects to the registration form.
                        if (error.message === 'REGISTRATION_REQUIRED' && session) {
                            set({
                                session,
                                user: null, 
                                isAuthenticated: true,
                                isLoading: false,
                                error: null,
                            });
                        } else {
                            set({
                                error: error.message,
                                isLoading: false,
                                isAuthenticated: false,
                            });
                        }
                        throw error;
                    }

                    // Process profile
                    let finalProfile = profile;
                    if (session && !finalProfile) {
                         finalProfile = {
                             id: session.userId || authUser?.id,
                             email: authUser?.email || '',
                             active: false,
                             role: 'EMPLOYER' as any
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
                        const token = session.token || session.sessionToken;
                        if (token) {
                            backendApiClient.setAuthToken(token);
                        }
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            /**
             * Sign up with credentials
             */
            signUp: async (credentials: LoginCredentials) => {
                try {
                    set({ isLoading: true, error: null });

                    const { user: authUser, session, error } = await authService.signUp(credentials);

                    if (error) {
                        set({
                            error: error.message,
                            isLoading: false,
                            isAuthenticated: false,
                        });
                        throw error;
                    }

                    // Initial profile state after signup (waiting for step 2)
                    const initialProfile = {
                        id: session?.userId || authUser?.id || '',
                        email: authUser?.email || '',
                        active: false,
                        role: 'EMPLOYER' as any
                    };

                    set({
                        user: initialProfile,
                        session,
                        isAuthenticated: !!session,
                        isLoading: false,
                        error: null,
                    });

                    if (session) {
                        const token = session.token || session.sessionToken;
                        if (token) {
                            backendApiClient.setAuthToken(token);
                        }
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
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
            setSession: (session: any | null, user: UserProfile | null) => {
                const currentSession = get().session;
                const userChanged = (session?.userId || session?.user?.id) !== (currentSession?.userId || currentSession?.user?.id);
                
                set((state) => ({
                    session,
                    user: user || (userChanged ? null : state.user),
                    isAuthenticated: !!session,
                    isProfileLoading: !!session && !user && userChanged ? true : state.isProfileLoading,
                }));

                const token = session?.token || session?.sessionToken;
                backendApiClient.setAuthToken(token || null);
            },

            /**
             * Get current access token
             */
            getAccessToken: () => {
                const { session } = get();
                return session?.token || session?.sessionToken || null;
            },

            /**
             * Fetch latest profile from backend
             */
            fetchProfile: async () => {
                const { session, user: currentUser } = get();
                if (!session) return;

                try {
                    set({ isProfileLoading: true });
                    const profileResult = await authService.getProfile({ suppressToast: true });
                    
                    if (profileResult.data) {
                        set({ 
                            user: {
                                ...profileResult.data,
                                email: profileResult.data.email || currentUser?.email || session.user?.email || ''
                            }, 
                            isAuthenticated: true,
                            isProfileLoading: false 
                        });
                    } else if (profileResult.error) {
                        // Handle inactive user error (401)
                        const msg = profileResult.error.message?.toLowerCase() || '';
                        if (profileResult.error.statusCode === 401 && msg.includes('inactive')) {
                            set({
                                isProfileLoading: false,
                                isAuthenticated: true,
                                user: {
                                    ...(currentUser || {}),
                                    id: session.userId || session.user?.id || '',
                                    email: currentUser?.email || session.user?.email || '', 
                                    active: false,
                                    role: currentUser?.role || 'EMPLOYER' as any
                                } as UserProfile
                            });
                        } else if (profileResult.error.statusCode === 403 && profileResult.error.message === 'PROFILE_INCOMPLETE') {
                            set({ user: null, isAuthenticated: true, isProfileLoading: false });
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

            /**
             * Update user profile via api and store
             */
            updateProfile: async (data: Partial<UserProfile>) => {
                set({ isProfileLoading: true });
                const { data: profile } = await authService.updateProfile(data);
                if (profile) {
                    const { user, session } = get();
                    set({ 
                        user: {
                            ...profile,
                            email: profile.email || user?.email || session?.user?.email || ''
                        },
                        isProfileLoading: false 
                    });
                    return true;
                }
                set({ isProfileLoading: false });
                return false;
            },
        }),
        { name: 'AuthStore' }
    )
);
