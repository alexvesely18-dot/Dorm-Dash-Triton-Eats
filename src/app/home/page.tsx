"use client";

import Link from "next/link";
import { Bell, Plus, ChevronRight, Home, ClipboardList, User } from "lucide-react";

const PAST_ORDERS = [
  {
    id: 1,
    hall: "64 Degrees",
    college: "Revelle",
    items: "Grilled Chicken Bowl, Garden Salad, Water",
    date: "Apr 21",
    total: "$21.79",
    emoji: "🍳",
    bg: "bg-orange-100",
  },
  {
    id: 2,
    hall: "Pines",
    college: "Muir",
    items: "Tacos ×2, Sparkling Water",
    date: "Apr 18",
    total: "$16.50",
    emoji: "🌮",
    bg: "bg-green-100",
  },
  {
    id: 3,
    hall: "Sixth Market",
    college: "Sixth",
    items: "Buddha Bowl, Kombucha",
    date: "Apr 15",
    total: "$14.25",
    emoji: "🥗",
    bg: "bg-blue-100",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-24">

      {/* Header */}
      <div className="bg-[#003087] px-5 pt-14 pb-6">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <p className="text-white/60 text-sm">Good afternoon 👋</p>
            <h1 className="text-white text-2xl font-black mt-0.5">Hey, Triton!</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 bg-white/15 rounded-full flex items-center justify-center text-white">
              <Bell size={18}/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F5B700] rounded-full"/>
            </button>
            <div className="w-10 h-10 bg-[#F5B700] rounded-full flex items-center justify-center text-[#003087] font-black text-sm">AT</div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-md mx-auto w-full px-5 -mt-1">

        {/* Active Order Card */}
        <div className="mt-5 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Active Order</span>
              </div>
              <p className="font-bold text-gray-900 mt-0.5">Marcus is on his way 🚲</p>
              <p className="text-xs text-gray-400 mt-0.5">64 Degrees → Sixth College · ~8 min</p>
            </div>
            <Link href="/chat" className="bg-[#003087] text-white text-xs font-bold px-3 py-2 rounded-xl">
              Chat
            </Link>
          </div>

          {/* Campus Map */}
          <CampusMap />

          {/* Delivery progress bar */}
          <div className="px-4 pb-4 pt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>64 Degrees</span>
              <span>Sixth Dorms</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#003087] to-[#F5B700] rounded-full" style={{width: "55%"}}/>
            </div>
          </div>
        </div>

        {/* New Order button */}
        <Link
          href="/order"
          className="mt-4 w-full flex items-center justify-between bg-[#F5B700] text-[#003087] font-bold px-5 py-4 rounded-2xl shadow-md hover:bg-[#e0a800] transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#003087]/15 rounded-full flex items-center justify-center">
              <Plus size={18}/>
            </div>
            <div>
              <p className="font-black text-base">New Order</p>
              <p className="text-[#003087]/60 text-xs font-medium">Order from any dining hall</p>
            </div>
          </div>
          <ChevronRight size={20}/>
        </Link>

        {/* Dining hall chips */}
        <div className="mt-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dining Halls Open Now</p>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { name: "64 Degrees", emoji: "🍳", wait: "15 min" },
              { name: "Pines", emoji: "🌮", wait: "10 min" },
              { name: "Sixth Market", emoji: "🥗", wait: "20 min" },
              { name: "Café Ventanas", emoji: "☕", wait: "8 min" },
              { name: "Canyon Vista", emoji: "🍜", wait: "25 min" },
            ].map((d) => (
              <Link key={d.name} href="/order" className="flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-2.5 flex flex-col items-center gap-1 min-w-[80px] hover:shadow-md transition">
                <span className="text-2xl">{d.emoji}</span>
                <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{d.name}</p>
                <p className="text-[10px] text-gray-400">{d.wait}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Past Orders */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Past Orders</p>
            <button className="text-xs font-semibold text-[#003087]">See all</button>
          </div>
          <div className="flex flex-col gap-3">
            {PAST_ORDERS.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-12 h-12 ${o.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                  {o.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-gray-900">{o.hall}</p>
                    <p className="text-xs text-gray-400">{o.date}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{o.items}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs font-bold text-[#003087]">{o.total}</span>
                    <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">✓ Delivered</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-xl">
        <div className="max-w-md mx-auto flex items-center h-16">
          {[
            { icon: <Home size={20}/>, label: "Home", active: true, href: "/home" },
            { icon: <ClipboardList size={20}/>, label: "Orders", active: false, href: "/home" },
            { icon: <User size={20}/>, label: "Profile", active: false, href: "/home" },
          ].map((tab) => (
            <Link key={tab.label} href={tab.href} className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition ${tab.active ? "text-[#003087]" : "text-gray-400"}`}>
              {tab.icon}
              <span className="text-[10px] font-semibold">{tab.label}</span>
              {tab.active && <span className="w-1 h-1 bg-[#F5B700] rounded-full mt-0.5"/>}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

function CampusMap() {
  return (
    <div className="mx-4 rounded-2xl overflow-hidden border border-gray-100 bg-[#E8F0E4]" style={{height: 190}}>
      <svg viewBox="0 0 360 190" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Campus bg */}
        <rect width="360" height="190" fill="#E8F0E4"/>

        {/* Grass patches */}
        <ellipse cx="180" cy="95" rx="70" ry="45" fill="#D4E8CC" opacity="0.7"/>
        <ellipse cx="45"  cy="40" rx="28" ry="18" fill="#CCE0C4" opacity="0.6"/>
        <ellipse cx="320" cy="160" rx="30" ry="20" fill="#CCE0C4" opacity="0.6"/>

        {/* Roads */}
        <rect x="0"   y="100" width="360" height="7" fill="#D0D4CC"/>
        <rect x="105" y="0"   width="7"   height="190" fill="#D0D4CC"/>
        <rect x="200" y="55"  width="6"   height="135" fill="#D0D4CC"/>

        {/* Geisel Library */}
        <rect x="152" y="72" width="52" height="44" fill="#B4C8B4" rx="5"/>
        <rect x="159" y="79" width="38" height="14" fill="#A4BAA4" rx="2"/>
        <text x="178" y="106" textAnchor="middle" fontSize="6.5" fill="#2D4A2D" fontWeight="700">GEISEL</text>

        {/* Price Center */}
        <rect x="150" y="128" width="56" height="20" fill="#C4B8D8" rx="4"/>
        <text x="178" y="142" textAnchor="middle" fontSize="6" fill="#3A2860" fontWeight="600">PRICE CTR</text>

        {/* Warren area */}
        <rect x="246" y="140" width="40" height="22" fill="#D4C4B0" rx="3"/>
        <text x="266" y="155" textAnchor="middle" fontSize="5.5" fill="#5A3820" fontWeight="500">WARREN</text>

        {/* Delivery path */}
        <path id="dd-route" d="M68,98 C82,80 108,58 142,38" fill="none" stroke="#F5B700" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.9"/>

        {/* Origin pin: 64 Degrees */}
        <circle cx="68" cy="98" r="11" fill="#003087" stroke="white" strokeWidth="2.5"/>
        <text x="68" y="102" textAnchor="middle" fontSize="7" fill="white" fontWeight="800">64°</text>
        <text x="68" y="118" textAnchor="middle" fontSize="6" fill="#003087" fontWeight="700">64 Degrees</text>

        {/* Destination: Sixth Dorms (pulsing rings) */}
        <circle cx="142" cy="38" r="18" fill="#F5B700" opacity="0.15">
          <animate attributeName="r" values="12;22;12" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="142" cy="38" r="10" fill="#F5B700" stroke="white" strokeWidth="2.5"/>
        <text x="142" y="42" textAnchor="middle" fontSize="8" fill="white">🏠</text>
        <text x="142" y="58" textAnchor="middle" fontSize="6" fill="#003087" fontWeight="700">Your Dorm</text>

        {/* Secondary dining markers */}
        <circle cx="252" cy="82" r="7" fill="#003087" opacity="0.55" stroke="white" strokeWidth="1.5"/>
        <text x="252" y="96" textAnchor="middle" fontSize="5.5" fill="#1A3A6A">Pines</text>

        <circle cx="306" cy="62" r="7" fill="#003087" opacity="0.55" stroke="white" strokeWidth="1.5"/>
        <text x="306" y="76" textAnchor="middle" fontSize="5.5" fill="#1A3A6A">OVT</text>

        <circle cx="215" cy="172" r="7" fill="#003087" opacity="0.55" stroke="white" strokeWidth="1.5"/>
        <text x="215" y="186" textAnchor="middle" fontSize="5.5" fill="#1A3A6A">Canyon</text>

        {/* Animated dasher along route */}
        <circle r="9" fill="#F5B700" stroke="white" strokeWidth="2.5">
          <animateMotion dur="4s" repeatCount="indefinite">
            <mpath href="#dd-route"/>
          </animateMotion>
        </circle>
        <text fontSize="10" textAnchor="middle" dy="4">
          🛵
          <animateMotion dur="4s" repeatCount="indefinite">
            <mpath href="#dd-route"/>
          </animateMotion>
        </text>
      </svg>
    </div>
  );
}
