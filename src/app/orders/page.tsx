"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, RotateCcw, ShoppingBag } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const ACTIVE_ORDER = {
  id: "TDE-20851",
  hall: "64 Degrees",
  college: "Revelle",
  emoji: "🍳",
  bg: "bg-orange-100",
  items: ["1× Grilled Chicken Bowl", "1× Garden Salad", "1× Sparkling Water"],
  total: "$21.79",
  dasher: "Marcus T.",
  eta: "~6 min",
  status: "On the way",
};

const PAST_ORDERS = [
  {
    id: "TDE-20844",
    hall: "Pines",
    college: "Muir",
    emoji: "🌮",
    bg: "bg-green-100",
    items: ["2× Tacos", "1× Sparkling Water"],
    date: "Apr 18, 2:30 PM",
    total: "$16.50",
    status: "Delivered",
  },
  {
    id: "TDE-20831",
    hall: "Sixth Market",
    college: "Sixth",
    emoji: "🥗",
    bg: "bg-sky-100",
    items: ["1× Buddha Bowl", "1× Kombucha"],
    date: "Apr 15, 12:10 PM",
    total: "$14.25",
    status: "Delivered",
  },
  {
    id: "TDE-20819",
    hall: "Café Ventanas",
    college: "Warren",
    emoji: "☕",
    bg: "bg-amber-100",
    items: ["1× Latte", "1× Avocado Toast"],
    date: "Apr 12, 9:45 AM",
    total: "$12.00",
    status: "Delivered",
  },
  {
    id: "TDE-20800",
    hall: "OceanView Terrace",
    college: "Roosevelt",
    emoji: "🍜",
    bg: "bg-purple-100",
    items: ["1× Ramen Bowl", "1× Green Tea"],
    date: "Apr 9, 6:20 PM",
    total: "$13.75",
    status: "Delivered",
  },
];

// Set to true to preview the empty state
const SHOW_EMPTY = false;

export default function OrdersPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">

      {/* Header */}
      <div className="bg-[#003087] px-5 pt-14 pb-6 text-white">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-black">My Orders</h1>
          <p className="text-white/60 text-sm mt-1">Track and review your deliveries</p>
        </div>
      </div>

      <main className="max-w-md mx-auto px-5 py-5 flex flex-col gap-6">

        {SHOW_EMPTY ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-5">
              🛵
            </div>
            <h2 className="text-xl font-black text-gray-700">No previous orders</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">
              Looks like you haven&apos;t ordered yet. Grab something from a UCSD dining hall!
            </p>
            <Link
              href="/order"
              className="mt-6 bg-[#F5B700] text-[#003087] font-bold px-6 py-3.5 rounded-2xl shadow-md hover:bg-[#e0a800] transition"
            >
              Place Your First Order
            </Link>
          </div>
        ) : (
          <>
            {/* ── Active Order ── */}
            <section>
              <SectionLabel text="Active Order" dot />
              <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden">
                {/* Status bar */}
                <div className="bg-gradient-to-r from-[#003087] to-[#00429B] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white text-xs font-bold uppercase tracking-wide">In Progress</span>
                  </div>
                  <Link href="/chat" className="bg-[#F5B700] text-[#003087] text-xs font-bold px-3 py-1.5 rounded-lg">
                    Chat
                  </Link>
                </div>

                <div className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${ACTIVE_ORDER.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                      {ACTIVE_ORDER.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{ACTIVE_ORDER.hall}</p>
                      <p className="text-xs text-gray-400">{ACTIVE_ORDER.college} College · {ACTIVE_ORDER.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#003087]">{ACTIVE_ORDER.total}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500 bg-[#F5B700]/10 rounded-xl px-3 py-2">
                    <span>🚲 {ACTIVE_ORDER.dasher} · {ACTIVE_ORDER.status}</span>
                    <span className="font-bold text-[#003087]">{ACTIVE_ORDER.eta}</span>
                  </div>

                  <button onClick={() => toggle(ACTIVE_ORDER.id)} className="mt-3 w-full flex items-center justify-between text-xs font-semibold text-gray-400 hover:text-gray-600 transition">
                    <span>{expanded === ACTIVE_ORDER.id ? "Hide items" : "Show items"}</span>
                    {expanded === ACTIVE_ORDER.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                  </button>

                  {expanded === ACTIVE_ORDER.id && (
                    <ul className="mt-2 flex flex-col gap-1 pl-1 animate-slide-up">
                      {ACTIVE_ORDER.items.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-1 h-1 bg-[#F5B700] rounded-full flex-shrink-0"/>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>

            {/* ── Past Orders ── */}
            <section>
              <SectionLabel text="Past Orders" />
              <div className="flex flex-col gap-3">
                {PAST_ORDERS.map((o) => (
                  <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-4 py-3.5 flex items-center gap-3">
                      <div className={`w-11 h-11 ${o.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                        {o.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm text-gray-900">{o.hall}</p>
                          <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">✓ Delivered</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{o.date}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-bold text-[#003087]">{o.total}</span>
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
                          {o.items.map((item, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="w-1 h-1 bg-[#F5B700] rounded-full flex-shrink-0"/>
                              {item}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-gray-400 mb-3">Order ID: {o.id}</p>
                        <Link
                          href="/order"
                          className="flex items-center gap-2 bg-[#003087] text-white text-xs font-bold px-4 py-2.5 rounded-xl w-fit hover:bg-[#002060] transition"
                        >
                          <RotateCcw size={12}/> Reorder
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
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
