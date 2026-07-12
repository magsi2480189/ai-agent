import React, { useState, useEffect } from "react";
import { Brain, EyeOff, Zap, Users, BarChart, Gift, ArrowRight, Github, Code } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ringPos, setRingPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const updateRing = () => {
      setRingPos((prev) => {
        const dx = mousePos.x - prev.x - 16;
        const dy = mousePos.y - prev.y - 16;
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15,
        };
      });
      animationFrameId = requestAnimationFrame(updateRing);
    };

    animationFrameId = requestAnimationFrame(updateRing);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-400 overflow-hidden pb-20">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,black,transparent)] pointer-events-none" />

      {/* Custom Cursor */}
      <div
        className="fixed w-2 h-2 bg-cyan-400 rounded-full pointer-events-none z-[9999] transition-transform duration-75 ease-out hidden md:block"
        style={{ left: `${mousePos.x - 4}px`, top: `${mousePos.y - 4}px` }}
      />
      <div
        className="fixed w-8 h-8 border border-cyan-400/40 rounded-full pointer-events-none z-[9998] hidden md:block"
        style={{ left: `${ringPos.x}px`, top: `${ringPos.y}px` }}
      />

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 px-10 py-6 border-b border-white/5 bg-slate-950/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-cyan-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-xl font-bold tracking-tighter uppercase text-white font-display">ai-agent</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-400">
          <a href="#how" className="hover:text-cyan-400 transition-colors">How it works</a>
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
        </div>
        <button
          onClick={onStart}
          className="px-5 py-2 bg-white text-black text-xs font-bold rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all cursor-pointer"
        >
          Launch Agent
        </button>
      </nav>

      {/* HERO & MAIN SECTION */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 pt-16 md:pt-24 relative z-10 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Side */}
        <div className="w-full lg:w-1/2 pr-0 lg:pr-10 text-left">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-[10px] uppercase tracking-widest mb-6 font-bold">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
            v4.2 Engine Live · 100% Free
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight mb-6 text-white font-display">
            Autonomous <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500">Intelligence</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-8">
            Deploy specialized AI switchboard agents on WhatsApp that instantly handle customer queries while bypassing personal family chats.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={onStart}
              className="px-6 py-3.5 bg-cyan-400 hover:bg-white text-[#020617] font-bold text-sm rounded-full uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] cursor-pointer"
            >
              Use AI-Agent Free
            </button>
            <a
              href="#how"
              className="px-6 py-3.5 bg-slate-900/50 hover:bg-slate-900 text-slate-300 border border-slate-800 rounded-full text-sm font-semibold text-center transition-all duration-300"
            >
              See How It Works
            </a>
          </div>

          <div className="flex space-x-4">
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex-1 shadow-lg">
              <div className="text-cyan-400 font-mono text-xl mb-1">100%</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider">Privacy Guaranteed</div>
            </div>
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex-1 shadow-lg">
              <div className="text-indigo-400 font-mono text-xl mb-1">0.4s</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider">Inference Latency</div>
            </div>
          </div>
        </div>

        {/* Right Side (Visual Central Orbit + Mockup) */}
        <div className="w-full lg:w-1/2 min-h-[500px] relative flex items-center justify-center">
          {/* Central Glow Element behind mockup */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 scale-95 md:scale-100">
            <div className="w-72 h-72 border border-white/10 rounded-full flex items-center justify-center">
              <div className="w-56 h-56 border border-cyan-500/20 rounded-full flex items-center justify-center">
                <div className="w-36 h-36 bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 rounded-full backdrop-blur-xl border border-white/20 shadow-[0_0_50px_rgba(34,211,238,0.15)] flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_#fff]"></div>
                </div>
              </div>
            </div>
            {/* Orbiting Nodes */}
            <div className="absolute w-[360px] h-[360px] animate-spin" style={{ animationDuration: '24s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
              <div className="absolute bottom-10 left-10 w-2.5 h-2.5 bg-indigo-400 rounded-full"></div>
              <div className="absolute bottom-20 right-5 w-2.5 h-2.5 bg-purple-400 rounded-full"></div>
            </div>
          </div>

          {/* Floating Phone Mockup */}
          <div className="relative z-10 w-full max-w-sm bg-[#070d1e]/90 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.8)] text-left">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none rounded-3xl" />
            
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-tr from-cyan-400 to-indigo-500 rounded-full flex items-center justify-center text-lg shadow-[0_0_12px_rgba(34,211,238,0.4)]">🤖</div>
                <div>
                  <h4 className="text-sm font-semibold text-white">AI-Agent Live Mock</h4>
                  <p className="text-xs text-cyan-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Active · Monitoring Chat Stream
                  </p>
                </div>
              </div>
              <div className="px-2.5 py-1 bg-white/5 rounded text-[10px] text-slate-400 uppercase font-semibold">Switchboard</div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="inline-block text-[9px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded uppercase tracking-wider mb-2">✓ Answered (Business Intent)</span>
                <div className="bg-slate-900/60 text-xs text-slate-300 px-3.5 py-2.5 rounded-2xl rounded-bl-sm max-w-[85%] mb-1.5 border border-white/5">What are your scholarship requirements?</div>
                <div className="bg-cyan-500 text-[#020617] text-xs font-semibold px-3.5 py-2.5 rounded-2xl rounded-br-sm max-w-[85%] ml-auto shadow-md">Please submit your CNIC, latest marksheet, and fee slip. Har semester ke start pe scholarship de di jati hai.</div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <span className="inline-block text-[9px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded uppercase tracking-wider mb-2">👻 Ignored (Personal Intent)</span>
                <div className="bg-slate-900/60 text-xs text-slate-300 px-3.5 py-2.5 rounded-2xl rounded-bl-sm max-w-[85%] mb-1.5 border border-white/5">Ammi bol rahi hain dahi le kar aao.</div>
                <div className="text-[11px] text-slate-400 italic pl-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Personal chat detected — Left unread. Forwarded to owner.
                </div>
              </div>
            </div>
          </div>

          {/* Floating tech cards around phone */}
          <div className="absolute top-4 right-[-20px] p-4 w-44 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl hidden xl:block">
            <div className="text-[10px] text-cyan-400 uppercase font-bold mb-2">Active Observation</div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
              <div className="h-full w-2/3 bg-cyan-400 animate-pulse"></div>
            </div>
            <div className="text-[9px] text-slate-400">Monitoring system signals and user intent...</div>
          </div>

          <div className="absolute bottom-4 left-[-40px] p-4 w-44 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl hidden xl:block">
            <div className="text-[10px] text-indigo-400 uppercase font-bold mb-2">Neural Reasoning</div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="w-20 h-1 bg-slate-800 rounded-full"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
              </div>
              <div className="flex justify-between items-center opacity-50">
                <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* HOW IT WORKS SECTION */}
      <section id="how" className="px-6 md:px-12 py-24 max-w-5xl mx-auto border-t border-white/5 relative">
        <div className="text-center md:text-left mb-16">
          <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase mb-3">Seamless Process</p>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-4">Set up once. Runs forever.</h2>
          <p className="text-slate-400 font-light max-w-md">Connect your device in three simple steps. No subscription or coding required.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#070d1e]/50 border border-white/5 rounded-2xl p-8 hover:bg-slate-900/80 hover:border-cyan-500/20 transition-all duration-300 group shadow-lg">
            <div className="font-display text-4xl font-extrabold text-white/10 mb-6 group-hover:text-cyan-400 transition-colors">01</div>
            <h3 className="text-lg font-semibold text-white mb-2">Describe Your Business</h3>
            <p className="text-sm text-slate-400 font-light leading-relaxed">Tell the agent what you do and paste your Q&As. AI-Agent matches questions by intent, not strict keywords.</p>
          </div>
          <div className="bg-[#070d1e]/50 border border-white/5 rounded-2xl p-8 hover:bg-slate-900/80 hover:border-cyan-500/20 transition-all duration-300 group shadow-lg">
            <div className="font-display text-4xl font-extrabold text-white/10 mb-6 group-hover:text-cyan-400 transition-colors">02</div>
            <h3 className="text-lg font-semibold text-white mb-2">Scan QR Code</h3>
            <p className="text-sm text-slate-400 font-light leading-relaxed">Link your WhatsApp by scanning a QR code inside your console. No API approvals or complex developer accounts required.</p>
          </div>
          <div className="bg-[#070d1e]/50 border border-white/5 rounded-2xl p-8 hover:bg-slate-900/80 hover:border-cyan-500/20 transition-all duration-300 group shadow-lg">
            <div className="font-display text-4xl font-extrabold text-white/10 mb-6 group-hover:text-cyan-400 transition-colors">03</div>
            <h3 className="text-lg font-semibold text-white mb-2">AI Handles the Rest</h3>
            <p className="text-sm text-slate-400 font-light leading-relaxed">Let the bot auto-respond to business queries 24/7. Friends, family, and group chats are automatically bypassed.</p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="px-6 md:px-12 py-24 max-w-5xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase mb-3">Superior Capabilities</p>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white">Built for real communication.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#070d1e]/50 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all hover:-translate-y-1 shadow-lg">
            <div className="w-11 h-11 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-xl mb-5">🧠</div>
            <h4 className="text-base font-semibold text-white mb-2">Intent-Based Matching</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">Powered by semantic parsing. It understands roman urdu, slang, typos, and mixed language perfectly.</p>
          </div>
          <div className="bg-[#070d1e]/50 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all hover:-translate-y-1 shadow-lg">
            <div className="w-11 h-11 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-xl mb-5">👻</div>
            <h4 className="text-base font-semibold text-white mb-2">Personal Chat Bypassing</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">We value your privacy. Personal messages are strictly ignored, so you can chat freely with family.</p>
          </div>
          <div className="bg-[#070d1e]/50 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all hover:-translate-y-1 shadow-lg">
            <div className="w-11 h-11 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-xl mb-5">⚡</div>
            <h4 className="text-base font-semibold text-white mb-2">Real-Time Sync</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">Zero delays. Customers receive the exact Q&A answers instantly, ensuring high retention and engagement.</p>
          </div>
          <div className="bg-[#070d1e]/50 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all hover:-translate-y-1 shadow-lg">
            <div className="w-11 h-11 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-xl mb-5">📊</div>
            <h4 className="text-base font-semibold text-white mb-2">Console Dashboard</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">Monitor active chat logs. Filter between answered and ignored, and see what the agent is doing in real-time.</p>
          </div>
          <div className="bg-[#070d1e]/50 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all hover:-translate-y-1 shadow-lg">
            <div className="w-11 h-11 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-xl mb-5">👥</div>
            <h4 className="text-base font-semibold text-white mb-2">Group Reply Control</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">Toggle bot replies for group chats with a single click. Keep your group discussions orderly.</p>
          </div>
          <div className="bg-[#070d1e]/50 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all hover:-translate-y-1 shadow-lg">
            <div className="w-11 h-11 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-xl mb-5">⭐</div>
            <h4 className="text-base font-semibold text-white mb-2">Scale-Up Option</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">Upgrade to Premium anytime to unlock 15 Q&As and advanced intent-detection limits.</p>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="px-6 md:px-12 py-24 max-w-4xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase mb-3">Market Comparison</p>
          <h2 className="font-display text-3xl font-extrabold text-white">Why AI-Agent?</h2>
        </div>

        <div className="bg-[#070d1e]/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-3 bg-white/5 border-b border-white/5 font-semibold text-xs text-slate-400 tracking-wider uppercase">
            <div className="p-4 md:p-6">Feature</div>
            <div className="p-4 md:p-6 text-cyan-400">AI-Agent ✦</div>
            <div className="p-4 md:p-6">Standard Bots</div>
          </div>
          <div className="grid grid-cols-3 border-b border-white/5 text-sm">
            <div className="p-4 md:p-6 font-medium text-white">Ignores personal chats</div>
            <div className="p-4 md:p-6 text-cyan-400 font-semibold">✓ Yes (Standard)</div>
            <div className="p-4 md:p-6 text-rose-400">✗ Bypasses none</div>
          </div>
          <div className="grid grid-cols-3 border-b border-white/5 text-sm">
            <div className="p-4 md:p-6 font-medium text-white">Mixed Roman Urdu</div>
            <div className="p-4 md:p-6 text-cyan-400 font-semibold">✓ Supported</div>
            <div className="p-4 md:p-6 text-slate-400/60">✗ Key-match only</div>
          </div>
          <div className="grid grid-cols-3 border-b border-white/5 text-sm">
            <div className="p-4 md:p-6 font-medium text-white">Setup Fees</div>
            <div className="p-4 md:p-6 text-cyan-400 font-semibold">✓ Free Tier</div>
            <div className="p-4 md:p-6 text-rose-400">✗ $20–$100/mo</div>
          </div>
          <div className="grid grid-cols-3 text-sm">
            <div className="p-4 md:p-6 font-medium text-white">Conversation logs</div>
            <div className="p-4 md:p-6 text-cyan-400 font-semibold">✓ Full Dashboard</div>
            <div className="p-4 md:p-6 text-slate-400/60">✗ Rarely offered</div>
          </div>
        </div>
      </section>

      {/* THE BUILDER */}
      <section className="px-6 md:px-12 py-24 max-w-3xl mx-auto border-t border-white/5 text-center flex flex-col items-center">
        <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase mb-3">The Builder</p>
        <h2 className="font-display text-3xl font-extrabold text-white mb-6">Designed by a student with a real problem.</h2>
        <p className="text-slate-400 font-light leading-relaxed mb-4 max-w-2xl">
          Hello! I'm <strong>Asad abdul sattar</strong>, a Software Engineering student. I created AI-Agent after watching small business owners struggle with answering repetitive WhatsApp FAQs day and night, missing personal family moments in the process.
        </p>
        <p className="text-slate-400 font-light leading-relaxed mb-6 max-w-2xl">
          AI-Agent is optimized to give merchants their personal life back, while delivering immediate, precise Q&A matching to prospective clients.
        </p>
        <a
          href="https://github.com/bsse2480189-arch"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-white transition-all border border-cyan-400/30 hover:border-white px-5 py-2.5 rounded-full"
        >
          <Github size={16} />
          GitHub · @Asad
        </a>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="px-6 md:px-12 py-16 text-center max-w-4xl mx-auto">
        <div className="bg-gradient-to-b from-[#070d1e]/80 to-[#020617] border border-white/10 rounded-3xl p-10 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-4">Start Automating Your Chats Today</h2>
          <p className="text-slate-400 max-w-md mx-auto font-light mb-8">Set up your WhatsApp agent in less than 5 minutes. Entirely free to get started.</p>
          <button
            onClick={onStart}
            className="px-8 py-4 bg-cyan-400 hover:bg-white text-slate-950 font-bold text-sm rounded-full uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] cursor-pointer"
          >
            Launch Console Now
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-white/5 pt-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between px-6 md:px-12 max-w-6xl mx-auto">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          <span>System Status: Nominal</span>
        </div>
        <div className="mt-2 sm:mt-0">© 2026 AI-AGENT CORE. All rights reserved. Built by Asad abdul sattar</div>
      </footer>
    </div>
  );
}
