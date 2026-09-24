"use client";

import { useState } from "react";
import { ShieldCheck, ArrowRight, List, X } from "@phosphor-icons/react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <a href="#" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-black">
            <ShieldCheck size={18} weight="bold" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-base text-neutral-100 tracking-tight">WipeSure</span>
            <span className="font-mono text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-400 border border-neutral-700">
              v1.0
            </span>
          </div>
        </a>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-neutral-400">
          <a href="#simulator" className="hover:text-neutral-100 transition-colors">
            Simulator
          </a>
          <a href="#compliance" className="hover:text-neutral-100 transition-colors">
            NIST 800-88
          </a>
          <a href="#architecture" className="hover:text-neutral-100 transition-colors">
            C Engine
          </a>
          <a href="#workflow" className="hover:text-neutral-100 transition-colors">
            Protocol
          </a>
          <a href="#download" className="hover:text-neutral-100 transition-colors">
            ISO Artifact
          </a>
        </nav>

        {/* Action */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="#download"
            className="btn-primary text-xs py-2 px-3.5 gap-1.5"
          >
            <span>Deploy ISO</span>
            <ArrowRight size={14} weight="bold" />
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
          className="md:hidden p-2 rounded-md border border-neutral-800 text-neutral-400 hover:text-white"
        >
          {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950 px-6 py-6 space-y-4 text-sm font-medium">
          <a
            href="#simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-neutral-300 hover:text-white"
          >
            Interactive Simulator
          </a>
          <a
            href="#compliance"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-neutral-300 hover:text-white"
          >
            NIST SP 800-88 Guidelines
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-neutral-300 hover:text-white"
          >
            C Core Architecture
          </a>
          <a
            href="#workflow"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-neutral-300 hover:text-white"
          >
            Sanitization Protocol
          </a>
          <a
            href="#download"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-neutral-300 hover:text-white"
          >
            Download ISO Artifact
          </a>
          <div className="pt-2">
            <a
              href="#download"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full text-center text-xs"
            >
              Download Bootable ISO
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
