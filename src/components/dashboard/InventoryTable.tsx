'use client';

import React, { useState, useEffect } from 'react';
import { ProductItem } from '@/store/usePosStore';
import { Plus, Package, Tag, Search, CheckCircle2, X } from 'lucide-react';

export const InventoryTable: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceUsd: '',
    category: 'Beverages',
    imageEmoji: '☕',
    stock: '100',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.priceUsd) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          priceUsd: parseFloat(formData.priceUsd),
          priceXlm: parseFloat(formData.priceUsd) * 10,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setFormData({
          title: '',
          description: '',
          priceUsd: '',
          category: 'Beverages',
          imageEmoji: '☕',
          stock: '100',
        });
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-base">Store Catalog & Inventory</h3>
          <p className="text-xs text-zinc-400">Manage products, stock levels, and POS pricing.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price USD</th>
              <th className="p-3">Price XLM</th>
              <th className="p-3">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-zinc-500 font-sans">
                  No catalog items found. Click "Add New Product" to populate your inventory.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3 flex items-center space-x-3 font-sans">
                    <span className="text-xl p-1.5 bg-zinc-800 rounded-lg">{p.imageEmoji}</span>
                    <div>
                      <span className="font-semibold text-white block">{p.title}</span>
                      <span className="text-zinc-500 text-[11px] block">{p.description}</span>
                    </div>
                  </td>
                  <td className="p-3 font-sans">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px]">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">${p.priceUsd.toFixed(2)}</td>
                  <td className="p-3 text-teal-400 font-bold">{(p.priceUsd * 10).toFixed(1)} XLM</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.stock < 20
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="font-bold text-white text-base">Add New POS Product</h4>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Iced Chai"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="4.50"
                    value={formData.priceUsd}
                    onChange={(e) => setFormData({ ...formData, priceUsd: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  >
                    <option>Beverages</option>
                    <option>Bakery</option>
                    <option>Food</option>
                    <option>Merch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={formData.imageEmoji}
                    onChange={(e) => setFormData({ ...formData, imageEmoji: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-2 transition-colors"
              >
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
