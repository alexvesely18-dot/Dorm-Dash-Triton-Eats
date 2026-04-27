"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Star, DollarSign, Package, Clock } from "lucide-react";
import type { Order } from "@/lib/orderStore";
import { getCollegeTheme } from "@/lib/campus";

type DasherDelivery = {
  id: string;
  orderNumber: string;
  hall: string;
  hallEmoji: string;
  building: string;
  earning: number;
  toDoor: boolean;
  completedAt: string;
};

function elapsed(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function DasherHomePage() {
  const [active, setActive] = useState(false);
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [countdown, setCountdown] = useState(15);
  const [dasherName, setDasherName] = useState("Dasher");
  const [dasherCollege, setDasherCollege] = useState("");
  const [dasherTransport, setDasherTransport] = useState("bike");
  const [claiming, setClaiming] = useState(false);
  const [history, setHistory] = useState<DasherDelivery[]>([]);
  const [tab, setTab] = useState<"dashboard" | "history" | "profile">("dashboard");
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [editingCollege, setEditingCollege] = useState(false);
  const [draftCollege, setDraftCollege] = useState("");
  const shownIds = useRef<Set<string>>(new Set());
  // Ref mirrors state so the polling closure always reads the current value
  const incomingOrderRef = useRef<Order | null>(null);

  useEffect(() => {
    incomingOrderRef.current = incomingOrder;
  }, [incomingOrder]);

  useEffect(() => {
    setDasherName(localStorage.getItem("dasher_name") ?? "Dasher");
    setDasherCollege(localStorage.getItem("dasher_college") ?? "");
    setDasherTransport(localStorage.getItem("dasher_transport") ?? "bike");
    try {
      const raw = localStorage.getItem("dasher_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
    // If a delivery is already in-progress, go straight to the right page
    const claimed = localStorage.getItem("dasher_claimed_order_id");
    if (claimed) {
      fetch(`/api/orders/${claimed}`)
        .then(r => r.json())
        .then(d => {
          if (d.order?.status === "claimed") window.location.href = "/dasher/pickup";
          else if (d.order?.status === "picked_up") window.location.href = "/dasher/delivery";
          else localStorage.removeItem("dasher_claimed_order_id");
        })
        .catch(() => {});
    }
  }, []);

  // Poll for available orders when active
  useEffect(() => {
    if (!active) { setIncomingOrder(null); return; }
    // Reset dismissed list so any pending orders are re-evaluated
    shownIds.current = new Set();
    let alive = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders?dasherCollege=${encodeURIComponent(dasherCollege)}`);
        if (!res.ok) return;
        const data = await res.json();
        const orders: Order[] = data.orders ?? [];
        const next = orders.find(o => !shownIds.current.has(o.id));
        // Use ref (not stale closure) to avoid resetting countdown on every poll
        if (alive && next && !incomingOrderRef.current) {
          setIncomingOrder(next);
          setCountdown(15);
        }
      } catch { /* network */ }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => { alive = false; clearInterval(interval); };
  }, [active, dasherCollege]);

  // Countdown timer
  useEffect(() => {
    if (!incomingOrder) return;
    if (countdown <= 0) {
      shownIds.current.add(incomingOrder.id);
      setIncomingOrder(null);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [incomingOrder, countdown]);

  const decline = () => {
    if (incomingOrder) shownIds.current.add(incomingOrder.id);
    setIncomingOrder(null);
  };

  const accept = async () => {
    if (!incomingOrder || claiming) return;
    setClaiming(true);
    try {
      const res = await fetch(`/api/orders/${incomingOrder.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dasherName, dasherTransport }),
      });
      if (res.status === 409) {
        shownIds.current.add(incomingOrder.id);
        setIncomingOrder(null);
        setClaiming(false);
        return;
      }
      const data = await res.json();
      if (!data.order?.id) { setClaiming(false); return; }
      localStorage.setItem("dasher_claimed_order_id", data.order.id);
      window.location.href = "/dasher/pickup";
    } catch {
      setClaiming(false);
    }
  };

  const firstName = dasherName.split(" ")[0];
  const theme = getCollegeTheme(dasherCollege);

  // Computed stats from real history
  const todayStr = new Date().toDateString();
  const todayDeliveries = history.filter(d => new Date(d.completedAt).toDateString() === todayStr);
  const todayEarnings = todayDeliveries.reduce((s, d) => s + d.earning, 0);
  const weekEarnings = history.reduce((s, d) => {
    const age = Date.now() - new Date(d.completedAt).getTime();
    return age < 7 * 24 * 3600 * 1000 ? s + d.earning : s;
  }, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-8">

      <div style={{ backgroundColor: theme.accent }} className="px-5 pt-14 pb-10 text-white relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"/>
        <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{backgroundColor: `${theme.gold}20`}}/>
        <div className="relative flex items-center justify-between max-w-md mx-auto">
          <div className="animate-slide-down">
            <p className="text-white/70 text-sm flex items-center gap-1.5">Hey Dasher <span className="animate-wiggle inline-block">👋</span></p>
            <h1 className="text-3xl font-black mt-0.5 tracking-tight">{firstName}</h1>
            {dasherCollege && <p className="text-white/60 text-xs mt-1">{dasherCollege}</p>}
          </div>
          <div className="flex items-center gap-3 animate-slide-down stagger-1">
            <button className="relative w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white press hover:bg-white/30 transition">
              <Bell size={18}/>
            </button>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-lg ring-2 ring-white/30" style={{ backgroundColor: theme.avatarBg, color: theme.avatarText }}>
              {dasherName.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "D"}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-md mx-auto w-full px-5 -mt-5 relative z-10">

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <DollarSign size={16}/>, label: "Today",      value: `$${todayEarnings.toFixed(2)}` },
            { icon: <Package size={16}/>,    label: "Deliveries", value: String(history.length) },
            { icon: <Star size={16}/>,       label: "Rating",     value: history.length > 0 ? "4.9" : "—" },
          ].map((s, i) => (
            <div key={s.label} className={`bg-white rounded-2xl border border-gray-100 shadow-md p-3.5 flex flex-col items-center gap-1 lift animate-pop-in stagger-${i+1}`}>
              <span className="text-[#003087]">{s.icon}</span>
              <p className="text-lg font-black text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Status Toggle */}
        <div className="mt-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-gray-900">Dash Status</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {active ? "You are accepting orders" : "Go active to start earning"}
              </p>
            </div>
            <button
              onClick={() => setActive(!active)}
              className={`w-16 h-8 rounded-full transition-all duration-300 relative flex-shrink-0 ${active ? "bg-green-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${active ? "left-9" : "left-1"}`}/>
            </button>
          </div>

          <div className={`rounded-2xl px-4 py-4 transition-all ${active ? "bg-green-50 border-2 border-green-200" : "bg-gray-50 border-2 border-gray-100"}`}>
            {active ? (
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-3 h-3 bg-green-400 rounded-full"/>
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"/>
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">Looking for orders nearby…</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    {dasherCollege ? `Showing orders + door delivery in ${dasherCollege}` : "Showing all lobby orders"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full flex-shrink-0"/>
                <p className="text-sm font-semibold text-gray-400">Toggle active to start receiving orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex bg-gray-100 rounded-2xl p-1 gap-1">
          {([
            { id: "dashboard", label: "Earnings" },
            { id: "history",   label: history.length > 0 ? `History (${history.length})` : "History" },
            { id: "profile",   label: "Profile" },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Earnings tab */}
        {tab === "dashboard" && (
          <div className="mt-3 bg-[#003087] rounded-3xl p-5 text-white">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1">This Week</p>
            <p className="text-3xl font-black">${weekEarnings.toFixed(2)}</p>
            <div className="mt-3 flex gap-5 text-sm">
              <div>
                <p className="text-white/50 text-xs">Total Orders</p>
                <p className="font-bold">{history.length}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs">Today</p>
                <p className="font-bold">{todayDeliveries.length} orders</p>
              </div>
              <div>
                <p className="text-white/50 text-xs">Today&apos;s Earnings</p>
                <p className="font-bold">${todayEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Past Orders tab */}
        {tab === "history" && (
          <div className="mt-3 flex flex-col gap-2">
            {history.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
                <p className="text-4xl mb-3">🛵</p>
                <p className="font-bold text-gray-700">No deliveries yet</p>
                <p className="text-xs text-gray-400 mt-1.5">Complete your first delivery to see your history here</p>
              </div>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">{entry.hallEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{entry.hall} → {entry.building}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <Clock size={10}/>
                      {elapsed(entry.completedAt)}
                      {entry.toDoor && (
                        <span className="bg-[#003087]/10 text-[#003087] px-1.5 py-0.5 rounded-full text-[10px] font-semibold">Door</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-green-600 text-sm">+${entry.earning.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400">{entry.orderNumber}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === "profile" && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dasher Info</p>

              {/* Name */}
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Name</p>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={draftName}
                      onChange={e => setDraftName(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20"
                    />
                    <button onClick={() => { const n = draftName.trim() || dasherName; setDasherName(n); localStorage.setItem("dasher_name", n); setEditingName(false); }} className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</button>
                    <button onClick={() => setEditingName(false)} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">{dasherName}</p>
                    <button onClick={() => { setDraftName(dasherName); setEditingName(true); }} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#003087" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                  </div>
                )}
              </div>

              {/* College */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-400 mb-1">College</p>
                {editingCollege ? (
                  <div className="flex items-center gap-2">
                    <select value={draftCollege} onChange={e => setDraftCollege(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                      <option value="">All colleges (lobby only)</option>
                      {["Revelle College","Muir College","Marshall College","Warren College","Roosevelt College","Sixth College","Seventh College","Eighth College"].map(c => <option key={c}>{c}</option>)}
                    </select>
                    <button onClick={() => { setDasherCollege(draftCollege); localStorage.setItem("dasher_college", draftCollege); setEditingCollege(false); }} className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</button>
                    <button onClick={() => setEditingCollege(false)} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs flex-shrink-0">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">{dasherCollege || "All colleges (lobby only)"}</p>
                    <button onClick={() => { setDraftCollege(dasherCollege); setEditingCollege(true); }} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#003087" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Transport */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-400 mb-2">Transport</p>
                <div className="flex gap-2">
                  {(["bike", "scooter"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => { setDasherTransport(t); localStorage.setItem("dasher_transport", t); }}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition border-2 ${dasherTransport === t ? "border-[#003087] bg-[#003087]/5 text-[#003087]" : "border-gray-200 text-gray-400"}`}
                    >
                      {t === "bike" ? "🚲 Bike" : "🛵 Scooter"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => { ["dasher_name","dasher_college","dasher_transport","dasher_claimed_order_id"].forEach(k => localStorage.removeItem(k)); window.location.href = "/dasher"; }}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-200 text-red-500 font-bold py-4 rounded-2xl shadow-sm hover:bg-red-50 transition"
            >
              Sign Out
            </button>
          </div>
        )}

        <Link href="/dasher" className="mt-5 w-full flex items-center justify-center text-xs text-gray-400 hover:text-gray-600 py-2">
          ← Back to Dasher Login
        </Link>

      </main>

      {/* Incoming Order Modal */}
      {incomingOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-t-3xl px-6 pt-2 pb-10 animate-slide-up">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5"/>

            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-[#F5B700] rounded-full animate-pulse"/>
                  <span className="text-xs font-bold text-[#003087] uppercase tracking-wide">New Order!</span>
                </div>
                <h2 className="text-xl font-black text-gray-900">Order Request</h2>
              </div>
              <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-black text-xl ${countdown <= 5 ? "border-red-400 text-red-500" : "border-[#F5B700] text-[#003087]"}`}>
                {countdown}
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-4 mb-5 flex flex-col gap-3">
              <Row emoji={incomingOrder.hallEmoji} label="Pickup"     value={`${incomingOrder.hall} · ${incomingOrder.hallCollege}`}/>
              <Row emoji="📍"                      label="Deliver to" value={`${incomingOrder.building} · ${incomingOrder.deliveryCollege}`}/>
              {incomingOrder.toDoor && incomingOrder.room && (
                <Row emoji="🚪" label="Room delivery" value={`Room ${incomingOrder.room}`}/>
              )}
              <Row emoji="🥡" label="Items"    value={`${incomingOrder.cart.length} item${incomingOrder.cart.length !== 1 ? "s" : ""} · Triton2Go`}/>
              <Row emoji="💰" label="You earn" value={`$${(4.75 + (incomingOrder.toDoor ? 2.0 : 0)).toFixed(2)} + tips`}/>
              {incomingOrder.toDoor && (
                <div className="bg-[#003087]/5 rounded-xl px-3 py-2 text-xs text-[#003087] font-semibold">
                  🚪 Door delivery — only you ({dasherCollege}) can take this order
                </div>
              )}
              {incomingOrder.batched && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-base">📦</span>
                  <div>
                    <p className="text-xs font-black text-amber-800">Smart Batch — Same Building!</p>
                    <p className="text-[11px] text-amber-600">Another order is already heading to {incomingOrder.building}. Add this one to your run!</p>
                  </div>
                </div>
              )}
              {incomingOrder.scheduledFor && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-base">🕐</span>
                  <p className="text-xs font-semibold text-blue-700">
                    Scheduled for {new Date(incomingOrder.scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={decline} className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition">
                Decline
              </button>
              <button
                onClick={accept}
                disabled={claiming}
                className="flex-1 flex items-center justify-center bg-[#F5B700] text-[#003087] font-black py-4 rounded-2xl shadow-lg hover:bg-[#e0a800] transition active:scale-[0.98] disabled:opacity-60"
              >
                {claiming ? "Claiming…" : "Accept →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-7 flex-shrink-0">{emoji}</span>
      <div className="flex-1 flex items-center justify-between">
        <p className="text-xs text-gray-400 font-semibold">{label}</p>
        <p className="text-sm font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
