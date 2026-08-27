/**
 * PostHog / Product Analytics Tracker for PassPOS
 */

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    console.log(`[PassPOS Analytics] ${eventName}:`, properties || {});
    // If PostHog or custom window analytics exist, forward event:
    if ((window as any).posthog) {
      (window as any).posthog.capture(eventName, properties);
    }
  }
}

export function trackWalletConnected(walletType: string, address: string) {
  trackEvent('WALLET_CONNECTED', { walletType, address, timestamp: new Date().toISOString() });
}

export function trackPasskeyRegistration(email: string, storeName: string) {
  trackEvent('PASSPOS_CREDENTIAL_CREATED', { email, storeName, timestamp: new Date().toISOString() });
}

export function trackTransactionInitiated(amountUsd: number, amountXlm: number, paymentType: string) {
  trackEvent('TRANSACTION_INITIATED', { amountUsd, amountXlm, paymentType, timestamp: new Date().toISOString() });
}

export function trackTransactionCompleted(txHash: string, amountUsd: number, amountXlm: number) {
  trackEvent('TRANSACTION_CONFIRMED', { txHash, amountUsd, amountXlm, timestamp: new Date().toISOString() });
}

export function trackFeedbackSubmitted(rating: number, category: string) {
  trackEvent('USER_FEEDBACK_SUBMITTED', { rating, category, timestamp: new Date().toISOString() });
}

export function identifyMerchant(merchantId: string, traits?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    console.log(`[PassPOS Analytics] Identify Merchant: ${merchantId}`, traits || {});
    if ((window as any).posthog) {
      (window as any).posthog.identify(merchantId, traits);
    }
  }
}
