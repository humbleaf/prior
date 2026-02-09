'use client';

import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

export function MetaMaskConnectButton() {
  const { connect, isPending } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [hasMetaMask, setHasMetaMask] = useState<boolean | null>(null);

  // Check if MetaMask is installed
  useEffect(() => {
    const checkMetaMask = () => {
      const isMetaMask = typeof window !== 'undefined' && 
        window.ethereum && 
        (window.ethereum as any).isMetaMask;
      setHasMetaMask(!!isMetaMask);
    };
    checkMetaMask();
  }, []);

  const handleConnect = () => {
    if (hasMetaMask) {
      // Direct injected connection - no popup
      connect({ connector: injected({ target: 'metaMask' }) });
    } else {
      // Fallback to standard RainbowKit behavior
      // This will open the wallet selection modal
      const event = new CustomEvent('rainbowkit-connect');
      window.dispatchEvent(event);
    }
  };

  if (isConnected && address) {
    return (
      <Button
        variant="outline"
        onClick={() => disconnect()}
        className="font-mono"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isPending}
      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isPending ? 'Connecting...' : hasMetaMask ? 'Connect MetaMask' : 'Connect Wallet'}
    </Button>
  );
}
