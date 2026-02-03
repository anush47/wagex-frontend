'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { TokenDisplay } from '@/components/auth/TokenDisplay';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { isAuthenticated, signOut, isLoading: authLoading } = useAuthStore();

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 dark:from-neutral-100 dark:via-neutral-300 dark:to-neutral-100">
            WageX
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">
            Authentication Testing Platform
          </p>
        </div>

        {!isAuthenticated ? (
          <LoginForm />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Button
                onClick={() => signOut()}
                disabled={authLoading}
                variant="destructive"
                size="lg"
              >
                Sign Out
              </Button>
            </div>
            <TokenDisplay />
          </div>
        )}
      </div>
    </main>
  );
}
