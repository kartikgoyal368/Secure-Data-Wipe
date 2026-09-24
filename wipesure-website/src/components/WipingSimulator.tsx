"use client";

import { useState, useEffect, useRef } from "react";
import { 
  HardDrive, 
  Play, 
  CheckCircle, 
  WarningCircle, 
  ArrowClockwise, 
  FileText, 
  Clock, 
  Thermometer, 
  Gauge, 
  ArrowSquareOut,
  FolderOpen
} from "@phosphor-icons/react";

interface DeviceSpec {
  id: string;
  name: string;
  devicePath: string;
  busType: string;
  capacity: string;
  lbaCount: string;
  method: string;
  standard: string;
  throughput: string;
  baselineTemp: number;
}

const STORAGE_PROFILES: DeviceSpec[] = [
  {
    id: "nvme",
    name: "Samsung 990 PRO NVMe 2.0 TB",
    devicePath: "/dev/nvme0n1",
    busType: "PCIe 4.0 x4 NVMe 1.4",
    capacity: "2,000.3 GB",
    lbaCount: "3,907,029,168",
    method: "NVMe Format NVM (Crypto Erase 0x80)",
    standard: "NIST SP 800-88 Purge & IEEE 2883-2022",
    throughput: "3.85 GB/s",
    baselineTemp: 48,
  },
  {
    id: "sata",
    name: "Crucial MX500 SATA SSD 1.0 TB",
    devicePath: "/dev/sda",
    busType: "SATA 3.3 (6 Gb/s)",
    capacity: "1,000.2 GB",
    lbaCount: "1,953,525,168",
    method: "Enhanced ATA Secure Erase + RTCWake S3 Bypass",
    standard: "DoD 5220.22-M & ATA Sanitize",
    throughput: "540 MB/s",
    baselineTemp: 42,
  },
  {
    id: "hdd",
    name: "Seagate Exos Enterprise 4.0 TB",
    devicePath: "/dev/sdb",
    busType: "Enterprise SAS 12 Gb/s",
    capacity: "4,000.7 GB",
    lbaCount: "7,814,037,168",
    method: "DoD 5220.22-M ECE (3-Pass) + DCO Unlock",
    standard: "DoD 5220.22-M 3-Pass Overwrite",
    throughput: "220 MB/s",
    baselineTemp: 39,
  },
  {
    id: "emmc",
    name: "SanDisk iNAND 128 GB eMMC 5.1",
    devicePath: "/dev/mmcblk0",
    busType: "HS400 (8-bit Embedded)",
    capacity: "128.0 GB",
    lbaCount: "250,068,992",
    method: "mmc-utils extcsd sanitize (Deallocation)",
    standard: "JEDEC JESD84-B51 Standard",
    throughput: "185 MB/s",
    baselineTemp: 37,
  },
];

const TOTAL_BLOCKS = 160;

export default function WipingSimulator() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceSpec | null>(STORAGE_PROFILES[0]);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Regulatory authorizations
  const [consentHpa, setConsentHpa] = useState(false);
  const [consentIrreversible, setConsentIrreversible] = useState(false);
  const [consentAudit, setConsentAudit] = useState(false);

  // Runtime telemetry
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusCode, setStatusCode] = useState("IDLE_AWAITING_INPUT");
  const [logs, setLogs] = useState<string[]>([]);
  const [hexDump, setHexDump] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [temperature, setTemperature] = useState(48);
  const [currentThroughput, setCurrentThroughput] = useState("0.00 MB/s");
  const [certificateHash, setCertificateHash] = useState("");
  const [certId, setCertId] = useState("");

  const logRef = useRef<HTMLDivElement>(null);
  const hexRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (hexRef.current) hexRef.current.scrollTop = hexRef.current.scrollHeight;
  }, [hexDump]);

  const selectDevice = (dev: DeviceSpec) => {
    if (isProcessing) return;
    setSelectedDevice(dev);
    setTemperature(dev.baselineTemp);
    setActiveStep(1);
    setConsentHpa(false);
    setConsentIrreversible(false);
    setConsentAudit(false);
    setLogs([]);
    setHexDump([]);
  };

  const generateHexRow = () => {
    const hexChars = "0123456789ABCDEF";
    let segment = "";
    for (let i = 0; i < 4; i++) {
      let chunk = "";
      for (let j = 0; j < 4; j++) chunk += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
      segment += `${chunk} `;
    }
    return `0x${segment.trim()}  ${Math.random() > 0.3 ? "00 00 00 00" : "FF FF FF FF"}`;
  };

  const startErasure = () => {
    if (!selectedDevice) return;
    setActiveStep(3);
    setIsProcessing(true);
    setProgress(0);
    setElapsed(0);
    setLogs([]);
    setHexDump([]);
    setStatusCode("INITIALIZING_ROOT_UID_0");

    const dev = selectedDevice;
    const timestamp = () => new Date().toISOString().split("T")[1].slice(0, 8);

    const stages = [
      { delay: 400, pct: 10, status: "KERNEL_IO_EXCL_LOCK", log: `[${timestamp()}] UID=0 confirmed. Opening ${dev.devicePath} with O_EXCL descriptor.`, temp: dev.baselineTemp + 2 },
      { delay: 1400, pct: 24, status: "SCANNING_HPA_DCO", log: `[${timestamp()}] Auditing Host Protected Area (HPA) and Device Configuration Overlays (DCO).`, temp: dev.baselineTemp + 4 },
      { delay: 2500, pct: 42, status: "ACPI_S3_RTCWAKE_BYPASS", log: `[${timestamp()}] Motherboard freeze register detected. Issuing rtcwake -m mem -s 3 ACPI suspend cycle.`, temp: dev.baselineTemp + 7 },
      { delay: 3700, pct: 58, status: "REGISTER_UNLOCKED", log: `[${timestamp()}] System awake from S3 sleep. Controller register unlocked for physical sanitize.`, temp: dev.baselineTemp + 9 },
      { delay: 5000, pct: 74, status: "CONTROLLER_SANITIZE_EXEC", log: `[${timestamp()}] Dispatching: ${dev.method}.`, temp: dev.baselineTemp + 14 },
      { delay: 6500, pct: 88, status: "O_DIRECT_SAMPLE_AUDIT", log: `[${timestamp()}] O_DIRECT direct memory bus verification. Testing 100 sample 1MB sector blocks.`, temp: dev.baselineTemp + 10 },
      { delay: 7800, pct: 96, status: "CERTIFICATE_GENERATION", log: `[${timestamp()}] Physical verification complete: 100% zeroed (0x00). Writing SHA-256 PDF certificate.`, temp: dev.baselineTemp + 4 },
      { delay: 9000, pct: 100, status: "IMMUTABLE_ANCHOR_COMPLETE", log: `[${timestamp()}] Digest committed to public ledger. Verification pass confirmed.`, temp: dev.baselineTemp },
    ];

    stages.forEach((s) => {
      setTimeout(() => {
        setProgress(s.pct);
        setStatusCode(s.status);
        setTemperature(s.temp);
        setLogs((prev) => [...prev, s.log]);
      }, s.delay);
    });

    const hexTicker = setInterval(() => {
      setHexDump((prev) => {
        const next = [...prev, generateHexRow()];
        return next.length > 25 ? next.slice(next.length - 25) : next;
      });
      setCurrentThroughput(dev.throughput);
    }, 140);

    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(hexTicker);
      clearInterval(timer);
      setIsProcessing(false);
      setCurrentThroughput("0.00 MB/s");
      setCertificateHash("0x89e02377c8e9d3000cc6cfffe10d54a2cb58ab42fbbf1c750eddeec4cfd2f831");
      setCertId(`WIPESURE-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`);
      setActiveStep(4);
    }, 9800);
  };

  const wipedCount = Math.floor((progress / 100) * TOTAL_BLOCKS);

  return (
    <section id="simulator" className="py-24 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header: Left-aligned, Real Type Scale */}
        <div className="mb-12 text-left">
          <div className="font-mono text-xs text-neutral-400 uppercase tracking-wider mb-2">
            Execution Lab
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-3">
            Interactive Hardware Sanitization Console
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-[65ch]">
            Test the C engine state machine in an isolated software sandbox. Select a target storage bus, bypass simulated motherboard freeze-locks, and inspect direct I/O readback verification.
          </p>
        </div>

        {/* Hardware Inventory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {STORAGE_PROFILES.map((dev) => (
            <button
              key={dev.id}
              onClick={() => selectDevice(dev)}
              disabled={isProcessing}
              className={`p-3.5 text-left rounded-md border text-xs transition-colors cursor-pointer ${
                selectedDevice?.id === dev.id
                  ? "bg-neutral-900 border-white text-white"
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                <span className="font-semibold text-neutral-200">{dev.devicePath}</span>
                <span className="text-neutral-500">{dev.capacity}</span>
              </div>
              <div className="font-medium text-neutral-300 truncate text-[11px] mb-0.5">{dev.name}</div>
              <div className="font-mono text-[10px] text-neutral-500 truncate">{dev.busType}</div>
            </button>
          ))}
        </div>

        {/* Console Execution Box: Flat panel-border, rounded-md, no drop shadows */}
        <div className="panel-border p-6 sm:p-8 space-y-6">
          
          {/* Telemetry Status Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-neutral-800 font-mono text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">TARGET:</span>
              <span className="text-neutral-200 font-medium">{selectedDevice ? selectedDevice.devicePath : "NONE"}</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <Thermometer size={14} className="text-neutral-500" />
                <span className="text-neutral-300">{temperature}°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gauge size={14} className="text-neutral-500" />
                <span className="text-neutral-300">{currentThroughput}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-neutral-500" />
                <span className="text-neutral-300">{elapsed}s</span>
              </div>
            </div>
          </div>

          {/* STEP 1: Topology Confirmation & Ready State */}
          {activeStep === 1 && (
            <div className="space-y-6 text-left">
              {selectedDevice ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3.5 rounded-md border border-neutral-800 bg-neutral-950">
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Physical LBAs</div>
                      <div className="text-neutral-200 font-medium">{selectedDevice.lbaCount}</div>
                      <div className="text-[10px] text-neutral-500 mt-1">4096B Sector Granularity</div>
                    </div>
                    <div className="p-3.5 rounded-md border border-neutral-800 bg-neutral-950">
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Controller Interface</div>
                      <div className="text-neutral-200 font-medium">{selectedDevice.busType}</div>
                      <div className="text-[10px] text-neutral-500 mt-1">Direct Kernel DMA Mode</div>
                    </div>
                    <div className="p-3.5 rounded-md border border-neutral-800 bg-neutral-950">
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Sanitization Opcode</div>
                      <div className="text-neutral-200 font-medium truncate">{selectedDevice.method}</div>
                      <div className="text-[10px] text-neutral-500 mt-1">{selectedDevice.standard}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-md border border-neutral-800 bg-neutral-900/40 text-xs text-neutral-300 space-y-1">
                    <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                      Automated BIOS Freeze Bypass
                    </div>
                    <p className="max-w-[65ch] text-neutral-400 leading-relaxed">
                      If the target OEM motherboard locked the drive controller during POST, WipeSure deploys an ACPI S3 memory sleep cycle (<code className="text-neutral-300 font-mono">rtcwake -m mem -s 3</code>) to clear the register without manual hot-unplugging.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setActiveStep(2)}
                      className="btn-primary"
                    >
                      Authorize Protocol
                    </button>
                  </div>
                </>
              ) : (
                /* Empty state when no device selected */
                <div className="py-12 text-center space-y-3 font-mono">
                  <FolderOpen size={32} className="mx-auto text-neutral-600" />
                  <div className="text-xs text-neutral-400">No storage device selected</div>
                  <p className="text-[11px] text-neutral-600 max-w-sm mx-auto">
                    Select a hardware bus profile from the inventory grid above to initialize target topology.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Regulatory Consent */}
          {activeStep === 2 && (
            <div className="space-y-6 text-left">
              <div className="pb-3 border-b border-neutral-800">
                <div className="font-display text-base font-semibold text-neutral-200">
                  Regulatory Authorization &amp; Risk Sign-Off
                </div>
                <p className="text-xs text-neutral-400 mt-0.5 max-w-[65ch]">
                  NIST SP 800-88 compliance mandates explicit operator confirmation prior to hardware voltage-spike or sector deallocation commands.
                </p>
              </div>

              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-3.5 rounded-md border text-xs transition-colors cursor-pointer ${
                  consentHpa ? "bg-neutral-900 border-neutral-700" : "bg-neutral-950 border-neutral-800"
                }`}>
                  <input
                    type="checkbox"
                    checked={consentHpa}
                    onChange={(e) => setConsentHpa(e.target.checked)}
                    className="mt-0.5 accent-white rounded"
                  />
                  <div>
                    <span className="font-medium text-neutral-200 block">1. Unhide and purge Host Protected Areas (HPA/DCO)</span>
                    <span className="text-neutral-400 block mt-0.5 text-[11px]">
                      Concealed sector overlays and manufacturer recovery regions will be restored and permanently destroyed.
                    </span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3.5 rounded-md border text-xs transition-colors cursor-pointer ${
                  consentIrreversible ? "bg-neutral-900 border-neutral-700" : "bg-neutral-950 border-neutral-800"
                }`}>
                  <input
                    type="checkbox"
                    checked={consentIrreversible}
                    onChange={(e) => setConsentIrreversible(e.target.checked)}
                    className="mt-0.5 accent-white rounded"
                  />
                  <div>
                    <span className="font-medium text-neutral-200 block">2. Acknowledge absolute mathematical irreversibility</span>
                    <span className="text-neutral-400 block mt-0.5 text-[11px]">
                      Zero residual bit recovery is possible using forensic software, hardware carving tools, or cleanroom microscopy.
                    </span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3.5 rounded-md border text-xs transition-colors cursor-pointer ${
                  consentAudit ? "bg-neutral-900 border-neutral-700" : "bg-neutral-950 border-neutral-800"
                }`}>
                  <input
                    type="checkbox"
                    checked={consentAudit}
                    onChange={(e) => setConsentAudit(e.target.checked)}
                    className="mt-0.5 accent-white rounded"
                  />
                  <div>
                    <span className="font-medium text-neutral-200 block">3. Administrative mandate for media decommissioning</span>
                    <span className="text-neutral-400 block mt-0.5 text-[11px]">
                      Operator certifies legal authority to sanitize the designated hardware asset.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStep(1)}
                  className="btn-secondary text-xs"
                >
                  Back
                </button>
                <button
                  onClick={startErasure}
                  disabled={!consentHpa || !consentIrreversible || !consentAudit}
                  className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                >
                  Execute Sanitization
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Execution & Active Telemetry */}
          {activeStep === 3 && (
            <div className="space-y-6 text-left">
              
              {/* Progress Track */}
              <div>
                <div className="flex items-center justify-between font-mono text-xs mb-2">
                  <span className="text-neutral-300 font-medium">STAGE: {statusCode}</span>
                  <span className="text-neutral-100 font-semibold">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-900 rounded-md overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Physical Sector Grid: Flat, gray to solid white */}
              <div>
                <div className="flex justify-between items-center font-mono text-[10px] text-neutral-500 uppercase mb-2">
                  <span>Physical Sector Map ({TOTAL_BLOCKS} Sample Clusters)</span>
                  <span>{wipedCount} / {TOTAL_BLOCKS} Blocks Verified (0x00)</span>
                </div>
                <div className="grid grid-cols-20 sm:grid-cols-40 gap-1 p-2.5 bg-neutral-950 rounded-md border border-neutral-800">
                  {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-[2px] transition-colors duration-150 ${
                        i < wipedCount ? "bg-white" : "bg-neutral-800"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Dual Terminals with designed Empty State fallback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Kernel Log */}
                <div className="p-3.5 rounded-md border border-neutral-800 bg-neutral-950 font-mono text-[11px] h-44 flex flex-col">
                  <div className="text-[10px] text-neutral-500 uppercase pb-1 mb-2 border-b border-neutral-900 flex justify-between">
                    <span>Kernel Execution Log</span>
                    <span className="text-neutral-400">stdout</span>
                  </div>
                  <div ref={logRef} className="overflow-y-auto space-y-1 flex-1 pr-1 text-neutral-300">
                    {logs.length > 0 ? (
                      logs.map((l, idx) => <div key={idx} className="leading-tight">{l}</div>)
                    ) : (
                      <div className="text-neutral-600 py-6 text-center">Log buffer initialized. Awaiting daemon output.</div>
                    )}
                  </div>
                </div>

                {/* Direct Sector Stream */}
                <div className="p-3.5 rounded-md border border-neutral-800 bg-neutral-950 font-mono text-[11px] h-44 flex flex-col">
                  <div className="text-[10px] text-neutral-500 uppercase pb-1 mb-2 border-b border-neutral-900 flex justify-between">
                    <span>Direct Read Stream (O_DIRECT)</span>
                    <span className="text-neutral-400">raw payload</span>
                  </div>
                  <div ref={hexRef} className="overflow-y-auto space-y-1 flex-1 pr-1 text-neutral-500 select-none">
                    {hexDump.length > 0 ? (
                      hexDump.map((h, idx) => <div key={idx} className="leading-tight">{h}</div>)
                    ) : (
                      <div className="text-neutral-600 py-6 text-center">No active memory bus transaction.</div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* STEP 4: Verified Audit Certificate */}
          {activeStep === 4 && (
            <div className="py-6 space-y-6 text-left">
              
              <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
                <div className="w-9 h-9 rounded-md bg-white border border-white flex items-center justify-center text-black flex-shrink-0">
                  <CheckCircle size={20} weight="bold" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-neutral-100">
                    Sanitization Verified — Zero Residual Bits
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Physical controller purge completed. Direct I/O audit confirmed 100% 0x00 pattern.
                  </p>
                </div>
              </div>

              {/* Certificate Record */}
              <div className="p-4 rounded-md border border-neutral-800 bg-neutral-950 font-mono text-xs space-y-2.5">
                <div className="flex justify-between border-b border-neutral-900 pb-2">
                  <span className="text-neutral-500">CERTIFICATE ID:</span>
                  <span className="text-neutral-200 font-semibold">{certId}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 pb-2">
                  <span className="text-neutral-500">TARGET NODE:</span>
                  <span className="text-neutral-200">{selectedDevice?.devicePath} ({selectedDevice?.name})</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 pb-2">
                  <span className="text-neutral-500">STANDARD COMPLIANCE:</span>
                  <span className="text-neutral-200">{selectedDevice?.standard}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 pb-2">
                  <span className="text-neutral-500">DIGEST (SHA-256):</span>
                  <span className="text-neutral-300 truncate max-w-[280px]">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-neutral-500">PUBLIC LEDGER ANCHOR:</span>
                  <a
                    href={`https://polygonscan.com/tx/${certificateHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:underline flex items-center gap-1"
                  >
                    <span>{certificateHash.substring(0, 16)}...</span>
                    <ArrowSquareOut size={13} />
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => {
                    const content = `WIPESURE AUDIT CERTIFICATE\nID: ${certId}\nNode: ${selectedDevice?.devicePath}\nStandard: ${selectedDevice?.standard}\nStatus: PASSED 0.00% RESIDUAL\nTimestamp: ${new Date().toISOString()}`;
                    const blob = new Blob([content], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${certId}.txt`;
                    a.click();
                  }}
                  className="btn-primary text-xs gap-1.5"
                >
                  <FileText size={14} weight="bold" />
                  <span>Export Signed Certificate</span>
                </button>

                <button
                  onClick={() => {
                    setActiveStep(1);
                    setConsentHpa(false);
                    setConsentIrreversible(false);
                    setConsentAudit(false);
                  }}
                  className="btn-secondary text-xs gap-1.5"
                >
                  <ArrowClockwise size={14} />
                  <span>Select Another Storage Node</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
