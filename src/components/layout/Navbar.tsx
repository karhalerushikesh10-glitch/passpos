'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePosStore } from '@/store/usePosStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useToast } from '@/components/ui/ToastProvider';
import {
  ShieldCheck,
  Coins,
  Store,
  Zap,
  RefreshCw,
  Wallet,
  Menu,
  X,
  MessageSquareHeart,
  LayoutDashboard,
  CreditCard,
  KeyRound
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { merchant, currency, toggleCurrency, updateMerchantBalance, setFeedbackModalOpen } = usePosStore();
  const wallet = useWalletStore();
  const { showSuccess, showError } = useToast();
  const [funding, setFunding] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        showSuccess('Funded +10,000 XLM', 'Stellar Testnet Friendbot transaction confirmed on ledger.');
      } else {
        showError('Friendbot Funding Failed', data.message);
      }
    } catch (e: any) {
      showError('Network Error', e);
    } finally {
      setFunding(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Store Info */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-500 to-indigo-600 p-0.5 shadow-glow group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-zinc-900 rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-teal-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                    PassPOS
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                      Testnet
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-zinc-400 flex items-center gap-1">
                  <Store className="w-3 h-3 text-zinc-500" />
                  {merchant.storeName}
                </p>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links (Desktop) */}
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
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Feedback Button */}
            <button
              id="navbar-feedback-btn"
              onClick={() => setFeedbackModalOpen(true)}
              className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-500/30 transition-all hover:border-amber-500/50 shadow-sm"
              title="Give Level 4 User Feedback"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Feedback</span>
            </button>

            {/* Currency Toggle */}
            <button
              onClick={toggleCurrency}
              className="flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-800 transition-colors"
              title="Toggle POS Currency View"
            >
              <Coins className="w-3.5 h-3.5 text-teal-400" />
              <span>{currency}</span>
            </button>

            {/* Stellar Balance / Connect Wallet */}
            <div className="hidden sm:flex items-center space-x-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs">
              <Wallet className="w-3.5 h-3.5 text-blue-400" />
              {wallet.isConnected && wallet.publicKey ? (
                <>
                  <span className="font-mono text-zinc-200" title={wallet.publicKey}>
                    {wallet.publicKey.substring(0, 4)}...{wallet.publicKey.slice(-4)}
                  </span>
                  <span className="text-zinc-500">|</span>
                  <span className="font-mono text-zinc-200">
                    {merchant.balanceXlm.toLocaleString(undefined, { maximumFractionDigits: 1 })} XLM
                  </span>
                </>
              ) : (
                <button
                  onClick={() => wallet.connect()}
                  className="font-medium text-blue-400 hover:text-blue-300"
                >
                  {wallet.isConnecting ? 'Connecting...' : 'Connect Freighter'}
                </button>
              )}
              <button
                onClick={handleFundAccount}
                disabled={funding}
                className="p-1 hover:bg-zinc-800 rounded text-teal-400 hover:text-teal-300 transition-colors ml-1"
                title="Auto-fund 10,000 Testnet XLM"
              >
                <RefreshCw className={`w-3 h-3 ${funding ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Passkey Status Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-teal-950/60 border border-teal-500/30 text-teal-400 px-3 py-1.5 rounded-lg text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Secured</span>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              id="navbar-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-zinc-800/80 mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-4 gap-2 pb-2">
              <Link
                href="/pos"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 rounded-xl text-center text-xs font-semibold flex flex-col items-center gap-1 ${
                  pathname === '/pos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-400" />
                POS
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 rounded-xl text-center text-xs font-semibold flex flex-col items-center gap-1 ${
                  pathname === '/dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-teal-400" />
                Dash
              </Link>
              <Link
                href="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 rounded-xl text-center text-xs font-semibold flex flex-col items-center gap-1 ${
                  pathname === '/onboarding'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                }`}
              >
                <KeyRound className="w-4 h-4 text-purple-400" />
                Auth
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setFeedbackModalOpen(true);
                }}
                className="p-2 rounded-xl text-center text-xs font-semibold flex flex-col items-center gap-1 bg-amber-950/40 border border-amber-500/30 text-amber-300"
              >
                <MessageSquareHeart className="w-4 h-4 text-amber-400" />
                Review
              </button>
            </div>

            <div className="flex items-center justify-between bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800 text-xs">
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-zinc-300">
                  {merchant.balanceXlm.toLocaleString(undefined, { maximumFractionDigits: 1 })} XLM
                </span>
              </div>
              <button
                onClick={handleFundAccount}
                disabled={funding}
                className="px-2.5 py-1 bg-teal-950 border border-teal-500/40 text-teal-400 rounded-lg text-[11px] font-semibold flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${funding ? 'animate-spin' : ''}`} />
                <span>+10k Friendbot</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
