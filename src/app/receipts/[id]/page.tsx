'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ReceiptView } from '@/components/ui/ReceiptView';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReceiptPage() {
  const params = useParams();
  const id = params?.id as string;
  const [receipt, setReceipt] = useState<any | null>(null);

  useEffect(() => {
    // Render demo receipt object
    setReceipt({
      receiptNumber: `INV-${id?.slice(0, 6) || '948201'}`,
      totalUsd: 18.30,
      totalXlm: 183.0,
      taxAmount: 1.45,
      discountAmount: 0,
      txHash: 'a89c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c',
      createdAt: new Date().toISOString(),
      items: [
        { product: { title: 'Espresso Double Shot', priceUsd: 3.50 }, quantity: 2 },
        { product: { title: 'Smoked Salmon Bagel', priceUsd: 11.00 }, quantity: 1 },
      ],
      merchantStore: 'Stellar Artisanal Coffee & Bakery',
    });
  }, [id]);

  if (!receipt) return null;

  return (
    <div className="flex-1 bg-zinc-950 p-6 flex flex-col items-center justify-center space-y-4">
      <Link
        href="/pos"
        className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to POS Terminal</span>
      </Link>
      <ReceiptView receipt={receipt} />
    </div>
  );
}
