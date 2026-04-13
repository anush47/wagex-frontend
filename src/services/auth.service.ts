import { authClient } from '@/lib/auth-client';
import { backendApiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import type { LoginCredentials, UserProfile } from '@/types/user';
import { toast } from 'sonner';

/**
 * Authentication service handling Better Auth operations
 */
export class AuthService {
    async signIn(credentials: LoginCredentials): Promise<{
        user: any | null;
        profile: UserProfile | null;
        session: any | null;
        error: Error | null;
    }> {
        try {
            logger.info('Signing in user', { email: credentials.email });

            const { data, error } = await authClient.signIn.email({
                email: credentials.email,
                password: credentials.password,
            });

            if (error) {
                logger.error('Sign in failed', error);
                
                // Map Better Auth error codes to user-friendly messages
                let message = error.message || 'Sign in failed';
                if (error.code === 'INVALID_EMAIL_OR_PASSWORD') {
                    message = 'Invalid email or password. Please try again.';
                } else if (error.code === 'USER_NOT_FOUND') {
                    message = 'Account not found. Please register first.';
                }
                
                toast.error(message);
                return { user: null, profile: null, session: null, error: new Error(message) };
            }

            if (data) {
                const token = data.token || (data as any).session?.token;
                const user = data.user;
                
                if (token) {
                    // Set auth token for backend API calls
                    backendApiClient.setAuthToken(token);
                    logger.info('Sign in successful', { userId: user?.id });

                    // Fetch backend profile data (suppress toast here as we handle the error specifically)
                    const profileResult = await this.getProfile({ suppressToast: true });

                    if (profileResult.error) {
                        // Check if this is the expected "registration required" response
                        if (profileResult.error.statusCode === 403 && profileResult.error.message === 'PROFILE_INCOMPLETE') {
                            logger.info('User exists in Auth system but not in backend DB. Needs registration.');
                            return { user, profile: null, session: data, error: new Error('REGISTRATION_REQUIRED') };
                        }

                        // Handle other errors
                        logger.error('Failed to fetch user profile during sign in', profileResult.error);
                        return { user, profile: null, session: data, error: null }; // Authenticated but profile fetch failed
                    }

                    logger.info('User profile found in backend DB');
                    return { user, profile: profileResult.data || null, session: data, error: null };
                }
            }

            return { user: data?.user || null, profile: null, session: data || null, error: null };
        } catch (error) {
            logger.error('Sign in error', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(message);
            return {
                user: null,
                profile: null,
                session: null,
                error: error instanceof Error ? error : new Error('Unknown error'),
            };
        }
    }

    /**
     * Sign up with email and password
     */
    async signUp(credentials: LoginCredentials): Promise<{
        user: any | null;
        session: any | null;
        error: Error | null;
    }> {
        try {
            logger.info('Signing up user', { email: credentials.email });

            const { data, error } = await authClient.signUp.email({
                email: credentials.email,
                password: credentials.password,
                name: credentials.email.split('@')[0], // Default name
            });

            if (error) {
                logger.error('Sign up failed', error);
                
                let message = error.message || 'Sign up failed';
                if (error.code === 'USER_ALREADY_EXISTS') {
                    message = 'An account with this email already exists.';
                } else if (error.code === 'INVALID_EMAIL') {
                    message = 'Please provide a valid email address.';
                } else if (error.code === 'WEAK_PASSWORD') {
                    message = 'Password is too weak. Please use a stronger password.';
                }
                
                toast.error(message);
                return { user: null, session: null, error: new Error(message) };
            }

            if (data) {
                const token = data.token || (data as any).session?.token;
                if (token) {
                    backendApiClient.setAuthToken(token);
                }
            }

            return { user: data?.user || null, session: data || null, error: null };
        } catch (error) {
            logger.error('Sign up error', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(message);
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
            // Using the new endpoint
            const response = await backendApiClient.post('/auth/register-profile', data);
            
            if (response.error) {
                toast.error(response.error.message || 'Profile registration failed');
                return { success: false, error: new Error(response.error.message) };
            }

            return { success: true, error: null };
        } catch (error) {
            logger.error('Backend registration failed', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(message);
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

            const { error } = await authClient.signOut();

            if (error) {
                logger.error('Sign out failed', error);
                toast.error(error.message || 'Sign out failed');
                return { error: new Error(error.message || 'Sign out failed') };
            }

            // Clear auth token from backend API client
            backendApiClient.setAuthToken(null);
            logger.info('Sign out successful');

            return { error: null };
        } catch (error) {
            logger.error('Sign out error', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(message);
            return {
                error: error instanceof Error ? error : new Error('Unknown error'),
            };
        }
    }

    /**
     * Get current session
     */
    async getSession(): Promise<any | null> {
        try {
            const { data, error } = await authClient.getSession();

            if (error) {
                // We don't toast error here because background session checks are normal to fail
                logger.error('Get session failed', error);
                return null;
            }

            if (data && data.session) {
                // Ensure backend API client has the token
                backendApiClient.setAuthToken(data.session.token);
                return data.session;
            }

            return null;
        } catch (error) {
            logger.error('Get session error', error);
            return null;
        }
    }

    /**
     * Fetch user profile from backend
     */
    async getProfile(config: { suppressToast?: boolean } = {}): Promise<{ data: UserProfile | null; error: any | null }> {
        try {
            const response = await backendApiClient.get<UserProfile>('/users/me');
            if (response.error) {
                // Suppress toast for expected errors (like 401 Inactive or 403 Incomplete)
                if (!config.suppressToast) {
                    if (!(response.error.statusCode === 401 && response.error.message === 'User inactive') &&
                        !(response.error.statusCode === 403 && response.error.message === 'PROFILE_INCOMPLETE')) {
                        toast.error(response.error.message || 'Failed to fetch profile');
                    }
                }
                return { data: null, error: response.error };
            }
            return { data: response.data || null, error: null };
        } catch (error) {
            return { data: null, error: { message: 'Failed to fetch profile', statusCode: 500 } };
        }
    }

    /**
     * Change user password
     */
    async changePassword(data: { currentPassword?: string; newPassword: string; revokeOtherSessions?: boolean }): Promise<{ success: boolean; error: Error | null }> {
        try {
            logger.info('Changing user password');

            const { error } = await authClient.changePassword({
                newPassword: data.newPassword,
                currentPassword: data.currentPassword,
                revokeOtherSessions: data.revokeOtherSessions ?? true,
            });

            if (error) {
                logger.error('Change password failed', error);
                
                let message = error.message || 'Failed to change password';
                if (error.code === 'WEAK_PASSWORD') {
                    message = 'Password is too weak. Please use a stronger password.';
                } else if (error.code === 'WRONG_PASSWORD') {
                    message = 'Current password is incorrect.';
                }
                
                toast.error(message);
                return { success: false, error: new Error(message) };
            }

            toast.success('Password changed successfully');
            return { success: true, error: null };
        } catch (error) {
            logger.error('Change password error', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(message);
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error'),
            };
        }
    }
}

/**
 * Singleton instance of AuthService
 */
export const authService = new AuthService();
