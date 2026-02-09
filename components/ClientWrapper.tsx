'use client';

import { useEffect, useState } from 'react';
import { WalletProvider } from '@/components/WalletProvider';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        {children}
      </>
    );
  }

  return <WalletProvider>{children}</WalletProvider>;
}
