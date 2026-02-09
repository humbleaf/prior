/**
 * Blockchain anchoring for PRIOR
 * Anchors file hashes to Base (L2) for immutable timestamping
 * 
 * Note: This is a mock implementation for the UI.
 * Real implementation would use ethers.js with a smart contract on Base
 */

const BASE_CHAIN_ID = 8453;
const BASE_RPC_URL = "https://mainnet.base.org";
const BASE_EXPLORER = "https://basescan.org";

export interface AnchorResult {
  txHash: string;
  blockNumber: number;
  timestamp: number;
  gasUsed: string;
}

export interface TeslaClaim {
  id: string;
  fileHash: string;
  ipfsCid: string;
  timestamp: number;
  txHash: string;
  blockNumber: number;
  assertion: string; // User's claim statement
  owner: string; // Ethereum address
  chain: string; // "base" or "ethereum"
}

/**
 * Anchor a file hash to the blockchain
 * In production: Calls the PRIOR smart contract on Base
 */
export async function anchorToBlockchain(
  fileHash: string,
  ipfsCid: string,
  assertion: string,
  ownerAddress: string
): Promise<AnchorResult> {
  // MOCK: Simulate blockchain transaction
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const mockTxHash = generateMockTxHash();
  const mockBlockNumber = Math.floor(Math.random() * 10000000) + 15000000;

  const result: AnchorResult = {
    txHash: mockTxHash,
    blockNumber: mockBlockNumber,
    timestamp: Date.now(),
    gasUsed: "0.0005", // Lower gas on Base
  };

  // Create claim record
  const claim: TeslaClaim = {
    id: `claim-${Date.now()}`,
    fileHash,
    ipfsCid,
    timestamp: Date.now(),
    txHash: result.txHash,
    blockNumber: result.blockNumber,
    assertion,
    owner: ownerAddress,
    chain: "base",
  };

  // Save to localStorage (demo only - production saves to blockchain + backend)
  const existing = JSON.parse(localStorage.getItem("prior_claims") || "[]");
  existing.push(claim);
  localStorage.setItem("prior_claims", JSON.stringify(existing));

  return result;
}

/**
 * Get Base explorer URL for a transaction
 */
export function getBaseExplorerUrl(txHash: string): string {
  return `${BASE_EXPLORER}/tx/${txHash}`;
}

/**
 * Get all claims for an address
 */
export async function getClaims(address: string): Promise<TeslaClaim[]> {
  const stored = JSON.parse(localStorage.getItem("prior_claims") || "[]");
  return stored.filter((claim: TeslaClaim) => claim.owner === address);
}

/**
 * Get a single claim by ID
 */
export async function getClaim(id: string): Promise<TeslaClaim | null> {
  const stored = JSON.parse(localStorage.getItem("prior_claims") || "[]");
  return stored.find((claim: TeslaClaim) => claim.id === id) || null;
}

/**
 * Mock wallet connection
 * In production: Uses MetaMask, WalletConnect, etc. with Base network
 */
export async function connectWallet(): Promise<string | null> {
  // Check if we have a mock address stored
  const mockAddress = localStorage.getItem("prior_mock_address");
  if (mockAddress) {
    return mockAddress;
  }

  // Generate a mock Ethereum address
  const newAddress = generateMockAddress();
  localStorage.setItem("prior_mock_address", newAddress);
  return newAddress;
}

/**
 * Get chain info
 */
export function getChainInfo() {
  return {
    name: "Base",
    chainId: BASE_CHAIN_ID,
    rpcUrl: BASE_RPC_URL,
    explorer: BASE_EXPLORER,
    currency: "ETH",
  };
}

/**
 * Disconnect wallet
 */
export function disconnectWallet(): void {
  localStorage.removeItem("prior_mock_address");
}

/**
 * Check if wallet is connected
 */
export function getConnectedAddress(): string | null {
  return localStorage.getItem("prior_mock_address");
}

// Mock generators

function generateMockTxHash(): string {
  return "0x" + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function generateMockAddress(): string {
  return "0x" + Array.from({ length: 40 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}
