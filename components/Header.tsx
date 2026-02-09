"use client";

import Link from "next/link";
import { Lock, FileText, List, BookOpen, Fingerprint, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";

// Wallet button that only renders on client to avoid hydration issues
function WalletButton() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="opacity-50 pointer-events-none">
        <Wallet className="w-4 h-4 mr-2" />
        Connect
      </Button>
    );
  }
  
  return (
    <ConnectButton 
      showBalance={false}
      accountStatus="address"
      chainStatus="icon"
    />
  );
}

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight">Prior</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Tesla Claims for Inventors</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/manifesto">
              <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50">
                <BookOpen className="w-4 h-4 mr-2" />
                Manifesto
              </Button>
            </Link>
            <Link href="/first-claim">
              <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50">
                <Fingerprint className="w-4 h-4 mr-2" />
                First Claim
              </Button>
            </Link>
            <Link href="/claim">
              <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50">
                <FileText className="w-4 h-4 mr-2" />
                File Claim
              </Button>
            </Link>
            <Link href="/claims">
              <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50">
                <List className="w-4 h-4 mr-2" />
                My Claims
              </Button>
            </Link>
          </nav>

          {/* Wallet Connect + CTA */}
          <div className="flex items-center gap-3">
            <WalletButton />
            <Link href="/claim" className="hidden sm:block">
              <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white shadow-md shadow-purple-500/20">
                File Claim
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
