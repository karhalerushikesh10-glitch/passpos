'use client';

import React, { useState } from 'react';
import { usePosStore } from '@/store/usePosStore';
import { truncateStellarAddress } from '@/lib/stellar';
import { ExternalLink, CheckCircle2, ShieldCheck, Receipt, Eye } from 'lucide-react';
import { ReceiptView } from '@/components/ui/ReceiptView';

export const TransactionHistory: React.FC = () => {
  const { transactions } = usePosStore();
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="font-bold text-white text-base">Passkey Payment Log</h3>
        <p className="text-xs text-zinc-400">Live feed of transactions executed on Stellar Testnet.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Tx Hash</th>
              <th className="p-3">Amount USD</th>
              <th className="p-3">Amount XLM</th>
              <th className="p-3">Payment Type</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-zinc-500 font-sans">
                  No payments recorded yet. Perform a checkout in the POS Terminal to populate live transaction logs.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3 text-zinc-400">
                    {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3 font-mono text-teal-400">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline flex items-center space-x-1"
                    >
                      <span>{truncateStellarAddress(tx.txHash)}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </a>
                  </td>
                  <td className="p-3 font-bold text-white">${tx.amountUsd.toFixed(2)}</td>
                  <td className="p-3 font-bold text-teal-300">{tx.amountXlm.toFixed(1)} XLM</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-semibold flex items-center gap-1 w-fit">
                      <ShieldCheck className="w-3 h-3" /> {tx.paymentType}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg flex items-center space-x-1 font-sans text-[11px]"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <ReceiptView
              receipt={{
                receiptNumber: `INV-${selectedTx.id.slice(0, 6)}`,
                totalUsd: selectedTx.amountUsd,
                totalXlm: selectedTx.amountXlm,
                taxAmount: (selectedTx.amountUsd * 0.085),
                discountAmount: 0,
                txHash: selectedTx.txHash,
                createdAt: selectedTx.createdAt,
                items: selectedTx.items || [],
              }}
            />
            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
