import { create } from 'zustand';
import {
  isConnected,
  getPublicKey,
  getNetwork,
  signTransaction,
} from '@stellar/freighter-api';

interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  isConnecting: boolean;
  error: string | null;
  
  connect: () => Promise<void>;
  disconnect: () => void;
  checkConnection: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  publicKey: null,
  network: null,
  isConnecting: false,
  error: null,

  connect: async () => {
    set({ isConnecting: true, error: null });
    try {
      const connected = await isConnected();
      if (!connected) {
        set({ isConnecting: false, error: 'Freighter wallet not installed or not available.' });
        return;
      }
      const publicKey = await getPublicKey();
      const network = await getNetwork();
      set({
        isConnected: !!publicKey,
        publicKey: publicKey || null,
        network: network || null,
        isConnecting: false,
      });
    } catch (error: any) {
      set({ isConnecting: false, error: error.message || 'Failed to connect wallet.' });
    }
  },

  disconnect: () => {
    set({ isConnected: false, publicKey: null, network: null, error: null });
  },

  checkConnection: async () => {
    try {
      const connected = await isConnected();
      if (connected) {
        const publicKey = await getPublicKey();
        const network = await getNetwork();
        if (publicKey) {
          set({ isConnected: true, publicKey, network });
        }
      }
    } catch (e) {
      console.warn('Silent wallet check failed', e);
    }
  },
}));
