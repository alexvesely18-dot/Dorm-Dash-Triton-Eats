"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Star, DollarSign, Package } from "lucide-react";
import type { Order } from "@/lib/orderStore";

export default function DasherHomePage() {
  const [active, setActive] = useState(false);
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [countdown, setCountdown] = useState(15);
  const [dasherName, setDasherName] = useState("Dasher");
  const [dasherCollege, setDasherCollege] = useState("");
  const [dasherTransport, setDasherTransport] = useState("bike");
  const [claiming, setClaiming] = useState(false);
  const shownIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    setDasherName(localStorage.getItem("dasher_name") ?? "Dasher");
    setDasherCollege(localStorage.getItem("dasher_college") ?? "");
    setDasherTransport(localStorage.getItem("dasher_transport") ?? "bike");
  }, []);

  // Poll for available orders when active
  useEffect(() => {
    if (!active) { setIncomingOrder(null); return; }
    let alive = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders?dasherCollege=${encodeURIComponent(dasherCollege)}`);
        if (!res.ok) return;
        const data = await res.json();
        const orders: Order[] = data.orders ?? [];
        // Show the first order we haven't dismissed yet
        const next = orders.find(o => !shownIds.current.has(o.id));
        if (alive && next && !incomingOrder) {
          setIncomingOrder(next);
          setCountdown(15);
        }
      } catch { /* network */ }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => { alive = false; clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // Already claimed by someone else
        shownIds.current.add(incomingOrder.id);
        setIncomingOrder(null);
        setClaiming(false);
        return;
      }
      const data = await res.json();
      localStorage.setItem("dasher_claimed_order_id", data.order.id);
      window.location.href = "/dasher/pickup";
    } catch {
      setClaiming(false);
    }
  };

  const firstName = dasherName.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-8">

      <div className="bg-[#003087] px-5 pt-14 pb-6 text-white">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <p className="text-white/60 text-sm">Hey Dasher 👋</p>
            <h1 className="text-2xl font-black mt-0.5">{firstName}</h1>
            {dasherCollege && <p className="text-white/50 text-xs mt-0.5">{dasherCollege}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 bg-white/15 rounded-full flex items-center justify-center text-white">
              <Bell size={18}/>
            </button>
            <div className="w-10 h-10 bg-[#F5B700] rounded-full flex items-center justify-center text-[#003087] font-black text-sm">
              {dasherName.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "D"}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-md mx-auto w-full px-5 -mt-1">

        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { icon: <DollarSign size={16}/>, label: "Today",      value: "$14.50" },
            { icon: <Package size={16}/>,    label: "Deliveries", value: "3"      },
            { icon: <Star size={16}/>,       label: "Rating",     value: "4.9"    },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex flex-col items-center gap-1">
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
                    {dasherCollege ? `Showing all orders + door delivery in ${dasherCollege}` : "Showing all lobby orders"}
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

        {/* Earnings */}
        <div className="mt-4 bg-[#003087] rounded-3xl p-5 text-white">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1">This Week</p>
          <p className="text-3xl font-black">$47.25</p>
          <div className="mt-3 flex gap-4 text-sm">
            <div><p className="text-white/50 text-xs">Orders</p><p className="font-bold">11</p></div>
            <div><p className="text-white/50 text-xs">Avg. Tip</p><p className="font-bold">$2.10</p></div>
            <div><p className="text-white/50 text-xs">Best Day</p><p className="font-bold">$18.50</p></div>
          </div>
        </div>

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
              <Row emoji="🥡" label="Items"   value={`${incomingOrder.cart.length} item${incomingOrder.cart.length !== 1 ? "s" : ""} · Triton2Go`}/>
              <Row emoji="💰" label="You earn" value="$4.75 + tips"/>
              {incomingOrder.toDoor && (
                <div className="bg-[#003087]/5 rounded-xl px-3 py-2 text-xs text-[#003087] font-semibold">
                  🚪 Door delivery — only you ({dasherCollege}) can take this order
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
