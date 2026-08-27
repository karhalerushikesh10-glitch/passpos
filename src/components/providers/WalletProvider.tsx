'use client';

import { useEffect } from 'react';
import { useWalletStore } from '@/store/useWalletStore';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const checkConnection = useWalletStore((state) => state.checkConnection);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return <>{children}</>;
}
