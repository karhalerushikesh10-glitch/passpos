'use client';

import React, { useState } from 'react';
import { usePosStore } from '@/store/usePosStore';
import { X, Delete, Plus, Tag, Calculator } from 'lucide-react';

export const NumpadModal: React.FC = () => {
  const { numpadModalOpen, setNumpadModalOpen, addCustomCharge } = usePosStore();
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [itemLabel, setItemLabel] = useState<string>('Custom Charge');

  if (!numpadModalOpen) return null;

  const handleKeyPress = (val: string) => {
    if (val === 'CLEAR') {
      setDisplayValue('0');
    } else if (val === 'BACK') {
      setDisplayValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (val === '.') {
      if (!displayValue.includes('.')) {
        setDisplayValue((prev) => prev + '.');
      }
    } else {
      setDisplayValue((prev) => (prev === '0' ? val : prev + val));
    }
  };

  const handleAdd = () => {
    const amount = parseFloat(displayValue);
    if (!isNaN(amount) && amount > 0) {
      addCustomCharge(amount, itemLabel || 'Custom Charge');
      setDisplayValue('0');
      setNumpadModalOpen(false);
    }
  };

  const numKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'BACK'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-white text-base">Custom Entry</h3>
          </div>
          <button
            onClick={() => setNumpadModalOpen(false)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="p-5 bg-zinc-950 border-b border-zinc-800">
          <input
            type="text"
            placeholder="Item Description (optional)"
            value={itemLabel}
            onChange={(e) => setItemLabel(e.target.value)}
            className="w-full bg-transparent text-xs text-zinc-400 placeholder-zinc-600 focus:outline-none mb-2 font-medium"
          />
          <div className="text-right">
            <span className="text-xs text-zinc-500 font-mono block">USD Amount</span>
            <span className="text-4xl font-bold font-mono text-white tracking-tight">
              ${displayValue}
            </span>
          </div>
        </div>

        {/* Keypad Grid */}
        <div className="p-4 grid grid-cols-3 gap-2 bg-zinc-900">
          {numKeys.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="h-14 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 text-xl font-bold font-mono text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"
            >
              {key === 'BACK' ? <Delete className="w-5 h-5 text-zinc-400" /> : key}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex space-x-2">
          <button
            onClick={() => handleKeyPress('CLEAR')}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-sm transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleAdd}
            className="flex-2 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center space-x-2 px-6 shadow-glow-teal"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>
    </div>
  );
};
