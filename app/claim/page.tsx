"use client";

import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Download, CheckCircle, ExternalLink, Wallet, Lock, Shield, AlertTriangle } from "lucide-react";
import { generateKeyFilename } from "@/lib/crypto";
import { uploadToIPFS } from "@/lib/ipfs";
import { usePriorContract } from "@/hooks/usePriorContract";
import { useAccount, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function ClaimPage() {
  const { isConnected, address, chainId } = useAccount();
  const { fileClaim, isWritePending, useClaimFee } = usePriorContract();
  const { switchChain } = useSwitchChain();
  
  const isCorrectChain = chainId === 8453; // Base Mainnet
  const { data: claimFee } = useClaimFee(); // Get current claim fee in wei
  
  // State
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [encryptedData, setEncryptedData] = useState<ArrayBuffer | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [ipfsCid, setIpfsCid] = useState<string>("");
  const [assertion, setAssertion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [claimComplete, setClaimComplete] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [keyDownloaded, setKeyDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSwitchNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: 8453 });
    }
  };

  // Handle file upload + encryption
  const handleFileSelected = (
    selectedFile: File,
    encrypted: ArrayBuffer,
    iv: Uint8Array | null,
    key: string,
    usePassword: boolean
  ) => {
    setFile(selectedFile);
    setEncryptedData(encrypted);
    setEncryptionKey(key);
    setStep(2);
    setError(null);
    // Note: For password encryption, the IV is embedded in the encrypted data
    // For random key, IV is separate (legacy support)
  };

  // Download encryption key AND encrypted file bundle
  const downloadKey = () => {
    const bundle = {
      key: encryptionKey,
      filename: file?.name,
      timestamp: Date.now(),
      id: Math.random().toString(36).substring(2, 11),
    };

    const keyBlob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const keyUrl = URL.createObjectURL(keyBlob);
    const keyLink = document.createElement("a");
    keyLink.href = keyUrl;
    keyLink.download = generateKeyFilename();
    document.body.appendChild(keyLink);
    keyLink.click();
    document.body.removeChild(keyLink);
    URL.revokeObjectURL(keyUrl);

    if (encryptedData) {
      const encryptedBlob = new Blob([encryptedData]);
      const encryptedUrl = URL.createObjectURL(encryptedBlob);
      const encryptedLink = document.createElement("a");
      encryptedLink.href = encryptedUrl;
      encryptedLink.download = `${file?.name || "file"}.prior-encrypted`;
      document.body.appendChild(encryptedLink);
      encryptedLink.click();
      document.body.removeChild(encryptedLink);
      URL.revokeObjectURL(encryptedUrl);
    }

    setKeyDownloaded(true);
  };

  // Submit claim
  const handleSubmitClaim = async () => {
    if (!file || !encryptedData || !assertion) return;
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    if (!isCorrectChain) {
      setError("Please switch to Base Mainnet");
      return;
    }
    if (!claimFee) {
      setError("Loading claim fee... please try again");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const blob = new Blob([encryptedData]);
      const ipfsResult = await uploadToIPFS(blob, file.name);
      setIpfsCid(ipfsResult.cid);
      setStep(3);

      const { calculateFileHash } = await import("@/lib/crypto");
      const contentHash = ('0x' + await calculateFileHash(encryptedData)) as `0x${string}`;

      const result = await fileClaim({
        contentHash,
        ipfsCid: ipfsResult.cid,
        assertion,
        fileSizeBytes: file.size,
        value: claimFee,
      });

      if (result) {
        setTxHash(result.txHash || "");
        setClaimComplete(true);
        setStep(4);
      }
    } catch (err) {
      console.error("Claim failed:", err);
      setError(err instanceof Error ? err.message : "Failed to file claim");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 border border-indigo-200 mb-6">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Secure & Immutable</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            File Your Tesla Claim
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Timestamp your invention with cryptographic proof. 
            Immutable, decentralized, undeniable.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Wallet Connection */}
        {!isConnected && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="flex items-center justify-between py-6">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">Wallet Required</p>
                  <p className="text-sm text-amber-700">Connect your wallet to file a Tesla Claim</p>
                </div>
              </div>
              <ConnectButton />
            </CardContent>
          </Card>
        )}

        {/* Wrong Network Alert */}
        {isConnected && !isCorrectChain && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="flex items-center justify-between py-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Wrong Network</p>
                  <p className="text-sm text-red-700">Please switch to Base Mainnet</p>
                </div>
              </div>
              <Button 
                onClick={handleSwitchNetwork}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Switch to Base Mainnet
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 h-0.5 ${
                    step > s ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
                Upload Your File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader 
                onFileSelected={handleFileSelected} 
                allowPasswordEncryption={true}
              />
              <p className="text-sm text-slate-500 mt-4">
                Your file is encrypted in the browser using AES-256-GCM. 
                We never see your unencrypted data.
                {encryptionKey === "PRIOR_GENESIS_SEED" && " Using Genesis encryption mode."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Assertion + Download */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">2</span>
                  Download Your Key Bundle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-amber-50 rounded-xl border-2 border-amber-200">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-amber-600 mt-1" />
                    <div>
                      <p className="font-semibold text-amber-900 mb-2">⚠️ Critical: Save Both Files</p>
                      <p className="text-sm text-amber-800 mb-4">
                        You must download BOTH the key file AND the encrypted binary. 
                        Without both, you can never decrypt your file. We cannot recover them.
                      </p>
                      <Button
                        onClick={downloadKey}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Bundle (Key + Encrypted File)
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What Are You Claiming?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="assertion">Your Assertion *</Label>
                    <Input
                      id="assertion"
                      placeholder="e.g., 'I invented this widget on January 15, 2026'"
                      value={assertion}
                      onChange={(e) => setAssertion(e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      This is your claim. The network remembers; courts decide (if needed).
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Network Fee (Gas)</p>
                        <p className="text-sm text-slate-500">Small fee paid to Base validators</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">~$0.001</p>
                      <p className="text-xs text-slate-500">Typically &lt;0.0001 ETH</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitClaim}
                    disabled={!assertion || !keyDownloaded || isProcessing || isWritePending || !isConnected || !isCorrectChain}
                    className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white"
                  >
                    {isProcessing || isWritePending ? (
                      "Processing..."
                    ) : (
                      <>
                        File Tesla Claim
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  {isConnected && !isCorrectChain && (
                    <Button
                      onClick={handleSwitchNetwork}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      Switch to Base Mainnet to Submit
                    </Button>
                  )}

                  {!isConnected && (
                    <div className="flex justify-center mt-4">
                      <ConnectButton />
                    </div>
                  )}

                  {!keyDownloaded && (
                    <p className="text-sm text-amber-600 text-center">
                      Download the key bundle above before filing
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Anchoring */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Anchoring to Blockchain...</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
              <p className="text-lg text-slate-700">Writing claim to Base Sepolia...</p>
              <p className="text-sm text-slate-500 mt-2">IPFS CID: {ipfsCid}</p>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success */}
        {step === 4 && claimComplete && (
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Tesla Claim Filed!</CardTitle>
                  <p className="text-sm text-slate-500">Your invention is now timestamped on-chain</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">IPFS Content ID</p>
                  <p className="font-mono text-slate-700 break-all">{ipfsCid}</p>
                </div>

                {txHash && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Transaction Hash</p>
                    <p className="font-mono text-slate-700 truncate">{txHash}</p>
                    <a
                      href={`https://sepolia.basescan.org/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-500 mt-2"
                    >
                      View on BaseScan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Reminder:</strong> Keep your key file safe! 
                    Without it, you cannot decrypt your file—even though the claim is on-chain.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Link href="/claims" className="flex-1">
                    <Button variant="outline" className="w-full">
                      View My Claims
                    </Button>
                  </Link>
                  <Link href="/claim" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                      File Another
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
