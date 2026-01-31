import { useAuthStore } from '@/stores/auth.store';

/**
 * Custom hook for accessing auth state and actions
 */
export function useAuth() {
    const user = useAuthStore((state) => state.user);
    const session = useAuthStore((state) => state.session);
    const isLoading = useAuthStore((state) => state.isLoading);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const error = useAuthStore((state) => state.error);
    const signIn = useAuthStore((state) => state.signIn);
    const signOut = useAuthStore((state) => state.signOut);
    const getAccessToken = useAuthStore((state) => state.getAccessToken);

    return {
        user,
        session,
        isLoading,
        isAuthenticated,
        error,
        signIn,
        signOut,
        getAccessToken,
    };
}
