import { getSupabaseClient } from '@/lib/supabase/client';
import { backendApiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import type { LoginCredentials } from '@/types/auth';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Authentication service handling Supabase auth operations
 */
export class AuthService {
    async signIn(credentials: LoginCredentials): Promise<{
        user: User | null;
        session: Session | null;
        error: Error | null;
    }> {
        try {
            logger.info('Signing in user', { email: credentials.email });

            const supabase = getSupabaseClient();
            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password,
            });

            if (error) {
                logger.error('Sign in failed', error);
                return { user: null, session: null, error };
            }

            if (data.session) {
                // Set auth token for backend API calls
                backendApiClient.setAuthToken(data.session.access_token);
                logger.info('Sign in successful', { userId: data.user?.id });

                // Check if user exists in backend DB by trying to get current user
                const profileResponse = await backendApiClient.get('/users/me');

                if (profileResponse.error) {
                    // Check if this is the expected "registration required" response
                    if (profileResponse.error.statusCode === 403 && profileResponse.error.message === 'User registration required') {
                        logger.info('User exists in Supabase but not in backend DB. Needs registration.');
                        return { user: data.user, session: data.session, error: new Error('REGISTRATION_REQUIRED') };
                    }
                    // For other errors, return them
                    logger.error('Failed to fetch user profile', profileResponse.error);
                    return { user: null, session: null, error: new Error(profileResponse.error.message || 'Failed to verify user') };
                }

                logger.info('User profile found in backend DB');
            }

            return { user: data.user, session: data.session, error: null };
        } catch (error) {
            logger.error('Sign in error', error);
            return {
                user: null,
                session: null,
                error: error instanceof Error ? error : new Error('Unknown error'),
            };
        }
    }

    /**
     * Sign up with email and password
     */
    async signUp(credentials: LoginCredentials): Promise<{
        user: User | null;
        session: Session | null;
        error: Error | null;
    }> {
        try {
            logger.info('Signing up user', { email: credentials.email });

            const supabase = getSupabaseClient();
            const { data, error } = await supabase.auth.signUp({
                email: credentials.email,
                password: credentials.password,
            });

            if (error) {
                logger.error('Sign up failed', error);
                return { user: null, session: null, error };
            }

            if (data.session) {
                backendApiClient.setAuthToken(data.session.access_token);
            }

            return { user: data.user, session: data.session, error: null };
        } catch (error) {
            logger.error('Sign up error', error);
            return {
                user: null,
                session: null,
                error: error instanceof Error ? error : new Error('Unknown error'),
            };
        }
    }

    /**
     * Register user in backend database
     */
    async register(data: any): Promise<{ success: boolean; error: Error | null }> {
        try {
            logger.info('Registering user profile in backend');
            await backendApiClient.post('/auth/register', data);
            return { success: true, error: null };
        } catch (error) {
            logger.error('Backend registration failed', error);
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error'),
            };
        }
    }

    /**
     * Sign out current user
     */
    async signOut(): Promise<{ error: Error | null }> {
        try {
            logger.info('Signing out user');

            const supabase = getSupabaseClient();
            const { error } = await supabase.auth.signOut();

            if (error) {
                logger.error('Sign out failed', error);
                return { error };
            }

            // Clear auth token from backend API client
            backendApiClient.setAuthToken(null);
            logger.info('Sign out successful');

            return { error: null };
        } catch (error) {
            logger.error('Sign out error', error);
            return {
                error: error instanceof Error ? error : new Error('Unknown error'),
            };
        }
    }

    /**
     * Get current session
     */
    async getSession(): Promise<Session | null> {
        try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                logger.error('Get session failed', error);
                return null;
            }

            if (data.session) {
                // Ensure backend API client has the token
                backendApiClient.setAuthToken(data.session.access_token);
            }

            return data.session;
        } catch (error) {
            logger.error('Get session error', error);
            return null;
        }
    }

    /**
     * Get current access token
     */
    getAccessToken(): string | null {
        // This will be called from the store
        return null; // Placeholder - will be implemented in the store
    }
}

/**
 * Singleton instance of AuthService
 */
export const authService = new AuthService();
