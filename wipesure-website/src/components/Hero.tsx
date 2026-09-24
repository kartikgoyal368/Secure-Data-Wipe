"use client";

import { TerminalWindow, ArrowRight, DownloadSimple, Check } from "@phosphor-icons/react";
import NebulaFlow from "@/components/lightswind/nebula-flow";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 pt-24 pb-32">
      {/* Interactive Nebula Flow Canvas (Restricted strictly to Hero Background) */}
      <div className="hidden lg:block">
        <NebulaFlow
          colors={["#000000", "#18181b", "#ffffff"]}
          speed={0.75}
          scale={1.15}
          density={0.85}
          interactive={true}
          className="opacity-45"
        />
      </div>
      <div className="lg:hidden absolute inset-0 bg-neutral-900/50" />

      {/* Engineering Precision Grid Dots Layer */}
      <div className="absolute inset-0 bg-grid-dots pointer-events-none opacity-50" />

      {/* Hero Content Container */}
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Left-aligned, disciplined editorial hierarchy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* System Identifier Tag */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-neutral-800 bg-neutral-900/90 backdrop-blur-sm font-mono text-[11px] text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span>NIST SP 800-88 REV. 1 PURGE COMPLIANT</span>
            </div>

            {/* Display Headline: Real Type Scale, Left-Aligned, Space Grotesk */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-semibold tracking-tight text-neutral-50 leading-[1.1]">
              Cryptographic Data Erasure Operating System
            </h1>

            {/* Disciplined Body Copy (under 68 characters per line) */}
            <p className="text-neutral-300 text-base leading-relaxed max-w-[65ch]">
              WipeSure is an air-gapped, bootable Linux environment engineered in low-level C. It bypasses OEM motherboard BIOS freeze-locks using ACPI S3 sleep-cycle state transitions, triggers high-voltage solid-state controller purges, and verifies physical zero-residual state via kernel direct I/O.
            </p>

            {/* Action Group: Functional, Flat, Pure White Primary Accent */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#simulator"
                className="btn-primary gap-2"
              >
                <span>Run Interactive Simulator</span>
                <ArrowRight size={15} weight="bold" />
              </a>

              <a
                href="#download"
                className="btn-secondary gap-2"
              >
                <DownloadSimple size={15} weight="bold" />
                <span>Download Universal ISO</span>
              </a>
            </div>

            {/* Technical Verification Footprint */}
            <div className="pt-6 border-t border-neutral-900/80 grid grid-cols-3 gap-6 font-mono text-xs">
              <div>
                <div className="text-neutral-500 text-[11px] uppercase tracking-wider mb-1">Standard</div>
                <div className="text-neutral-200 font-medium">NIST Purge &amp; DoD</div>
              </div>
              <div>
                <div className="text-neutral-500 text-[11px] uppercase tracking-wider mb-1">Verification</div>
                <div className="text-neutral-200 font-medium">O_DIRECT Direct Bus</div>
              </div>
              <div>
                <div className="text-neutral-500 text-[11px] uppercase tracking-wider mb-1">Bypass Engine</div>
                <div className="text-neutral-200 font-medium">ACPI RTCWake S3</div>
              </div>
            </div>

          </div>

          {/* Right Column: Precise Technical Spec Panel */}
          <div className="lg:col-span-5">
            <div className="panel-border bg-neutral-900/90 backdrop-blur-md font-mono text-xs">
              
              {/* Header */}
              <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between text-neutral-400">
                <div className="flex items-center gap-2">
                  <TerminalWindow size={16} className="text-neutral-400" />
                  <span className="text-[11px] uppercase tracking-wider text-neutral-300">wipesure-daemon v1.0.4</span>
                </div>
                <span className="text-[10px] text-white bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-700">
                  KERNEL_DIRECT
                </span>
              </div>

              {/* Console Body */}
              <div className="p-4 space-y-2.5 text-[11px] leading-relaxed text-neutral-300 bg-neutral-950/80">
                <div className="text-neutral-500"># System Hardware Topology Scan</div>
                <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                  <span className="text-neutral-400">Target Node:</span>
                  <span className="text-neutral-200">/dev/nvme0n1</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                  <span className="text-neutral-400">Controller Bus:</span>
                  <span className="text-neutral-200">PCIe 4.0 x4 (NVMe 1.4)</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                  <span className="text-neutral-400">Physical LBAs:</span>
                  <span className="text-neutral-200">3,907,029,168 (2.0 TB)</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                  <span className="text-neutral-400">BIOS Lock Status:</span>
                  <span className="text-neutral-200">ATA_FREEZE_LOCKED</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                  <span className="text-neutral-400">Bypass Protocol:</span>
                  <span className="text-white">rtcwake -m mem -s 3 (ACPI S3)</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                  <span className="text-neutral-400">Sanitize Opcode:</span>
                  <span className="text-neutral-200">NVMe Format NVM (0x80)</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-400">Residual Bit Audit:</span>
                  <span className="text-neutral-100 font-semibold flex items-center gap-1">
                    <Check size={13} weight="bold" className="text-white" />
                    <span>0.00% (PASSED)</span>
                  </span>
                </div>
              </div>

              {/* Status Footer */}
              <div className="px-4 py-2.5 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                <span>Direct I/O: <strong className="text-neutral-200">O_DIRECT Engaged</strong></span>
                <span className="text-neutral-500">Air-Gapped: True</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
