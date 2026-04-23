"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Bell, Plus, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import type { Order } from "@/lib/orderStore";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false, loading: () => <div className="w-full h-full bg-[#E8F0E4] animate-pulse rounded-2xl"/> });

const PAST_ORDERS = [
  { id: 1, hall: "64 Degrees", items: "Grilled Chicken Bowl, Garden Salad, Water", date: "Apr 21", total: "$21.79", emoji: "🍳", bg: "bg-orange-100" },
  { id: 2, hall: "Pines",       items: "Tacos ×2, Sparkling Water",                date: "Apr 18", total: "$16.50", emoji: "🌮", bg: "bg-green-100"  },
  { id: 3, hall: "Sixth Market",items: "Buddha Bowl, Kombucha",                    date: "Apr 15", total: "$14.25", emoji: "🥗", bg: "bg-blue-100"   },
];

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-yellow-400",
  claimed:   "bg-blue-400",
  picked_up: "bg-[#F5B700]",
  delivered: "bg-green-400",
};

export default function HomePage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("dorm_dash_order_id");
    setOrderId(id);
  }, []);

  useEffect(() => {
    if (!orderId) return;
    let alive = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (alive) setOrder(data.order);
        if (data.order?.status === "delivered") {
          localStorage.removeItem("dorm_dash_order_id");
        }
      } catch { /* retry */ }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => { alive = false; clearInterval(interval); };
  }, [orderId]);

  const isActive = order && order.status !== "delivered";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-24">

      <div className="bg-[#003087] px-5 pt-14 pb-6">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <p className="text-white/60 text-sm">Good afternoon 👋</p>
            <h1 className="text-white text-2xl font-black mt-0.5">Hey, Triton!</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 bg-white/15 rounded-full flex items-center justify-center text-white">
              <Bell size={18}/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F5B700] rounded-full"/>
            </button>
            <div className="w-10 h-10 bg-[#F5B700] rounded-full flex items-center justify-center text-[#003087] font-black text-sm">AT</div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-md mx-auto w-full px-5 -mt-1">

        {/* Active Order */}
        {isActive ? (
          <div className="mt-5 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${STATUS_COLOR[order.status]}`}/>
                  <span className="text-xs font-bold text-[#003087] uppercase tracking-wide">Active Order</span>
                </div>
                <p className="font-bold text-gray-900 mt-0.5 truncate">
                  {order.status === "pending"   && "Looking for a Dasher…"}
                  {order.status === "claimed"   && `${order.dasherName} is picking up your order ${order.dasherTransport === "scooter" ? "🛵" : "🚲"}`}
                  {order.status === "picked_up" && `${order.dasherName} is on the way! ${order.dasherTransport === "scooter" ? "🛵" : "🚲"}`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{order.hall} → {order.building}{order.room ? ` · Rm ${order.room}` : ""}</p>
              </div>
              {order.status !== "pending" && (
                <Link href="/chat" className="bg-[#003087] text-white text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0">Chat</Link>
              )}
            </div>

            {order.status === "pending" && (
              <div className="mx-4 mb-4 mt-2 bg-[#003087]/5 rounded-2xl px-4 py-4 flex items-center gap-3">
                <div className="flex gap-1.5">
                  {[0,1,2].map((i) => (
                    <span key={i} className="w-2 h-2 bg-[#003087]/40 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }}/>
                  ))}
                </div>
                <p className="text-sm text-[#003087]/70 font-medium">Finding the nearest Dasher…</p>
              </div>
            )}

            {(order.status === "claimed" || order.status === "picked_up") && (
              <div className="mx-4 mt-2 rounded-2xl overflow-hidden border border-gray-100" style={{ height: 200 }}>
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
            )}

            <div className="px-4 pb-4 pt-2">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                <span>{order.hall}</span>
                <span>{order.building}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#003087] to-[#F5B700] rounded-full transition-all duration-1000"
                  style={{ width: order.status === "pending" ? "10%" : order.status === "claimed" ? "40%" : "75%" }}
                />
              </div>
            </div>
          </div>
        ) : order?.status === "delivered" ? (
          <div className="mt-5 bg-green-50 border-2 border-green-200 rounded-3xl p-5 text-center animate-fade-in">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-black text-green-800">Order Delivered!</p>
            <p className="text-xs text-green-600 mt-1">Enjoy your meal, Triton</p>
          </div>
        ) : null}

        {/* New Order */}
        <Link
          href="/order"
          className="mt-4 w-full flex items-center justify-between bg-[#F5B700] text-[#003087] font-bold px-5 py-4 rounded-2xl shadow-md hover:bg-[#e0a800] transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#003087]/15 rounded-full flex items-center justify-center"><Plus size={18}/></div>
            <div>
              <p className="font-black text-base">New Order</p>
              <p className="text-[#003087]/60 text-xs font-medium">Order from any dining hall</p>
            </div>
          </div>
          <ChevronRight size={20}/>
        </Link>

        {/* Dining hall chips */}
        <div className="mt-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dining Halls Open Now</p>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { name: "64 Degrees",  emoji: "🍳", wait: "15 min" },
              { name: "Pines",       emoji: "🌮", wait: "10 min" },
              { name: "Sixth Market",emoji: "🥗", wait: "20 min" },
              { name: "Café Ventanas",emoji:"☕", wait: "8 min"  },
              { name: "Canyon Vista",emoji: "🍜", wait: "25 min" },
            ].map((d) => (
              <Link key={d.name} href="/order" className="flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-2.5 flex flex-col items-center gap-1 min-w-[80px] hover:shadow-md transition">
                <span className="text-2xl">{d.emoji}</span>
                <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{d.name}</p>
                <p className="text-[10px] text-gray-400">{d.wait}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Past Orders */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Past Orders</p>
            <button className="text-xs font-semibold text-[#003087]">See all</button>
          </div>
          <div className="flex flex-col gap-3">
            {PAST_ORDERS.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-12 h-12 ${o.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>{o.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-gray-900">{o.hall}</p>
                    <p className="text-xs text-gray-400">{o.date}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{o.items}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs font-bold text-[#003087]">{o.total}</span>
                    <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">✓ Delivered</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}

