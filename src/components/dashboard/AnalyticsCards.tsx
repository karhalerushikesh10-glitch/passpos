'use client';

import React from 'react';
import { usePosStore } from '@/store/usePosStore';
import { DollarSign, Coins, TrendingUp, ShoppingCart, ShieldCheck } from 'lucide-react';

export const AnalyticsCards: React.FC = () => {
  const { transactions, merchant } = usePosStore();

  const totalSalesUsd = transactions.reduce((acc, t) => acc + t.amountUsd, 0);
  const totalSalesXlm = transactions.reduce((acc, t) => acc + t.amountXlm, 0);
  const totalOrders = transactions.length;
  const avgTicketUsd = totalOrders > 0 ? totalSalesUsd / totalOrders : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Gross Revenue Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">Gross Sales</span>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold font-mono text-white">${totalSalesUsd.toFixed(2)}</h3>
          <p className="text-xs text-teal-400 font-mono mt-1">≈ {totalSalesXlm.toFixed(1)} XLM Processed</p>
        </div>
      </div>

      {/* Stellar XLM Balance Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">Stellar Testnet Balance</span>
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold font-mono text-white">
            {merchant.balanceXlm.toLocaleString(undefined, { maximumFractionDigits: 1 })} XLM
          </h3>
          <p className="text-xs text-zinc-400 font-mono mt-1">SDF Friendbot Active</p>
        </div>
      </div>

      {/* Total Orders Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">Completed Orders</span>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold font-mono text-white">{totalOrders}</h3>
          <p className="text-xs text-emerald-400 font-mono mt-1">100% WebAuthn Authenticated</p>
        </div>
      </div>

      {/* Average Ticket Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">Avg Ticket Size</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold font-mono text-white">${avgTicketUsd.toFixed(2)}</h3>
          <p className="text-xs text-zinc-400 font-mono mt-1">Per transaction average</p>
        </div>
      </div>
    </div>
  );
};
