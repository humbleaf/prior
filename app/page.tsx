"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Lock, 
  Clock, 
  Database, 
  Shield, 
  FileText,
  Quote,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Scale,
  Eye,
  GitBranch,
  Moon,
  Zap,
  Lightbulb,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const steps = [
  { icon: FileText, title: "Upload", desc: "Any file, any format", color: "indigo" },
  { icon: Lock, title: "Encrypt", desc: "AES-256 in browser", color: "purple" },
  { icon: Database, title: "Store", desc: "Distributed IPFS", color: "pink" },
  { icon: Shield, title: "Anchor", desc: "Blockchain timestamp", color: "indigo" },
];

const brokenSystem = [
  { icon: AlertTriangle, title: "Trolls Win", desc: "$29B annual settlements", color: "red" },
  { icon: XCircle, title: "96.7% Invalid", desc: "Software patents overturned", color: "orange" },
  { icon: Scale, title: "$50K-500K", desc: "Patent attorney costs", color: "amber" },
  { icon: Clock, title: "3-5 Years", desc: "Average patent timeline", color: "yellow" },
];

const solution = [
  { icon: CheckCircle, title: "$9 Per Claim", desc: "Affordable Tesla claims", color: "green" },
  { icon: Clock, title: "5 Minutes", desc: "Instant timestamping", color: "emerald" },
  { icon: Database, title: "Immutable", desc: "Blockchain anchored", color: "teal" },
  { icon: Shield, title: "Public Evidence", desc: "User-asserted record", color: "cyan" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-200 shadow-sm mb-8">
            <Lock className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">The Tesla Claim Protocol</span>
          </div>

          {/* Tesla Sentence */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            File a Tesla Claim.
            <br />
            Before They Do.
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-4">
            Cryptographic proof of existence at time T. Immutable timestamps.
          </p>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            Under $10 to make forgetting impossible—not legal protection, just undeniable memory.
          </p>

          {/* The Tesla Sentence */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-10 max-w-2xl mx-auto">
            <Quote className="w-8 h-8 mx-auto mb-4 text-purple-400" />
            <blockquote className="text-lg italic text-slate-600 mb-3">
              "PRIOR exists so that no idea is ever lost to silence, theft, or time."
            </blockquote>
            <p className="text-sm text-slate-400">— The truth Tesla deserved</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/claim">
              <Button size="lg" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white px-8 py-6 text-lg shadow-lg shadow-purple-500/25">
                File Your First Tesla Claim
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/manifesto">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 px-8 py-6 text-lg">
                Read The Manifesto
              </Button>
            </Link>
          </div>

          {/* Price Callout */}
          <div className="mt-12 inline-flex items-center gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-left">
              <p className="text-sm text-slate-500">One Tesla Claim</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">$9</span>
                <span className="text-slate-500">ETH/Base</span>
              </div>
            </div>
            <div className="h-12 w-px bg-slate-200" />
            <div className="text-left">
              <p className="text-sm text-slate-500">Time required</p>
              <p className="text-4xl font-bold text-slate-900">5 min</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Broken System */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">The Patent System is Broken</h2>
          </div>
          
          <p className="text-center text-slate-500 mb-8 max-w-2xl mx-auto">
            Traditional patent protection has become inaccessible, slow, and weaponized by trolls.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {brokenSystem.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="bg-gradient-to-br from-red-50 to-orange-50 border-red-100">
                  <CardContent className="p-6">
                    <Icon className={`w-8 h-8 text-red-500 mb-4`} />
                    <h3 className="text-xl font-bold mb-2 text-slate-900">{item.title}</h3>
                    <p className="text-slate-600">{item.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">The Prior Solution</h2>
          </div>
          
          <p className="text-center text-slate-500 mb-8 max-w-2xl mx-auto">
            Not a replacement for patents. A memory primitive. Fair, fast, and accessible to all.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {solution.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="bg-white border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <Icon className={`w-8 h-8 text-green-500 mb-4`} />
                    <h3 className="text-xl font-bold mb-2 text-slate-900">{item.title}</h3>
                    <p className="text-slate-600">{item.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">How Tesla Claims Work</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="bg-white border-slate-200 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-300 mb-2">{idx + 1}</div>
                    <h3 className="font-bold mb-1 text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-500">{step.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* The "Do Nothing" Check */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <Moon className="w-6 h-6 text-cyan-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-slate-900">The "Do Nothing" Check</h2>
            <p className="text-lg text-slate-600">
              If we do absolutely nothing else for a year, does PRIOR still function?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/80 border-cyan-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-10 h-10 mx-auto mb-4 text-cyan-600" />
                <h3 className="font-bold mb-2 text-slate-900">Protocol, Not Product</h3>
                <p className="text-sm text-slate-600">Contracts are deployed. IPFS persists. Timestamping continues.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-cyan-200">
              <CardContent className="p-6 text-center">
                <Shield className="w-10 h-10 mx-auto mb-4 text-cyan-600" />
                <h3 className="font-bold mb-2 text-slate-900">Reduced Attack Surface</h3>
                <p className="text-sm text-slate-600">No dependencies on our continued operation.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-cyan-200">
              <CardContent className="p-6 text-center">
                <Target className="w-10 h-10 mx-auto mb-4 text-cyan-600" />
                <h3 className="font-bold mb-2 text-slate-900">Respects Inevitability</h3>
                <p className="text-sm text-slate-600">We built memory that outlives us.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">What Your Tesla Claim Includes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <Clock className="w-8 h-8 text-indigo-500 mb-4" />
                <h3 className="font-bold text-lg mb-2 text-slate-900">Immutable Timestamp</h3>
                <p className="text-slate-600 text-sm">
                  Proof your file existed at a specific time. Anchored to Ethereum, unchangeable forever.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <Database className="w-8 h-8 text-purple-500 mb-4" />
                <h3 className="font-bold text-lg mb-2 text-slate-900">Distributed Storage</h3>
                <p className="text-slate-600 text-sm">
                  Your encrypted file stored on IPFS. Survives single points of failure. Remains accessible even if we disappear.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <Lock className="w-8 h-8 text-pink-500 mb-4" />
                <h3 className="font-bold text-lg mb-2 text-slate-900">Your Private Key</h3>
                <p className="text-slate-600 text-sm">
                  Download your encryption key. Without it, no one can decrypt—not us, not anyone. True zero-knowledge.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <Lightbulb className="w-16 h-16 mx-auto mb-6 text-white" />
          <h2 className="text-4xl font-bold mb-4 text-white">Ready to Timestamp Your Claim?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join inventors filing Tesla claims to establish priority.
            Your first claim costs less than lunch.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/claim">
              <Button className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-2">
                <Zap className="w-5 h-5" />
                File a Tesla Claim
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="px-8 py-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors border-white/40">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
