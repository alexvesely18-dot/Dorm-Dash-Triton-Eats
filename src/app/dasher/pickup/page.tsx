"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, MapPin, Package, MessageCircle, ChevronRight } from "lucide-react";
import type { Order } from "@/lib/orderStore";

export default function DasherPickupPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{from:string;text:string;at:string}[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = localStorage.getItem("dasher_claimed_order_id");
    if (!id) { router.replace("/dasher/home"); return; }
    fetch(`/api/orders/${id}`)
      .then(r => {
        if (r.status === 404) {
          localStorage.removeItem("dasher_claimed_order_id");
          router.replace("/dasher/home");
          return null;
        }
        return r.json();
      })
      .then(d => { if (d?.order) setOrder(d.order); })
      .catch(() => {});
  }, [router]);

  // Poll messages every 2s so badge count and bubbles stay live even when sheet is closed
  useEffect(() => {
    const id = localStorage.getItem("dasher_claimed_order_id");
    if (!id) return;
    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${id}/message`);
        if (!res.ok) return;
        const data = await res.json();
        if (alive) {
          setMessages(data.messages ?? []);
          if (showChat && chatEnd.current) chatEnd.current.scrollIntoView({ behavior: "smooth" });
        }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => { alive = false; clearInterval(interval); };
  }, [showChat]);

  // Broadcast dasher GPS position every 5 seconds while on this screen
  useEffect(() => {
    const id = localStorage.getItem("dasher_claimed_order_id");
    if (!id || !navigator.geolocation) return;
    let lastUpdate = 0;
    const watchId = navigator.geolocation.watchPosition((pos) => {
      const now = Date.now();
      if (now - lastUpdate < 5000) return;
      lastUpdate = now;
      const sig = localStorage.getItem("dasher_claim_sig") ?? "";
      fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Claim-Sig": sig },
        body: JSON.stringify({ dasherLat: pos.coords.latitude, dasherLng: pos.coords.longitude }),
      }).catch(() => {});
    }, () => {}, { enableHighAccuracy: true });
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const send = async () => {
    const id = localStorage.getItem("dasher_claimed_order_id");
    if (!input.trim() || !id || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      await fetch(`/api/orders/${id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: "dasher", text }),
      });
      const res = await fetch(`/api/orders/${id}/message`);
      const data = await res.json();
      setMessages(data.messages ?? []);
      if (chatEnd.current) chatEnd.current.scrollIntoView({ behavior: "smooth" });
    } catch {} finally {
      setSending(false);
    }
  };

  const [starting, setStarting] = useState(false);

  const markPickedUp = async () => {
    if (!order || starting) return;
    setStarting(true);
    try {
      const sig = localStorage.getItem("dasher_claim_sig") ?? "";
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Claim-Sig": sig },
        body: JSON.stringify({ status: "picked_up" }),
      });
      if (!res.ok) { setStarting(false); return; }
    } catch {
      setStarting(false);
      return;
    }
    router.push("/dasher/delivery");
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading order…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-10">

      <div className="bg-[#003087] px-5 pt-14 pb-6 text-white">
        <div className="max-w-md mx-auto">
          <p className="text-white/60 text-sm flex items-center gap-1.5 mb-3">
            <span className="w-2 h-2 bg-[#F5B700] rounded-full animate-pulse"/>
            Order Accepted
          </p>
          <h1 className="text-3xl font-black">Pick Up Order</h1>
          <p className="text-white/60 mt-1 text-sm">Head to the dining hall counter</p>
        </div>
      </div>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 flex flex-col gap-4">

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">
              {order.hallEmoji}
            </div>
            <div>
              <p className="font-black text-gray-900 text-lg">{order.hall}</p>
              <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                <MapPin size={11}/>
                <span>{order.hallCollege}</span>
              </div>
            </div>
          </div>

          {order.pickup_time && (
            <div className="bg-[#003087]/5 rounded-2xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl">⏱</span>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Scheduled Pickup Time</p>
                <p className="font-black text-[#003087] text-lg">{order.pickup_time}</p>
              </div>
            </div>
          )}
        </div>

        {/* BIG PID display */}
        <div className="bg-[#F5B700] rounded-3xl p-5 shadow-lg">
          <p className="text-[#003087]/70 text-xs font-bold uppercase tracking-widest mb-2">Student ID — Last 4 Digits</p>
          <p className="text-[#003087] font-black text-6xl tracking-widest text-center py-2">
            {order.pid_last4 ?? "••••"}
          </p>
          <p className="text-[#003087]/60 text-xs text-center mt-1 font-medium">
            Show this at the counter to pick up the order
          </p>
        </div>

        {order.order_number && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-semibold">Order #</p>
            <p className="font-black text-[#003087]">{order.order_number}</p>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package size={15} className="text-[#003087]"/>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Items to Pick Up</p>
          </div>
          <div className="flex flex-col gap-2">
            {order.cart.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <div className="w-6 h-6 bg-[#003087]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#003087] text-xs font-black">{item.split("×")[0].trim()}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{item.replace(/^\d+× /, "")}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-semibold">Items</p>
            <p className="font-black text-gray-900">{order.cart.length}</p>
          </div>
        </div>

        {/* Chat — available before pickup so dasher can resolve any issue at the counter */}
        <button
          onClick={() => setShowChat(true)}
          className="w-full flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#003087]/10 rounded-full flex items-center justify-center">
              <MessageCircle size={18} className="text-[#003087]"/>
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-800">Chat with Student</p>
              <p className="text-xs text-gray-400">{messages.length > 0 ? `${messages.length} message${messages.length !== 1 ? "s" : ""}` : "No messages yet"}</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400"/>
        </button>

        {!confirmed ? (
          <button
            onClick={() => setConfirmed(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#003087] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#002060] transition active:scale-[0.98] text-base"
          >
            <CheckCircle size={18}/>
            I have the order
          </button>
        ) : (
          <button
            onClick={markPickedUp}
            disabled={starting}
            className="w-full flex items-center justify-center gap-2 bg-[#F5B700] text-[#003087] font-black py-4 rounded-2xl shadow-lg hover:bg-[#e0a800] transition active:scale-[0.98] text-base animate-fade-in disabled:opacity-60"
          >
            {starting ? "Starting…" : "Start Delivery →"}
          </button>
        )}
      </main>

      {/* Chat sheet */}
      {showChat && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40" onClick={() => setShowChat(false)}>
          <div className="w-full max-w-md bg-white rounded-t-3xl flex flex-col" style={{ height: "70vh" }} onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F5B700] rounded-full flex items-center justify-center text-[#003087] font-black text-sm flex-shrink-0">AT</div>
              <div>
                <p className="font-bold text-gray-900">Student</p>
                <p className="text-xs text-green-500 font-semibold">Online</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {messages.length === 0 && (
                <p className="text-center text-gray-400 text-sm mt-6">No messages yet — send one!</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "dasher" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 text-sm ${m.from === "dasher" ? "bubble-user" : "bubble-dasher text-gray-800"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEnd}/>
            </div>
            <div className="px-4 pb-6 pt-3 border-t border-gray-100 flex gap-2">
              <input
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20"
                placeholder="Message student…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") send(); }}
              />
              <button onClick={send} disabled={!input.trim() || sending} className="w-10 h-10 bg-[#003087] rounded-full flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
