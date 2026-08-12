'use client';

import React, { useState } from 'react';
import { usePosStore } from '@/store/usePosStore';
import { createPasskeyCredential } from '@/lib/passkey';
import { truncateStellarAddress } from '@/lib/stellar';
import { ShieldCheck, Fingerprint, Store, CheckCircle2, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const { merchant, setMerchant } = usePosStore();
  const [storeName, setStoreName] = useState<string>(merchant.storeName);
  const [email, setEmail] = useState<string>(merchant.email);
  const [loading, setLoading] = useState<boolean>(false);
  const [successState, setSuccessState] = useState<boolean>(false);

  const handleRegisterPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Passkey Credential using WebAuthn API
      const passkeyResult = await createPasskeyCredential({
        userName: email,
        storeName,
      });

      // 2. Submit to server API route to register merchant & fund Stellar Testnet Keypair
      const res = await fetch('/api/auth/passkey-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          email,
          passkeyCredential: passkeyResult.credential,
        }),
      });

      const data = await res.json();

      if (data.success && data.merchant) {
        setMerchant({
          id: data.merchant.id,
          storeName: data.merchant.storeName,
          email: data.merchant.email,
          stellarPublicKey: data.merchant.stellarPublicKey,
          passkeyRegistered: true,
        });
        setSuccessState(true);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-zinc-950 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-500 p-0.5 shadow-glow mx-auto mb-2">
            <div className="w-full h-full bg-zinc-900 rounded-[14px] flex items-center justify-center">
              <Fingerprint className="w-7 h-7 text-teal-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Merchant Passkey Setup</h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Bind Touch ID, Face ID, or Windows Hello biometrics for passwordless POS authorization.
          </p>
        </div>

        {successState ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-base">Passkey Registered Successfully!</h4>
              <p className="text-xs text-emerald-300">
                Stellar Keypair created and auto-funded with 10,000 Testnet XLM.
              </p>
              <div className="text-[11px] text-zinc-400 font-mono pt-2 border-t border-emerald-900">
                Key: {truncateStellarAddress(merchant.stellarPublicKey)}
              </div>
            </div>

            <button
              onClick={() => router.push('/pos')}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <span>Go to POS Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegisterPasskey} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Store / Merchant Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Stellar Espresso Bar"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-medium mb-1">Merchant Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cashier@passpos.stellar"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-teal-400 text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>WebAuthn Hardware Credential</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                A public/private keypair (Secp256r1) will be generated on your device secure enclave. Private key never leaves your device.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 hover:opacity-95 text-white font-bold rounded-2xl text-sm flex items-center justify-center space-x-2 shadow-glow transition-all active:scale-[0.99]"
            >
              <Fingerprint className="w-5 h-5" />
              <span>{loading ? 'Registering Credential...' : 'Register Passkey & Fund Wallet'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
