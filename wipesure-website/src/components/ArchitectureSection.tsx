"use client";

import { useState } from "react";
import { Code, Cpu, TerminalWindow, ShieldCheck } from "@phosphor-icons/react";

interface KernelModule {
  id: string;
  tag: string;
  title: string;
  sourceFile: string;
  code: string;
  rationale: string;
  mitigation: string;
}

const MODULES: KernelModule[] = [
  {
    id: "rtcwake",
    tag: "ACPI POWER SUBSYSTEM",
    title: "S3 Sleep State Controller Freeze Bypass",
    sourceFile: "src/hardware_erase.c",
    code: `// Suspend system to RAM (S3) for 3 seconds to clear OEM freeze register
execute_command("rtcwake -m mem -s 3 2>&1", output, sizeof(output));

// Query ATA security register via raw hdparm ioctl
execute_command("hdparm -I /dev/sda | grep -i frozen", status, sizeof(status));`,
    rationale: "Motherboard UEFI firmware locks storage controllers on POST to prevent malware tampering. This register lock halts legitimate secure erase attempts, prompting technicians to manually pull SATA power cables.",
    mitigation: "WipeSure issues an ACPI S3 memory suspend command. Upon wake, the motherboard BIOS freeze register is re-initialized to an unlocked state, enabling direct execution of ATA Secure Erase without physical disconnection.",
  },
  {
    id: "direct-io",
    tag: "KERNEL I/O SUBSYSTEM",
    title: "Direct Physical Memory Bus Readback Validation",
    sourceFile: "src/verify.c",
    code: `// Open device descriptor with O_DIRECT to bypass OS page cache
int fd = open(device_path, O_RDONLY | O_DIRECT);
void *buffer = NULL;

// Enforce 4096-byte memory boundary alignment
posix_memalign(&buffer, 4096, VERIFY_BLOCK_SIZE);
lseek(fd, random_offset, SEEK_SET);
read(fd, buffer, VERIFY_BLOCK_SIZE);`,
    rationale: "Reading sectors through default Linux page cache serves buffered zero-writes directly from system RAM, returning false positive audits even if physical NAND blocks failed to flash.",
    mitigation: "WipeSure enforces direct controller access (O_DIRECT) with strict 4KB memory boundary alignment, conducting direct DMA reads from physical silicon cells across the entire LBA address space.",
  },
  {
    id: "hpa-dco",
    tag: "LBA TOPOLOGY",
    title: "Host Protected Area & Overlay Restoration",
    sourceFile: "src/hardware_erase.c",
    code: `// Reset Device Configuration Overlay (DCO) to native factory limits
snprintf(cmd, sizeof(cmd), 
  "hdparm --yes-i-know-what-i-am-doing --dco-restore %s", dev);
execute_command(cmd, output, sizeof(output));

// Disable Host Protected Area (HPA) and set max native LBA sectors
snprintf(cmd, sizeof(cmd), "hdparm -N %s", dev);`,
    rationale: "Firmware caches, OEM recovery overlays, and rootkits can reside in hidden HPA/DCO sectors beyond the logical boundary reported by standard partition tables.",
    mitigation: "WipeSure commands the disk firmware to restore native factory boundaries, unhiding every concealed block and subjecting all hidden sectors to permanent cryptographic zero-overwrite.",
  },
  {
    id: "nvme-purge",
    tag: "SOLID-STATE FIRMWARE",
    title: "NVMe Format NVM & Cryptographic Scramble",
    sourceFile: "src/hardware_erase.c",
    code: `// Dispatch NVMe Format NVM opcode with cryptographic erase (SES=1)
snprintf(cmd, sizeof(cmd), "nvme format %s -s 1 2>&1", dev);
execute_command(cmd, output, sizeof(output));

// Purge unmapped flash blocks on embedded multimedia cards
snprintf(cmd, sizeof(cmd), "mmc extcsd sanitize %s", dev);`,
    rationale: "Wear-leveling controllers reallocate retired or spare NAND flash blocks outside the accessible user LBA range, leaving forensic residue in unmapped cells.",
    mitigation: "Commands drive firmware to trigger simultaneous high-voltage discharge across all internal NAND gates and immediately invalidate the hardware AES media key.",
  },
];

export default function ArchitectureSection() {
  const [selectedModule, setSelectedModule] = useState<string>("rtcwake");

  const current = MODULES.find((m) => m.id === selectedModule) || MODULES[0];

  return (
    <section id="architecture" className="py-24 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header: Left-aligned, Real Type Scale */}
        <div className="mb-12 text-left">
          <div className="font-mono text-xs text-neutral-400 uppercase tracking-wider mb-2">
            Low-Level Implementation
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-3">
            C Engine Kernel Subsystems
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-[65ch]">
            WipeSure operates at the hardware-kernel interface. Rather than running unprivileged userspace loops, the runtime issues direct ioctls and ACPI power management calls to control drive controllers.
          </p>
        </div>

        {/* Module Grid Selector */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6">
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedModule(m.id)}
              className={`p-3.5 text-left rounded-md border text-xs font-mono transition-colors cursor-pointer ${
                selectedModule === m.id
                  ? "bg-neutral-900 border-white text-white"
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
              }`}
            >
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">{m.tag}</div>
              <div className="text-xs font-semibold text-neutral-200 truncate">{m.title}</div>
            </button>
          ))}
        </div>

        {/* Module Content Inspector */}
        <div className="panel-border p-6 sm:p-8 space-y-6 text-left">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-800">
            <div>
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                {current.tag}
              </span>
              <h3 className="font-display text-xl font-semibold text-neutral-100 mt-1">
                {current.title}
              </h3>
            </div>
            <div className="font-mono text-xs text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800 self-start sm:self-auto">
              {current.sourceFile}
            </div>
          </div>

          {/* Code Window */}
          <div className="rounded-md border border-neutral-800 bg-neutral-950 overflow-hidden font-mono text-xs">
            <div className="px-4 py-2 bg-neutral-900/80 border-b border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
              <span>{current.sourceFile}</span>
              <span className="text-neutral-500">GNU C99</span>
            </div>
            <pre className="p-4 text-neutral-200 overflow-x-auto leading-relaxed">
              <code>{current.code}</code>
            </pre>
          </div>

          {/* Rationale & Mitigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-md border border-neutral-800 bg-neutral-950 space-y-1">
              <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                Architectural Challenge
              </div>
              <p className="text-neutral-400 leading-relaxed max-w-[65ch]">
                {current.rationale}
              </p>
            </div>

            <div className="p-4 rounded-md border border-neutral-800 bg-neutral-900/60 space-y-1">
              <div className="font-mono text-[11px] text-white uppercase tracking-wider">
                Kernel Resolution
              </div>
              <p className="text-neutral-300 leading-relaxed max-w-[65ch]">
                {current.mitigation}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
