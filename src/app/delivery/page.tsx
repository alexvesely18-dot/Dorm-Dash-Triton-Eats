"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Star, CheckCircle, Package, ShoppingBag } from "lucide-react";

interface Message {
  id: number;
  from: "dasher" | "user";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    from: "dasher",
    text: "Hey! I've picked up your order from 64 Degrees. On my way to Price Center East now 🚲",
    time: "2:38 PM",
  },
  {
    id: 2,
    from: "user",
    text: "Awesome, thanks! I'm on the east side of the plaza near the fountain.",
    time: "2:39 PM",
  },
  {
    id: 3,
    from: "dasher",
    text: "Got it! Be there in about 5 minutes 👍",
    time: "2:39 PM",
  },
];

type Status = "picking-up" | "on-the-way" | "arriving" | "delivered";

const STATUS_STEPS: { key: Status; label: string; emoji: string }[] = [
  { key: "picking-up", label: "Picking up", emoji: "🥡" },
  { key: "on-the-way", label: "On the way", emoji: "🚲" },
  { key: "arriving", label: "Arriving soon", emoji: "📍" },
  { key: "delivered", label: "Delivered!", emoji: "✅" },
];

export default function DeliveryPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("on-the-way");
  const [showNotifyButton, setShowNotifyButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate status progression
  useEffect(() => {
    const t1 = setTimeout(() => setStatus("arriving"), 4000);
    const t2 = setTimeout(() => {
      setStatus("delivered");
      setShowNotifyButton(true);
    }, 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text: input.trim(), time: timeStr }]);
    setInput("");

    // Auto-reply from dasher
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "dasher", text: "Got it, thanks!", time: timeStr },
      ]);
    }, 1500);
  };

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#003087] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/matching" className="p-1 -ml-1 rounded-full hover:bg-white/10 transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#C69214] rounded-full flex items-center justify-center">
              <ShoppingBag size={13} className="text-white" />
            </div>
            <span className="font-bold">Live Delivery</span>
          </div>
          {/* Dasher info pill */}
          <div className="ml-auto flex items-center gap-2 bg-white/15 rounded-full pl-1 pr-3 py-1">
            <div className="w-6 h-6 bg-[#C69214] rounded-full flex items-center justify-center text-xs font-bold text-white">
              MT
            </div>
            <span className="text-xs font-medium">Marcus T.</span>
            <div className="flex items-center gap-0.5">
              <Star size={10} fill="white" stroke="white" />
              <span className="text-xs">4.9</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full flex flex-col flex-1 overflow-hidden">

        {/* Status tracker */}
        <div className="bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 -z-0" />
            <div
              className="absolute top-4 left-4 h-0.5 bg-[#003087] transition-all duration-700 -z-0"
              style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
            />

            {STATUS_STEPS.map((step, i) => (
              <div key={step.key} className="flex flex-col items-center gap-1 z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                    i <= currentStepIdx
                      ? "bg-[#003087] text-white shadow-md scale-110"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step.emoji}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${i <= currentStepIdx ? "text-[#003087]" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order mini-summary */}
        <div className="bg-[#003087]/5 border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <Package size={15} className="text-[#003087] flex-shrink-0" />
          <p className="text-xs text-gray-600 flex-1">
            <span className="font-semibold text-[#003087]">64 Degrees</span> · 3 items · Triton2Go · Price Center East
          </p>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ maxHeight: "calc(100vh - 330px)" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} gap-2 items-end`}
            >
              {msg.from === "dasher" && (
                <div className="w-7 h-7 bg-[#003087] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-0.5">
                  MT
                </div>
              )}
              <div className="max-w-[75%]">
                <div
                  className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.from === "user" ? "chat-bubble-user" : "chat-bubble-dasher text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
                <p className={`text-xs text-gray-400 mt-0.5 ${msg.from === "user" ? "text-right" : "text-left"}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Notify Dasher banner — appears when order is complete */}
        {showNotifyButton && (
          <div className="px-4 py-3 bg-green-50 border-t border-green-100 animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-green-800">Your order is ready for pickup!</span>
            </div>
            <Link
              href="/complete"
              className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-2xl shadow-md hover:bg-green-600 transition active:scale-[0.98] text-sm"
            >
              📲 Send Push Notification to Dasher
            </Link>
          </div>
        )}

        {/* Chat input */}
        {!showNotifyButton && (
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Message your Dasher…"
              className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/30"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-10 h-10 bg-[#003087] text-white rounded-full flex items-center justify-center shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#002270] transition active:scale-95"
            >
              <Send size={15} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
