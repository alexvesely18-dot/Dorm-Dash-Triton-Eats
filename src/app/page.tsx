"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [show, setShow] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#003087]">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-white">
        <div className="animate-float text-6xl mb-5 select-none">🛵</div>
        <h1 className="text-4xl font-black tracking-tight">Dorm Dash</h1>
        <p className="text-white/60 mt-2 text-base">UCSD Triton Eats Delivery</p>

        {/* Feature pills */}
        <div className="flex gap-2 mt-6 flex-wrap justify-center">
          {["Fast Pickup", "Triton2Go ✓", "Dorm Delivery"].map((t) => (
            <span key={t} className="bg-white/15 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="bg-[#F8FAFC] rounded-t-[2rem] px-6 pt-8 pb-10 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-gray-400 text-sm mb-6">Sign in to your Triton account</p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">UCSD Email</label>
            <input
              type="email"
              placeholder="triton@ucsd.edu"
              className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pr-12 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition"
              />
              <button onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Link
            href="/home"
            className="mt-1 w-full flex items-center justify-center bg-[#F5B700] text-[#003087] font-bold py-4 rounded-2xl shadow-lg hover:bg-[#e0a800] transition active:scale-[0.98] text-base"
          >
            Sign In →
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">new to Dorm Dash?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Link
            href="/signup"
            className="w-full flex items-center justify-center border-2 border-[#003087] text-[#003087] font-semibold py-3.5 rounded-2xl hover:bg-[#003087]/5 transition text-sm"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
