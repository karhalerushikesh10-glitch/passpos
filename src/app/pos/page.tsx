'use client';

import React from 'react';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { CartDrawer } from '@/components/pos/CartDrawer';
import { NumpadModal } from '@/components/pos/NumpadModal';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { QrPaymentModal } from '@/components/pos/QrPaymentModal';
import { usePosStore } from '@/store/usePosStore';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function PosPage() {
  const { cart, getTotalUsd, getTotalXlm, currency, setMobileCartOpen } = usePosStore();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalUsd = getTotalUsd();
  const totalXlm = getTotalXlm();

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-61px)] overflow-hidden bg-zinc-950 relative">
      {/* Product Catalog Grid (Left / Center) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <ProductGrid />

        {/* Mobile Floating Cart Summary Bar (Visible only on screens < lg) */}
        {totalItems > 0 && (
          <div className="lg:hidden p-3 bg-zinc-900/95 border-t border-zinc-800 backdrop-blur-md sticky bottom-0 z-30">
            <button
              onClick={() => setMobileCartOpen(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-95 text-white font-bold rounded-xl flex items-center justify-between shadow-glow transition-transform active:scale-[0.99]"
            >
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center font-mono text-xs">
                  {totalItems}
                </div>
                <span className="text-xs">View Order Cart</span>
              </div>
              <div className="flex items-center space-x-2 font-mono text-xs">
                <span>{currency === 'USD' ? `$${totalUsd.toFixed(2)}` : `${totalXlm.toFixed(1)} XLM`}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Order Cart Drawer (Desktop side-panel & Mobile slide-over) */}
      <CartDrawer />

      {/* Modals */}
      <NumpadModal />
      <PaymentModal />
      <QrPaymentModal />
    </div>
  );
}
