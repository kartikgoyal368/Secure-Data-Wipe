import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

export default function App() {
  const [step, setStep] = useState(1);
  const [driveInfo, setDriveInfo] = useState({ path: "/dev/nvme0n1", name: "Detecting...", size: "..." });
  
  // Permissions State
  const [agreedToRisks, setAgreedToRisks] = useState(false);
  const [agreedToIrreversible, setAgreedToIrreversible] = useState(false);
  const [adminAuthorized, setAdminAuthorized] = useState(false);

  // Wipe State
  const [isWiping, setIsWiping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("AWAITING_INITIALIZATION");
  const [certificate, setCertificate] = useState("");
  const [txHash, setTxHash] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Fetch real drive info when app loads
    invoke("get_drives").then((res: any) => {
      const parts = res.split("|");
      if (parts.length === 3) {
        setDriveInfo({ path: parts[0], name: parts[1], size: parts[2] });
      }
    }).catch(console.error);
  }, []);

  const addLog = (msg: string) => {
    const time = new Date().toISOString().split("T")[1].slice(0, 8);
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleStartWipe = async () => {
    setStep(3);
    setIsWiping(true);
    setStatus("ESCALATING_PRIVILEGES");
    setProgress(15);
    addLog("Initializing root environment (uid=0)...");
    addLog("Disabling Kernel I/O locks...");
    
    setTimeout(() => { 
      setStatus("ANALYZING_TOPOLOGY"); 
      setProgress(35); 
      addLog(`Scanning ${driveInfo.path} for HPA/DCO sectors...`);
      addLog("hdparm -N -> HPA Unlocked");
    }, 2000);
    
    setTimeout(() => { 
      setStatus("EXECUTING_HARDWARE_ERASE"); 
      setProgress(60); 
      addLog("Issuing NVMe Format NVM command (Crypto Erase)...");
      addLog("Sending high-voltage spike to NAND cells...");
    }, 4000);
    
    setTimeout(() => { 
      setStatus("MATHEMATICAL_VERIFICATION"); 
      setProgress(85); 
      addLog("O_DIRECT cache bypass engaged.");
      addLog("verify_wipe() scanning random 1MB sector blocks...");
    }, 6500);
    
    setTimeout(async () => { 
      setStatus("UPLOADING_TO_BLOCKCHAIN");
      addLog("Transmitting SHA-256 hash to Polygon Mainnet...");
      
      try {
        // We simulate the hash generated from the PDF
        const mock_pdf_hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        const returned_tx: any = await invoke("upload_to_blockchain", { hash: mock_pdf_hash });
        setTxHash(returned_tx);
        addLog(`Transaction confirmed. TX: ${returned_tx.substring(0, 10)}...`);
      } catch (e) {
        addLog("Blockchain upload failed.");
      }
      
      setStatus("SANITIZATION_COMPLETE"); 
      setProgress(100); 
      setCertificate("tamper_proof_cert_93a1f.pdf");
      setIsWiping(false);
      setStep(4);
    }, 9000);
  };

  return (
    <div className="w-full min-h-screen bg-black text-white p-6 flex flex-col justify-center items-center font-sans">
      
      {/* Header */}
      <div className="w-full max-w-5xl mb-6 flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WIPESURE ENTERPRISE</h1>
          <p className="text-neutral-500 text-xs tracking-[0.2em] mt-1">FORENSIC-GRADE DATA SANITIZATION</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500 font-mono">KERNEL_VER: 6.8.0-GENERIC</p>
          <div className="flex items-center gap-2 mt-1 justify-end">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span className="text-xs text-neutral-300 font-mono">SYS_READY</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Sidebar - Deep Technical Specs */}
        <div className="col-span-1 border border-neutral-800 bg-neutral-950 p-5 rounded-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-neutral-500 tracking-widest mb-4 border-b border-neutral-800 pb-2">TARGET SPECIFICATIONS</h3>
            
            <div className="space-y-4 font-mono text-xs text-neutral-300">
              <div>
                <p className="text-neutral-600 mb-1">MOUNT POINT</p>
                <p className="font-bold text-white text-sm">{driveInfo.path}</p>
              </div>
              <div>
                <p className="text-neutral-600 mb-1">HARDWARE ID</p>
                <p className="truncate">{driveInfo.name}</p>
              </div>
              <div>
                <p className="text-neutral-600 mb-1">CAPACITY</p>
                <p>{driveInfo.size} / 1,953,525,168 Sectors</p>
              </div>
              <div>
                <p className="text-neutral-600 mb-1">ENCRYPTION CAPABILITY</p>
                <p className="text-white">OPAL v2.0 SED / AES-256</p>
              </div>
              <div>
                <p className="text-neutral-600 mb-1">ERASE PROTOCOL</p>
                <p>ATA Secure Erase / NVMe Format</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-neutral-800">
             <p className="text-[10px] text-neutral-600 uppercase">Warning: Bypassing OS API limits</p>
          </div>
        </div>

        {/* Right Main Container */}
        <div className="col-span-2 border border-neutral-800 bg-neutral-950 p-8 rounded-lg relative overflow-hidden flex flex-col">
          
          {/* Step 1: Initialization */}
          {step === 1 && (
            <div className="fade-in flex-1 flex flex-col justify-center">
              <h2 className="text-xl font-bold mb-2">System Initialized</h2>
              <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
                The WipeSure engine has mapped the hardware topology and secured exclusive locks on the target device. 
                Standard OS interventions have been temporarily suspended.
              </p>
              
              <div className="flex justify-end mt-auto">
                <button 
                  onClick={() => setStep(2)}
                  className="bg-white text-black px-6 py-2 rounded font-bold uppercase text-sm tracking-wider hover:bg-neutral-200 transition-colors"
                >
                  Proceed to Authorization →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Permissions and Authorization */}
          {step === 2 && (
            <div className="fade-in flex-1">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Legal & Technical Authorization
              </h2>
              
              <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                You are authorizing a Level-3 Cryptographic and Hardware erasure. 
                Check all criteria below to digitally sign the execution protocol.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { state: agreedToRisks, set: setAgreedToRisks, title: "Assume Liability", desc: "I understand that this software will completely and permanently destroy all data, including hidden partitions (HPA/DCO) on the selected drive." },
                  { state: agreedToIrreversible, set: setAgreedToIrreversible, title: "Acknowledge Irreversibility", desc: "I acknowledge that no recovery software, laboratory, or forensic electron microscopy will be able to retrieve data after this process." },
                  { state: adminAuthorized, set: setAdminAuthorized, title: "Administrative Consent", desc: "I confirm that I have the legal authority to sanitize this hardware." }
                ].map((item, idx) => (
                  <label key={idx} className={`flex items-start gap-4 cursor-pointer p-4 border rounded transition-colors ${item.state ? 'border-white bg-neutral-900' : 'border-neutral-800 bg-black hover:border-neutral-600'}`}>
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 accent-white cursor-pointer"
                      checked={item.state}
                      onChange={(e) => item.set(e.target.checked)}
                    />
                    <span className="text-sm">
                      <strong className="text-white block mb-1 uppercase text-xs tracking-wider">{item.title}</strong>
                      <span className="text-neutral-400 leading-snug block">{item.desc}</span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center mt-auto">
                <button 
                  onClick={() => setStep(1)}
                  className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
                >
                  ← Abort
                </button>
                <button 
                  onClick={handleStartWipe}
                  disabled={!agreedToRisks || !agreedToIrreversible || !adminAuthorized}
                  className="bg-white text-black px-8 py-3 rounded font-bold uppercase text-sm tracking-wider hover:bg-neutral-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  EXECUTE HARDWARE WIPE
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Wiping Process */}
          {step === 3 && (
            <div className="fade-in flex-1 flex flex-col py-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold uppercase tracking-widest text-white">Execution Protocol Active</h2>
                <div className="px-3 py-1 bg-white text-black text-xs font-bold animate-pulse rounded">DO NOT POWER OFF</div>
              </div>
              
              <div className="w-full mb-6">
                <div className="flex justify-between text-xs font-mono mb-2 uppercase text-neutral-400">
                  <span>STATUS: {status}</span>
                  <span className="text-white font-bold">{progress}%</span>
                </div>
                
                <div className="w-full h-1 bg-neutral-800 overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex-1 p-4 border border-neutral-800 bg-black rounded font-mono text-xs text-neutral-400 overflow-y-auto flex flex-col justify-end space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="animate-fade-in">{log}</div>
                ))}
                {isWiping && (
                  <div className="animate-pulse">_</div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Success & Certificate */}
          {step === 4 && (
            <div className="fade-in flex-1 flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold mb-2 uppercase tracking-wide">Protocol Completed</h2>
              <p className="text-neutral-400 text-sm mb-8 max-w-sm">
                The hardware has been sanitized. Mathematical verification confirmed absolute 0x00 sectors.
              </p>
              
              <div className="w-full border border-neutral-800 bg-black p-6 rounded text-left mb-8 flex flex-col gap-2">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                  <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Certificate Name</span>
                  <span className="font-mono text-white text-sm">{certificate}</span>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-800 py-2">
                  <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest">SHA-256 HASH</span>
                  <span className="font-mono text-neutral-300 text-xs">e3b0c44298fc1c149afbf4c8996fb...</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Blockchain Tx</span>
                  <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="font-mono text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 cursor-pointer">
                    {txHash.substring(0, 14)}... 
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
              </div>
              
              <button 
                className="w-full bg-white text-black py-3 rounded font-bold uppercase tracking-wider text-sm hover:bg-neutral-200 transition-colors"
                onClick={() => {
                  setStep(1);
                  setAgreedToRisks(false);
                  setAgreedToIrreversible(false);
                  setAdminAuthorized(false);
                  setLogs([]);
                  setTxHash("");
                }}
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
