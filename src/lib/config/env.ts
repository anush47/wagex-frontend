import { z } from 'zod';

/**
 * Environment variable schema with runtime validation
 */
const envSchema = z.object({
  backend: z.object({
    apiUrl: z.string().url('Invalid backend API URL'),
  }),
});

/**
 * Validated environment configuration
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 * Only validates on client-side to prevent build-time errors with placeholders
 */
function parseEnv(): EnvConfig {
  const rawEnv = {
    backend: {
      apiUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL || '',
    },
  };

  // Only validate on client-side (browser)
  if (typeof window !== 'undefined') {
    try {
      return envSchema.parse(rawEnv);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
        console.error(`Environment validation failed:\n${issues}`);
      }
    }
  }

  // Return raw env for server-side/build-time
  return rawEnv as EnvConfig;
}

/**
 * Singleton instance of validated environment configuration
 */
export const env = parseEnv();
