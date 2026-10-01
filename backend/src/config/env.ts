import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

if (!process.env.JWT_SECRET)
  console.warn("[warn] JWT_SECRET not set — using insecure dev fallback. Set it in .env.");

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL:
    process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/slotsync",
  JWT_SECRET: required("JWT_SECRET", "dev-only-insecure-secret-change-me"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  COOKIE_NAME: process.env.COOKIE_NAME ?? "slotsync_token",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  REMINDER_INTERVAL_MS: Number(process.env.REMINDER_INTERVAL_MS ?? 60_000),
} as const;

export const isProd = env.NODE_ENV === "production";
