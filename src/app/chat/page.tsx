"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, CheckCircle, Phone } from "lucide-react";

interface Msg { id: number; from: "dasher"|"user"; text: string; time: string; }

const t = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const REPLIES = ["On my way! 👍","Almost there!","Got it, no worries!","I'll be there in 2 min 🚲","Sure thing!"];

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, from: "dasher", text: "Hey! Picked up your order from 64 Degrees. Heading to Sixth now 🚲", time: "2:41 PM" },
  ]);
  const [input, setInput] = useState("");
  const [ready, setReady] = useState(false);
  const [notified, setNotified] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const replyI = useRef(0);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { const t2 = setTimeout(() => setReady(true), 10000); return () => clearTimeout(t2); }, []);

  const send = () => {
    if (!input.trim()) return;
    const now = t();
    setMsgs(p => [...p, { id: Date.now(), from: "user", text: input.trim(), time: now }]);
    setInput("");
    setTimeout(() => {
      setMsgs(p => [...p, { id: Date.now()+1, from: "dasher", text: REPLIES[replyI.current++ % REPLIES.length], time: t() }]);
    }, 1200);
  };

  const notify = () => {
    setNotified(true);
    setMsgs(p => [...p, { id: Date.now(), from: "user", text: "📲 Just sent you a notification — order's confirmed and waiting!", time: t() }]);
    setTimeout(() => setMsgs(p => [...p, { id: Date.now()+1, from: "dasher", text: "Got it! Be there in 2 minutes 🔥", time: t() }]), 1400);
  };

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">

      {/* Header */}
      <div className="bg-[#003087] px-4 pt-12 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Link href="/home" className="text-white/70 hover:text-white p-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </Link>

          {/* Dasher avatar */}
          <div className="relative">
            <div className="w-10 h-10 bg-[#F5B700] rounded-full flex items-center justify-center text-[#003087] font-black text-sm">MT</div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#003087]"/>
          </div>

          <div className="flex-1">
            <p className="text-white font-bold leading-none">Marcus T.</p>
            <p className="text-green-300 text-xs mt-0.5">● Delivering your order</p>
          </div>

          <button className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center text-white hover:bg-white/25 transition">
            <Phone size={16}/>
          </button>
        </div>
      </div>

      {/* Order info strip */}
      <div className="bg-[#F5B700]/15 border-b border-[#F5B700]/30 px-4 py-2.5 flex-shrink-0 max-w-md mx-auto w-full">
        <p className="text-xs text-[#003087] font-semibold">64 Degrees · Triton2Go ✓ · Heading to Sixth College Dorms</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 max-w-md mx-auto w-full flex flex-col gap-4">
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.from==="user" ? "justify-end" : "justify-start"} items-end gap-2`}>
            {m.from === "dasher" && (
              <div className="w-8 h-8 bg-[#F5B700] rounded-full flex items-center justify-center text-[#003087] text-xs font-black flex-shrink-0">MT</div>
            )}
            <div className="max-w-[76%]">
              <div className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${m.from==="user" ? "bubble-user" : "bubble-dasher text-gray-800"}`}>
                {m.text}
              </div>
              <p className={`text-[10px] text-gray-400 mt-1 ${m.from==="user" ? "text-right" : "text-left"}`}>{m.time}</p>
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>

      {/* Notify banner */}
      {ready && !notified && (
        <div className="px-4 py-3 bg-white border-t-2 border-[#F5B700] flex-shrink-0 max-w-md mx-auto w-full animate-slide-up">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle size={12} className="text-white"/>
            </div>
            <p className="text-sm font-bold text-gray-800">Your order is ready for pickup!</p>
          </div>
          <button onClick={notify} className="w-full bg-[#F5B700] text-[#003087] font-bold py-3 rounded-xl shadow-md hover:bg-[#e0a800] transition active:scale-[0.98] text-sm">
            📲 Send Push Notification to Dasher
          </button>
        </div>
      )}

      {notified && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border-t border-green-200 flex-shrink-0 max-w-md mx-auto w-full">
          <CheckCircle size={15} className="text-green-500 flex-shrink-0"/>
          <p className="text-sm text-green-700 font-semibold">Push notification sent to Marcus ✓</p>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0 max-w-md mx-auto w-full flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key==="Enter" && send()}
          placeholder="Message Marcus…"
          className="flex-1 bg-[#F1F5F9] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 transition"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="w-11 h-11 bg-[#003087] text-white rounded-2xl flex items-center justify-center shadow-md disabled:opacity-30 hover:bg-[#002060] transition active:scale-95"
        >
          <Send size={16}/>
        </button>
      </div>
    </div>
  );
}
