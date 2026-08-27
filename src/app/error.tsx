'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import { captureException } from '@/lib/sentry';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to Sentry / error monitoring
    captureException(error, { digest: error.digest });
    console.error('PassPOS Application Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="flex-1 min-h-[80vh] flex flex-col items-center justify-center p-6 bg-zinc-950 text-white font-sans text-center">
      <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white">Application Encountered an Error</h2>
          <p className="text-xs text-zinc-400">
            An unexpected error occurred during POS execution. State has been safely contained.
          </p>
          {error.message && (
            <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80 text-left font-mono text-[11px] text-red-400 break-words mt-3">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors shadow-glow"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/pos"
            className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors border border-zinc-700"
          >
            <Home className="w-4 h-4" />
            <span>Return to POS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
