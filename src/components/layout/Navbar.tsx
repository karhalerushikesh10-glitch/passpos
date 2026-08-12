'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePosStore } from '@/store/usePosStore';
import { truncateStellarAddress } from '@/lib/stellar';
import {
  ShieldCheck,
  Coins,
  Store,
  Sparkles,
  Zap,
  CheckCircle2,
  RefreshCw,
  Wallet
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { merchant, currency, toggleCurrency, updateMerchantBalance } = usePosStore();
  const [funding, setFunding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleFundAccount = async () => {
    setFunding(true);
    try {
      const res = await fetch('/api/stellar/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: merchant.stellarPublicKey }),
      });
      const data = await res.json();
      if (data.success) {
        updateMerchantBalance(merchant.balanceXlm + 10000);
        setToastMessage('Funded +10,000 XLM from Friendbot!');
      } else {
        setToastMessage(data.message || 'Friendbot request failed');
      }
    } catch (e: any) {
      setToastMessage('Friendbot network request failed');
    } finally {
      setFunding(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Store Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-500 to-indigo-600 p-0.5 shadow-glow">
            <div className="w-full h-full bg-zinc-900 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                PassPOS
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  Stellar Testnet
                </span>
              </h1>
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-1">
              <Store className="w-3 h-3 text-zinc-500" />
              {merchant.storeName}
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800/80">
          <Link
            href="/pos"
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === '/pos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            POS Terminal
          </Link>
          <Link
            href="/dashboard"
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === '/dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/onboarding"
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === '/onboarding'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            Passkey Setup
          </Link>
        </nav>

        {/* Right Status Controls */}
        <div className="flex items-center space-x-3">
          {/* Currency Toggle */}
          <button
            onClick={toggleCurrency}
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-800 transition-colors"
            title="Toggle POS Currency View"
          >
            <Coins className="w-3.5 h-3.5 text-teal-400" />
            <span>{currency}</span>
          </button>

          {/* Stellar Balance & Friendbot */}
          <div className="hidden sm:flex items-center space-x-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs">
            <Wallet className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-zinc-200">
              {merchant.balanceXlm.toLocaleString(undefined, { maximumFractionDigits: 1 })} XLM
            </span>
            <button
              onClick={handleFundAccount}
              disabled={funding}
              className="p-1 hover:bg-zinc-800 rounded text-teal-400 hover:text-teal-300 transition-colors"
              title="Auto-fund 10,000 Testnet XLM"
            >
              <RefreshCw className={`w-3 h-3 ${funding ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Passkey Status Badge */}
          <div className="flex items-center space-x-1.5 bg-teal-950/60 border border-teal-500/30 text-teal-400 px-3 py-1.5 rounded-lg text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">Passkey Secured</span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 right-4 z-50 bg-teal-900 border border-teal-500 text-teal-100 text-xs px-4 py-2 rounded-lg shadow-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
};
