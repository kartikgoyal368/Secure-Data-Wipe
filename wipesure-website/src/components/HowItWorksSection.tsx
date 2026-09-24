"use client";

import { Usb, Cpu, Certificate } from "@phosphor-icons/react";

export default function HowItWorksSection() {
  const steps = [
    {
      stepNumber: "01",
      icon: Usb,
      title: "Write Image to Target Media",
      description: "Write the WipeSure bootable ISO to any standard USB flash storage using standard utilities (e.g. Rufus on Windows, or direct raw dd in Unix).",
      detail: "Dual UEFI Grub64 + Legacy Syslinux bootloaders included.",
    },
    {
      stepNumber: "02",
      icon: Cpu,
      title: "Boot Workstation into Kernel Kiosk",
      description: "Attach media to the target computer and initiate boot via OEM one-time menu (F12, F9, or Option). The systemd daemon initializes headless root console without host OS interaction.",
      detail: "Hardware freeze registers cleared via ACPI S3 sleep cycle.",
    },
    {
      stepNumber: "03",
      icon: Certificate,
      title: "Execute Sanitize & Export Audit Record",
      description: "Select target storage bus, confirm regulatory consent, and execute controller-level purge. The daemon conducts kernel direct I/O readback validation and generates a cryptographic SHA-256 certificate.",
      detail: "Certificate written to USB and broadcast to public ledger.",
    },
  ];

  return (
    <section id="workflow" className="py-24 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header: Left-aligned, Real Type Scale */}
        <div className="mb-12 text-left">
          <div className="font-mono text-xs text-neutral-400 uppercase tracking-wider mb-2">
            Standard Operating Procedure
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-3">
            Three-Stage Sanitization Workflow
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-[65ch]">
            The WipeSure runtime is engineered for rapid deployment by enterprise technicians and security auditors across diverse multi-vendor workstation hardware.
          </p>
        </div>

        {/* 3 Steps: Flat panel-border, rounded-md, no drop shadows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="panel-border p-6 flex flex-col justify-between text-left space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                    <span className="font-mono text-xs font-semibold text-neutral-400">{s.stepNumber}</span>
                    <div className="w-8 h-8 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                      <Icon size={16} weight="bold" />
                    </div>
                  </div>

                  <h3 className="font-display text-base font-semibold text-neutral-100 mt-4 mb-2">
                    {s.title}
                  </h3>
                  
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-[65ch]">
                    {s.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800/80 font-mono text-[11px] text-neutral-500">
                  {s.detail}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
