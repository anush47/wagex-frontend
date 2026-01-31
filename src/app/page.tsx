'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { TokenDisplay } from '@/components/auth/TokenDisplay';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { isAuthenticated, signOut, isLoading: authLoading } = useAuthStore();

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-foreground">
            WageX
          </h1>
          <p className="text-muted-foreground text-lg">
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
