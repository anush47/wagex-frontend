import { z } from 'zod';

/**
 * Login credentials schema
 */
export const loginCredentialsSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Login credentials type
 */
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

/**
 * Signup credentials schema
 */
export const signupCredentialsSchema = loginCredentialsSchema.extend({
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

/**
 * Signup credentials type
 */
export type SignupCredentials = z.infer<typeof signupCredentialsSchema>;

/**
 * Authentication state interface
 */
export interface AuthState {
    user: any | null;
    session: any | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

/**
 * Authentication context interface
 */
export interface AuthContextValue extends AuthState {
    signIn: (credentials: LoginCredentials) => Promise<void>;
    signOut: () => Promise<void>;
    getAccessToken: () => string | null;
}
