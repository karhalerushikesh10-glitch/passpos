'use client';

import React, { useState, useEffect } from 'react';
import { usePosStore, ProductItem } from '@/store/usePosStore';
import { Search, Plus, Sparkles, Filter, Tag } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { addToCart, currency, xlmExchangeRate } = usePosStore();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        setProducts(data.products);
      } else {
        // Fallback default menu items if database is empty
        setProducts(DEFAULT_PRODUCTS);
      }
    } catch (e) {
      setProducts(DEFAULT_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Beverages', 'Bakery', 'Food', 'Merch'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 p-4 md:p-6 overflow-y-auto">
      {/* Search and Category Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search catalog or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-glow'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Product Cards */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-500">Loading catalog...</p>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px] text-center border-2 border-dashed border-zinc-800 rounded-2xl p-8">
          <div>
            <Tag className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-zinc-300 font-semibold text-sm">No items found</h3>
            <p className="text-zinc-500 text-xs mt-1">Try refining your search query or category filter.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredProducts.map((product) => {
            const displayPrice =
              currency === 'USD'
                ? `$${product.priceUsd.toFixed(2)}`
                : `${(product.priceUsd * xlmExchangeRate).toFixed(1)} XLM`;

            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="group relative bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-blue-500/50 rounded-2xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pos flex flex-col justify-between"
              >
                {/* Emoji Icon & Stock Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 group-hover:bg-blue-600/10 flex items-center justify-center text-2xl transition-colors">
                    {product.imageEmoji || '📦'}
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                    Stock: {product.stock}
                  </span>
                </div>

                {/* Product Info */}
                <div>
                  <h4 className="font-semibold text-white text-sm tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">
                    {product.title}
                  </h4>
                  {product.description && (
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{product.description}</p>
                  )}
                </div>

                {/* Price and Add Icon */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/80">
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm font-mono">{displayPrice}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {currency === 'USD'
                        ? `${(product.priceUsd * xlmExchangeRate).toFixed(1)} XLM`
                        : `$${product.priceUsd.toFixed(2)} USD`}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-blue-600 text-zinc-300 group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 'def-1',
    title: 'Espresso Double Shot',
    description: 'Rich organic Ethiopian single-origin espresso',
    priceUsd: 3.50,
    priceXlm: 35.0,
    category: 'Beverages',
    imageEmoji: '☕',
    stock: 250,
  },
  {
    id: 'def-2',
    title: 'Cold Brew Stellar',
    description: '18-hour cold steeped nitro coffee',
    priceUsd: 4.80,
    priceXlm: 48.0,
    category: 'Beverages',
    imageEmoji: '🥤',
    stock: 180,
  },
  {
    id: 'def-3',
    title: 'Matcha Latte Soroban',
    description: 'Ceremonial grade Uji matcha with oat milk',
    priceUsd: 5.20,
    priceXlm: 52.0,
    category: 'Beverages',
    imageEmoji: '🍵',
    stock: 120,
  },
  {
    id: 'def-4',
    title: 'Butter Croissant',
    description: 'Flaky French butter pastry baked daily',
    priceUsd: 3.80,
    priceXlm: 38.0,
    category: 'Bakery',
    imageEmoji: '🥐',
    stock: 90,
  },
  {
    id: 'def-5',
    title: 'Avocado Toast Deluxe',
    description: 'Sourdough, smashed avocado & poached egg',
    priceUsd: 9.50,
    priceXlm: 95.0,
    category: 'Food',
    imageEmoji: '🥑',
    stock: 60,
  },
  {
    id: 'def-6',
    title: 'Smoked Salmon Bagel',
    description: 'Everything bagel with dill cream cheese',
    priceUsd: 11.00,
    priceXlm: 110.0,
    category: 'Food',
    imageEmoji: '🥯',
    stock: 45,
  },
  {
    id: 'def-7',
    title: 'Acai Bowl Supreme',
    description: 'Organic acai, hemp seeds & banana',
    priceUsd: 8.50,
    priceXlm: 85.0,
    category: 'Food',
    imageEmoji: '🫐',
    stock: 50,
  },
  {
    id: 'def-8',
    title: 'Stellar Tote Bag',
    description: 'Heavyweight organic cotton POS tote',
    priceUsd: 15.00,
    priceXlm: 150.0,
    category: 'Merch',
    imageEmoji: '🛍️',
    stock: 30,
  },
];
