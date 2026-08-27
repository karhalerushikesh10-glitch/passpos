'use client';

import React, { useState } from 'react';
import { usePosStore } from '@/store/usePosStore';
import { signTransactionWithPasskey } from '@/lib/passkey';
import { truncateStellarAddress } from '@/lib/stellar';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Fingerprint,
  X,
  CheckCircle2,
  ExternalLink,
  Receipt,
  Loader2,
  Sparkles,
  ArrowRight,
  Wallet
} from 'lucide-react';
import { ReceiptView } from '@/components/ui/ReceiptView';
import { useWalletStore } from '@/store/useWalletStore';
import { executeSorobanPayment } from '@/lib/freighter';

export const PaymentModal: React.FC = () => {
  const {
    paymentModalOpen,
    setPaymentModalOpen,
    cart,
    clearCart,
    merchant,
    getTotalUsd,
    getTotalXlm,
    getTaxAmountUsd,
    getDiscountAmountUsd,
    addTransaction,
  } = usePosStore();

  const wallet = useWalletStore();
  const [step, setStep] = useState<'IDLE' | 'SIGNING' | 'SUCCESS'>('IDLE');
  const [txDetails, setTxDetails] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!paymentModalOpen) return null;

  const totalUsd = getTotalUsd();
  const totalXlm = getTotalXlm();
  const taxAmount = getTaxAmountUsd();
  const discountAmount = getDiscountAmountUsd();

  const handleAuthorizeFreighter = async () => {
    if (step !== 'IDLE') return;
    if (!wallet.isConnected || !wallet.publicKey) {
      setErrorMsg('Please connect Freighter Wallet first.');
      return;
    }
    setStep('SIGNING');
    setErrorMsg(null);
    try {
      const txRef = `ORD-${Date.now()}`;
      const result = await executeSorobanPayment(
        wallet.publicKey,
        merchant.stellarPublicKey,
        totalXlm,
        txRef
      );

      if (!result.success) {
        setErrorMsg(result.error || 'Freighter transaction failed');
        setStep('IDLE');
        return;
      }

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUsd: totalUsd,
          amountXlm: totalXlm,
          taxAmount,
          discountAmount,
          paymentType: 'FREIGHTER_SOROBAN',
          items: cart,
          merchantId: merchant.id,
          customerRef: wallet.publicKey,
          txHash: result.txHash,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTxDetails({ ...data, transaction: { ...data.transaction, txHash: result.txHash } });
        setStep('SUCCESS');
        addTransaction({
          id: data.transaction.id,
          txHash: result.txHash || data.transaction.txHash,
          amountUsd: totalUsd,
          amountXlm: totalXlm,
          paymentType: 'FREIGHTER_SOROBAN',
          status: 'CONFIRMED',
          customerRef: wallet.publicKey,
          items: cart,
          createdAt: new Date().toISOString(),
        });
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#14b8a6', '#10b981', '#8b5cf6'],
        });
      } else {
        setErrorMsg(data.error || 'Backend recording failed');
        setStep('IDLE');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Unexpected payment error occurred');
      setStep('IDLE');
    }
  };

  const handleAuthorizePasskey = async () => {
    if (step !== 'IDLE') return;
    setStep('SIGNING');
    setErrorMsg(null);

    try {
      // 1. Sign payment intent with WebAuthn Passkey (TouchID / FaceID)
      const passkeyResult = await signTransactionWithPasskey({
        amountXlm: totalXlm,
        merchantStore: merchant.storeName,
      });

      if (!passkeyResult.success) {
        setErrorMsg(passkeyResult.error || 'Passkey authorization failed');
        setStep('IDLE');
        return;
      }

      // 2. Submit transaction to Stellar API route
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUsd: totalUsd,
          amountXlm: totalXlm,
          taxAmount,
          discountAmount,
          paymentType: 'WEBAUTHN_PASSKEY',
          items: cart,
          merchantId: merchant.id,
          customerRef: 'Passkey Verified Customer',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setTxDetails(data);
        setStep('SUCCESS');

        // Add to Zustand transaction store
        addTransaction({
          id: data.transaction.id,
          txHash: data.transaction.txHash,
          amountUsd: totalUsd,
          amountXlm: totalXlm,
          paymentType: 'WEBAUTHN_PASSKEY',
          status: 'CONFIRMED',
          customerRef: 'Passkey Verified Customer',
          items: cart,
          createdAt: new Date().toISOString(),
        });

        // Trigger celebratory confetti burst!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#14b8a6', '#10b981', '#8b5cf6'],
        });
      } else {
        setErrorMsg(data.error || 'Transaction recording failed');
        setStep('IDLE');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Unexpected payment error occurred');
      setStep('IDLE');
    }
  };

  const handleClose = () => {
    if (step === 'SUCCESS') {
      clearCart();
    }
    setStep('IDLE');
    setTxDetails(null);
    setPaymentModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-white text-base">Passkey Payment Authorization</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {step === 'IDLE' && (
          <div className="p-6 space-y-6">
            {/* Amount Banner */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-center relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-teal-500/10 rounded-full blur-xl" />
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Amount to Pay</span>
              <div className="text-4xl font-bold text-white font-mono mt-1">${totalUsd.toFixed(2)} USD</div>
              <div className="text-sm font-semibold text-teal-400 font-mono mt-0.5">
                ≈ {totalXlm.toFixed(1)} XLM (Stellar Testnet)
              </div>
            </div>

            {/* Merchant Receiver Details */}
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Merchant Store</span>
                <span className="text-white font-semibold">{merchant.storeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Stellar Address</span>
                <span className="text-teal-400 font-mono">{truncateStellarAddress(merchant.stellarPublicKey)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Authentication Method</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Fingerprint className="w-3.5 h-3.5" /> WebAuthn Passkey (Secp256r1)
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Passkey Biometric Button */}
            <div className="space-y-3">
              <button
                onClick={handleAuthorizePasskey}
                className="w-full bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 hover:opacity-95 text-white font-bold rounded-2xl py-4 px-6 flex items-center justify-center space-x-3 shadow-glow transition-all active:scale-[0.99]"
              >
                <Fingerprint className="w-6 h-6 text-white animate-pulse" />
                <span className="text-base">Authorize with Touch ID / Passkey</span>
              </button>
              
              <button
                onClick={handleAuthorizeFreighter}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl py-4 px-6 flex items-center justify-center space-x-3 border border-zinc-700 transition-all active:scale-[0.99]"
              >
                <Wallet className="w-6 h-6 text-blue-400" />
                <span className="text-base">Pay via Freighter Wallet</span>
              </button>
            </div>
          </div>
        )}

        {step === 'SIGNING' && (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-teal-500/10 border-2 border-teal-500/40 flex items-center justify-center animate-pulse">
                <Fingerprint className="w-10 h-10 text-teal-400" />
              </div>
              <Loader2 className="w-24 h-24 text-blue-500 animate-spin absolute -top-2 -left-2" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Verifying Biometric Passkey...</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Please complete Touch ID / Face ID prompt on your device to sign the Stellar transaction.
              </p>
            </div>
          </div>
        )}

        {step === 'SUCCESS' && txDetails && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white">Payment Confirmed!</h4>
              <p className="text-xs text-zinc-400">
                Stellar Testnet Transaction verified and recorded.
              </p>
            </div>

            {/* Receipt Component */}
            <div className="max-h-[300px] overflow-y-auto rounded-2xl border border-zinc-800">
              <ReceiptView
                receipt={{
                  receiptNumber: txDetails.receipt.receiptNumber,
                  totalUsd,
                  totalXlm,
                  taxAmount,
                  discountAmount,
                  txHash: txDetails.transaction.txHash,
                  createdAt: txDetails.transaction.createdAt,
                  items: cart,
                  merchantStore: merchant.storeName,
                }}
              />
            </div>

            {/* Stellar Explorer Link & Close */}
            <div className="space-y-2">
              <a
                href={txDetails.stellarExpertUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-teal-400 font-mono text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>View on Stellar Expert Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleClose}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors"
              >
                Done & Next Sale
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
