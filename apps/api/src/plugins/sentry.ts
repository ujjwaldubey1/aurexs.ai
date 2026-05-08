export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return;
  }
  // Stub for future Sentry SDK initialization.
}
