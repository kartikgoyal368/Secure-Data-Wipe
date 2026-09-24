"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Can the drive be reused after WipeSure executes a Purge operation?",
      a: "Yes. WipeSure resets data cells at the controller layer without damaging the NAND flash gates or magnetic platters. Once sanitization finishes and passes direct I/O verification, the drive can immediately be partitioned, formatted, and provisioned with any operating system.",
    },
    {
      q: "Is data recovery possible through specialized lab hardware after wiping?",
      a: "No. WipeSure adheres to NIST SP 800-88 Rev. 1 Purge directives and DoD 5220.22-M guidelines. The controller commands (NVMe Format NVM, Cryptographic Erase, and ATA Secure Erase) along with multi-pass random overwrites render previous states physically non-recoverable even under magnetic force microscopy.",
    },
    {
      q: "Why is an OS-level 'Format' or 'Factory Reset' insufficient for decommission?",
      a: "Standard file system formatting only clears allocation tables and partition metadata, leaving the actual file payloads intact across unallocated LBAs. Commodity recovery utilities can reconstruct intact files within minutes. WipeSure directly addresses every physical sector.",
    },
    {
      q: "How does the ACPI S3 sleep cycle unfreeze locked drives?",
      a: "Many system BIOS implementations assert the ATA Security Freeze Lock during early power-on self-test (POST) to prevent unauthorized flash alterations. By issuing an rtcwake command, WipeSure suspends the system to RAM for 3 seconds. The motherboard wakes without re-executing POST, releasing the freeze lock.",
    },
    {
      q: "What cryptographic proof does the Certificate of Erasure provide?",
      a: "The certificate records the physical drive serial number, controller model, total LBA count, purge opcode executed, and a SHA-256 digest of sample verification sectors. The document is signed with a cryptographic key and optionally anchored to a public ledger.",
    },
    {
      q: "Does WipeSure require an active internet connection to operate?",
      a: "No. The WipeSure boot environment is strictly air-gapped. The core C daemon, controller utilities, and local PDF certificate generator execute entirely in system RAM without network dependencies.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-neutral-950">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Left-aligned editorial header */}
        <div className="space-y-3 mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-neutral-800 bg-neutral-900 font-mono text-[11px] text-neutral-400">
            <span>TECHNICAL SPECIFICATIONS FAQ</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-50">
            Frequently Asked Questions
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-[65ch]">
            Detailed explanations of hardware controller interactions, BIOS bypass mechanisms, and compliance validation.
          </p>
        </div>

        {/* FAQ List: Flat 1px border, rounded-md, no shadows */}
        <div className="space-y-3 text-left">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="panel-border rounded-md overflow-hidden bg-neutral-900/40"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-display text-base font-medium text-neutral-100">
                    {faq.q}
                  </span>
                  <CaretDown
                    size={16}
                    className={`text-neutral-400 shrink-0 transition-transform ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-neutral-400 leading-relaxed border-t border-neutral-800 max-w-[68ch]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
