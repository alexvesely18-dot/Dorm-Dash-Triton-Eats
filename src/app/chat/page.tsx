"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, ShoppingBag, CheckCircle } from "lucide-react";

interface Message {
  id: number;
  from: "dasher" | "user";
  text: string;
  time: string;
}

const now = () =>
  new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const INITIAL: Message[] = [
  {
    id: 1,
    from: "dasher",
    text: "Hey! I picked up your order and I'm heading your way now 🚲",
    time: "2:41 PM",
  },
];

const DASHER_REPLIES = [
  "On my way! 👍",
  "Got it, thanks!",
  "Sure, no problem!",
  "I'll be there soon 🏃",
  "Almost there!",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");
  const [orderReady, setOrderReady] = useState(false);
  const [notified, setNotified] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  let replyIdx = 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate order becoming ready after 10s
  useEffect(() => {
    const t = setTimeout(() => setOrderReady(true), 10000);
    return () => clearTimeout(t);
  }, []);

  const send = () => {
    if (!input.trim()) return;
    const t = now();
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "user", text: input.trim(), time: t },
    ]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "dasher",
          text: DASHER_REPLIES[replyIdx % DASHER_REPLIES.length],
          time: now(),
        },
      ]);
      replyIdx++;
    }, 1200);
  };

  const notifyDasher = () => {
    setNotified(true);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        from: "user",
        text: "📲 Your order is ready! I've sent you a notification.",
        time: now(),
      },
    ]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "dasher",
          text: "Awesome, I got the notification! I'll be there in 2 minutes 🚲",
          time: now(),
        },
      ]);
    }, 1500);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#003087] text-white shadow-md flex-shrink-0">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/order" className="p-1 -ml-1 rounded-full hover:bg-white/10 transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#C69214] rounded-full flex items-center justify-center">
              <ShoppingBag size={13} className="text-white" />
            </div>
            <span className="font-bold">Chat with Dasher</span>
          </div>
          {/* Dasher pill */}
          <div className="ml-auto flex items-center gap-2 bg-white/15 rounded-full pl-1.5 pr-3 py-1">
            <div className="w-6 h-6 bg-[#C69214] rounded-full flex items-center justify-center text-xs font-bold text-white">
              MT
            </div>
            <div>
              <p className="text-xs font-semibold leading-none">Marcus T.</p>
              <p className="text-[10px] text-green-300 leading-none mt-0.5">● Online</p>
            </div>
          </div>
        </div>
      </header>

      {/* Order summary bar */}
      <div className="bg-[#003087]/8 border-b border-gray-200 px-4 py-2.5 flex-shrink-0 max-w-md mx-auto w-full">
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-[#003087]">Your order</span> · 64 Degrees · Triton2Go ✓
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-md mx-auto w-full flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
          >
            {msg.from === "dasher" && (
              <div className="w-7 h-7 bg-[#003087] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                MT
              </div>
            )}
            <div className="max-w-[78%]">
              <div
                className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.from === "user"
                    ? "chat-bubble-user"
                    : "chat-bubble-dasher text-gray-800"
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
        <div ref={endRef} />
      </div>

      {/* Notify banner */}
      {orderReady && !notified && (
        <div className="bg-green-50 border-t border-green-100 px-4 py-3 max-w-md mx-auto w-full flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} className="text-green-600" />
            <span className="text-sm font-semibold text-green-800">Order is ready for pickup!</span>
          </div>
          <button
            onClick={notifyDasher}
            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-green-600 transition active:scale-[0.98] text-sm"
          >
            📲 Send Push Notification to Dasher
          </button>
        </div>
      )}

      {notified && (
        <div className="bg-green-50 border-t border-green-100 px-4 py-2.5 max-w-md mx-auto w-full flex-shrink-0 flex items-center gap-2">
          <CheckCircle size={14} className="text-green-600" />
          <p className="text-sm text-green-700 font-medium">Notification sent to Marcus T. ✓</p>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0 max-w-md mx-auto w-full flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message your Dasher…"
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="w-10 h-10 bg-[#003087] text-white rounded-full flex items-center justify-center shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#002270] transition active:scale-95"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
