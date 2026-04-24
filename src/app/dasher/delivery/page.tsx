"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MapPin, Package, MessageCircle, CheckCircle, ChevronRight, Building2 } from "lucide-react";
import type { Order } from "@/lib/orderStore";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false, loading: () => <div className="w-full h-full bg-[#E8F0E4] animate-pulse"/> });

export default function DasherDeliveryPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{from:string;text:string;at:string}[]>([]);
  const [input, setInput] = useState("");
  const [delivering, setDelivering] = useState(false);
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

  // Poll messages every 2s when chat is open (and always in background to show badge)
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
          if (chatEnd.current) chatEnd.current.scrollIntoView({ behavior: "smooth" });
        }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => { alive = false; clearInterval(interval); };
  }, []);

  // Continuously broadcast dasher GPS (throttled to every 5s)
  useEffect(() => {
    const id = localStorage.getItem("dasher_claimed_order_id");
    if (!id || !navigator.geolocation) return;
    let lastUpdate = 0;
    const watchId = navigator.geolocation.watchPosition((pos) => {
      const now = Date.now();
      if (now - lastUpdate < 5000) return;
      lastUpdate = now;
      fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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

  const markDelivered = async () => {
    if (!order || delivering) return;
    setDelivering(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      });
      if (!res.ok) { setDelivering(false); return; }
    } catch {
      setDelivering(false);
      return;
    }

    // Only update local state after backend confirms
    try {
      const entry = {
        id: order.id,
        orderNumber: order.order_number,
        hall: order.hall,
        hallEmoji: order.hallEmoji,
        building: order.building,
        earning: 4.75 + (order.toDoor ? 2.0 : 0),
        toDoor: order.toDoor,
        completedAt: new Date().toISOString(),
      };
      const prev = JSON.parse(localStorage.getItem("dasher_history") ?? "[]");
      localStorage.setItem("dasher_history", JSON.stringify([entry, ...prev]));
    } catch {}

    localStorage.removeItem("dasher_claimed_order_id");
    router.push("/dasher/complete");
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading delivery…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-10">

      <div className="bg-[#003087] px-5 pt-14 pb-6 text-white">
        <div className="max-w-md mx-auto">
          <p className="text-white/60 text-sm flex items-center gap-1.5 mb-3">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            En route to delivery
          </p>
          <h1 className="text-3xl font-black">Deliver Order</h1>
          <p className="text-white/60 mt-1 text-sm">Drop off at the destination below</p>
        </div>
      </div>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 flex flex-col gap-4">

        {/* Delivery Destination */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={15} className="text-[#003087]"/>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Delivery Address</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#003087]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Building2 size={18} className="text-[#003087]"/>
              </div>
              <div>
                <p className="font-black text-gray-900 text-lg">{order.building}</p>
                <p className="text-xs text-gray-400">{order.deliveryCollege}</p>
              </div>
            </div>

            {order.toDoor && order.room ? (
              <div className="bg-[#F5B700]/20 border-2 border-[#F5B700] rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="text-2xl">🚪</span>
                <div>
                  <p className="text-xs text-[#003087]/70 font-bold uppercase tracking-wide">Room Delivery</p>
                  <p className="font-black text-[#003087] text-2xl">Room {order.room}</p>
                  <p className="text-xs text-[#003087]/60 mt-0.5">Deliver directly to the door</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl">🏢</span>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Lobby Drop-off</p>
                  <p className="text-sm font-bold text-gray-800">Leave at building entrance</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Map */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Route</p>
            <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block"/>
              GPS Active
            </span>
          </div>
          <div style={{ height: 200 }}>
            <LiveMap
              hallLat={order.hallLat}
              hallLng={order.hallLng}
              hallName={order.hall}
              hallEmoji={order.hallEmoji}
              destLat={order.destLat}
              destLng={order.destLng}
              building={order.building}
              dasherLat={order.dasherLat}
              dasherLng={order.dasherLng}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package size={15} className="text-[#003087]"/>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Order Contents</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {order.cart.map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <span className="w-1.5 h-1.5 bg-[#003087] rounded-full flex-shrink-0"/>
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Student ID (last 4)</p>
            <p className="font-black text-[#003087]">{order.pid_last4 ?? "N/A"}</p>
          </div>
        </div>

        {/* Chat */}
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

        {/* Mark Delivered */}
        <button
          onClick={markDelivered}
          disabled={delivering}
          className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-green-600 transition active:scale-[0.98] text-base disabled:opacity-60"
        >
          <CheckCircle size={18}/>
          {delivering ? "Marking as delivered…" : "Mark as Delivered"}
        </button>

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

