/**
 * PostHog / Product Analytics Tracker for PassPOS
 */

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    console.log(`[PostHog Analytics] Track Event: ${eventName}`, properties || {});
  }
}

export function identifyMerchant(merchantId: string, traits?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    console.log(`[PostHog Analytics] Identify Merchant: ${merchantId}`, traits || {});
  }
}
