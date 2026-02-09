'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { base, baseSepolia } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'Prior — Tesla Claims',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'PRIOR_WALLET_CONNECT',
  chains: [base], // Base Mainnet only for production
});

const queryClient = new QueryClient();

export function WalletProviderInner({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#7C3AED',
            accentColorForeground: 'white',
            borderRadius: 'large',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
