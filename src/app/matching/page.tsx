"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, ChevronRight, ShoppingBag, MapPin, Package } from "lucide-react";

const DASHER = {
  name: "Marcus T.",
  rating: 4.92,
  deliveries: 312,
  avatar: "MT",
  avatarBg: "bg-[#003087]",
  vehicle: "Bicycle 🚲",
  eta: "~8 min away",
  bio: "3rd year UCSD CS student, know the campus well!",
};

type Stage = "searching" | "found";

export default function MatchingPage() {
  const [stage, setStage] = useState<Stage>("searching");
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const dotTimer = setInterval(() => setDots((d) => (d % 3) + 1), 500);
    const matchTimer = setTimeout(() => setStage("found"), 3200);
    return () => {
      clearInterval(dotTimer);
      clearTimeout(matchTimer);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#003087] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/location" className="p-1 -ml-1 rounded-full hover:bg-white/10 transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#C69214] rounded-full flex items-center justify-center">
              <ShoppingBag size={13} className="text-white" />
            </div>
            <span className="font-bold">Finding Your Dasher</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-4 pb-10 flex-1 flex flex-col items-center justify-center">

        {stage === "searching" && (
          <div className="flex flex-col items-center animate-fade-in">
            {/* Animated pulse rings */}
            <div className="relative w-32 h-32 flex items-center justify-center mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-[#003087]/20 animate-ping" style={{ animationDuration: "1.5s" }} />
              <div className="absolute inset-3 rounded-full border-4 border-[#003087]/30 animate-ping" style={{ animationDuration: "1.8s", animationDelay: "0.3s" }} />
              <div className="w-20 h-20 bg-[#003087] rounded-full flex items-center justify-center shadow-xl">
                <span className="text-3xl">🛵</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Finding a Dasher{".".repeat(dots)}
            </h2>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              We&apos;re matching you with a nearby Triton Dasher. This only takes a moment!
            </p>

            {/* Progress bar */}
            <div className="w-full max-w-xs mt-8 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#003087] to-[#00629B] rounded-full transition-all"
                style={{ width: "75%", animation: "loading-bar 3s ease-out forwards" }}
              />
            </div>

            {/* Order summary mini card */}
            <div className="mt-8 w-full max-w-xs bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#003087]/10 rounded-xl flex items-center justify-center">
                  <Package size={18} className="text-[#003087]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">64 Degrees</p>
                  <p className="text-xs text-gray-500">3 items · Triton2Go ✓</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-gray-400">Pickup by</p>
                  <p className="text-sm font-bold text-[#003087]">2:45 PM</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "found" && (
          <div className="w-full animate-slide-up">
            {/* Match found banner */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 font-semibold text-sm px-4 py-2 rounded-full mb-3">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="#22c55e" />
                  <path d="M5 8l2.5 2.5L11 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Dasher Found!
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Meet {DASHER.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Your Dasher is on their way to pick up your order</p>
            </div>

            {/* Dasher card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden">
              {/* Card top — avatar + stats */}
              <div className="bg-gradient-to-r from-[#003087] to-[#00629B] px-5 py-5 flex items-center gap-4">
                <div className={`w-16 h-16 ${DASHER.avatarBg} rounded-full flex items-center justify-center text-white text-xl font-bold border-4 border-white/30 shadow-lg`}>
                  {DASHER.avatar}
                </div>
                <div className="text-white">
                  <p className="font-bold text-lg">{DASHER.name}</p>
                  <p className="text-white/75 text-xs">{DASHER.bio}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Star size={12} fill="white" stroke="white" />
                      <span className="text-sm font-semibold">{DASHER.rating}</span>
                    </div>
                    <span className="text-white/50">·</span>
                    <span className="text-xs text-white/75">{DASHER.deliveries} deliveries</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="px-5 py-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    🚲
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Vehicle</p>
                    <p className="text-sm font-medium text-gray-700">{DASHER.vehicle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-[#003087]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">ETA to your pickup</p>
                    <p className="text-sm font-medium text-gray-700">{DASHER.eta}</p>
                  </div>
                </div>
              </div>

              {/* Delivery summary */}
              <div className="border-t border-gray-100 mx-5 py-3 flex items-center justify-between text-sm text-gray-600">
                <span>📍 Price Center East</span>
                <span className="text-[#003087] font-medium">→ Delivering to you</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/delivery"
                className="w-full flex items-center justify-center gap-2 bg-[#003087] text-white font-semibold py-3.5 rounded-2xl shadow-md hover:bg-[#002270] transition active:scale-[0.98] text-sm"
              >
                Track Order & Chat
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes loading-bar {
          from { width: 10%; }
          to { width: 90%; }
        }
      `}</style>
    </div>
  );
}
