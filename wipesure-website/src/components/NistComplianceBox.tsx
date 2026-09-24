"use client";

import { useState } from "react";
import { ShieldCheck, Check, CaretRight } from "@phosphor-icons/react";

interface StandardSpec {
  id: string;
  code: string;
  title: string;
  scope: string;
  clearDescription: string;
  purgeDescription: string;
  wipesureImplementation: string;
}

const STANDARDS: StandardSpec[] = [
  {
    id: "nist",
    code: "NIST SP 800-88 Rev. 1",
    title: "Guidelines for Media Sanitization",
    scope: "National Institute of Standards & Technology (U.S. Federal Standard)",
    clearDescription: "Applies logical techniques to overwrite all user-addressable sectors to defend against simple non-invasive keyboard recovery tools.",
    purgeDescription: "Executes hardware-level controller commands (Cryptographic Erase and Block Erase) rendering target data recovery infeasible even using laboratory electron microscopes.",
    wipesureImplementation: "WipeSure executes full NIST Purge by commanding NVMe/SATA controller firmware, followed by kernel direct I/O (O_DIRECT) sampling across physical LBA bounds.",
  },
  {
    id: "dod",
    code: "DoD 5220.22-M",
    title: "National Industrial Security Program (NISP)",
    scope: "U.S. Department of Defense Standard for Magnetic Spindles",
    clearDescription: "Single-pass zero fill across addressable logical blocks.",
    purgeDescription: "Mandates a 3-pass sequence: fixed character overwrite (0x00), complement character write (0xFF), and random byte sequence, verified by bit-by-bit sector readback.",
    wipesureImplementation: "WipeSure applies the 3-pass ECE pattern to rotational HDDs, simultaneously resetting Device Configuration Overlays (DCO) and Host Protected Areas (HPA).",
  },
  {
    id: "ieee",
    code: "IEEE 2883-2022",
    title: "Standard for Sanitizing Storage",
    scope: "Institute of Electrical and Electronics Engineers (Solid-State Benchmark)",
    clearDescription: "Logical sector deallocation and LBA unmap requests via OS filesystem commands.",
    purgeDescription: "Simultaneous controller-level voltage discharge across all physical NAND floating gates and immediate revocation of internal media encryption keys.",
    wipesureImplementation: "Direct interface with NVMe and eMMC controllers triggering raw physical block sanitize opcodes rather than file-level trimming.",
  },
  {
    id: "legal",
    code: "GDPR Article 17 & HIPAA",
    title: "Sovereign Privacy & Healthcare Regulations",
    scope: "European Union & U.S. Department of Health and Human Services",
    clearDescription: "Statutory requirement for verified erasure of protected health information (ePHI) and personal identifiable data (PII).",
    purgeDescription: "Requires complete, defensible audit trails proving data cannot be reconstructed by downstream hardware purchasers or forensic adversaries.",
    wipesureImplementation: "Generates an unforgeable, cryptographically signed PDF certificate anchored to public blockchain smart contracts for permanent audit immunity.",
  },
];

export default function NistComplianceBox() {
  const [selectedStandard, setSelectedStandard] = useState<string>("nist");

  const active = STANDARDS.find((s) => s.id === selectedStandard) || STANDARDS[0];

  return (
    <section id="compliance" className="py-24 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header: Left-aligned, Real Type Scale */}
        <div className="mb-12 text-left">
          <div className="font-mono text-xs text-neutral-400 uppercase tracking-wider mb-2">
            Regulatory Framework
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-3">
            NIST SP 800-88 Media Sanitization Architecture
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-[65ch]">
            When decommissioning enterprise storage assets, regulatory compliance requires defensible proof of physical non-recoverability. WipeSure adheres strictly to recognized government and industrial sanitization benchmarks.
          </p>
        </div>

        {/* Standard Selector Tab Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {STANDARDS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStandard(s.id)}
              className={`p-3.5 text-left rounded-md border text-xs font-mono transition-colors cursor-pointer ${
                selectedStandard === s.id
                  ? "bg-neutral-900 border-white text-white"
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
              }`}
            >
              <div className="text-[11px] font-semibold text-neutral-200 mb-0.5">{s.code}</div>
              <div className="text-[10px] text-neutral-500 truncate">{s.title}</div>
            </button>
          ))}
        </div>

        {/* Main Content Box: Flat 1px border, rounded-md, no drop shadows */}
        <div className="panel-border p-6 sm:p-8 space-y-6">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-neutral-800">
            <div>
              <div className="font-display text-xl font-semibold text-neutral-100">
                {active.code} — {active.title}
              </div>
              <div className="font-mono text-xs text-neutral-400 mt-0.5">
                {active.scope}
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-white bg-neutral-900 border border-neutral-700 px-2.5 py-1 rounded-md self-start sm:self-auto">
              <ShieldCheck size={14} weight="bold" />
              <span>100% PURGE COMPLIANT</span>
            </div>
          </div>

          {/* Clear vs Purge Definition Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-md border border-neutral-800 bg-neutral-950 space-y-2">
              <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                Level 1: Clear Specification
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-[65ch]">
                {active.clearDescription}
              </p>
            </div>

            <div className="p-4 rounded-md border border-neutral-700 bg-neutral-900/40 space-y-2">
              <div className="font-mono text-[11px] text-white uppercase tracking-wider flex items-center gap-1.5">
                <Check size={13} weight="bold" />
                <span>Level 2: Purge Specification (WipeSure Standard)</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-[65ch]">
                {active.purgeDescription}
              </p>
            </div>

          </div>

          {/* WipeSure Implementation Footprint */}
          <div className="p-4 rounded-md border border-neutral-800 bg-neutral-900/60 text-xs space-y-1">
            <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
              Execution Mechanism
            </div>
            <p className="text-neutral-300 leading-relaxed max-w-[65ch]">
              {active.wipesureImplementation}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
