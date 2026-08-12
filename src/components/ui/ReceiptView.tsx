'use client';

import React from 'react';
import { truncateStellarAddress } from '@/lib/stellar';
import { Printer, Download, CheckCircle2, Zap } from 'lucide-react';

interface ReceiptViewProps {
  receipt: {
    receiptNumber: string;
    totalUsd: number;
    totalXlm: number;
    taxAmount: number;
    discountAmount: number;
    txHash: string;
    createdAt: string;
    items: any[];
    merchantStore?: string;
  };
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ receipt }) => {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="bg-white text-zinc-900 p-6 rounded-xl font-mono text-xs shadow-lg space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center space-y-1 border-b border-zinc-200 pb-3">
        <div className="flex items-center justify-center space-x-1 font-sans font-bold text-base text-zinc-900">
          <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
          <span>PassPOS Terminal</span>
        </div>
        <h4 className="font-semibold text-zinc-800 text-sm">{receipt.merchantStore || 'Stellar Merchant Store'}</h4>
        <p className="text-[10px] text-zinc-500">Official Payment Receipt</p>
        <p className="text-[10px] text-zinc-400">Date: {new Date(receipt.createdAt).toLocaleString()}</p>
        <p className="text-[10px] text-zinc-600 font-bold">No: {receipt.receiptNumber}</p>
      </div>

      {/* Items List */}
      <div className="space-y-2 border-b border-zinc-200 pb-3">
        <div className="flex justify-between font-bold text-zinc-600 text-[10px] uppercase tracking-wider">
          <span>Item</span>
          <span>Qty x Price</span>
          <span>Total</span>
        </div>
        {receipt.items.map((item, idx) => {
          const title = item.product?.title || item.title || 'Item';
          const price = item.product?.priceUsd || item.priceUsd || 0;
          const qty = item.quantity || 1;
          return (
            <div key={idx} className="flex justify-between text-[11px]">
              <span className="truncate max-w-[150px]">{title}</span>
              <span className="text-zinc-500">
                {qty} x ${price.toFixed(2)}
              </span>
              <span className="font-bold">${(qty * price).toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      {/* Financial Calculations */}
      <div className="space-y-1 text-right text-[11px]">
        {receipt.discountAmount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Discount Applied</span>
            <span>-${receipt.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-zinc-500">
          <span>Tax</span>
          <span>${receipt.taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm text-zinc-900 pt-1 border-t border-zinc-200">
          <span>Total Paid</span>
          <span>${receipt.totalUsd.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-blue-600 font-bold text-[11px]">
          <span>Stellar Testnet Ledger</span>
          <span>{receipt.totalXlm.toFixed(1)} XLM</span>
        </div>
      </div>

      {/* Stellar Tx Signature */}
      <div className="bg-zinc-100 p-2.5 rounded-lg space-y-1 text-[10px] border border-zinc-200">
        <div className="flex justify-between text-zinc-600">
          <span>Auth Method</span>
          <span className="font-bold text-emerald-600">WebAuthn Passkey</span>
        </div>
        <div className="flex justify-between text-zinc-600">
          <span>Stellar Hash</span>
          <span className="font-mono text-zinc-900">{truncateStellarAddress(receipt.txHash)}</span>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex justify-center space-x-2 pt-2 border-t border-zinc-200">
        <button
          onClick={handlePrint}
          className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-sans font-semibold flex items-center space-x-1 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Receipt</span>
        </button>
      </div>
    </div>
  );
};
