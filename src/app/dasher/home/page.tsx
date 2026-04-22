"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Star, DollarSign, Package } from "lucide-react";

export default function DasherHomePage() {
  const [active, setActive] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (!active) { setShowOrder(false); return; }
    const wait = setTimeout(() => setShowOrder(true), 4000);
    return () => clearTimeout(wait);
  }, [active]);

  useEffect(() => {
    if (!showOrder) { setCountdown(15); return; }
    if (countdown <= 0) { setShowOrder(false); setActive(false); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [showOrder, countdown]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-8">

      {/* Header */}
      <div className="bg-[#003087] px-5 pt-14 pb-6 text-white">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <p className="text-white/60 text-sm">Hey Dasher 👋</p>
            <h1 className="text-2xl font-black mt-0.5">Marcus T.</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 bg-white/15 rounded-full flex items-center justify-center text-white">
              <Bell size={18}/>
            </button>
            <div className="w-10 h-10 bg-[#F5B700] rounded-full flex items-center justify-center text-[#003087] font-black text-sm">MT</div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-md mx-auto w-full px-5 -mt-1">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { icon: <DollarSign size={16}/>, label: "Today", value: "$14.50" },
            { icon: <Package size={16}/>,    label: "Deliveries", value: "3" },
            { icon: <Star size={16}/>,       label: "Rating", value: "4.9" },
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

          {/* Active state indicator */}
          <div className={`rounded-2xl px-4 py-4 transition-all ${active ? "bg-green-50 border-2 border-green-200" : "bg-gray-50 border-2 border-gray-100"}`}>
            {active ? (
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-3 h-3 bg-green-400 rounded-full"/>
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"/>
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">Looking for orders nearby…</p>
                  <p className="text-xs text-green-600 mt-0.5">You&apos;ll be notified when a new order arrives</p>
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

        {/* Earnings summary */}
        <div className="mt-4 bg-[#003087] rounded-3xl p-5 text-white">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1">This Week</p>
          <p className="text-3xl font-black">$47.25</p>
          <div className="mt-3 flex gap-4 text-sm">
            <div>
              <p className="text-white/50 text-xs">Orders</p>
              <p className="font-bold">11</p>
            </div>
            <div>
              <p className="text-white/50 text-xs">Avg. Tip</p>
              <p className="font-bold">$2.10</p>
            </div>
            <div>
              <p className="text-white/50 text-xs">Best Day</p>
              <p className="font-bold">$18.50</p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <Link
          href="/dasher"
          className="mt-5 w-full flex items-center justify-center text-xs text-gray-400 hover:text-gray-600 py-2"
        >
          ← Back to Dasher Login
        </Link>

      </main>

      {/* Incoming Order Modal */}
      {showOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-t-3xl px-6 pt-2 pb-10 animate-slide-up">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5"/>

            {/* Timer ring */}
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
              <Row emoji="🍳" label="Pickup" value="64 Degrees · Revelle"/>
              <Row emoji="📍" label="Deliver to" value="Tioga Hall · Sixth College"/>
              <Row emoji="🛵" label="Distance" value="~0.4 miles · 6 min"/>
              <Row emoji="💰" label="You earn" value="$4.75 + tips"/>
              <Row emoji="🥡" label="Items" value="2 items in Triton2Go"/>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowOrder(false); setActive(false); }}
                className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition"
              >
                Decline
              </button>
              <Link
                href="/dasher/pickup"
                className="flex-1 flex items-center justify-center bg-[#F5B700] text-[#003087] font-black py-4 rounded-2xl shadow-lg hover:bg-[#e0a800] transition active:scale-[0.98]"
              >
                Accept →
              </Link>
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
