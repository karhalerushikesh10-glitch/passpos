import React from 'react';
import Link from 'next/link';
import { Store, ArrowLeft, Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 min-h-[80vh] flex flex-col items-center justify-center p-6 bg-zinc-950 text-white font-sans text-center">
      <div className="max-w-md w-full bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto text-teal-400">
          <Zap className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white font-mono">404</h1>
          <h2 className="text-lg font-bold text-zinc-200">Terminal Page Not Found</h2>
          <p className="text-xs text-zinc-400">
            The POS terminal route you requested does not exist or has been moved.
          </p>
        </div>

        <Link
          href="/pos"
          className="inline-flex items-center justify-center space-x-2 w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-90 text-white font-bold rounded-xl text-xs transition-all shadow-glow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to POS Terminal</span>
        </Link>
      </div>
    </div>
  );
}
