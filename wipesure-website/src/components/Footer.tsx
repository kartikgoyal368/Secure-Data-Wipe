"use client";

import { ShieldCheck, ArrowSquareOut } from "@phosphor-icons/react";
import AsciiWave from "@/components/lightswind/ascii-wave";

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-950 py-16 border-t border-neutral-900 text-neutral-400 font-sans relative overflow-hidden">
      {/* AsciiWave decorative background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <AsciiWave color="#ffffff" speed={0.5} className="w-full h-full" />
      </div>
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-left">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-black">
                <ShieldCheck size={16} weight="bold" />
              </div>
              <span className="font-display font-semibold tracking-tight text-neutral-100 text-base">
                WipeSure Enterprise
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-[50ch]">
              Hardware sanitization operating system engineered for Smart India Hackathon. Delivers mathematical non-recoverability through low-level C controller commands and signed cryptographic verification.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 font-mono text-[10px] text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span>NIST SP 800-88 REV. 1 &amp; DOD 5220.22-M AUDITED</span>
            </div>
          </div>

          {/* System Modules */}
          <div className="space-y-3 font-mono text-xs">
            <div className="text-neutral-200 font-semibold uppercase tracking-wider text-[11px]">
              System Modules
            </div>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href="#simulator" className="hover:text-neutral-100 transition-colors">
                  Interactive Simulator
                </a>
              </li>
              <li>
                <a href="#compliance" className="hover:text-neutral-100 transition-colors">
                  NIST Compliance Matrix
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-neutral-100 transition-colors">
                  C Engine Architecture
                </a>
              </li>
              <li>
                <a href="#who-is-it-for" className="hover:text-neutral-100 transition-colors">
                  Deployment Scope
                </a>
              </li>
            </ul>
          </div>

          {/* Distribution & Ledger */}
          <div className="space-y-3 font-mono text-xs">
            <div className="text-neutral-200 font-semibold uppercase tracking-wider text-[11px]">
              Distribution
            </div>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href="#download" className="hover:text-neutral-100 transition-colors">
                  Universal Bootable ISO
                </a>
              </li>
              <li>
                <a
                  href="https://polygonscan.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-neutral-100 transition-colors inline-flex items-center gap-1"
                >
                  <span>Polygon Ledger Proof</span>
                  <ArrowSquareOut size={12} />
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-neutral-100 transition-colors">
                  Audit Documentation
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Clean, whitespace, single hairline border */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-neutral-500 gap-4">
          <p>© 2026 WipeSure Enterprise. Smart India Hackathon Project.</p>
          <p className="text-neutral-500 max-w-[50ch]">
            Sanitization routines are permanent and mathematically irreversible.
          </p>
        </div>

      </div>
    </footer>
  );
}
