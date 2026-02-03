'use client';

import { useState, type FormEvent } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { loginCredentialsSchema } from '@/types/auth';
import { logger } from '@/lib/utils/logger';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useRouter } from 'next/navigation';

/**
 * Login form using shadcn components with theme variables
 */
export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { signIn, isLoading, error: authError } = useAuthStore();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        try {
            const credentials = loginCredentialsSchema.parse({ email, password });
            await signIn(credentials);
            logger.info('Login successful');
            router.push('/dashboard');
        } catch (error) {
            if (error && typeof error === 'object' && 'errors' in error) {
                const zodErrors = error as { errors: Array<{ path: string[]; message: string }> };
                const errorMap: Record<string, string> = {};
                zodErrors.errors.forEach((err) => {
                    errorMap[err.path[0]] = err.message;
                });
                setErrors(errorMap);
            } else {
                logger.error('Login failed', error);
            }
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Welcome to WageX</CardTitle>
                <CardDescription>
                    Login to access your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password}</p>
                        )}
                    </div>

                    {authError && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-destructive">{authError}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
