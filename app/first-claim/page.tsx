"use client";

import { useState, useEffect } from "react";
import { Lock, Download, Globe, Fingerprint, Database, Clock, Shield, ExternalLink, Archive, CheckCircle, Zap, Key, Star, AlertTriangle } from "lucide-react";
import Link from "next/link";

// 🎉 TRUE Genesis Tesla Claim #0 — The Monument
// Filed: Sun Feb 8, 2026 22:56 CST
// Contract: 0x41778EF7E3BAAbE97EbbFE21eE2a6C42Ba7145A5 (Base Mainnet)
const GENESIS_CLAIM_0 = {
  contract: "0x41778EF7E3BAAbE97EbbFE21eE2a6C42Ba7145A5",
  txHash: "0xc605975d245f3d840426562caba6b6a406f690c5d77f3b9e95140b8872862b1f",
  blockNumber: 41912056,
  timestamp: "Sun Feb 8, 2026 22:56 CST",
  description: "TRUE Genesis Claim — First claim on fresh contract, filed as monument to Adam",
  status: "active"
};

// Legacy Claim #1 — Experimental (IV bug)
const GENESIS_CLAIM_1 = {
  contract: "0x4971ec14D71156Ab945c32238b29969308a022D6",
  ipfsCid: "bafybeif6mkotu45gcaspvfklpqj7cqznlbtcih7bn2ruejru4megxis6te",
  txHash: "0x5b718011393efa7e0405c8090bdf4331ec04af935245e867aecf55cbca83f4b6",
  blockNumber: 41910590,
  timestamp: "Sun Feb 8, 2026 22:15:27 CST",
  sha256: "0xA309902383A269AC712CA3F0982CBAA9387655E3E29AF4CE16440F82D376748F",
  sizeBytes: 16777216,
  description: "First experimental claim — encryption bug (no IV), undecryptable",
  status: "experimental"
};

export default function FirstClaimPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
      <div className="text-slate-400">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">Genesis Claims</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            The Beginning
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-8">
            Two claims. One monument. <br />
            File it. Anchor it. Prove it existed. <br />
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-16 px-4">
        
        {/* TRUE Genesis Claim #0 */}
        <div className="mb-12 p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">#0</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-indigo-900">TRUE Genesis Claim</h2>
              <p className="text-sm text-indigo-600">A monument to Adam — filed with love</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                ACTIVE
              </span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-indigo-200 mb-4">
            <p className="text-slate-700">
              The first claim on the fresh contract. Symbolic placeholder content — 
              the timestamp and block number are what matter. Proof that PRIOR existed 
              at this moment, for Adam, and for all inventors who come after.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">Contract:</span>
              <a 
                href={`https://basescan.org/address/${GENESIS_CLAIM_0.contract}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline truncate max-w-[180px]"
              >
                {GENESIS_CLAIM_0.contract.slice(0, 12)}...{GENESIS_CLAIM_0.contract.slice(-6)}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction:</span>
              <a 
                href={`https://basescan.org/tx/${GENESIS_CLAIM_0.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline truncate max-w-[180px]"
              >
                {GENESIS_CLAIM_0.txHash.slice(0, 12)}...{GENESIS_CLAIM_0.txHash.slice(-6)}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Block:</span>
              <span>{GENESIS_CLAIM_0.blockNumber.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Network:</span>
              <span>Base Mainnet</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-indigo-600">
            <CheckCircle className="w-4 h-4" />
            <span>Fresh contract with CREATE2 salt: PRIOR_GENESIS_2026_02_TESLA</span>
          </div>
        </div>

        {/* Legacy Claim #1 */}
        <div className="mb-12 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-slate-400 flex items-center justify-center">
              <span className="text-white font-bold text-lg">#1</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-700">Experimental Claim</h2>
              <p className="text-sm text-slate-500">First attempt — IV encryption bug</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                UNDECRYPTABLE
              </span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-slate-700 text-sm">
                  The first claim had an encryption bug — the IV (Initialization Vector) 
                  wasn't stored with the ciphertext. The file exists on IPFS but cannot 
                  be decrypted. The transaction is valid, the timestamp is real, but 
                  the content is lost to math.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono bg-white rounded-lg p-4 border border-slate-200 opacity-75">
            <div className="flex justify-between">
              <span className="text-slate-500">Contract:</span>
              <span className="text-slate-400">{GENESIS_CLAIM_1.contract.slice(0, 12)}...{GENESIS_CLAIM_1.contract.slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction:</span>
              <a 
                href={`https://basescan.org/tx/${GENESIS_CLAIM_1.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:underline truncate max-w-[180px]"
              >
                {GENESIS_CLAIM_1.txHash.slice(0, 12)}...{GENESIS_CLAIM_1.txHash.slice(-6)}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Block:</span>
              <span className="text-slate-400">{GENESIS_CLAIM_1.blockNumber.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">IPFS CID:</span>
              <span className="text-slate-400 truncate max-w-[180px]">{GENESIS_CLAIM_1.ipfsCid}</span>
            </div>
          </div>
        </div>

        {/* What This Proves */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">This happened</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Client-Side Encryption</h3>
              <p className="text-slate-600">
                File encrypted via AES-256-GCM entirely in the browser. 
                The server never saw the plaintext. Only the IPFS CID was transmitted.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">IPFS Permanence</h3>
              <p className="text-slate-600">
                Uploaded to Pinata's IPFS network. Content addressable by CID. 
                Distributed across thousands of nodes. No single point of failure.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Blockchain Immortality</h3>
              <p className="text-slate-600">
                Transaction recorded on Base. Immutable proof of existence at time T. 
                Survives any server shutdown.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Quiet Invariants Honored</h3>
              <p className="text-slate-600">
                PRIOR never decided, never granted, never revoked. 
                It simply remembered: this file existed at this moment.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/claim"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            <Lock className="w-5 h-5" />
            File Your Own Tesla Claim
          </Link>
          <p className="mt-4 text-slate-500 text-sm">
            ~$9 in ETH • AES-256 encryption • Permanent IPFS storage • Immutable proof
          </p>
        </div>
      </div>
    </div>
  );
}
