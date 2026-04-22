"use client";

import Link from "next/link";
import { CheckCircle, Package, Clock, Camera, ChevronRight, ShoppingBag } from "lucide-react";

const ORDER_ID = "TDE-20847";
const STUDENT_LAST4 = "7382";
const TARGET_TIME = "2:45 PM";
const ORDER_ITEMS = [
  { name: "Grilled Chicken Bowl", qty: 1, price: "$11.50" },
  { name: "Garden Side Salad", qty: 1, price: "$4.25" },
  { name: "Sparkling Water", qty: 2, price: "$3.00" },
];

export default function OrderQueuePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#003087] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-1 -ml-1 rounded-full hover:bg-white/10 transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#C69214] rounded-full flex items-center justify-center">
              <ShoppingBag size={13} className="text-white" />
            </div>
            <span className="font-bold">Order Queue</span>
          </div>
          <span className="ml-auto text-xs text-white/60">{ORDER_ID}</span>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-4 pb-24 flex-1">

        {/* Status Banner */}
        <div className="mt-5 bg-green-500 rounded-2xl p-4 text-white flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 bg-white/25 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-base">Order Confirmed!</p>
            <p className="text-white/85 text-sm">Your food is being prepared</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-white/70">Target pickup</p>
            <p className="font-bold text-lg">{TARGET_TIME}</p>
          </div>
        </div>

        {/* Screenshot checklist */}
        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Camera size={16} className="text-amber-600" />
            <p className="font-semibold text-amber-800 text-sm">Take a screenshot to verify:</p>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: `Last 4 of student ID: ${STUDENT_LAST4}`, done: true },
              { label: `Order confirmed — Target time ${TARGET_TIME}`, done: true },
              { label: "In a Triton2Go container", done: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details Card */}
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2 border-b border-gray-100">
            <Package size={16} className="text-[#003087]" />
            <span className="font-semibold text-gray-800 text-sm">Your Order</span>
          </div>

          {/* Student ID row */}
          <div className="px-4 py-3 bg-[#003087]/5 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#003087] uppercase tracking-wide">Student ID (last 4)</span>
            <div className="flex gap-1">
              {STUDENT_LAST4.split("").map((digit, i) => (
                <div
                  key={i}
                  className="w-8 h-9 bg-[#003087] text-white rounded-lg flex items-center justify-center font-bold text-lg"
                >
                  {digit}
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="px-4 py-3 flex flex-col gap-3">
            {ORDER_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-gray-100 rounded-full text-xs flex items-center justify-center text-gray-500 font-medium">
                    {item.qty}
                  </span>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm text-gray-500">{item.price}</span>
              </div>
            ))}
          </div>

          {/* Triton2Go badge */}
          <div className="mx-4 mb-4 mt-1 bg-[#003087]/8 border border-[#003087]/20 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
            <div className="text-xl">🥡</div>
            <div>
              <p className="text-xs font-bold text-[#003087]">Triton2Go Container</p>
              <p className="text-xs text-gray-500">Eco-friendly reusable container</p>
            </div>
            <div className="ml-auto">
              <div className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                ✓ Ready
              </div>
            </div>
          </div>

          {/* Target time */}
          <div className="mx-4 mb-4 flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
            <Clock size={15} className="text-[#00629B] flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#003087]">Estimated Pickup Time</p>
              <p className="text-xs text-gray-500">Ready for delivery by {TARGET_TIME}</p>
            </div>
            <span className="ml-auto font-bold text-[#003087] text-sm">{TARGET_TIME}</span>
          </div>
        </div>

        {/* Totals */}
        <div className="mt-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span>$18.75</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery fee</span><span>$1.50</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax</span><span>$1.54</span>
            </div>
            <div className="border-t border-gray-100 mt-1 pt-2 flex justify-between font-bold text-gray-900">
              <span>Total</span><span>$21.79</span>
            </div>
          </div>
        </div>
      </main>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <Link
            href="/location"
            className="w-full flex items-center justify-center gap-2 bg-[#003087] text-white font-semibold py-3.5 rounded-2xl shadow-md hover:bg-[#002270] transition active:scale-[0.98] text-sm"
          >
            Confirm & Select Pickup Location
            <ChevronRight size={16} />
          </Link>
          <p className="text-center text-xs text-gray-400 mt-2">Screenshot this page before continuing</p>
        </div>
      </div>
    </div>
  );
}
