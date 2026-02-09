// hooks/usePriorContract.ts - Smart contract interactions

import { useWriteContract, useReadContract, useAccount, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { parseEther } from 'viem';

// Base Sepolia chain definition
const BASE_SEPOLIA = {
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
};

// Contract ABI - matches PRIORTeslaClaim.sol
const PRIOR_ABI = [
  {
    inputs: [
      { name: '_contentHash', type: 'bytes32' },
      { name: '_ipfsCid', type: 'string' },
      { name: '_assertion', type: 'string' },
    ],
    name: 'fileClaim',
    outputs: [{ name: 'claimId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_claimId', type: 'uint256' }],
    name: 'getClaim',
    outputs: [{
      name: '',
      type: 'tuple',
      components: [
        { name: 'contentHash', type: 'bytes32' },
        { name: 'ipfsCid', type: 'string' },
        { name: 'assertion', type: 'string' },
        { name: 'claimant', type: 'address' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'blockNumber', type: 'uint256' },
        { name: 'exists', type: 'bool' },
      ],
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_claimant', type: 'address' }],
    name: 'getClaimsByClaimant',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalClaims',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_claimId', type: 'uint256' }],
    name: 'claimExists',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_contentHash', type: 'bytes32' }],
    name: 'getClaimIdByHash',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Contract address - Base Sepolia deployment
const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_PRIOR_CONTRACT_ADDRESS || '0x2405DBaDD194C132713e902d99C8482c771601A4') as `0x${string}`;

// NOTE: fileClaim is NOT payable - no ETH required
// User pays gas fees only, not a protocol fee

export interface ClaimData {
  contentHash: `0x${string}`;
  ipfsCid: string;
  assertion: string;
}

export interface FiledClaim {
  claimId: number;
  contentHash: `0x${string}`;
  ipfsCid: string;
  assertion: string;
  claimant: `0x${string}`;
  timestamp: number;
  blockNumber: number;
  exists: boolean;
  txHash?: `0x${string}`;
}

export function usePriorContract() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync, isPending: isWritePending, error: writeError } = useWriteContract();
  
  // Check if user is on correct network (Base Sepolia = 84532)
  const isCorrectChain = chainId === 84532;
  
  const switchToBaseSepolia = () => {
    if (switchChain) {
      switchChain({ chainId: 84532 });
    }
  };

  /**
   * File a new Tesla Claim
   */
  const fileClaim = async (data: ClaimData): Promise<FiledClaim | null> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    if (!isCorrectChain) {
      throw new Error('Please switch to Base Sepolia network (Chain ID: 84532)');
    }

    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('Contract not deployed yet');
    }

    try {
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: PRIOR_ABI,
        functionName: 'fileClaim',
        args: [data.contentHash, data.ipfsCid, data.assertion],
        // Note: fileClaim is NOT payable - no ETH value sent
      });

      // In a real implementation, we'd wait for the transaction receipt
      // and parse the event logs to get the claimId
      // For now, return mock data
      return {
        claimId: 0, // Will be populated from event logs
        contentHash: data.contentHash,
        ipfsCid: data.ipfsCid,
        assertion: data.assertion,
        claimant: address!,
        timestamp: Math.floor(Date.now() / 1000),
        blockNumber: 0, // Will be populated from receipt
        exists: true,
        txHash,
      };
    } catch (error) {
      console.error('Failed to file claim:', error);
      throw error;
    }
  };

  /**
   * Get a claim by ID
   */
  const useGetClaim = (claimId: number) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: PRIOR_ABI,
      functionName: 'getClaim',
      args: [BigInt(claimId)],
      query: {
        enabled: claimId > 0 && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
      },
    });
  };

  /**
   * Get claims by address
   */
  const useGetClaimsByAddress = (claimantAddress?: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: PRIOR_ABI,
      functionName: 'getClaimsByClaimant',
      args: [claimantAddress || address!],
      query: {
        enabled: !!(claimantAddress || address) && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
      },
    });
  };

  /**
   * Check if a claim exists
   */
  const useClaimExists = (claimId: number) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: PRIOR_ABI,
      functionName: 'claimExists',
      args: [BigInt(claimId)],
      query: {
        enabled: claimId > 0 && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
      },
    });
  };

  /**
   * Get total claims count
   */
  const useTotalClaims = () => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: PRIOR_ABI,
      functionName: 'totalClaims',
      query: {
        enabled: CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
      },
    });
  };

  return {
    // Write functions
    fileClaim,
    isWritePending,
    writeError,
    
    // Read functions
    useGetClaim,
    useGetClaimsByAddress,
    useClaimExists,
    useTotalClaims,
    
    // Connection state
    isConnected,
    address,
    chainId,
    
    // Chain switching
    isCorrectChain,
    switchToBaseSepolia,
    
    // Contract info
    contractAddress: CONTRACT_ADDRESS,
  };
}
