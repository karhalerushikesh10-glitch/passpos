'use client';

import React from 'react';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { CartDrawer } from '@/components/pos/CartDrawer';
import { NumpadModal } from '@/components/pos/NumpadModal';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { QrPaymentModal } from '@/components/pos/QrPaymentModal';

export default function PosPage() {
  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-61px)] overflow-hidden bg-zinc-950">
      {/* Product Catalog Grid (Left / Center) */}
      <ProductGrid />

      {/* Order Cart Drawer (Right) */}
      <CartDrawer />

      {/* Modals */}
      <NumpadModal />
      <PaymentModal />
      <QrPaymentModal />
    </div>
  );
}
