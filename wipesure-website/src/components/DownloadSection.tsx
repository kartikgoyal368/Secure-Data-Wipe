"use client";

import { useState } from "react";
import { DownloadSimple, Copy, Check, TerminalWindow, HardDrive } from "@phosphor-icons/react";

export default function DownloadSection() {
  const [checksumCopied, setChecksumCopied] = useState(false);
  const sha256Checksum = "a7b38d94e102f9c87d4a20b1297e68bc5d290fb4310d54a2cb58ab42fbbf1c75";

  const copyChecksum = () => {
    navigator.clipboard.writeText(sha256Checksum);
    setChecksumCopied(true);
    setTimeout(() => setChecksumCopied(false), 2000);
  };

  return (
    <section id="download" className="py-24 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Left-aligned editorial header */}
        <div className="space-y-3 mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-neutral-800 bg-neutral-900 font-mono text-[11px] text-neutral-400">
            <span>DISTRIBUTION ARTIFACT</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-50">
            Download Bootable ISO
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-[65ch]">
            A minimal live Linux kernel with non-free proprietary storage controller firmware pre-integrated for universal boot on Dell, HP, Lenovo, ASUS, and Acer systems.
          </p>
        </div>

        {/* Download Panel: Flat 1px border, rounded-md, no box shadows */}
        <div className="panel-border p-8 rounded-md bg-neutral-900/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HardDrive size={20} className="text-white" />
                <h3 className="font-display text-xl font-semibold text-neutral-100">
                  WipeSure-Universal-Boot.iso
                </h3>
                <span className="font-mono text-[10px] text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded-md bg-neutral-950">
                  v1.0.4-RELEASE
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                Debian 12 Live Core • Linux Kernel 6.8 LTS • Zero-Dependency Daemon
              </p>
            </div>

            {/* Actions: Flat, Single Accent, No shadows */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/kartikgoyal368/Secure-Data-Wipe/releases/latest/download/WipeSure-Universal-Boot.iso"
                download
                className="btn-primary gap-2"
              >
                <DownloadSimple size={16} weight="bold" />
                <span>Download ISO (1.2 GB)</span>
              </a>

              <a
                href="#architecture"
                className="btn-secondary gap-2"
              >
                <TerminalWindow size={16} />
                <span>Flash Instructions</span>
              </a>
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-neutral-800 font-mono text-xs">
            <div>
              <div className="text-[10px] uppercase text-neutral-500 mb-1">IMAGE SIZE</div>
              <div className="text-neutral-200 font-medium">1.24 GB</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-neutral-500 mb-1">TARGET ARCH</div>
              <div className="text-neutral-200 font-medium">x86_64 / AMD64</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-neutral-500 mb-1">BOOT MODE</div>
              <div className="text-neutral-200 font-medium">UEFI &amp; Legacy BIOS</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-neutral-500 mb-1">LICENSE</div>
              <div className="text-neutral-200 font-medium">Apache 2.0 (Open Source)</div>
            </div>
          </div>

          {/* Checksum Box */}
          <div className="pt-6 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-neutral-500 uppercase tracking-wider">SHA-256 HASH VERIFICATION</span>
              <button
                onClick={copyChecksum}
                className="text-neutral-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                {checksumCopied ? (
                  <>
                    <Check size={13} weight="bold" className="text-white" />
                    <span className="text-white">Checksum Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy SHA-256</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 rounded-md bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 select-all overflow-x-auto">
              {sha256Checksum}
            </div>
          </div>

          {/* Hardware Certified Matrix */}
          <div className="mt-6 pt-6 border-t border-neutral-800">
            <div className="text-[10px] font-mono text-neutral-500 uppercase mb-2.5">
              Verified OEM Hardware Compatibility
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-neutral-400">
              {[
                "Dell PowerEdge & Latitude",
                "HP ProLiant & EliteBook",
                "Lenovo ThinkSystem & ThinkPad",
                "ASUS ExpertBook",
                "Acer TravelMate",
                "Supermicro Enterprise",
              ].map((brand, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-300"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
