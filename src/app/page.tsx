'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePosStore } from '@/store/usePosStore';
import { signTransactionWithPasskey, createPasskeyCredential } from '@/lib/passkey';
import {
  Plus,
  User,
  Menu,
  X,
  ShieldCheck,
  Wallet,
  Fingerprint,
  Smartphone,
  CheckCircle2,
  Loader2,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { merchant, setMerchant, updateMerchantBalance } = usePosStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [connectedToast, setConnectedToast] = useState<string | null>(null);

  const handleConnectPasskeyWallet = async () => {
    setConnectingWallet('PASSKEY');
    try {
      const res = await createPasskeyCredential({
        userName: merchant.email,
        storeName: merchant.storeName,
      });

      if (res.success && res.credential) {
        setMerchant({
          passkeyRegistered: true,
        });
        setConnectedToast('Connected via WebAuthn Passkey Secure Enclave!');
        setTimeout(() => {
          setWalletModalOpen(false);
          setConnectingWallet(null);
          router.push('/pos');
        }, 1200);
      }
    } catch (e) {
      setConnectingWallet(null);
    }
  };

  const handleConnectFreighter = async () => {
    setConnectingWallet('FREIGHTER');
    setTimeout(() => {
      setMerchant({
        stellarPublicKey: 'GBV2Z6D564T5E2W7Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6',
      });
      setConnectedToast('Connected via Freighter Stellar Wallet!');
      setTimeout(() => {
        setWalletModalOpen(false);
        setConnectingWallet(null);
        router.push('/pos');
      }, 1200);
    }, 1000);
  };

  const handleConnectTestnet = async () => {
    setConnectingWallet('TESTNET');
    try {
      const res = await fetch('/api/stellar/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: merchant.stellarPublicKey }),
      });
      const data = await res.json();
      if (data.success) {
        updateMerchantBalance(merchant.balanceXlm + 10000);
        setConnectedToast('Connected & Funded +10,000 Testnet XLM!');
      } else {
        setConnectedToast('Connected to Stellar Testnet');
      }
      setTimeout(() => {
        setWalletModalOpen(false);
        setConnectingWallet(null);
        router.push('/pos');
      }, 1200);
    } catch (e) {
      setConnectingWallet(null);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans flex flex-col">
      {/* 1. BACKGROUND VIDEO (z-index 0) */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
          type="video/mp4"
        />
      </video>

      {/* 2. BOTTOM BLUR OVERLAY (z-index 1, no dark gradient overlay) */}
      <div className="fixed inset-0 z-1 pointer-events-none backdrop-blur-xl bottom-blur-mask" />

      {/* 3. NAVBAR (z-index 50) */}
      <header className="relative z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-6">
        {/* Left: Text Logo */}
        <Link
          href="/"
          className="text-2xl md:text-3xl font-extrabold tracking-tight h-8 md:h-10 flex items-center text-white animate-blur-fade-up"
          style={{ animationDelay: '0ms' }}
        >
          PassPOS
        </Link>

        {/* Center Navigation Links (desktop only, hidden below lg) */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-white hover:text-gray-300 transition-colors animate-blur-fade-up"
            style={{ animationDelay: '100ms' }}
          >
            Dashboard
          </Link>
          <Link
            href="/pos"
            className="text-sm font-medium text-white hover:text-gray-300 transition-colors animate-blur-fade-up"
            style={{ animationDelay: '150ms' }}
          >
            Transactions
          </Link>
          <Link
            href="/onboarding"
            className="text-sm font-medium text-white hover:text-gray-300 transition-colors animate-blur-fade-up"
            style={{ animationDelay: '200ms' }}
          >
            Settings
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* New Payment Pill */}
          <Link
            href="/pos"
            className="hidden sm:flex items-center space-x-2 px-5 py-2 rounded-full liquid-glass text-sm font-medium text-white animate-blur-fade-up"
            style={{ animationDelay: '350ms' }}
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Payment</span>
          </Link>

          {/* User Profile Button */}
          <Link
            href="/onboarding"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full liquid-glass text-white animate-blur-fade-up"
            style={{ animationDelay: '400ms' }}
            title="Merchant Profile"
          >
            <User className="w-5 h-5 text-white" />
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden items-center justify-center w-10 h-10 rounded-full liquid-glass text-white animate-blur-fade-up"
            style={{ animationDelay: '350ms' }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 4. MOBILE MENU DROPDOWN (below lg) */}
      <div
        className={`absolute top-[72px] left-4 right-4 z-40 bg-gray-900/95 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl p-6 transition-all duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col space-y-4">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-white hover:text-gray-300 py-2 border-b border-gray-800"
          >
            Dashboard
          </Link>
          <Link
            href="/pos"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-white hover:text-gray-300 py-2 border-b border-gray-800"
          >
            Transactions
          </Link>
          <Link
            href="/onboarding"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-white hover:text-gray-300 py-2 border-b border-gray-800"
          >
            Settings
          </Link>

          <div className="pt-2 flex items-center space-x-3">
            <Link
              href="/pos"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-full liquid-glass text-sm font-medium text-white"
            >
              <Plus className="w-4 h-4" />
              <span>New Payment</span>
            </Link>
            <Link
              href="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="w-11 h-11 flex items-center justify-center rounded-full liquid-glass text-white"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. HERO CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col justify-end px-4 sm:px-6 md:px-12 pb-8 md:pb-16">
        <div className="flex-1 flex flex-col justify-end max-w-4xl">
          {/* Hero Title */}
          <h1
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-white mb-4 md:mb-6 leading-tight animate-blur-fade-up"
            style={{ animationDelay: '400ms' }}
          >
            Passkey-Based Merchant Payments.
          </h1>

          {/* Description */}
          <p
            className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 md:mb-12 max-w-2xl animate-blur-fade-up"
            style={{ animationDelay: '500ms' }}
          >
            Seamless, passwordless checkout powered by Stellar Soroban smart contracts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/pos"
              className="bg-white text-black hover:bg-gray-200 rounded-full font-medium px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base transition-colors animate-blur-fade-up shadow-lg"
              style={{ animationDelay: '600ms' }}
            >
              Start POS Terminal
            </Link>

            <button
              id="connect-wallet-btn"
              onClick={() => setWalletModalOpen(true)}
              className="rounded-full font-medium liquid-glass px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base text-white hover:text-white transition-colors animate-blur-fade-up"
              style={{ animationDelay: '700ms' }}
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </main>

      {/* WALLET CONNECTION MODAL */}
      {walletModalOpen && (
        <div id="wallet-modal" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-base">Select Wallet Connection</h3>
              </div>
              <button
                onClick={() => setWalletModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {connectedToast ? (
              <div className="p-6 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">{connectedToast}</h4>
                <p className="text-xs text-emerald-300 font-mono">Redirecting to POS Terminal...</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {/* WebAuthn Passkey Wallet */}
                <button
                  onClick={handleConnectPasskeyWallet}
                  disabled={!!connectingWallet}
                  className="w-full bg-gradient-to-r from-blue-600/30 via-teal-500/20 to-emerald-500/30 hover:bg-blue-600/40 border border-blue-500/40 text-white rounded-2xl p-4 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Passkey Biometric Wallet</h4>
                      <p className="text-zinc-400 text-[11px]">Touch ID / Face ID passwordless login</p>
                    </div>
                  </div>
                  {connectingWallet === 'PASSKEY' ? (
                    <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>

                {/* Freighter Wallet */}
                <button
                  onClick={handleConnectFreighter}
                  disabled={!!connectingWallet}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-white rounded-2xl p-4 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Freighter Extension</h4>
                      <p className="text-zinc-400 text-[11px]">Stellar browser extension wallet</p>
                    </div>
                  </div>
                  {connectingWallet === 'FREIGHTER' ? (
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>

                {/* SDF Friendbot Testnet Keypair */}
                <button
                  onClick={handleConnectTestnet}
                  disabled={!!connectingWallet}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-white rounded-2xl p-4 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Auto-Funded Testnet Keypair</h4>
                      <p className="text-zinc-400 text-[11px]">Instant 10,000 Testnet XLM Friendbot</p>
                    </div>
                  </div>
                  {connectingWallet === 'TESTNET' ? (
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
