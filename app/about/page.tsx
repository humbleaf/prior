"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Clock, Database, Shield, Scale, Eye, GitBranch, UserX, Quote } from "lucide-react";

const steps = [
  { icon: Lock, title: "Upload & Encrypt", desc: "Your file is encrypted in your browser using AES-256-GCM. We never see your unencrypted data.", color: "indigo" },
  { icon: Database, title: "Store on IPFS", desc: "Encrypted chunks are distributed across the IPFS network. No single point of failure.", color: "purple" },
  { icon: Clock, title: "Anchor to Blockchain", desc: "A cryptographic hash is written to Ethereum, creating an immutable timestamp.", color: "pink" },
  { icon: Shield, title: "Take Your Key", desc: "Download your private key. Without it, no one can decrypt—not even us.", color: "indigo" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-16">

        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-400 bg-clip-text text-transparent">
            How PRIOR Works
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            A Tesla Claim is a timestamped assertion—cryptographic proof that your invention existed at a specific time.
          </p>
        </div>

        {/* The Tesla Sentence */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-center">
          <Quote className="w-10 h-10 mx-auto mb-4 text-slate-900 opacity-60" />
          <p className="text-2xl md:text-3xl font-medium text-slate-900 italic">
            "PRIOR exists so that no idea is ever lost to silence, theft, or time."
          </p>
          <p className="text-slate-900/70 mt-4">
            — The truth Tesla deserved.
          </p>
        </div>

        {/* The Steps */}
        <div>
          <h2 className="text-2xl font-bold mb-8 text-center">The Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="bg-slate-100 border-slate-200">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Step {idx + 1}</p>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{step.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* The Invariants */}
        <div>
          <h2 className="text-2xl font-bold mb-8 text-center">The Quiet Invariants</h2>
          <p className="text-slate-600 text-center mb-6">
            These rules never change. They are the foundation of PRIOR.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              "Never decides, only remembers",
              "Never grants, only records",
              "Never revokes",
              "Claims are assertions, not judgments",
              "Memory is append-only",
            ].map((text) => (
              <div key={text} className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center">
                <Lock className="w-5 h-5 mx-auto mb-2 text-indigo-600" />
                <p className="text-sm text-slate-900 font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What It Is NOT */}
        <Alert className="bg-amber-50 border-amber-100">
          <AlertDescription className="text-amber-200/80">
            <strong className="text-amber-400">Important:</strong> PRIOR does not establish ownership, exclusivity, or enforceable rights.
            It does not certify originality or validate authorship. It is not a substitute for legal counsel.
            PRIOR makes user assertions observable—not valid, not certified, not official.
          </AlertDescription>
        </Alert>

        {/* The "Nothing to Hide" Posture */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">The "Nothing to Hide" Posture</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Sunlight (Public by default)", icon: Eye },
              { label: "Clear Schemas", icon: Scale },
              { label: "No Dark UX", icon: Lock },
              { label: "No 'Trust Us'", icon: Shield },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-pink-400" />
                  <p className="text-sm text-slate-700">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center p-8 rounded-2xl bg-slate-100 border border-slate-200">
          <p className="text-xl text-slate-900 mb-4">
            Ready to establish priority?
          </p>
          <p className="text-slate-600 mb-6">
            File your first Tesla claim in under 5 minutes.
          </p>
          <a href="/claim" className="inline-block">
            <button className="px-8 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity">
              File a Tesla Claim
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
