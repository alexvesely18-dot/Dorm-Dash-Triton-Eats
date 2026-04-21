"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Home } from "lucide-react";

export default function CompletePage() {
  const [notifSent, setNotifSent] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setNotifSent(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#003087] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#C69214] rounded-full flex items-center justify-center">
              <ShoppingBag size={13} className="text-white" />
            </div>
            <span className="font-bold">Dorm Dash</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-4 pb-10 flex-1 flex flex-col items-center">
        {/* Success animation */}
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="relative w-28 h-28 mb-6">
            <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
            <div className="w-28 h-28 bg-green-500 rounded-full flex items-center justify-center shadow-xl">
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <path d="M14 26l10 10 14-18" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Complete!</h1>
          <p className="text-gray-500 text-sm max-w-xs">
            Your Dorm Dash delivery is done. Thanks for ordering with Triton Eats!
          </p>
        </div>

        {/* Push notification sent card */}
        <div
          className={`mt-8 w-full bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden transition-all duration-700 ${
            notifSent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Phone mockup header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <p className="text-white/60 text-xs ml-2">Marcus T.&apos;s iPhone</p>
            <div className="ml-auto text-white/40 text-xs">2:46 PM</div>
          </div>

          {/* Notification banner */}
          <div className="bg-gray-900 px-4 py-3">
            <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-3 flex items-start gap-3">
              <div className="w-10 h-10 bg-[#003087] rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                🛵
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-white text-xs font-bold">Dorm Dash</p>
                  <p className="text-white/50 text-xs">now</p>
                </div>
                <p className="text-white text-sm font-semibold leading-snug">
                  📲 Your order is ready for pickup!
                </p>
                <p className="text-white/70 text-xs mt-0.5">
                  Order TDE-20847 is confirmed and waiting. Head to Price Center East.
                </p>
              </div>
            </div>
          </div>

          {/* Sent status */}
          <div className="px-4 py-3 bg-green-50 border-t border-green-100 flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-green-700 text-sm font-medium">
              Push notification sent to Marcus T. ✓
            </p>
          </div>
        </div>

        {/* Order summary */}
        <div className="mt-4 w-full bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Order Summary</p>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>64 Degrees — 3 items</span>
              <span>$18.75</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery fee</span>
              <span>$1.50</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-800">
              <span>Total paid</span>
              <span>$21.79</span>
            </div>
          </div>
        </div>

        {/* Rate your dasher */}
        {!submitted ? (
          <div className="mt-4 w-full bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
            <p className="text-sm font-semibold text-gray-800 mb-3 text-center">Rate Marcus T.</p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={32}
                    fill={(hoverRating || rating) >= star ? "#C69214" : "none"}
                    stroke={(hoverRating || rating) >= star ? "#C69214" : "#d1d5db"}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={() => rating > 0 && setSubmitted(true)}
              disabled={rating === 0}
              className="w-full bg-[#003087] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#002270] transition"
            >
              Submit Rating
            </button>
          </div>
        ) : (
          <div className="mt-4 w-full bg-[#003087]/5 border border-[#003087]/20 rounded-2xl px-4 py-4 text-center">
            <p className="text-sm font-semibold text-[#003087]">Thanks for rating Marcus! ⭐</p>
            <p className="text-xs text-gray-500 mt-1">Your feedback helps the Triton Eats community</p>
          </div>
        )}

        {/* Back home */}
        <Link
          href="/"
          className="mt-6 w-full flex items-center justify-center gap-2 border-2 border-[#003087] text-[#003087] font-semibold py-3.5 rounded-2xl hover:bg-[#003087]/5 transition active:scale-[0.98] text-sm"
        >
          <Home size={16} />
          Back to Home
        </Link>
      </main>
    </div>
  );
}
