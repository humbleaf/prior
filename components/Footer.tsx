"use client";

import { Lock, Shield, Scale, Eye, GitBranch, UserX, Moon, Zap } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const invariants = [
  { title: "Never decides", note: "Only remembers", icon: Shield },
  { title: "Never grants", note: "Only records", icon: Scale },
  { title: "Never revokes", note: "Append-only", icon: Lock },
  { title: "Claims are assertions", note: "Not judgments", icon: UserX },
  { title: "Memory is permanent", note: "Cannot be unwritten", icon: GitBranch },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Invariants - The Sacred Rules */}
        <div className="mb-8 p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-500" />
            The Quiet Invariants
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
            {invariants.map((inv) => {
              const Icon = inv.icon;
              return (
                <div key={inv.title} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-indigo-500" />
                    <p className="text-slate-900 font-medium">{inv.title}</p>
                  </div>
                  <p className="text-slate-500 text-xs">{inv.note}</p>
                </div>
              );
            })}
          </div>
        </div>

        <Separator className="bg-slate-200 mb-6" />

        {/* Disclaimer - Required on all pages */}
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-700">
            <strong>Disclaimer:</strong> PRIOR is an informational tool that timestamps and records user-asserted claims. 
            It does not confer legal rights, validate originality, or certify authorship. PRIOR is not a substitute for legal counsel. 
            Your Tesla claim is your assertion — the network only remembers, it does not judge.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <p>© 2026 Prior — A memory primitive for human invention, with love for Adam.</p>
            <span className="text-slate-300">|</span>
            <Link 
              href="/tesla" 
              className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <Zap className="w-3 h-3" />
              Why Tesla Claim?
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <p>Network: Base</p>
            <span className="text-slate-300">|</span>
            <p className="text-purple-600 font-medium">Mainnet L2</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
