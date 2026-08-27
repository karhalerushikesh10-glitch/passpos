'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, rawError?: any) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Sanitizes Stellar Horizon & WebAuthn error objects into clean, user-facing explanations
 */
export function sanitizeRpcError(err: any): string {
  if (!err) return 'An unexpected error occurred. Please try again.';
  if (typeof err === 'string') {
    if (err.includes('tx_bad_auth')) return 'Transaction authorization signature invalid.';
    if (err.includes('op_underfunded')) return 'Account balance is insufficient for this Stellar transaction.';
    if (err.includes('op_no_destination')) return 'Destination Stellar account does not exist or requires funding.';
    if (err.includes('NotAllowedError') || err.includes('User canceled')) return 'Passkey biometric prompt was cancelled.';
    if (err.includes('NotSupportedError')) return 'Passkey WebAuthn is not supported by your browser environment.';
    return err;
  }

  // Object error responses
  const msg = err.message || err.detail || err.title || '';
  if (msg) return sanitizeRpcError(msg);
  return 'Network operation could not be completed on Stellar Testnet.';
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, durationMs = 4000 }: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, title, message, durationMs };

      setToasts((prev) => [...prev, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          removeToast(id);
        }, durationMs);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'success', title, message });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, rawError?: any) => {
      const sanitized = rawError ? sanitizeRpcError(rawError) : undefined;
      showToast({ type: 'error', title, message: sanitized, durationMs: 6000 });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'info', title, message });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'warning', title, message });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      {/* Fixed Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 ${
                isSuccess
                  ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
                  : isError
                  ? 'bg-red-950/90 border-red-500/40 text-red-100'
                  : isWarning
                  ? 'bg-amber-950/90 border-amber-500/40 text-amber-100'
                  : 'bg-zinc-900/90 border-zinc-700 text-zinc-100'
              }`}
            >
              <div className="mr-3 mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-red-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-400" />}
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <h5 className="text-xs font-bold tracking-tight">{toast.title}</h5>
                {toast.message && (
                  <p className="text-[11px] opacity-90 font-mono mt-0.5 break-words">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
