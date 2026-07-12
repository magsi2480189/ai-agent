import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { User, Conversation, QAItem, BusinessSetup } from "../types";
import { INITIAL_QA, INITIAL_CONVERSATIONS } from "../data";
import {
  Smartphone,
  Settings,
  Database,
  BarChart3,
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  CreditCard,
  AlertCircle
} from "lucide-react";
import ChatSandbox from "./ChatSandbox";

interface UserConsoleProps {
  currentUser: User;
  onLogout: () => void;
  onUpgradeToPremium: () => void;
  usersList: User[];
  onUpdateUserMessages: (userId: number, messageCount: number) => void;
}

export default function UserConsole({
  currentUser,
  onLogout,
  onUpgradeToPremium,
  usersList,
  onUpdateUserMessages
}: UserConsoleProps) {
  const [activeTab, setActiveTab] = useState<"connect" | "setup" | "qna" | "dashboard" | "subscription">("connect");
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "generating" | "scanning" | "connected">("disconnected");
  
  // Localized state persisted to localStorage
  const [businessSetup, setBusinessSetup] = useState<BusinessSetup>(() => {
    const saved = localStorage.getItem(`setup_${currentUser.id}`);
    return saved ? JSON.parse(saved) : { business_description: "", owner_number: "" };
  });

  const [qaList, setQaList] = useState<QAItem[]>(() => {
    const saved = localStorage.getItem(`qa_${currentUser.id}`);
    if (saved && saved.includes("apply for the scholarship")) {
      localStorage.removeItem(`qa_${currentUser.id}`);
      return INITIAL_QA;
    }
    return saved ? JSON.parse(saved) : INITIAL_QA;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(`conversations_${currentUser.id}`);
    if (saved && saved.includes("TCF ki scholarship")) {
      localStorage.removeItem(`conversations_${currentUser.id}`);
      return INITIAL_CONVERSATIONS;
    }
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [replyToGroups, setReplyToGroups] = useState<boolean>(() => {
    const saved = localStorage.getItem(`groups_${currentUser.id}`);
    return saved ? JSON.parse(saved) === "true" : false;
  });

  const [filterType, setFilterType] = useState<"all" | "answered" | "ignored">("all");
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Persist states to local storage
  useEffect(() => {
    localStorage.setItem(`setup_${currentUser.id}`, JSON.stringify(businessSetup));
  }, [businessSetup, currentUser.id]);

  useEffect(() => {
    localStorage.setItem(`qa_${currentUser.id}`, JSON.stringify(qaList));
  }, [qaList, currentUser.id]);

  useEffect(() => {
    localStorage.setItem(`conversations_${currentUser.id}`, JSON.stringify(conversations));
  }, [conversations, currentUser.id]);

  useEffect(() => {
    localStorage.setItem(`groups_${currentUser.id}`, replyToGroups ? "true" : "false");
  }, [replyToGroups, currentUser.id]);
useEffect(() => {
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_description: businessSetup.business_description,
        owner_number: businessSetup.owner_number,
        qaList,
        replyToGroups
      })
    }).catch(() => {});
  }, [businessSetup, qaList, replyToGroups]);
  // Real-time WhatsApp States
  const [backendStatus, setBackendStatus] = useState<"disconnected" | "waiting" | "connected" | "authenticating" | "error">("disconnected");
  const [connectionInfo, setConnectionInfo] = useState<{ phoneNumber?: string; connectionTime?: string; errorDetails?: string; isSimulated?: boolean }>({});

  // Socket.IO hook to listen to status changes in real-time
  useEffect(() => {
    const socket = io();

    socket.on("status_update", (data: {
      status: "disconnected" | "waiting" | "connected" | "authenticating" | "error";
      qr: string | null;
      connectionInfo: any;
    }) => {
      setBackendStatus(data.status);
      setQrCodeData(data.qr);
      setConnectionInfo(data.connectionInfo || {});

      // Map backend status to existing UI states
      if (data.status === "disconnected" || data.status === "error") {
        setConnectionStatus("disconnected");
      } else if (data.status === "authenticating") {
        setConnectionStatus("generating");
      } else if (data.status === "waiting") {
        setConnectionStatus("scanning");
      } else if (data.status === "connected") {
        setConnectionStatus("connected");
      }
    });

    // Request initial state on load
    socket.emit("request_state");

    return () => {
      socket.disconnect();
    };
  }, []);

  // QR Generation via Real API Trigger
  const handleGenerateQR = () => {
    setConnectionStatus("generating");
    setQrCodeData(null);

    fetch("/api/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forceSimulate: false })
    }).catch(err => console.error("Error triggering connection:", err));
  };

  const handleSimulateScan = () => {
    fetch("/api/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forceSimulate: true })
    }).catch(err => console.error("Error triggering simulated scanning:", err));
  };

  const handleDisconnect = () => {
    fetch("/api/logout", {
      method: "POST"
    }).catch(err => console.error("Error disconnecting session:", err));
  };

  // Add/Remove Q&A items
  const handleAddQA = () => {
    let maxQa = 5;
    if (currentUser.plan === "ULTIMATE 👑") {
      maxQa = 9999;
    } else if (currentUser.plan === "PRO ⭐") {
      maxQa = 15;
    }
    if (qaList.length >= maxQa) {
      onUpgradeToPremium();
      return;
    }
    setQaList([...qaList, { question: "", answer: "" }]);
  };

  const handleRemoveQA = (idx: number) => {
    const newList = qaList.filter((_, i) => i !== idx);
    setQaList(newList);
  };

  const handleQAChange = (idx: number, field: "question" | "answer", val: string) => {
    const newList = [...qaList];
    newList[idx][field] = val;
    setQaList(newList);
  };

  const handleSaveSetup = () => {
    setSaveSuccessMsg("Setup saved successfully!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  const handleSaveQA = () => {
    setSaveSuccessMsg("Q&A saved successfully!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  // Stats Counters
  const filteredConversations = conversations.filter(c => {
    if (filterType === "all") return true;
    return c.status === filterType;
  });

  const totalMessages = conversations.length;
  const answeredMessages = conversations.filter(c => c.status === "answered").length;
  const ignoredMessages = conversations.filter(c => c.status === "ignored").length;
  const responseRate = totalMessages > 0 ? Math.round((answeredMessages / totalMessages) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-400 flex flex-col md:flex-row relative">
      {/* Sidebar navigation backdrop */}
      <div className="absolute top-0 left-0 w-80 h-full bg-cyan-950/5 blur-[100px] pointer-events-none"></div>

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-[#070d1e]/90 backdrop-blur-md border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col justify-between shrink-0 relative z-10">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 font-display text-xl font-bold tracking-tight text-white mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
            AI-Agent
          </div>

          {/* User Info Capsule */}
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 mb-6 space-y-2.5">
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Account User</p>
              <p className="text-xs font-bold text-white truncate">{currentUser.email}</p>
            </div>
            <div className="h-px bg-white/5" />
            <div className="grid grid-cols-2 gap-y-1.5 text-[10px]">
              <span className="text-slate-400 font-medium">Plan:</span>
              <span className={`font-bold text-right ${
                currentUser.plan === "ULTIMATE 👑" ? "text-amber-400" :
                currentUser.plan === "PRO ⭐" ? "text-cyan-400" : "text-slate-400"
              }`}>
                {currentUser.plan || "FREE"}
              </span>
              
              <span className="text-slate-400 font-medium">Payment:</span>
              <span className={`font-bold text-right ${
                currentUser.payment_status === "Pending Approval" ? "text-amber-400" :
                currentUser.payment_status === "Approved" ? "text-emerald-400" :
                currentUser.payment_status === "Rejected" ? "text-rose-400" : "text-slate-500"
              }`}>
                {currentUser.payment_status || "None"}
              </span>

              <span className="text-slate-400 font-medium">Status:</span>
              <span className={`font-bold text-right ${
                currentUser.subscription_status === "Active" ? "text-emerald-400" : "text-rose-400"
              }`}>
                {currentUser.subscription_status || "Inactive"}
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("connect")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "connect"
                  ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 pl-3.5"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Smartphone size={16} />
              Connect Device
            </button>
            <button
              onClick={() => setActiveTab("setup")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "setup"
                  ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 pl-3.5"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings size={16} />
              Business Setup
            </button>
            <button
              onClick={() => setActiveTab("qna")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "qna"
                  ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 pl-3.5"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Database size={16} />
              Q&A Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 pl-3.5"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <BarChart3 size={16} />
              Conversations Log
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "subscription"
                  ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 pl-3.5"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <CreditCard size={16} />
              My Subscription
            </button>
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-400/10 rounded-xl text-sm font-semibold transition-all mt-8 md:mt-0 cursor-pointer"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      {/* CORE WORKSPACE */}
      <main className="flex-1 px-6 md:px-12 py-10 max-w-5xl mx-auto min-w-0 relative z-10">
        {/* TAB 1: CONNECT */}
        {activeTab === "connect" && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase mb-1">Step 01</p>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">Connect WhatsApp Device</h2>
              <p className="text-sm text-slate-400 font-light mt-1">Scan the generated authentication barcode to go live instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px] text-center shadow-2xl backdrop-blur-sm relative">
                
                {/* Connection Status Pill Header */}
                <div className="absolute top-4 right-4">
                  {connectionStatus === "connected" ? (
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 text-[10px] text-emerald-400 font-bold rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_6px_#34d399]" />
                      🟢 Connected
                    </span>
                  ) : connectionStatus === "scanning" || connectionStatus === "generating" ? (
                    <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/25 text-[10px] text-amber-400 font-bold rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_6px_#fbbf24]" />
                      🟡 Waiting for Scan
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/25 text-[10px] text-rose-400 font-bold rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full shadow-[0_0_6px_#f87171]" />
                      🔴 Disconnected
                    </span>
                  )}
                </div>

                <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-6 self-start pl-2">Barcode Connection State</p>

                {connectionStatus === "disconnected" && (
                  <div className="space-y-5 flex flex-col items-center py-4">
                    <div className="w-16 h-16 border border-dashed border-white/20 rounded-2xl flex items-center justify-center text-slate-400 text-3xl bg-white/5 shadow-inner">◈</div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">WhatsApp Web Not Linked</p>
                      <p className="text-xs text-slate-400 font-light max-w-xs leading-relaxed">No connection active. Generate a barcode session below to link your mobile WhatsApp.</p>
                    </div>
                    {backendStatus === "error" && connectionInfo.errorDetails && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] rounded-xl max-w-xs leading-relaxed text-left">
                        <strong className="block font-bold mb-0.5">Initialization Note:</strong>
                        {connectionInfo.errorDetails}
                      </div>
                    )}
                    <button
                      onClick={handleGenerateQR}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-extrabold text-xs rounded-xl transition-all hover:from-cyan-400 hover:to-indigo-400 shadow-lg shadow-cyan-500/15 cursor-pointer active:scale-[0.98]"
                    >
                      Generate Connection QR
                    </button>
                  </div>
                )}

                {connectionStatus === "generating" && (
                  <div className="space-y-5 flex flex-col items-center py-6">
                    <div className="w-10 h-10 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
                    <div>
                      <p className="text-sm font-bold text-white">Creating Secure Session</p>
                      <p className="text-xs text-slate-400 font-light mt-1">Spinning up secure browser and generating WhatsApp Web auth variables...</p>
                    </div>
                  </div>
                )}

                {connectionStatus === "scanning" && qrCodeData && (
                  <div className="space-y-5 flex flex-col items-center py-4 w-full">
                    <div className="p-3 bg-white rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                      <img src={qrCodeData} alt="WhatsApp Web QR Code" className="w-[180px] h-[180px]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-300">Scan to Go Live</p>
                      <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed mt-1">Open WhatsApp &rarr; Linked Devices &rarr; Link a Device and scan the code above.</p>
                    </div>
                    <button
                      onClick={handleSimulateScan}
                      className="px-5 py-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles size={12} className="text-cyan-400" /> Bypass with Simulated Scan (Test)
                    </button>
                  </div>
                )}

                {connectionStatus === "connected" && (
                  <div className="space-y-5 flex flex-col items-center w-full">
                    <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative">
                      <CheckCircle size={56} className="text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white mb-1">WhatsApp Fully Connected!</h4>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Your Switchboard AI Agent is active and listening to incoming chat threads.</p>
                    </div>

                    {/* Metadata Table */}
                    <div className="w-full max-w-xs bg-slate-950/50 rounded-xl border border-white/5 p-4.5 text-left space-y-2.5 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-slate-400">Connection Status:</span>
                        <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                          🟢 Connected
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Phone Number:</span>
                        <span className="font-mono font-bold text-white select-all">{connectionInfo.phoneNumber || "+92 370 3089154"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Connected At:</span>
                        <span className="text-slate-300">{connectionInfo.connectionTime || "Just Now"}</span>
                      </div>
                      {connectionInfo.isSimulated && (
                        <div className="pt-2 border-t border-white/5 text-[10px] text-amber-400 font-medium flex items-center gap-1">
                          ⚠️ Sandbox Demo Session Fallback Active
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
                      <button
                        onClick={() => setActiveTab("setup")}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-extrabold text-xs rounded-xl hover:from-cyan-400 hover:to-indigo-400 transition-all cursor-pointer shadow-lg shadow-cyan-500/15"
                      >
                        Proceed to Setup &rarr;
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleGenerateQR}
                          className="px-3 py-2 border border-white/10 hover:border-white/20 text-slate-300 hover:bg-white/5 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Reconnect
                        </button>
                        <button
                          onClick={handleDisconnect}
                          className="px-3 py-2 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:bg-rose-500/5 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* How it works card */}
              <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
                <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-6">Instructions Checklist</p>
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <span className="text-sm font-bold text-cyan-400 bg-cyan-400/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">1</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white mb-1">Generate Authorization Barcode</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Click the generate button to spin up a headless WhatsApp container on our secure host.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-sm font-bold text-cyan-400 bg-cyan-400/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">2</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white mb-1">Scan from Settings</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Inside your mobile phone, click "Linked Devices" and scan the generated code within 45 seconds.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-sm font-bold text-cyan-400 bg-cyan-400/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">3</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white mb-1">Stay Online</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Keep your phone connected to the internet. The AI Agent will handle concurrent business chats automatically.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SETUP */}
        {activeTab === "setup" && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase mb-1">Step 02</p>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">Business Setup</h2>
              <p className="text-sm text-slate-400 font-light mt-1">Fine-tune how your AI responds by writing your core business context.</p>
            </div>

            <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-sm">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Business Description</label>
                <textarea
                  placeholder="e.g. We are a premium medicine shop. We also handle scholarship queries, documentation requests, and transport fee schedules..."
                  value={businessSetup.business_description}
                  onChange={(e) => setBusinessSetup({ ...businessSetup, business_description: e.target.value })}
                  className="w-full bg-[#0a0f24] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 transition-all h-28 resize-y"
                />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  💡 <strong>Tip:</strong> If your agent is failing to reply to certain niche queries, include that topic inside your Business Description so the classifier can route it appropriately.
                </p>
              </div>

              <div className="space-y-2 max-w-md">
                <label className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Owner WhatsApp Number</label>
                <input
                  type="text"
                  placeholder="e.g. 923182182142"
                  value={businessSetup.owner_number}
                  onChange={(e) => setBusinessSetup({ ...businessSetup, owner_number: e.target.value })}
                  className="w-full bg-[#0a0f24] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 transition-all"
                />
                <p className="text-[10px] text-slate-500">Format: Country code + number without spaces or symbols.</p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center gap-4">
                <button
                  onClick={handleSaveSetup}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-sm rounded-xl hover:from-cyan-400 hover:to-indigo-400 transition-all cursor-pointer shadow-lg shadow-cyan-500/15"
                >
                  Save Business Config
                </button>
                {saveSuccessMsg && <span className="text-xs text-cyan-400 font-semibold">{saveSuccessMsg}</span>}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Q&A KNOWLEDGE BASE */}
        {activeTab === "qna" && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase mb-1">Step 03</p>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">Q&A Knowledge Base</h2>
              <p className="text-sm text-slate-400 font-light mt-1">Add intent-matching question and answer pairs for your Switchboard agent.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Q&A List configuration */}
              <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <h4 className="text-xs font-semibold uppercase text-slate-400">Frequently Asked Questions</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReplyToGroups(!replyToGroups)}
                      className="px-3 py-1.5 border border-white/10 rounded-lg text-xs font-medium hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {replyToGroups ? <ToggleRight className="text-cyan-400" size={16} /> : <ToggleLeft className="text-slate-500" size={16} />}
                      Groups: {replyToGroups ? "ON" : "OFF"}
                    </button>
                    <button
                      onClick={handleAddQA}
                      className="px-3 py-1.5 bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold hover:bg-white transition-colors cursor-pointer"
                    >
                      + Add Pair
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {qaList.map((item, idx) => (
                    <div key={idx} className="p-4 bg-[#0a0f24] border border-white/5 rounded-xl space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold">Pair #{String(idx + 1).padStart(2, "0")}</span>
                        <button
                          onClick={() => handleRemoveQA(idx)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="User might ask (e.g. 'What is the pricing?')..."
                          value={item.question}
                          onChange={(e) => handleQAChange(idx, "question", e.target.value)}
                          className="w-full bg-[#070d1e] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
                        />
                        <textarea
                          rows={2}
                          placeholder="Agent replies with..."
                          value={item.answer}
                          onChange={(e) => handleQAChange(idx, "answer", e.target.value)}
                          className="w-full bg-[#070d1e] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center gap-4">
                  <button
                    onClick={handleSaveQA}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-sm rounded-xl hover:from-cyan-400 hover:to-indigo-400 transition-all cursor-pointer shadow-lg shadow-cyan-500/15"
                  >
                    Save Knowledge Base
                  </button>
                  {saveSuccessMsg && <span className="text-xs text-cyan-400 font-semibold">{saveSuccessMsg}</span>}
                </div>
              </div>

              {/* Chat Sandbox Widget */}
              <ChatSandbox businessSetup={businessSetup} qaList={qaList} replyToGroups={replyToGroups} />
            </div>
          </div>
        )}

        {/* TAB 4: DASHBOARD (CONVERSATIONS LOG) */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase mb-1">Metrics Overview</p>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">Conversations Dashboard</h2>
              <p className="text-sm text-slate-400 font-light mt-1">Audit active message logs, answered FAQs, and ignored personal queries.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-5 shadow-xl">
                <p className="text-[28px] font-display font-extrabold text-white leading-none mb-1">{totalMessages}</p>
                <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">Total Messages</p>
              </div>
              <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-5 shadow-xl">
                <p className="text-[28px] font-display font-extrabold text-cyan-400 leading-none mb-1">{answeredMessages}</p>
                <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">Replied (Business)</p>
              </div>
              <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-5 shadow-xl">
                <p className="text-[28px] font-display font-extrabold text-rose-400 leading-none mb-1">{ignoredMessages}</p>
                <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">Bypassed (Personal)</p>
              </div>
              <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-5 shadow-xl">
                <p className="text-[28px] font-display font-extrabold text-indigo-400 leading-none mb-1">{responseRate}%</p>
                <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">Switchboard Rate</p>
              </div>
            </div>

            {/* Filter control */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                  filterType === "all"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-[#070d1e] border-white/5 text-slate-400 hover:border-white/10 hover:text-white"
                }`}
              >
                All Threads
              </button>
              <button
                onClick={() => setFilterType("answered")}
                className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                  filterType === "answered"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-[#070d1e] border-white/5 text-slate-400 hover:border-white/10 hover:text-white"
                }`}
              >
                Auto-Replied
              </button>
              <button
                onClick={() => setFilterType("ignored")}
                className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                  filterType === "ignored"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    : "bg-[#070d1e] border-white/5 text-slate-400 hover:border-white/10 hover:text-white"
                }`}
              >
                Bypassed
              </button>
            </div>

            {/* Conversations list */}
            <div className="space-y-3">
              {filteredConversations.length === 0 ? (
                <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-8 text-center text-xs text-slate-400 shadow-xl">
                  No message logs found matching this filter state.
                </div>
              ) : (
                filteredConversations.map((c, idx) => (
                  <div key={idx} className="bg-[#070d1e]/80 border border-white/5 rounded-xl p-5 space-y-4 hover:border-white/10 transition-colors shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                        <span className="text-xs font-bold text-white">{c.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500">{c.time}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                          c.status === "answered" ? "bg-cyan-500/10 text-cyan-400" : "bg-rose-500/10 text-rose-400"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-baseline gap-4 text-xs">
                        <span className="text-[9px] uppercase font-bold text-slate-500 w-12 tracking-wide">User</span>
                        <p className="text-slate-300">{c.message}</p>
                      </div>
                      <div className="flex items-baseline gap-4 text-xs">
                        <span className={`text-[9px] uppercase font-bold w-12 tracking-wide ${
                          c.status === "answered" ? "text-cyan-400" : "text-rose-400"
                        }`}>Agent</span>
                        <p className={c.status === "answered" ? "text-white animate-fade-in" : "text-slate-500/50 italic"}>
                          {c.reply || "Not answered — Classified as personal or skipped"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SUBSCRIPTION */}
        {activeTab === "subscription" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase mb-1">Billing & Access</p>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">My Subscription</h2>
              <p className="text-sm text-slate-400 font-light mt-1">Manage your active subscription, payment status, and plan features.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CURRENT PLAN */}
              <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-4">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Current Plan</p>
                <div>
                  <h3 className="text-2xl font-display font-extrabold text-white flex items-center gap-1.5">
                    {currentUser.plan === "ULTIMATE 👑" ? (
                      <>
                        ULTIMATE <span className="text-amber-400">👑</span>
                      </>
                    ) : currentUser.plan === "PRO ⭐" ? (
                      <>
                        PRO Plan <span className="text-cyan-400">⭐</span>
                      </>
                    ) : (
                      "FREE Plan"
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {currentUser.plan === "ULTIMATE 👑" 
                      ? "Unlimited smart Q&As & advanced personalities active." 
                      : currentUser.plan === "PRO ⭐" 
                      ? "15 Smart Q&As & group bypass active." 
                      : "Limited to 5 Knowledge Base Q&A pairs."}
                  </p>
                </div>
                <div className="pt-2">
                  <span className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 rounded-lg text-xs font-bold">
                    Rs. {currentUser.plan === "ULTIMATE 👑" ? "1200" : currentUser.plan === "PRO ⭐" ? "500" : "0"} / month
                  </span>
                </div>
              </div>

              {/* PAYMENT STATUS */}
              <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-4">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Payment Status</p>
                <div>
                  {currentUser.payment_status === "Pending Approval" ? (
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-full text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Pending Approval
                      </span>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        Your payment proof has been submitted successfully and is waiting for admin approval.
                      </p>
                    </div>
                  ) : currentUser.payment_status === "Approved" ? (
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Approved & Verified
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        Verification completed by administrator.
                      </p>
                    </div>
                  ) : currentUser.payment_status === "Rejected" ? (
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded-full text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Rejected
                      </span>
                      {currentUser.rejection_reason && (
                        <div className="text-xs text-rose-300 font-medium leading-relaxed mt-1 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 space-y-1">
                          <p className="text-[10px] uppercase font-bold text-rose-400">Rejection Reason:</p>
                          <p className="text-slate-300 font-normal">{currentUser.rejection_reason}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 text-slate-400 border border-white/5 rounded-full text-xs font-medium">
                        No History
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        No payment proof submitted yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* SUBSCRIPTION STATUS */}
              <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-4">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Subscription Status</p>
                <div>
                  {currentUser.subscription_status === "Active" ? (
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full text-xs font-bold">
                        Active
                      </span>
                      {currentUser.premium_expiry && (
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          Your premium subscription is fully active. Expiry date: <strong className="text-cyan-400 font-semibold">{currentUser.premium_expiry}</strong>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded-full text-xs font-bold">
                        Inactive
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        Upgrade your account to activate PRO or ULTIMATE capabilities.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PRICING & PLANS SECTION */}
            <div className="space-y-5 pt-4 border-t border-white/5">
              <div>
                <h3 className="font-display text-xl font-extrabold text-white">Compare Plans & Features</h3>
                <p className="text-xs text-slate-400 font-light mt-1">Maximize your chat engagement and response accuracy with automated rules.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* PLAN 1: FREE */}
                <div className="bg-[#070d1e]/30 border border-white/5 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Free Tier</span>
                      <span className="px-2 py-0.5 bg-white/5 border border-white/5 text-[9px] text-slate-400 font-semibold rounded-full">Default Active</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-display font-black text-white">FREE Plan</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Simple automatic replies for testing and nano businesses.</p>
                    </div>
                    <div className="text-2xl font-display font-extrabold text-white">
                      Rs. 0 <span className="text-xs text-slate-500 font-normal">/ month</span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span>Up to <strong>5</strong> Smart Q&A intent pairs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span>Standard response speed (3s delay)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span>Auto-bypasses personal & family chats</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span>Basic logs history dashboard</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-6">
                    <button 
                      disabled 
                      className="w-full py-2.5 bg-white/5 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed border border-white/5"
                    >
                      {(!currentUser.plan || currentUser.plan === "FREE") ? "Current Plan" : "Downgrade Unavailable"}
                    </button>
                  </div>
                </div>

                {/* PLAN 2: PRO */}
                <div className="bg-[#070d1e]/80 border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm flex flex-col justify-between shadow-xl shadow-cyan-950/10">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-cyan-400/10 rounded-full blur-xl pointer-events-none" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Popular ⭐</span>
                      {currentUser.plan === "PRO ⭐" && (
                        <span className="px-2 py-0.5 bg-cyan-400/10 border border-cyan-400/20 text-[9px] text-cyan-300 font-bold rounded-full">Your Active Plan</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-display font-black text-white flex items-center gap-1.5">
                        PRO Plan <span className="text-cyan-400">⭐</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">For active retail shops, merchants, and growing desks.</p>
                    </div>
                    <div className="text-2xl font-display font-extrabold text-cyan-400">
                      Rs. 500 <span className="text-xs text-slate-500 font-normal">/ month</span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span>Up to <strong>15</strong> Smart Q&A intent pairs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span><strong>Instant</strong> responses (No fake delay)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span>Priority prompt parsing limits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span>Group chats bypass toggles controls</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-6">
                    {currentUser.plan === "PRO ⭐" ? (
                      <button 
                        disabled 
                        className="w-full py-2.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 font-bold text-xs rounded-xl"
                      >
                        Active
                      </button>
                    ) : (
                      <button 
                        onClick={onUpgradeToPremium}
                        className="w-full py-2.5 bg-cyan-400 hover:bg-white text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-cyan-500/10"
                      >
                        {currentUser.payment_status === "Pending Approval" ? "Resubmit Proof for PRO" : "Upgrade to PRO (Rs. 500)"}
                      </button>
                    )}
                  </div>
                </div>

                {/* PLAN 3: ULTIMATE */}
                <div className="bg-[#070d1e]/80 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm flex flex-col justify-between shadow-xl shadow-amber-950/10">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Ultimate 👑</span>
                      {currentUser.plan === "ULTIMATE 👑" && (
                        <span className="px-2 py-0.5 bg-amber-400/10 border border-amber-400/20 text-[9px] text-amber-300 font-bold rounded-full">Your Active Plan</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-display font-black text-white flex items-center gap-1.5">
                        ULTIMATE Plan <span className="text-amber-400">👑</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">For multi-number operations and enterprise power merchants.</p>
                    </div>
                    <div className="text-2xl font-display font-extrabold text-amber-400">
                      Rs. 1,200 <span className="text-xs text-slate-500 font-normal">/ month</span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span><strong>Unlimited</strong> Smart Q&A intent pairs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span>Multi-agent <strong>personalities</strong> (Casual, Pro, Urdu)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span>Connect up to <strong>3</strong> WhatsApp devices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span>Bulk Excel/CSV uploads & VIP Hotline</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-6">
                    {currentUser.plan === "ULTIMATE 👑" ? (
                      <button 
                        disabled 
                        className="w-full py-2.5 bg-amber-500/10 text-amber-300 border border-amber-500/25 font-bold text-xs rounded-xl"
                      >
                        Active
                      </button>
                    ) : (
                      <button 
                        onClick={onUpgradeToPremium}
                        className="w-full py-2.5 bg-amber-500 hover:bg-white text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10"
                      >
                        {currentUser.payment_status === "Pending Approval" ? "Resubmit Proof for ULTIMATE" : "Upgrade to ULTIMATE (Rs. 1200)"}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
