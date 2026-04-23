"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Package, MessageCircle, CheckCircle, ChevronRight, Building2 } from "lucide-react";
import type { Order } from "@/lib/orderStore";

export default function DasherDeliveryPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { from: "student", text: "Hey! I'm in my room, door on the left 👋" },
  ]);
  const [input, setInput] = useState("");
  const [delivering, setDelivering] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("dasher_claimed_order_id");
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(d => { if (d.order) setOrder(d.order); })
      .catch(() => {});
  }, []);

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { from: "dasher", text: input.trim() }]);
    setInput("");
    setTimeout(() => {
      setMessages(m => [...m, { from: "student", text: "Thanks, see you soon! 🙏" }]);
    }, 1500);
  };

  const markDelivered = async () => {
    if (!order || delivering) return;
    setDelivering(true);
    await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "delivered" }),
    });
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

        {/* Campus mini-map */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Route</p>
          </div>
          <DeliveryMap />
          <div className="px-4 pb-4 pt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>{order.hall}</span>
              <span>{order.building}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#003087] to-[#F5B700] rounded-full" style={{ width: "35%" }}/>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">~6 min away</p>
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
              <p className="text-xs text-gray-400">1 new message</p>
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowChat(false)}>
          <div className="w-full max-w-md bg-white rounded-t-3xl flex flex-col" style={{ height: "70vh" }} onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F5B700] rounded-full flex items-center justify-center text-[#003087] font-black text-sm flex-shrink-0">AT</div>
              <div>
                <p className="font-bold text-gray-900">Student</p>
                <p className="text-xs text-green-500 font-semibold">Online</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "dasher" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 text-sm ${m.from === "dasher" ? "bubble-user" : "bubble-dasher text-gray-800"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-6 pt-3 border-t border-gray-100 flex gap-2">
              <input
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20"
                placeholder="Message student…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") send(); }}
              />
              <button onClick={send} className="w-10 h-10 bg-[#003087] rounded-full flex items-center justify-center text-white flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeliveryMap() {
  return (
    <div className="mx-4 rounded-2xl overflow-hidden border border-gray-100 bg-[#E8F0E4]" style={{ height: 160 }}>
      <svg viewBox="0 0 360 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="160" fill="#E8F0E4"/>
        <ellipse cx="180" cy="80" rx="70" ry="40" fill="#D4E8CC" opacity="0.7"/>
        <rect x="0" y="85" width="360" height="6" fill="#D0D4CC"/>
        <rect x="105" y="0" width="6" height="160" fill="#D0D4CC"/>
        <rect x="200" y="45" width="5" height="115" fill="#D0D4CC"/>
        <rect x="152" y="60" width="50" height="40" fill="#B4C8B4" rx="4"/>
        <text x="177" y="85" textAnchor="middle" fontSize="6" fill="#2D4A2D" fontWeight="700">GEISEL</text>
        <path id="del-route" d="M68,83 C80,65 108,50 140,35" fill="none" stroke="#F5B700" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.9"/>
        <circle cx="68" cy="83" r="10" fill="#003087" stroke="white" strokeWidth="2.5"/>
        <text x="68" y="87" textAnchor="middle" fontSize="7" fill="white" fontWeight="800">64°</text>
        <circle cx="140" cy="35" r="16" fill="#F5B700" opacity="0.15">
          <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="140" cy="35" r="9" fill="#F5B700" stroke="white" strokeWidth="2.5"/>
        <text x="140" y="39" textAnchor="middle" fontSize="8" fill="white">🏠</text>
        <circle r="8" fill="#F5B700" stroke="white" strokeWidth="2">
          <animateMotion dur="5s" repeatCount="indefinite"><mpath href="#del-route"/></animateMotion>
        </circle>
        <text fontSize="9" textAnchor="middle" dy="4">
          🛵<animateMotion dur="5s" repeatCount="indefinite"><mpath href="#del-route"/></animateMotion>
        </text>
      </svg>
    </div>
  );
}
