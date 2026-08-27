import { create } from 'zustand';

export interface ProductItem {
  id: string;
  title: string;
  description?: string | null;
  priceUsd: number;
  priceXlm: number;
  category: string;
  imageEmoji: string;
  stock: number;
  barcode?: string | null;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
  notes?: string;
}

export interface MerchantState {
  id: string;
  storeName: string;
  email: string;
  stellarPublicKey: string;
  sorobanContractId: string;
  currencyPreference: string;
  balanceXlm: number;
  passkeyRegistered: boolean;
}

export interface TransactionRecord {
  id: string;
  txHash: string;
  amountUsd: number;
  amountXlm: number;
  paymentType: string;
  status: string;
  customerRef?: string;
  items: CartItem[];
  createdAt: string;
}

interface PosStore {
  // Merchant State
  merchant: MerchantState;
  setMerchant: (merchant: Partial<MerchantState>) => void;
  updateMerchantBalance: (balance: number) => void;

  // Cart State
  cart: CartItem[];
  addToCart: (product: ProductItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  addCustomCharge: (amountUsd: number, description?: string) => void;

  // Pricing & Currency
  currency: 'USD' | 'XLM';
  xlmExchangeRate: number; // 1 USD = 10 XLM
  discountPercentage: number;
  taxPercentage: number;
  setDiscount: (percent: number) => void;
  setTax: (percent: number) => void;
  toggleCurrency: () => void;

  // Calculations
  getSubtotalUsd: () => number;
  getDiscountAmountUsd: () => number;
  getTaxAmountUsd: () => number;
  getTotalUsd: () => number;
  getTotalXlm: () => number;

  // Modals & UI Controls
  paymentModalOpen: boolean;
  qrModalOpen: boolean;
  numpadModalOpen: boolean;
  mobileCartOpen: boolean;
  feedbackModalOpen: boolean;
  setPaymentModalOpen: (open: boolean) => void;
  setQrModalOpen: (open: boolean) => void;
  setNumpadModalOpen: (open: boolean) => void;
  setMobileCartOpen: (open: boolean) => void;
  setFeedbackModalOpen: (open: boolean) => void;

  // Receipts & History
  activeReceipt: any | null;
  setActiveReceipt: (receipt: any) => void;
  transactions: TransactionRecord[];
  addTransaction: (tx: TransactionRecord) => void;
}

const DEFAULT_CONTRACT_ID =
  process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID ||
  'CA3B7TZCS7MICD5OWQRE3Q265HPURBYU2YFEWJV2KCBCIW4NO36LV5U6';

export const usePosStore = create<PosStore>((set, get) => ({
  merchant: {
    id: 'demo-merchant-id',
    storeName: 'Stellar Artisanal Coffee & Bakery',
    email: 'cashier@passpos.stellar',
    stellarPublicKey: 'GBV2Z6D564T5E2W7Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6',
    sorobanContractId: DEFAULT_CONTRACT_ID,
    currencyPreference: 'USD',
    balanceXlm: 10000.0,
    passkeyRegistered: true,
  },
  setMerchant: (updated) =>
    set((state) => ({ merchant: { ...state.merchant, ...updated } })),
  updateMerchantBalance: (balance) =>
    set((state) => ({ merchant: { ...state.merchant, balanceXlm: balance } })),

  cart: [],
  addToCart: (product) =>
    set((state) => {
      const existingIndex = state.cart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...state.cart];
        updated[existingIndex].quantity += 1;
        return { cart: updated };
      }
      return { cart: [...state.cart, { product, quantity: 1 }] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),
  updateQuantity: (productId, delta) =>
    set((state) => {
      const updated = state.cart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
      return { cart: updated };
    }),
  clearCart: () => set({ cart: [], discountPercentage: 0 }),
  addCustomCharge: (amountUsd, description = 'Custom Entry') =>
    set((state) => {
      const customItem: ProductItem = {
        id: `custom_${Date.now()}`,
        title: description,
        description: 'Manual Numpad Item',
        priceUsd: amountUsd,
        priceXlm: amountUsd * state.xlmExchangeRate,
        category: 'Custom',
        imageEmoji: '🧮',
        stock: 999,
      };
      return { cart: [...state.cart, { product: customItem, quantity: 1 }] };
    }),

  currency: 'USD',
  xlmExchangeRate: 10,
  discountPercentage: 0,
  taxPercentage: 8.5,
  setDiscount: (percent) => set({ discountPercentage: percent }),
  setTax: (percent) => set({ taxPercentage: percent }),
  toggleCurrency: () =>
    set((state) => ({ currency: state.currency === 'USD' ? 'XLM' : 'USD' })),

  getSubtotalUsd: () => {
    const { cart } = get();
    return cart.reduce((acc, item) => acc + item.product.priceUsd * item.quantity, 0);
  },
  getDiscountAmountUsd: () => {
    const { getSubtotalUsd, discountPercentage } = get();
    return (getSubtotalUsd() * discountPercentage) / 100;
  },
  getTaxAmountUsd: () => {
    const { getSubtotalUsd, getDiscountAmountUsd, taxPercentage } = get();
    const taxableSubtotal = getSubtotalUsd() - getDiscountAmountUsd();
    return (taxableSubtotal * taxPercentage) / 100;
  },
  getTotalUsd: () => {
    const { getSubtotalUsd, getDiscountAmountUsd, getTaxAmountUsd } = get();
    return Math.max(0, getSubtotalUsd() - getDiscountAmountUsd() + getTaxAmountUsd());
  },
  getTotalXlm: () => {
    const { getTotalUsd, xlmExchangeRate } = get();
    return getTotalUsd() * xlmExchangeRate;
  },

  paymentModalOpen: false,
  qrModalOpen: false,
  numpadModalOpen: false,
  mobileCartOpen: false,
  feedbackModalOpen: false,
  setPaymentModalOpen: (open) => set({ paymentModalOpen: open }),
  setQrModalOpen: (open) => set({ qrModalOpen: open }),
  setNumpadModalOpen: (open) => set({ numpadModalOpen: open }),
  setMobileCartOpen: (open) => set({ mobileCartOpen: open }),
  setFeedbackModalOpen: (open) => set({ feedbackModalOpen: open }),

  activeReceipt: null,
  setActiveReceipt: (receipt) => set({ activeReceipt: receipt }),
  transactions: [],
  addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
}));
