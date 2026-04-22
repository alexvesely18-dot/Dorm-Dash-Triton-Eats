"use client";

import Link from "next/link";
import { ShoppingBag, MapPin, Clock, Star, ChevronRight, Utensils } from "lucide-react";

const restaurants = [
  {
    id: 1,
    name: "64 Degrees",
    location: "Revelle College",
    rating: 4.6,
    time: "15–25 min",
    emoji: "🍳",
    bg: "bg-orange-50",
  },
  {
    id: 2,
    name: "Pines",
    location: "Muir College",
    rating: 4.4,
    time: "10–20 min",
    emoji: "🌮",
    bg: "bg-green-50",
  },
  {
    id: 3,
    name: "Sixth Market",
    location: "Sixth College",
    rating: 4.5,
    time: "15–20 min",
    emoji: "🥗",
    bg: "bg-blue-50",
  },
  {
    id: 4,
    name: "OceanView Terrace",
    location: "Eleanor Roosevelt College",
    rating: 4.3,
    time: "20–30 min",
    emoji: "🍜",
    bg: "bg-purple-50",
  },
  {
    id: 5,
    name: "Café Ventanas",
    location: "Warren College",
    rating: 4.7,
    time: "10–15 min",
    emoji: "☕",
    bg: "bg-amber-50",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#003087] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C69214] rounded-full flex items-center justify-center">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Dorm Dash</span>
            <span className="text-[#C69214] font-bold text-lg tracking-tight ml-1">Triton Eats</span>
          </div>
          <div className="ml-auto">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
              A8
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-4 pb-10 flex-1">
        {/* Hero */}
        <div className="mt-5 mb-5">
          <div className="bg-gradient-to-r from-[#003087] to-[#00629B] rounded-2xl p-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Good afternoon, Triton!</p>
                <h1 className="text-2xl font-bold leading-tight">
                  What are you<br />craving today?
                </h1>
                <div className="mt-3 flex items-center gap-1 text-sm text-white/80">
                  <MapPin size={13} />
                  <span>UCSD Campus</span>
                </div>
              </div>
              <div className="text-5xl select-none">🐟</div>
            </div>
          </div>
        </div>

        {/* Feature chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
          {[
            { icon: <Clock size={13} />, label: "Fast pickup" },
            { icon: <Utensils size={13} />, label: "Triton2Go" },
            { icon: <MapPin size={13} />, label: "Dorm delivery" },
          ].map((chip) => (
            <div
              key={chip.label}
              className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 text-xs font-medium text-[#003087] border border-gray-100 shadow-sm whitespace-nowrap"
            >
              {chip.icon}
              {chip.label}
            </div>
          ))}
        </div>

        {/* Dining Halls */}
        <h2 className="text-base font-bold text-gray-800 mb-3">UCSD Dining Halls</h2>
        <div className="flex flex-col gap-3">
          {restaurants.map((r) => (
            <Link
              key={r.id}
              href="/order-queue"
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition active:scale-[0.99]"
            >
              <div className={`w-14 h-14 ${r.bg} rounded-xl flex items-center justify-center text-3xl flex-shrink-0`}>
                {r.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-sm">{r.name}</span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star size={11} fill="#C69214" stroke="#C69214" />
                    <span>{r.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{r.location}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-[#003087]/10 text-[#003087] text-xs px-2 py-0.5 rounded-full font-medium">
                    Triton2Go ✓
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={10} />
                    <span>{r.time}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
