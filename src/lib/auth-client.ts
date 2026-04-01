import { createAuthClient } from "better-auth/react";
import { env } from "@/lib/config/env";

/**
 * Better Auth client instance for client-side authentication
 */
export const authClient = createAuthClient({
    /**
     * The absolute base URL of the auth endpoints.
     */
    baseURL: `${env.backend.apiUrl}/auth`,
    /**
     * Override default /api/auth path since we included it in baseURL
     */
    basePath: "/"
});

export const { 
    signIn, 
    signUp, 
    signOut, 
    useSession,
    getSession 
} = authClient;
