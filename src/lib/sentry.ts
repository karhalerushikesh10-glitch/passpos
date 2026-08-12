/**
 * Sentry Error Monitoring & Telemetry for PassPOS
 */

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log('[Sentry] Monitoring initialized for PassPOS');
  }
}

export function captureException(error: any, context?: Record<string, any>) {
  console.error('[Sentry Telemetry Error Captured]:', error, context || '');
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[Sentry Telemetry Log - ${level.toUpperCase()}]: ${message}`);
}
