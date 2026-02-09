"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Clock, Shield } from "lucide-react";
import { getClaims, connectWallet, type TeslaClaim } from "@/lib/blockchain";

export default function ClaimsPage() {
  const [claims, setClaims] = useState<TeslaClaim[]>([]);
  const [wallet, setWallet] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    const address = await connectWallet();
    if (address) {
      setWallet(address);
      const userClaims = await getClaims(address);
      setClaims(userClaims);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading your claims...</p>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">My Tesla Claims</h1>
          <p className="text-slate-600 mb-8">Connect your wallet to view your claims</p>
          <Button onClick={loadClaims}>Connect Wallet</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">My Tesla Claims</h1>
          <p className="text-slate-600">
            Connected: {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </p>
        </div>

        {claims.length === 0 ? (
          <Card className="bg-slate-100 border-slate-200">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-500" />
              <p className="text-slate-600 mb-4">No claims found</p>
              <a href="/claim">
                <Button>File Your First Claim</Button>
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <Card key={claim.id} className="bg-slate-100 border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="font-mono text-sm">{claim.id}</span>
                    <Badge className="bg-green-100 text-green-600">Confirmed</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-700">{claim.assertion}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Timestamp</p>
                      <p className="text-slate-700">
                        {new Date(claim.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Block</p>
                      <p className="text-slate-700">#{claim.blockNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Network</p>
                      <p className="text-slate-700 capitalize">{claim.chain || 'base'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500">IPFS CID</p>
                      <p className="text-slate-700 font-mono truncate">{claim.ipfsCid}</p>
                    </div>
                  </div>

                  <a
                    href={`https://basescan.org/tx/${claim.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-500"
                  >
                    View on BaseScan
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
