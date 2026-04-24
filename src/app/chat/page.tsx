"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft } from "lucide-react";
import { getCollegeTheme } from "@/lib/campus";

interface Msg { from: string; text: string; at: string; }

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function ChatPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [dasherName, setDasherName] = useState("Dasher");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [theme] = useState(getCollegeTheme(typeof window !== "undefined" ? localStorage.getItem("user_college") : null));
  const endRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("dorm_dash_order_id");
    setOrderId(id);
    if (!id) return;

    // Load current dasher name
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(d => { if (d.order?.dasherName) setDasherName(d.order.dasherName); })
      .catch(() => {});

    // Poll messages every 2s
    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${id}/message`);
        if (!res.ok) return;
        const data = await res.json();
        setMsgs(data.messages ?? []);
      } catch {}
    };
    poll();
    pollRef.current = setInterval(poll, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    if (!input.trim() || !orderId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      await fetch(`/api/orders/${orderId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: "student", text }),
      });
      // Immediately re-poll
      const res = await fetch(`/api/orders/${orderId}/message`);
      const data = await res.json();
      setMsgs(data.messages ?? []);
    } catch {} finally {
      setSending(false);
    }
  };

  const initials = dasherName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "D";

  if (!orderId) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-4">
        <p className="text-gray-400">No active order to chat about.</p>
        <button onClick={() => router.push("/home")} className="text-sm font-semibold text-[#003087]">← Back to Home</button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">

      {/* Header */}
      <div style={{ backgroundColor: theme.accent }} className="px-4 pt-12 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button onClick={() => router.push("/home")} className="text-white/70 hover:text-white p-1">
            <ArrowLeft size={22}/>
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm" style={{ backgroundColor: theme.gold, color: theme.accent }}>
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2" style={{ borderColor: theme.accent }}/>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold leading-none">{dasherName}</p>
            <p className="text-green-300 text-xs mt-0.5">● Delivering your order</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 max-w-md mx-auto w-full flex flex-col gap-4">
        {msgs.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            <p className="text-2xl mb-2">💬</p>
            <p>No messages yet — say hi!</p>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === "student" ? "justify-end" : "justify-start"} items-end gap-2`}>
            {m.from !== "student" && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{ backgroundColor: theme.gold, color: theme.accent }}>
                {initials}
              </div>
            )}
            <div className="max-w-[76%]">
              <div className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${m.from === "student" ? "bubble-user" : "bubble-dasher text-gray-800"}`}>
                {m.text}
              </div>
              <p className={`text-[10px] text-gray-400 mt-1 ${m.from === "student" ? "text-right" : "text-left"}`}>
                {fmt(m.at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0 max-w-md mx-auto w-full flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={`Message ${dasherName.split(" ")[0]}…`}
          className="flex-1 bg-[#F1F5F9] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition"
          style={{ ["--tw-ring-color" as string]: `${theme.accent}30` }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="w-11 h-11 text-white rounded-2xl flex items-center justify-center shadow-md disabled:opacity-30 transition active:scale-95"
          style={{ backgroundColor: theme.accent }}
        >
          <Send size={16}/>
        </button>
      </div>
    </div>
  );
}
