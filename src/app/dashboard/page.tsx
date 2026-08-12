'use client';

import React from 'react';
import { AnalyticsCards } from '@/components/dashboard/AnalyticsCards';
import { InventoryTable } from '@/components/dashboard/InventoryTable';
import { TransactionHistory } from '@/components/dashboard/TransactionHistory';

export default function DashboardPage() {
  return (
    <div className="flex-1 bg-zinc-950 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Merchant Dashboard</h2>
        <p className="text-xs text-zinc-400">Overview of sales analytics, inventory management, and Stellar ledger activity.</p>
      </div>

      {/* Analytics Summary */}
      <AnalyticsCards />

      {/* Grid: Inventory & Transaction Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryTable />
        <TransactionHistory />
      </div>
    </div>
  );
}
