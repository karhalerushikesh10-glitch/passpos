'use client';

import React, { useState, useEffect } from 'react';
import { usePosStore } from '@/store/usePosStore';
import QRCode from 'qrcode';
import { truncateStellarAddress } from '@/lib/stellar';
import confetti from 'canvas-confetti';
import { QrCode, X, CheckCircle2, RefreshCw, Smartphone } from 'lucide-react';
import { ReceiptView } from '@/components/ui/ReceiptView';

export const QrPaymentModal: React.FC = () => {
  const {
    qrModalOpen,
    setQrModalOpen,
    cart,
    clearCart,
    merchant,
    getTotalUsd,
    getTotalXlm,
    getTaxAmountUsd,
    getDiscountAmountUsd,
    addTransaction,
  } = usePosStore();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [status, setStatus] = useState<'WAITING' | 'SIMULATING' | 'SUCCESS'>('WAITING');
  const [txDetails, setTxDetails] = useState<any | null>(null);

  const totalUsd = getTotalUsd();
  const totalXlm = getTotalXlm();
  const taxAmount = getTaxAmountUsd();
  const discountAmount = getDiscountAmountUsd();

  useEffect(() => {
    if (qrModalOpen) {
      // Build SEP-0007 / Stellar pay URI
      const stellarPayUri = `web+stellar:pay?destination=${encodeURIComponent(
        merchant.stellarPublicKey
      )}&amount=${totalXlm.toFixed(7)}&memo=PassPOS_${Date.now().toString().slice(-4)}`;

      QRCode.toDataURL(stellarPayUri, {
        width: 280,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#09090b',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    } else {
      setStatus('WAITING');
    }
  }, [qrModalOpen, totalXlm, merchant.stellarPublicKey]);

  if (!qrModalOpen) return null;

  const handleSimulateCustomerPayment = async () => {
    setStatus('SIMULATING');
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUsd: totalUsd,
          amountXlm: totalXlm,
          taxAmount,
          discountAmount,
          paymentType: 'STELLAR_QR_PAY',
          items: cart,
          merchantId: merchant.id,
          customerRef: 'Stellar Wallet QR Scan',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTxDetails(data);
        setStatus('SUCCESS');

        addTransaction({
          id: data.transaction.id,
          txHash: data.transaction.txHash,
          amountUsd: totalUsd,
          amountXlm: totalXlm,
          paymentType: 'STELLAR_QR_PAY',
          status: 'CONFIRMED',
          customerRef: 'Stellar Wallet QR Scan',
          items: cart,
          createdAt: new Date().toISOString(),
        });

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#14b8a6', '#10b981'],
        });
      }
    } catch (e) {
      setStatus('WAITING');
    }
  };

  const handleClose = () => {
    if (status === 'SUCCESS') {
      clearCart();
    }
    setQrModalOpen(false);
    setStatus('WAITING');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-white text-base">Customer QR Payment</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {status === 'SUCCESS' && txDetails ? (
          <div className="p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-white">QR Payment Received!</h4>
            </div>



            <div className="max-h-[280px] overflow-y-auto rounded-xl border border-zinc-800">
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

            <button
              onClick={handleClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors"
            >
              Done & New Sale
            </button>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center text-center space-y-4">
            <p className="text-xs text-zinc-400 max-w-xs">
              Scan with any Stellar Mobile Wallet (Freighter, Lobstr, Solar) to pay instantly.
            </p>

            {/* QR Code Container */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 shadow-inner flex flex-col items-center">
              {qrDataUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="Stellar Payment QR Code" className="w-56 h-56 rounded-lg" />
                </>
              ) : (
                <div className="w-56 h-56 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-teal-400 animate-spin" />
                </div>
              )}
              <div className="mt-3 text-center">
                <span className="text-2xl font-bold font-mono text-white block">
                  {totalXlm.toFixed(1)} XLM
                </span>
                <span className="text-xs font-mono text-teal-400 font-semibold block">
                  ${totalUsd.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Receiver Key */}
            <div className="text-[11px] text-zinc-500 font-mono">
              Pay to: {truncateStellarAddress(merchant.stellarPublicKey)}
            </div>

            {/* Action Simulator */}
            <button
              onClick={handleSimulateCustomerPayment}
              disabled={status === 'SIMULATING'}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-teal-300 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors border border-zinc-700"
            >
              <Smartphone className="w-4 h-4 text-teal-400" />
              <span>
                {status === 'SIMULATING' ? 'Listening for ledger verification...' : 'Simulate Customer Payment'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
