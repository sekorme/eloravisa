import * as Sentry from "@sentry/nextjs";

// Server-side Sentry. A no-op until SENTRY_DSN is set (create a Next.js
// project at sentry.io and add the DSN in Vercel env + .env.local), so this
// is safe to ship before the account exists.
export async function register() {
  if (!process.env.SENTRY_DSN) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    enableLogs: true,
  });
}

export const onRequestError = Sentry.captureRequestError;
