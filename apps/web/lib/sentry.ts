export function initSentryClient() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return;
  }
  // Browser Sentry SDK can be initialized here when UI error boundaries are added.
}
