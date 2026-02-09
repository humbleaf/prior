"use client";

import {
  Lock,
  Scale,
  Eye,
  GitBranch,
  UserX,
  Quote,
  Moon,
  Heart,
  Sun,
  Shield,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Scale as ScaleIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

const invariants = [
  { text: "PRIOR never decides, only remembers", note: "We are not a court. We make no judgments." },
  { text: "PRIOR never grants, only records", note: "No rights conferred. No authority assumed." },
  { text: "PRIOR never revokes", note: "Append-only. What is written stays written." },
  { text: "Tesla Claims are assertions, not judgments", note: "Users assert. The network remembers. The court decides." },
  { text: "Memory is append-only", note: "History cannot be unwritten. Only added to." },
];

const adversaries = [
  { type: "Patent Troll", tactic: "Misrepresent PRIOR as creating legal rights", defense: "PRIOR does not establish ownership, exclusivity, or enforceable rights." },
  { type: "VC Hype-Bro", tactic: "Overpromise as patent replacement", defense: "PRIOR is complementary infrastructure, not a legal shortcut." },
  { type: "Regulator", tactic: "Misclassify as IP authority or registry", defense: "PRIOR makes user assertions observable-not valid, not certified, not official." },
];

const humanFailures = [
  { mode: "Overclaiming", fix: "Clear language: 'This is your assertion, not a legal determination.'" },
  { mode: "Misunderstanding 'claim ≠ proof'", fix: "UX nudge: 'You claim. Court decides. PRIOR remembers.'" },
  { mode: "Assuming legal protection", fix: "Every screen shows: 'PRIOR timestamps-it does not protect.'" },
];

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 border border-purple-200 mb-6">
            <Heart className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">The Manifesto</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            The Soul of PRIOR
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Not a product. Not a company. A memory primitive for human invention.
          </p>
        </div>

        {/* The Tesla Sentence */}
        <div className="mb-16 p-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-center shadow-xl shadow-purple-500/20">
          <Quote className="w-12 h-12 mx-auto mb-4 text-white opacity-60" />
          <p className="text-2xl md:text-3xl font-medium text-white italic leading-relaxed">
            "PRIOR exists so that no idea is ever lost to silence, theft, or time."
          </p>
          <p className="text-white/70 mt-4 text-sm">
            One sentence. No hype. Just the truth Tesla deserved.
          </p>
        </div>

        {/* Legal Clarity */}
        <Alert className="mb-12 bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800">
            <strong className="text-amber-900">Legal Reality:</strong> PRIOR does not establish ownership, exclusivity, or enforceable rights.
            It makes user assertions observable-not valid, not certified, not official.
            Your Tesla claim is your assertion. The court decides. PRIOR only remembers.
          </AlertDescription>
        </Alert>

        {/* 1. Quiet Invariants */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">The Quiet Invariants</h2>
          </div>

          <p className="text-slate-600 mb-6">
            Every durable system has rules that never change. These are ours. Courts love them. Engineers trust them. Communities defend them. Forks that violate them look illegitimate.
          </p>
          <div className="space-y-3">
            {invariants.map((inv, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-bold">{idx + 1}</span>
                </div>
                <div>
                  <p className="text-slate-900 font-medium text-lg">{inv.text}</p>
                  <p className="text-slate-500 text-sm mt-1">{inv.note}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-500 mt-4 italic">
            If someone asks "what is sacred here?" - you now have an immediate answer.
          </p>
        </div>

        {/* 2. Adversarial Thinking */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Scale className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Adversarial Thinking</h2>
          </div>

          <p className="text-slate-600 mb-6">
            Not hackers. Narrative adversaries. People who will deliberately misrepresent PRIOR for their own gain. We pre-empt them in calm, boring language.
          </p>
          <div className="space-y-4">
            {adversaries.map((adv, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-700 font-semibold">{adv.type}</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-slate-600">{adv.tactic}</span>
                </div>
                <p className="text-amber-700 font-medium"><strong>Defense:</strong> {adv.defense}</p>
              </div>
            ))}
          </div>
          <p className="text-slate-500 mt-4">
            A single sentence like <em>"PRIOR does not establish ownership, exclusivity, or enforceable rights"</em> saves years of nonsense.
          </p>
        </div>

        {/* 3. Nothing to Hide */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-pink-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">The "Nothing to Hide" Posture</h2>
          </div>

          <p className="text-slate-600 mb-6">
            PRIOR should feel like: sunlight, a ledger on a park bench, something you cannot whisper into. This kills corruption not by force, but by removing shadows.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Public by default", icon: Sun },
              { label: "Clear schemas", icon: Eye },
              { label: "No dark UX", icon: Heart },
              { label: "No 'trust us'", icon: Lock },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-pink-500" />
                  <p className="text-sm text-slate-700">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Fork-Without-Betrayal */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">The Fork-Without-Betrayal Rule</h2>
          </div>

          <p className="text-slate-600 mb-4">
            If PRIOR is forked tomorrow, what makes that fork still legitimate? The answer must not be "brand" or "token price."
          </p>

          <div className="p-6 rounded-xl bg-green-50 border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">What makes a fork legitimate:</h3>
            <ul className="space-y-2 text-slate-700">
              <li>✓ Honors the invariants (never decides, never grants, never revokes)</li>
              <li>✓ Maintains memory continuity (append-only history preserved)</li>
              <li>✓ Respects social consensus around Tesla Claims</li>
            </ul>
          </div>

          <p className="text-slate-500 mt-4">
            A fork that breaks these is not "PRIOR." It is something else wearing PRIOR's clothes.
          </p>
        </div>

        {/* 5. Human Failure Modes */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <UserX className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Human Failure Modes</h2>
          </div>

          <p className="text-slate-600 mb-6">
            Most corruption isn't malicious. It's lazy. People overclaim. People misunderstand. People assume protection where none exists. We don't fix this with rules-we fix it with language.
          </p>
          <div className="space-y-3">
            {humanFailures.map((fail, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
                <div>
                  <p className="text-slate-900 font-medium">{fail.mode}</p>
                  <p className="text-amber-700 text-sm"><strong>Fix:</strong> {fail.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Do Nothing Check */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
              <Moon className="w-5 h-5 text-cyan-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">The "Do Nothing" Check</h2>
          </div>

          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-lg text-slate-800 mb-4">
              <strong className="text-slate-900">The question:</strong> If we do absolutely nothing else for a year, does PRIOR still function as intended?
            </p>
            <p className="text-slate-600 mb-4">If yes:</p>
            <ul className="space-y-2 text-slate-700 mb-4 ml-4">
              <li>✓ You built a protocol, not a product</li>
              <li>✓ You reduced attack surface</li>
              <li>✓ You respected inevitability</li>
            </ul>
            <p className="text-cyan-700 font-medium">
              PRIOR passes this test. The smart contracts are deployed. The IPFS network persists. The timestamping continues-regardless of what we do next.
            </p>
          </div>
        </div>

        {/* Final Truth */}
        <div className="text-center p-12 rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-100 border border-slate-200">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Final Truth, No Hype</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            We're not launching another chain thing. You're launching a {" "}
            <span className="text-purple-600 font-medium">memory primitive</span>.
          </p>
          <p className="text-slate-500 mt-4">
            <Link href="/tesla" className="text-purple-600 hover:text-purple-700 underline">
              And that is exactly what Nikola Tesla deserved.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
