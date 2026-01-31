'use client';

import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Token display using shadcn components with theme variables
 */
export function TokenDisplay() {
    const { session, user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated || !session) {
        return null;
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Authentication Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <InfoCard title="User Information">
                        <pre className="text-sm overflow-x-auto font-mono text-foreground">
                            {JSON.stringify(
                                {
                                    id: user?.id,
                                    email: user?.email,
                                    created_at: user?.created_at,
                                },
                                null,
                                2
                            )}
                        </pre>
                    </InfoCard>

                    <InfoCard title="Access Token">
                        <p className="text-xs font-mono break-all bg-muted p-3 rounded-lg text-foreground">
                            {session.access_token}
                        </p>
                    </InfoCard>

                    <InfoCard title="Refresh Token">
                        <p className="text-xs font-mono break-all bg-muted p-3 rounded-lg text-foreground">
                            {session.refresh_token}
                        </p>
                    </InfoCard>

                    <InfoCard title="Session Metadata">
                        <pre className="text-sm overflow-x-auto font-mono text-foreground">
                            {JSON.stringify(
                                {
                                    expires_at: session.expires_at,
                                    expires_in: session.expires_in,
                                    token_type: session.token_type,
                                },
                                null,
                                2
                            )}
                        </pre>
                    </InfoCard>
                </CardContent>
            </Card>
        </div>
    );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border rounded-lg p-4 bg-card">
            <h3 className="text-lg font-semibold mb-3 text-card-foreground">
                {title}
            </h3>
            {children}
        </div>
    );
}
