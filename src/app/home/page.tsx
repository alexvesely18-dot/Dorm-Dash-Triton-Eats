"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Bell, Plus, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import type { Order } from "@/lib/orderStore";
import { etaMinutes, isHallOpen, hallOpenLabel, getCollegeTheme } from "@/lib/campus";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false, loading: () => <div className="w-full h-full bg-[#E8F0E4] animate-pulse rounded-2xl"/> });

const ALL_HALLS = [
  { id: "64deg",    name: "64 Degrees",    emoji: "🍳" },
  { id: "pines",    name: "Pines",          emoji: "🌮" },
  { id: "sixth",    name: "Sixth Market",   emoji: "🥗" },
  { id: "ventanas", name: "Café Ventanas",  emoji: "☕" },
  { id: "canyon",   name: "Canyon Vista",   emoji: "🌯" },
  { id: "ovt",      name: "OceanView",      emoji: "🍜" },
  { id: "bistro",   name: "The Bistro",     emoji: "🥪" },
];

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-yellow-400",
  claimed:   "bg-blue-400",
  picked_up: "bg-[#F5B700]",
  delivered: "bg-green-400",
};

function timeOfDayGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Triton");
  const [userInitials, setUserInitials] = useState("AT");
  const [theme, setTheme] = useState(getCollegeTheme(null));
  const [recentOrders, setRecentOrders] = useState<{ id: string; hall: string; hallEmoji: string; cart: string[]; total: string; deliveredAt?: string }[]>([]);

  useEffect(() => {
    const id = localStorage.getItem("dorm_dash_order_id");
    setOrderId(id);
    const name = localStorage.getItem("user_first") ?? localStorage.getItem("user_name") ?? "Triton";
    setUserName(name.split(" ")[0]);
    const full = localStorage.getItem("user_name") ?? "Alex Triton";
    const parts = full.trim().split(" ");
    setUserInitials(((parts[0]?.[0] ?? "A") + (parts[1]?.[0] ?? "T")).toUpperCase());
    const college = localStorage.getItem("user_college");
    setTheme(getCollegeTheme(college));

    try {
      const history = JSON.parse(localStorage.getItem("student_history") ?? "[]");
      const delivered = history.filter((o: { status: string }) => o.status === "delivered").slice(0, 3);
      setRecentOrders(delivered);
    } catch {}
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
          // Mark matching history entry as delivered
          try {
            const history = JSON.parse(localStorage.getItem("student_history") ?? "[]");
            const updated = history.map((e: Record<string, unknown>) =>
              e.id === data.order.id
                ? { ...e, status: "delivered", dasherName: data.order.dasherName, deliveredAt: new Date().toISOString() }
                : e
            );
            localStorage.setItem("student_history", JSON.stringify(updated));
          } catch {}
        } else if (data.order && ["claimed","picked_up"].includes(data.order.status)) {
          // Keep status in sync for the orders page
          try {
            const history = JSON.parse(localStorage.getItem("student_history") ?? "[]");
            const updated = history.map((e: Record<string, unknown>) =>
              e.id === data.order.id ? { ...e, status: data.order.status, dasherName: data.order.dasherName } : e
            );
            localStorage.setItem("student_history", JSON.stringify(updated));
          } catch {}
        }
      } catch { /* retry */ }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => { alive = false; clearInterval(interval); };
  }, [orderId]);

  const isActive = order && order.status !== "delivered";

  const openHalls = ALL_HALLS.filter(h => isHallOpen(h.id));

  const showEta =
    order &&
    (order.status === "claimed" || order.status === "picked_up") &&
    order.dasherLat && order.dasherLng &&
    order.destLat && order.destLng;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-24">

      <div style={{ backgroundColor: theme.accent }} className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <p className="text-white/60 text-sm">{timeOfDayGreeting()} 👋</p>
            <h1 className="text-white text-2xl font-black mt-0.5">Hey, {userName}!</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 bg-white/15 rounded-full flex items-center justify-center text-white">
              <Bell size={18}/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: theme.gold }}/>
            </button>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm" style={{ backgroundColor: theme.avatarBg, color: theme.avatarText }}>
              {userInitials}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-md mx-auto w-full px-5 -mt-1">

        {/* Active Order — loading skeleton while first poll is in-flight */}
        {orderId && !order && (
          <div className="mt-5 bg-white rounded-3xl shadow-lg border border-gray-100 p-5 animate-pulse">
            <div className="h-3 bg-gray-100 rounded-full w-24 mb-3"/>
            <div className="h-5 bg-gray-100 rounded-full w-48 mb-2"/>
            <div className="h-3 bg-gray-100 rounded-full w-36"/>
          </div>
        )}

        {/* Active Order */}
        {isActive ? (
          <div className="mt-5 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${STATUS_COLOR[order.status]}`}/>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.accent }}>Active Order</span>
                </div>
                <p className="font-bold text-gray-900 mt-0.5 truncate">
                  {order.status === "pending"   && "Looking for a Dasher…"}
                  {order.status === "claimed"   && `${order.dasherName} is picking up ${order.dasherTransport === "scooter" ? "🛵" : "🚲"}`}
                  {order.status === "picked_up" && `${order.dasherName} is on the way! ${order.dasherTransport === "scooter" ? "🛵" : "🚲"}`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{order.hall} → {order.building}{order.room ? ` · Rm ${order.room}` : ""}</p>
              </div>
              {order.status !== "pending" && (
                <Link href="/chat" className="text-white text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0" style={{ backgroundColor: theme.accent }}>Chat</Link>
              )}
            </div>

            {order.status === "pending" && (
              <div className="mx-4 mb-4 mt-2 rounded-2xl px-4 py-3 flex flex-col gap-2.5" style={{ backgroundColor: `${theme.accent}10` }}>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {[0,1,2].map((i) => (
                      <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${theme.accent}60`, animationDelay: `${i*0.15}s` }}/>
                    ))}
                  </div>
                  <p className="text-sm font-medium" style={{ color: `${theme.accent}B0` }}>Finding the nearest Dasher…</p>
                </div>
                <Link
                  href="/dasher"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold transition hover:opacity-80"
                  style={{ backgroundColor: theme.accent, color: "#fff" }}
                >
                  <span>Are you a Dasher? Accept this order</span>
                  <span className="text-lg">🛵</span>
                </Link>
              </div>
            )}

            {(order.status === "claimed" || order.status === "picked_up") && (
              <div className="mx-4 mt-2 rounded-2xl overflow-hidden border border-gray-100 relative" style={{ height: 200 }}>
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
                {showEta && (
                  <div className="absolute bottom-3 left-3 z-[1000] bg-white rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2 border border-gray-100">
                    <span className="text-base">{order.dasherTransport === "scooter" ? "🛵" : "🚲"}</span>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">ETA</p>
                      <p className="text-sm font-black leading-none mt-0.5" style={{ color: theme.accent }}>
                        ~{etaMinutes(order.dasherLat!, order.dasherLng!, order.destLat, order.destLng, order.dasherTransport ?? "bike")} min
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="px-4 pb-4 pt-2">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                <span>{order.hall}</span>
                <span>{order.building}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    background: `linear-gradient(to right, ${theme.accent}, ${theme.gold})`,
                    width: order.status === "pending" ? "10%" : order.status === "claimed" ? "40%" : "75%",
                  }}
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
          className="mt-4 w-full flex items-center justify-between font-bold px-5 py-4 rounded-2xl shadow-md hover:opacity-90 transition active:scale-[0.98]"
          style={{ backgroundColor: theme.gold, color: theme.accent }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.accent}25` }}>
              <Plus size={18}/>
            </div>
            <div>
              <p className="font-black text-base">New Order</p>
              <p className="text-xs font-medium opacity-60">Order from any dining hall</p>
            </div>
          </div>
          <ChevronRight size={20}/>
        </Link>

        {/* Dining hall chips with real open/closed status */}
        <div className="mt-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Dining Halls — {openHalls.length} Open Now
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {ALL_HALLS.map((d) => {
              const open = isHallOpen(d.id);
              const label = hallOpenLabel(d.id);
              return (
                <Link
                  key={d.id}
                  href="/order"
                  className={`flex-shrink-0 rounded-2xl border shadow-sm px-3 py-2.5 flex flex-col items-center gap-1 min-w-[80px] hover:shadow-md transition ${
                    open ? "bg-white border-gray-100" : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <span className="text-2xl">{d.emoji}</span>
                  <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{d.name}</p>
                  <p className={`text-[10px] font-semibold ${open ? "text-green-500" : "text-gray-400"}`}>{label}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Past Orders — real from localStorage */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Past Orders</p>
            <Link href="/orders" className="text-xs font-semibold" style={{ color: theme.accent }}>See all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-2xl mb-2">🍽</p>
              <p className="text-sm font-bold text-gray-600">No orders yet</p>
              <p className="text-xs text-gray-400 mt-1">Your delivered orders will appear here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{o.hallEmoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-gray-900">{o.hall}</p>
                      <p className="text-xs text-gray-400">
                        {o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{o.cart.join(", ")}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-bold" style={{ color: theme.accent }}>{o.total}</span>
                      <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">✓ Delivered</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
