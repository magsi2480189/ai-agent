import React, { useState, useRef, useEffect } from "react";
import { QAItem, BusinessSetup } from "../types";
import { generateAgentResponse } from "../agentLogic";
import { Send, ArrowLeft, RefreshCw, Sparkles } from "lucide-react";

interface ChatSandboxProps {
  businessSetup: BusinessSetup;
  qaList: QAItem[];
  replyToGroups: boolean;
}

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  time: string;
  status?: "answered" | "ignored";
}

export default function ChatSandbox({ businessSetup, qaList, replyToGroups }: ChatSandboxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "As-salamu alaykum! I am your AI Agent Sandbox Bot. Type any message to test if I reply or ignore it based on your Setup and Q&As!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

 
  const handleSend = () => {
    if (!input.trim()) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: ChatMessage = {
      sender: "user",
      text: input,
      time: userTime
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    // Simulate Agent processing delay
    setTimeout(() => {
     const { reply, status } = generateAgentResponse(currentInput, businessSetup, qaList);
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (status === "answered" && reply) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: reply,
            time: botTime,
            status: "answered"
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "⚠️ [AI Agent: Message Ignored] - This message was classified as personal or out-of-scope, and the bot did not reply. A notification has been forwarded to the owner.",
            time: botTime,
            status: "ignored"
          }
        ]);
      }
    }, 800);
  };

  const clearChat = () => {
    setMessages([
      {
        sender: "bot",
        text: "Sandbox reset. You can start testing again!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="flex flex-col bg-[#070d1e]/80 border border-white/5 rounded-2xl h-[480px] overflow-hidden relative shadow-2xl backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />

      {/* SANDBOX HEADER */}
      <div className="px-5 py-3.5 bg-white/5 border-b border-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
            AI-Agent Live Sandbox <span className="text-[10px] text-slate-400 font-normal">(Testing Zone)</span>
          </h4>
        </div>
        <button
          onClick={clearChat}
          className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
          title="Reset chat log"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* CHAT MESSAGES PANEL */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 min-h-0 select-text">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
            {m.status && (
              <span className={`text-[9px] font-semibold uppercase tracking-wider mb-1 px-1.5 py-0.5 rounded ${
                m.status === "answered" ? "text-cyan-400 bg-cyan-400/10" : "text-rose-400 bg-rose-400/10"
              }`}>
                {m.status === "answered" ? "✓ Auto-Replied" : "👻 Ignored by Switchboard"}
              </span>
            )}
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
              m.sender === "user"
                ? "bg-slate-800 text-slate-100 rounded-tr-sm"
                : m.status === "ignored"
                  ? "bg-rose-950/20 text-slate-400 italic border border-rose-500/10 rounded-tl-sm"
                  : "bg-cyan-500/10 text-white border border-cyan-400/15 rounded-tl-sm"
            }`}>
              {m.text}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1">{m.time}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT PANEL */}
      <div className="p-3 bg-[#0a0f24] border-t border-white/5 flex gap-2 items-center z-10">
        <input
          type="text"
          placeholder="Ask a test question (e.g. 'How do I apply for scholarship?')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-[#070d1e] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 transition-all"
        />
        <button
          onClick={handleSend}
          className="p-2.5 bg-cyan-400 hover:bg-white text-slate-950 rounded-xl transition-all duration-150 cursor-pointer shadow-lg shadow-cyan-500/15"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
