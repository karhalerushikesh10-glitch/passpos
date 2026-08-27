'use client';

import React from 'react';
import { usePosStore } from '@/store/usePosStore';
import {
  Trash2,
  Plus,
  Minus,
  Calculator,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Percent,
  ArrowRight,
  X
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    currency,
    xlmExchangeRate,
    discountPercentage,
    setDiscount,
    getSubtotalUsd,
    getDiscountAmountUsd,
    getTaxAmountUsd,
    getTotalUsd,
    getTotalXlm,
    setPaymentModalOpen,
    setQrModalOpen,
    setNumpadModalOpen,
    mobileCartOpen,
    setMobileCartOpen,
  } = usePosStore();

  const subtotal = getSubtotalUsd();
  const discountVal = getDiscountAmountUsd();
  const taxVal = getTaxAmountUsd();
  const totalUsd = getTotalUsd();
  const totalXlm = getTotalXlm();

  return (
    <aside
      className={`
        fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-zinc-900 border-l border-zinc-800 flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:z-auto
        ${mobileCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-white text-base">Current Order</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} items
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Custom Numpad Button */}
          <button
            onClick={() => setNumpadModalOpen(true)}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Open Numpad for Custom Charge"
          >
            <Calculator className="w-4 h-4 text-teal-400" />
          </button>

          {/* Clear Cart */}
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
              title="Clear Cart"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileCartOpen(false)}
            className="lg:hidden p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-400">Cart is empty</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">
              Tap on items from the menu catalog or use the Numpad for custom charges.
            </p>
          </div>
        ) : (
          cart.map(({ product, quantity }) => {
            const itemTotalUsd = product.priceUsd * quantity;
            const itemTotalXlm = itemTotalUsd * xlmExchangeRate;

            return (
              <div
                key={product.id}
                className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between group hover:border-zinc-700 transition-colors"
              >
                {/* Item Info */}
                <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
                  <span className="text-xl p-2 bg-zinc-900 rounded-lg">{product.imageEmoji}</span>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-semibold text-white truncate">{product.title}</h5>
                    <p className="text-xs font-mono text-zinc-400">
                      {currency === 'USD'
                        ? `$${product.priceUsd.toFixed(2)} each`
                        : `${(product.priceUsd * xlmExchangeRate).toFixed(1)} XLM each`}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Price */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(product.id, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-white font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="block text-sm font-bold text-white font-mono">
                      {currency === 'USD' ? `$${itemTotalUsd.toFixed(2)}` : `${itemTotalXlm.toFixed(1)} XLM`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Checkout Footer */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800 space-y-3">
        {/* Discount Selector */}
        <div className="flex items-center justify-between bg-zinc-900 p-2 rounded-xl border border-zinc-800/80">
          <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
            <Percent className="w-3.5 h-3.5 text-blue-400" />
            Discount
          </span>
          <div className="flex space-x-1">
            {[0, 5, 10, 15, 20].map((d) => (
              <button
                key={d}
                onClick={() => setDiscount(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  discountPercentage === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {d}%
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Rows */}
        <div className="space-y-1.5 text-xs text-zinc-400 font-mono px-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-zinc-200">
              {currency === 'USD' ? `$${subtotal.toFixed(2)}` : `${(subtotal * xlmExchangeRate).toFixed(1)} XLM`}
            </span>
          </div>

          {discountPercentage > 0 && (
            <div className="flex justify-between text-teal-400">
              <span>Discount ({discountPercentage}%)</span>
              <span>
                {currency === 'USD'
                  ? `-$${discountVal.toFixed(2)}`
                  : `-${(discountVal * xlmExchangeRate).toFixed(1)} XLM`}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Estimated Tax (8.5%)</span>
            <span className="text-zinc-200">
              {currency === 'USD' ? `$${taxVal.toFixed(2)}` : `${(taxVal * xlmExchangeRate).toFixed(1)} XLM`}
            </span>
          </div>

          <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800">
            <span className="font-sans">Total Due</span>
            <div className="text-right">
              <span className="block text-teal-400 font-mono">
                {currency === 'USD' ? `$${totalUsd.toFixed(2)}` : `${totalXlm.toFixed(1)} XLM`}
              </span>
              <span className="block text-[11px] font-normal text-zinc-400 font-mono">
                {currency === 'USD' ? `${totalXlm.toFixed(1)} XLM` : `$${totalUsd.toFixed(2)} USD`}
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Buttons */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {/* Dynamic QR Code Button */}
          <button
            disabled={cart.length === 0}
            onClick={() => setQrModalOpen(true)}
            className="col-span-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-700 text-white font-semibold rounded-xl py-3 px-3 flex flex-col items-center justify-center transition-all text-xs space-y-1"
          >
            <QrCode className="w-4 h-4 text-teal-400" />
            <span>QR Code</span>
          </button>

          {/* Passkey Express Checkout */}
          <button
            disabled={cart.length === 0}
            onClick={() => setPaymentModalOpen(true)}
            className="col-span-3 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 px-4 flex items-center justify-center space-x-2 transition-all shadow-glow hover:shadow-glow-teal group"
          >
            <ShieldCheck className="w-5 h-5 text-white" />
            <span className="text-sm">Passkey Pay</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  );
};
