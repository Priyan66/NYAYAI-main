/**
 * Runtime environment validation.
 * Imported once at app startup to fail fast on missing config.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Add it to .env.local or your deployment environment.`
    );
  }
  return value;
}

function optionalEnv(key: string): string | undefined {
  return process.env[key] || undefined;
}

export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  NEXTAUTH_SECRET: requireEnv('NEXTAUTH_SECRET'),
  GROQ_API_KEY: requireEnv('GROQ_API_KEY'),
  GOOGLE_CLIENT_ID: optionalEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: optionalEnv('GOOGLE_CLIENT_SECRET'),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;
