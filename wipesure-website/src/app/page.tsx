import Head from 'next/head';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black relative overflow-hidden">
      <Head>
        <title>WipeSure Enterprise | Absolute Data Destruction</title>
      </Head>

      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid pointer-events-none z-0 h-[80vh]"></div>
      
      {/* Ambient Glow */}
      <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[800px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Navigation */}
      <nav className="w-full border-b border-white/10 py-6 px-8 flex justify-between items-center glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <h1 className="text-xl font-bold tracking-widest uppercase">WIPESURE</h1>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-widest text-neutral-400">
          <a href="#features" className="hover:text-white transition-colors">CAPABILITIES</a>
          <a href="#download" className="hover:text-white transition-colors">DEPLOY ISO</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-8 pt-32 pb-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-white/20 rounded-full text-xs font-mono text-neutral-300 mb-8 glass-panel">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          SMART INDIA HACKATHON 2026 EDITION
        </div>
        <h2 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[1.1] mb-8 gradient-text">
          Forensic-Grade <br/> Data Sanitization.
        </h2>
        <p className="text-xl text-neutral-400 max-w-2xl leading-relaxed mb-12">
          The uncompromising bootable OS designed to bypass BIOS locks, execute high-voltage ATA Secure Erases, and permanently record certificates on the Polygon Blockchain.
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <a href="#download" className="bg-white text-black px-10 py-4 rounded font-bold uppercase tracking-widest text-sm glow-button">
            Download Universal ISO
          </a>
        </div>
      </section>

      {/* Cinematic Tauri UI Demo Section */}
      <section id="demo" className="relative z-10 w-full max-w-6xl mx-auto px-8 py-24">
        <h3 className="text-3xl font-bold tracking-tighter mb-12 text-center">See It In Action</h3>
        
        {/* We use a sleek CSS representation of the Tauri app for the demo */}
        <div className="w-full glass-panel border border-neutral-800 rounded-2xl p-2 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          
          {/* Simulated Mac Window Controls */}
          <div className="px-4 py-3 flex gap-2 border-b border-white/10">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="ml-4 text-xs font-mono text-neutral-500">wipesure-enterprise-ui</div>
          </div>
          
          {/* The Demo Video Content */}
          <div className="relative aspect-video bg-black flex flex-col justify-center items-center text-center p-8 overflow-hidden">
            {/* Ambient Red glow behind video to simulate danger/erasing */}
            <div className="absolute inset-0 bg-red-900/10 blur-[100px] z-0"></div>
            
            <div className="z-10 flex flex-col items-center">
              <svg className="w-16 h-16 text-white mb-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <h4 className="text-2xl font-bold uppercase tracking-widest text-red-500 mb-2">Executing Hardware Wipe</h4>
              <p className="font-mono text-sm text-neutral-400 mb-8">Target: /dev/nvme0n1 (Samsung SSD 980 PRO)</p>
              
              <div className="w-full max-w-xl bg-neutral-900 rounded-full h-1.5 mb-6 overflow-hidden">
                <div className="bg-red-500 h-full w-[65%] transition-all duration-1000"></div>
              </div>
              
              <div className="font-mono text-xs text-neutral-500 text-left w-full max-w-xl bg-black border border-neutral-800 p-4 rounded h-32 overflow-hidden flex flex-col justify-end">
                <p>{">"} Initialize root environment (uid=0)...</p>
                <p>{">"} Disabling Kernel I/O locks...</p>
                <p>{">"} rtcwake -m mem -s 3 [BIOS Lock Bypassed]</p>
                <p className="text-white">{">"} Issuing NVMe Format NVM command (Crypto Erase)...</p>
                <p className="animate-pulse">_</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 w-full bg-neutral-950 py-32 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-10 rounded-2xl hover:bg-white/5 transition-all">
              <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h4 className="text-xl font-bold mb-4 uppercase tracking-wider">High-Voltage Destruction</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Sends ATA Secure Erase commands directly to the drive controller, causing a simultaneous voltage spike across all NAND cells, permanently resetting them to factory state.
              </p>
            </div>
            <div className="glass-panel p-10 rounded-2xl hover:bg-white/5 transition-all">
              <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h4 className="text-xl font-bold mb-4 uppercase tracking-wider">Hardware Exploit Bypasses</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Utilizes advanced ACPI sleep-cycle exploits (`rtcwake`) to trick motherboards into dropping BIOS Freeze Locks, leaving the drive defenseless.
              </p>
            </div>
            <div className="glass-panel p-10 rounded-2xl hover:bg-white/5 transition-all">
              <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <h4 className="text-xl font-bold mb-4 uppercase tracking-wider">Blockchain Audit Trail</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Generates a cryptographic SHA-256 PDF certificate and automatically logs the transaction hash onto the Polygon Mainnet for immutable public verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Download & Instructions */}
      <section id="download" className="relative z-10 w-full max-w-4xl mx-auto px-8 py-32 text-center">
        <h3 className="text-4xl font-bold tracking-tighter mb-6">Deploy WipeSure</h3>
        <p className="text-neutral-400 mb-12 max-w-2xl mx-auto">
          Download the Universal Bootable ISO. Contains the Debian Live core, proprietary laptop firmware, and the compiled WipeSure C Engine.
        </p>
        
        <div className="glass-panel p-10 rounded-2xl text-left max-w-2xl mx-auto shadow-2xl relative">
          <div className="absolute -top-4 right-8 bg-white text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            Latest: v1.0.0
          </div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-8 border-b border-white/10 pb-4">Installation Protocol</h4>
          <ol className="space-y-8 text-sm text-neutral-300">
            <li className="flex gap-6">
              <span className="font-mono text-white/50 text-xl">01</span>
              <div>
                <strong className="text-white block mb-1 text-base uppercase tracking-wide">Acquire the ISO</strong>
                <a href="/WipeSure-Universal-Boot.iso" download className="text-blue-400 hover:text-blue-300 font-mono transition-colors border-b border-blue-400/30 hover:border-blue-400 pb-1">Download WipeSure-Universal-Boot.iso (1.2GB)</a>
              </div>
            </li>
            <li className="flex gap-6">
              <span className="font-mono text-white/50 text-xl">02</span>
              <div>
                <strong className="text-white block mb-1 text-base uppercase tracking-wide">Flash to USB</strong>
                Use an imaging tool like <a href="https://rufus.ie/" target="_blank" rel="noreferrer" className="text-white underline hover:text-neutral-300">Rufus</a> (Windows) or <a href="https://balena.io/etcher/" target="_blank" rel="noreferrer" className="text-white underline hover:text-neutral-300">BalenaEtcher</a> (Mac/Linux). Flash the ISO to an 8GB+ Pendrive.
              </div>
            </li>
            <li className="flex gap-6">
              <span className="font-mono text-white/50 text-xl">03</span>
              <div>
                <strong className="text-white block mb-1 text-base uppercase tracking-wide">Boot Target Machine</strong>
                Insert the USB into the target computer, restart, and enter the Boot Menu (F12 or F2). Select the USB Drive. The WipeSure Kiosk UI will launch automatically.
              </div>
            </li>
          </ol>
        </div>
      </section>
      
      <footer className="w-full border-t border-white/10 py-12 flex flex-col items-center justify-center text-xs font-mono text-neutral-600 gap-4">
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">DOCUMENTATION</a>
          <a href="#" className="hover:text-white transition-colors">SECURITY AUDIT</a>
          <a href="#" className="hover:text-white transition-colors">TERMS</a>
        </div>
        <p>© 2026 WIPESURE ENTERPRISE. PROUDLY BUILT FOR THE SMART INDIA HACKATHON.</p>
      </footer>
    </main>
  );
}
