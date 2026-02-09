'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamically import the wallet provider with no SSR
const WalletProviderInner = dynamic(
  () => import('./WalletProviderInner').then((mod) => mod.WalletProviderInner),
  { ssr: false }
);

// Wrapper that provides a fallback during SSR
export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WalletProviderInner>
      {children}
    </WalletProviderInner>
  );
}
