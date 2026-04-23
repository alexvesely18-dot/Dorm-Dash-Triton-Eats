"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { getCollegeTheme } from "@/lib/campus";
import type { Order } from "@/lib/orderStore";

type StudentOrder = {
  id: string;
  hall: string;
  hallEmoji: string;
  hallCollege: string;
  cart: string[];
  total: string;
  building: string;
  room: string | null;
  toDoor: boolean;
  status: string;
  dasherName?: string;
  dasherTransport?: string;
  placedAt: string;
  deliveredAt?: string;
  scheduledFor?: string;
};

const HALL_BG: Record<string, string> = {
  "64 Degrees":  "bg-orange-100",
  "Pines":       "bg-green-100",
  "Sixth Market":"bg-sky-100",
  "OceanView":   "bg-purple-100",
  "Café Ventanas":"bg-amber-100",
  "Canyon Vista":"bg-rose-100",
  "The Bistro":  "bg-indigo-100",
};

function statusLabel(status: string) {
  if (status === "delivered") return { text: "✓ Delivered", cls: "bg-green-100 text-green-700" };
  if (status === "picked_up") return { text: "🚲 On the way", cls: "bg-blue-100 text-blue-700" };
  if (status === "claimed")   return { text: "📦 Picked up", cls: "bg-[#003087]/10 text-[#003087]" };
  return { text: "⏳ Finding dasher", cls: "bg-yellow-100 text-yellow-700" };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    ", " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function OrdersPage() {
  const [history, setHistory] = useState<StudentOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [theme, setTheme] = useState(getCollegeTheme(null));

  useEffect(() => {
    const college = localStorage.getItem("user_college");
    setTheme(getCollegeTheme(college));

    try {
      const raw = localStorage.getItem("student_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch {}

    // Poll active order for live status
    const activeId = localStorage.getItem("dorm_dash_order_id");
    if (!activeId) return;

    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${activeId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (alive && data.order) setActiveOrder(data.order);
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => { alive = false; clearInterval(interval); };
  }, []);

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  const pastOrders = history.filter(o => o.status === "delivered");
  const hasAny = history.length > 0 || activeOrder;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">

      <div style={{ backgroundColor: theme.accent }} className="px-5 pt-14 pb-6 text-white">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-black">My Orders</h1>
          <p className="text-white/60 text-sm mt-1">Track and review your deliveries</p>
        </div>
      </div>

      <main className="max-w-md mx-auto px-5 py-5 flex flex-col gap-6">

        {!hasAny ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-5">🛵</div>
            <h2 className="text-xl font-black text-gray-700">No orders yet</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">
              Looks like you haven&apos;t ordered yet. Grab something from a UCSD dining hall!
            </p>
            <Link
              href="/order"
              className="mt-6 font-bold px-6 py-3.5 rounded-2xl shadow-md transition"
              style={{ backgroundColor: theme.gold, color: theme.accent }}
            >
              Place Your First Order
            </Link>
          </div>
        ) : (
          <>
            {/* Active Order */}
            {activeOrder && activeOrder.status !== "delivered" && (
              <section>
                <SectionLabel text="Active Order" dot />
                <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between" style={{ background: `linear-gradient(to right, ${theme.accent}, ${theme.accent}DD)` }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                      <span className="text-white text-xs font-bold uppercase tracking-wide">In Progress</span>
                    </div>
                    {activeOrder.status !== "pending" && (
                      <Link href="/chat" className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: theme.gold, color: theme.accent }}>
                        Chat
                      </Link>
                    )}
                  </div>

                  <div className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${HALL_BG[activeOrder.hall] ?? "bg-gray-100"} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                        {activeOrder.hallEmoji}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{activeOrder.hall}</p>
                        <p className="text-xs text-gray-400">{activeOrder.hallCollege} · {activeOrder.id}</p>
                      </div>
                      <p className="font-black" style={{ color: theme.accent }}>${Number(activeOrder.total).toFixed(2)}</p>
                    </div>

                    {activeOrder.dasherName && (
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 rounded-xl px-3 py-2" style={{ backgroundColor: `${theme.gold}25` }}>
                        <span>{activeOrder.dasherTransport === "scooter" ? "🛵" : "🚲"} {activeOrder.dasherName} · {statusLabel(activeOrder.status).text}</span>
                      </div>
                    )}
                    {activeOrder.status === "pending" && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 rounded-xl px-3 py-2 bg-gray-50">
                        <div className="flex gap-1">
                          {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }}/>)}
                        </div>
                        Finding the nearest Dasher…
                      </div>
                    )}

                    <button onClick={() => toggle(activeOrder.id)} className="mt-3 w-full flex items-center justify-between text-xs font-semibold text-gray-400 hover:text-gray-600 transition">
                      <span>{expanded === activeOrder.id ? "Hide items" : "Show items"}</span>
                      {expanded === activeOrder.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    </button>
                    {expanded === activeOrder.id && (
                      <ul className="mt-2 flex flex-col gap-1 pl-1 animate-slide-up">
                        {activeOrder.cart.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: theme.gold }}/>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Past Orders */}
            {pastOrders.length > 0 && (
              <section>
                <SectionLabel text={`Past Orders (${pastOrders.length})`} />
                <div className="flex flex-col gap-3">
                  {pastOrders.map((o) => {
                    const badge = statusLabel(o.status);
                    return (
                      <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-4 py-3.5 flex items-center gap-3">
                          <div className={`w-11 h-11 ${HALL_BG[o.hall] ?? "bg-gray-100"} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                            {o.hallEmoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-sm text-gray-900">{o.hall}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.text}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {o.deliveredAt ? formatDate(o.deliveredAt) : formatDate(o.placedAt)}
                              {o.dasherName && ` · ${o.dasherName}`}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-bold" style={{ color: theme.accent }}>{o.total}</span>
                              <button
                                onClick={() => toggle(o.id)}
                                className="text-xs text-gray-400 flex items-center gap-0.5 hover:text-gray-600 transition"
                              >
                                {expanded === o.id ? "Less" : "Details"}
                                {expanded === o.id ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                              </button>
                            </div>
                          </div>
                        </div>

                        {expanded === o.id && (
                          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 animate-slide-up">
                            <p className="text-xs font-semibold text-gray-400 mb-2">Items ordered</p>
                            <ul className="flex flex-col gap-1 mb-3">
                              {o.cart.map((item, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: theme.gold }}/>
                                  {item}
                                </li>
                              ))}
                            </ul>
                            {o.toDoor && o.room && (
                              <p className="text-xs text-gray-400 mb-2">🚪 Room delivery · Room {o.room}</p>
                            )}
                            <p className="text-xs text-gray-400 mb-3">Order ID: {o.id}</p>
                            <Link
                              href="/order"
                              className="flex items-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-xl w-fit hover:opacity-90 transition"
                              style={{ backgroundColor: theme.accent }}
                            >
                              <RotateCcw size={12}/> Reorder
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* If active order exists but no past orders yet */}
            {activeOrder && pastOrders.length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm">
                Past orders will appear here once delivered
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function SectionLabel({ text, dot }: { text: string; dot?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {dot && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>}
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{text}</p>
    </div>
  );
}
