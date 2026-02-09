"use client";

import { useState, useEffect } from "react";
import { Lock, Download, Globe, Fingerprint, Database, Clock, Shield, ExternalLink, Archive, CheckCircle, Zap, Key } from "lucide-react";
import Link from "next/link";

interface FirstClaimData {
  ipfsCid: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
  sha256: string;
  sizeBytes: number;
  description: string;
  decryptionKey?: string;
}

// 🎉 Genesis Tesla Claim #1 — The Timeless Package
// Filed: Sun Feb 8, 2026 22:15:27 CST
// Contract: 0x4971ec14D71156Ab945c32238b29969308a022D6 (Base Mainnet)
const FIRST_CLAIM: FirstClaimData = {
  ipfsCid: "bafybeif6mkotu45gcaspvfklpqj7cqznlbtcih7bn2ruejru4megxis6te",
  timestamp: "Sun Feb 8, 2026 22:15:27 CST (Unix: 1770610527)",
  txHash: "0x5b718011393efa7e0405c8090bdf4331ec04af935245e867aecf55cbca83f4b6",
  blockNumber: 41910590,
  sha256: "0xA309902383A269AC712CA3F0982CBAA9387655E3E29AF4CE16440F82D376748F",
  sizeBytes: 16777216, // ~16MB
  description: "PRIOR Timeless Package v1.0.1 — The complete protocol, encrypted and immortalized. Self-referential proof of existence.",
  decryptionKey: "PRIOR_GENESIS_SEED"
};

// For pre-deployment display, we use placeholder URLs
const BLOCK_EXPLORER_URL = FIRST_CLAIM.txHash.startsWith("0x") 
  ? `https://basescan.org/tx/${FIRST_CLAIM.txHash}`
  : "#";
const IPFS_GATEWAY_URL = FIRST_CLAIM.ipfsCid.startsWith("Qm") || FIRST_CLAIM.ipfsCid.startsWith("bafy")
  ? `https://gateway.pinata.cloud/ipfs/${FIRST_CLAIM.ipfsCid}`
  : "#";

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

  const isDeployed = FIRST_CLAIM.blockNumber > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Genesis Claim #1 Filed</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Tesla Claim #1
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-8">
            The first memory filed on PRIOR was the protocol itself. <br />
            Encrypted. Uploaded to IPFS. Anchored to Base. <br />
            <span className="text-white/70">Self-referential proof of existence.</span>
          </p>
          
          {isDeployed && (
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <span className="text-white/60">IPFS CID</span>
                <p className="font-mono">{FIRST_CLAIM.ipfsCid.slice(0, 20)}...</p>
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <span className="text-white/60">Block</span>
                <p className="font-mono">#{FIRST_CLAIM.blockNumber.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-16 px-4">
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
                {isDeployed 
                  ? `Transaction recorded on Base at block #${FIRST_CLAIM.blockNumber.toLocaleString()}. `
                  : "Transaction will be recorded on Base. "
                }
                Immutable proof of existence at time T. Survives any server shutdown.
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
            
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-purple-300 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Why We Call It a Tesla Claim</h3>
              <p className="text-slate-600 mb-4">
                Named in honor of Nikola Tesla, whose inventions were stolen from him because 
                the world had no way to prove his ideas existed first.
              </p>
              <Link 
                href="/tesla"
                className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Read Tesla's story
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                <Key className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Resurrection Key</h3>
              <p className="text-slate-600 mb-4">
                If PRIOR ever goes offline, Claim #1 can be decrypted using the seed 
                phrase <code className="bg-slate-100 px-1 rounded font-mono text-indigo-600">PRIOR_GENESIS_SEED</code>.
              </p>
              <p className="text-xs text-slate-500">
                This key is also published via Bitcoin OP_RETURN and stored in multiple 
                offline locations for redundancy. (Pending: tomorrow)
              </p>
            </div>
          </div>
        </div>

        {/* Genesis Claim #1 — Timeless Package */}
        <div className="mb-16 p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Archive className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Claim #1 — The Timeless Package</h2>
          </div>
          
          <p className="text-slate-600 mb-6">
            Unlike user claims that protect inventions, Claim #1 protects <strong>PRIOR itself</strong>. 
            It contains the complete website, encryption tools, smart contracts, and documentation—
            encrypted as a <strong>self-referential proof</strong>. If prior-claim.xyz ever disappears, 
            anyone can reconstruct the entire system from this single claim.
          </p>

          <div className="mb-6 p-4 bg-white rounded-xl border border-indigo-200">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" />
              Decryption Instructions
            </h3>
            <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
              <li>Query Claim #1 from the PRIOR smart contract (0x4971ec...)</li>
              <li>Download the encrypted tarball from the IPFS CID on Base Mainnet</li>
              <li>Decrypt using: <code className="bg-indigo-100 px-2 py-0.5 rounded font-mono text-indigo-700">openssl enc -aes-256-cbc -pbkdf2 -iter 100000</code></li>
              <li>
                <strong>Decryption key:</strong>
                <code className="bg-indigo-100 px-2 py-0.5 rounded font-mono text-indigo-700 mx-1">PRIOR_GENESIS_SEED</code>
              </li>
              <li>Extract with <code className="bg-slate-100 px-1 rounded">tar -xzf</code> — PRIOR lives again</li>
            </ol>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600" />
                Download v1.0.1
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Complete static export. Unzip, open index.html. No server needed. 
                Works offline forever. Self-contained immortal software.
              </p>
              <div className="space-y-2">
                <a 
                  href="/prior-genesis-claim-0.tar.gz"
                  download
                  className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Timeless Package
                </a>
                <p className="text-xs text-slate-500 text-center">
                  16MB • SHA256: 40398711...bca4259
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                What's Inside
              </h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>✓ Complete web app (Next.js static export)</li>
                <li>✓ Smart contracts (PRIORTeslaClaim v2)</li>
                <li>✓ Foundry deployment scripts</li>
                <li>✓ Documentation & architecture</li>
                <li>✓ Genesis key file</li>
                <li>✓ Decryption instructions</li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-amber-800 text-sm">
              <strong>The Promise:</strong> Even if every server fails, the blockchain persists. 
              Even if we disappear, the decryption key is public. PRIOR is memory that outlives 
              the knower—including its creators.
            </p>
          </div>
        </div>

        {/* On-Chain Proof */}
        {isDeployed && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-600" />
              Proof of Existence
            </h2>
            
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">IPFS Content ID</p>
                  <p className="font-mono text-slate-700 break-all text-sm">{FIRST_CLAIM.ipfsCid}</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-1">Block Number</p>
                  <p className="font-mono text-slate-700">#{FIRST_CLAIM.blockNumber.toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-1">Timestamp</p>
                  <p className="font-mono text-slate-700">
                    {FIRST_CLAIM.timestamp}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-1">Network</p>
                  <p className="font-mono text-slate-700">Base Mainnet</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-500 mb-1">Blockchain Transaction</p>
                    <p className="font-mono text-slate-700 text-sm break-all">{FIRST_CLAIM.txHash}</p>
                  </div>
                  
                  <a
                    href={BLOCK_EXPLORER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors whitespace-nowrap"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on BaseScan
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 mb-12">
          <p className="text-sm text-amber-800">
            <strong>Legal Notice:</strong> PRIOR does not confer legal rights, validate originality, 
            or certify authorship. This claim records the existence of a file at a specific moment 
            in time. You claim. The network remembers. Courts decide (if it ever comes to that).
          </p>
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
