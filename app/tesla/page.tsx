"use client";

import { Zap, Quote, Clock, Globe, Shield, Lightbulb, Radio, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TeslaTributePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero — Electric Purple Theme */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-slate-900 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 py-24">
          {/* Electric Burst Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-30" />
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <Zap className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-center text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
              Nikola Tesla
            </span>
          </h1>

          <p className="text-center text-xl md:text-2xl text-purple-200/80 max-w-2xl mx-auto mb-8">
            The man who invented the 20th century. <br />
            <span className="text-purple-300">The reason we remember.</span>
          </p>

          <div className="flex justify-center gap-4 text-sm text-purple-300/60">
            <span>1856 — 1943</span>
            <span>•</span>
            <span>Inventor • Engineer • Futurist</span>
            <span>•</span>
            <span>300+ Patents</span>
          </div>
        </div>
      </div>

      {/* The Tragedy Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">The Tragedy That Inspired PRIOR</h2>
          <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-transparent mx-auto" />
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-slate-700/50">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Quote className="w-6 h-6 text-purple-400" />
            </div>
            <blockquote className="text-xl md:text-2xl text-slate-300 italic leading-relaxed">
              "Marconi is a good fellow. Let him continue. He is using seventeen of my patents."
            </blockquote>
          </div>
          <p className="text-slate-400 text-right">— Nikola Tesla, 1898</p>
        </div>

        <div className="mt-12 prose prose-invert prose-lg max-w-none text-slate-300">
          <p className="text-xl leading-relaxed">
            In 1898, Tesla demonstrated the first radio-controlled boat. The audience thought it was 
            mind-reading or magic. It was science. But when the time came to patent radio transmission, 
            Tesla was busy building Wardenclyffe Tower—his dream of free wireless energy for the world.
          </p>

          <p className="text-xl leading-relaxed">
            Guglielmo Marconi filed first. The U.S. Patent Office initially rejected Marconi's 
            application, citing Tesla's prior work. But Marconi had powerful backers. In 1904, 
            suddenly, the Patent Office reversed—without explanation—and awarded Marconi the patent 
            for radio.
          </p>

          <p className="text-xl leading-relaxed">
            The U.S. Navy used Marconi's equipment during World War I. After the war, Tesla sued. 
            In 1943—the year Tesla died—the Supreme Court finally ruled that Tesla's patents 
            had priority. Marconi's patents were invalidated.
          </p>

          <div className="bg-purple-900/20 border-l-4 border-purple-500 p-6 my-8 rounded-r-lg">
            <p className="text-purple-200 text-xl font-medium">
              But Tesla was already dead. He died penniless in a New York hotel room, 
              despite having invented the technology that powers our modern world: 
              alternating current, the induction motor, radio, X-rays, remote control, 
              and the foundations of wireless communication.
            </p>
          </div>
        </div>
      </div>

      {/* The Pattern */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
            The Pattern That Repeats
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: "The Timing Problem",
                desc: "First to invent ≠ First to file. Ideas get lost in gap between conception and paperwork."
              },
              {
                icon: Globe,
                title: "The Memory Problem",
                desc: "Institutions forget. Files get lost. Credit goes to whoever has better lawyers, not better ideas."
              },
              {
                icon: Shield,
                title: "The Power Problem",
                desc: "Small inventors can't fight giants. Even when right, justice comes too late—or never."
              }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tesla's Gifts to the World */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
          What Tesla Built
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { year: "1882", invention: "Rotating Magnetic Field", desc: "The foundation of AC power" },
            { year: "1888", invention: "Induction Motor", desc: "Still used in every appliance today" },
            { year: "1891", invention: "Tesla Coil", desc: "Wireless transmission, radio, medical devices" },
            { year: "1893", invention: "Radio Transmission", desc: "Before Marconi's demonstration" },
            { year: "1895", invention: "X-Ray Imaging", desc: "Simultaneous with Röntgen" },
            { year: "1898", invention: "Remote Control", desc: "Radio-controlled boat demo" },
            { year: "1900", invention: "Wireless Power Concept", desc: "Wardenclyffe Tower—ahead by 100 years" },
            { year: "1917", invention: "Radar Proposal", desc: "Ignored by Navy until WWII" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <div className="w-16 text-purple-400 font-mono font-bold">{item.year}</div>
              <div>
                <h4 className="font-semibold text-white">{item.invention}</h4>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-slate-500 text-sm">
          And 300+ more patents. Many of which never made him a dime.
        </div>
      </div>

      {/* The PRIOR Connection */}
      <div className="bg-purple-900/20 border-y border-purple-500/20 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-8 h-8 text-purple-400" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Why We Named It "Tesla Claims"
          </h2>

          <p className="text-xl text-slate-300 leading-relaxed mb-8">
            Tesla didn't need legal protection. He needed <strong>undeniable memory</strong>. 
            A way to prove—absolutely, cryptographically, permanently—that he was there first. 
            That his ideas existed at time T.
          </p>

          <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50">
            <p className="text-lg text-slate-300 leading-relaxed">
              If Tesla had filed a <strong>Tesla Claim</strong> in 1893—a cryptographic proof 
              of his radio demonstration—stored on an immutable, timestamped ledger, 
              connected to a distributed, permanent storage network... 
            </p>
            <p className="text-lg text-purple-200 font-medium mt-4">
              history might have been different.
            </p>
          </div>
        </div>
      </div>

      {/* The New Covenant */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
          What We Promise
        </h2>

        <div className="space-y-6">
          {[
            {
              icon: FileText,
              title: "Not Legal Protection",
              desc: "PRIOR doesn't grant rights. Only records assertions. You're claiming—not being granted."
            },
            {
              icon: Radio,
              title: "Not Validation",
              desc: "PRIOR doesn't check if your idea is original. It only proves it existed at time T."
            },
            {
              icon: Zap,
              title: "Not Revocable",
              desc: "Once filed, always filed. No take-backs. No deletions. The network remembers forever."
            },
            {
              icon: Shield,
              title: "Just Memory",
              desc: "Cryptographic, distributed, permanent. You claim. The network remembers. Courts decide (if ever)."
            }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-6 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Quote className="w-12 h-12 text-purple-400 mx-auto mb-6" />
          <blockquote className="text-2xl md:text-3xl text-white font-light italic leading-relaxed mb-6">
            "The present is theirs; I work for the future."
          </blockquote>
          <p className="text-purple-300">— Nikola Tesla</p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4 text-white">
          File Your Tesla Claim
        </h2>
        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
          Don't let your ideas be forgotten. Timestamp them. Prove they existed. 
          Join the chain of memory that honors Tesla's legacy.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/claim"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <Zap className="w-5 h-5" />
            File a Tesla Claim
          </Link>

          <Link 
            href="/manifesto"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 text-white rounded-xl font-semibold text-lg hover:bg-slate-700 transition-all border border-slate-700"
          >
            Read the Full Manifesto
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <p className="mt-8 text-slate-500 text-sm">
          ~$0.001 gas fee • AES-256 encryption • Permanent IPFS • Immutable blockchain
        </p>
      </div>

      {/* Footer Note */}
      <div className="border-t border-slate-800 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>
            PRIOR is named in honor of Nikola Tesla, not affiliated with Tesla Inc. <br />
            We believe invention should be remembered, not just monetized.
          </p>
        </div>
      </div>
    </div>
  );
}
