"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, MapPin, Package } from "lucide-react";

type Order = {
  hall: string;
  college: string;
  emoji: string;
  cart: string[];
  pid_last4: string | null;
  pickup_time: string | null;
  order_number: string | null;
  total: string;
};

const DEMO: Order = {
  hall: "64 Degrees",
  college: "Revelle",
  emoji: "🍳",
  cart: ["1× Grilled Chicken Bowl", "1× Garden Salad", "1× Water"],
  pid_last4: "7842",
  pickup_time: "12:15 PM",
  order_number: "TDE-24801",
  total: "$17.80",
};

export default function DasherPickupPage() {
  const [order, setOrder] = useState<Order>(DEMO);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dorm_dash_active_order");
      if (raw) setOrder(JSON.parse(raw));
    } catch { /* use demo */ }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-10">

      {/* Header */}
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

        {/* Dining Hall */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">
              {order.emoji}
            </div>
            <div>
              <p className="font-black text-gray-900 text-lg">{order.hall}</p>
              <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                <MapPin size={11}/>
                <span>{order.college} College</span>
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

        {/* Order number */}
        {order.order_number && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-semibold">Order #</p>
            <p className="font-black text-[#003087]">{order.order_number}</p>
          </div>
        )}

        {/* Items */}
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
            <p className="text-xs text-gray-400 font-semibold">Order Total</p>
            <p className="font-black text-gray-900">{order.total}</p>
          </div>
        </div>

        {/* Confirm & Continue */}
        {!confirmed ? (
          <button
            onClick={() => setConfirmed(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#003087] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#002060] transition active:scale-[0.98] text-base"
          >
            <CheckCircle size={18}/>
            I have the order
          </button>
        ) : (
          <Link
            href="/dasher/delivery"
            className="w-full flex items-center justify-center gap-2 bg-[#F5B700] text-[#003087] font-black py-4 rounded-2xl shadow-lg hover:bg-[#e0a800] transition active:scale-[0.98] text-base animate-fade-in"
          >
            Start Delivery →
          </Link>
        )}
      </main>
    </div>
  );
}
