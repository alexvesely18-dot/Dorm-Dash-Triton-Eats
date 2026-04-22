"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb]">
      {/* Top banner */}
      <div className="bg-[#003087] pt-16 pb-10 px-6 flex flex-col items-center">
        <div className="w-16 h-16 bg-[#C69214] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <ShoppingBag size={32} className="text-white" />
        </div>
        <h1 className="text-white text-2xl font-bold">Dorm Dash</h1>
        <p className="text-white/70 text-sm mt-1">Triton Eats Delivery</p>
      </div>

      {/* Card */}
      <div className="flex-1 -mt-5 bg-[#f8f9fb] rounded-t-3xl px-6 pt-8 pb-10 max-w-md mx-auto w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Sign In</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              UCSD Email
            </label>
            <input
              type="email"
              placeholder="triton@ucsd.edu"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087] shadow-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087] shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Link
            href="/order"
            className="mt-2 w-full flex items-center justify-center bg-[#003087] text-white font-semibold py-3.5 rounded-xl shadow-md hover:bg-[#002270] transition active:scale-[0.98] text-sm"
          >
            Sign In
          </Link>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Link
            href="/signup"
            className="w-full flex items-center justify-center border-2 border-[#003087] text-[#003087] font-semibold py-3.5 rounded-xl hover:bg-[#003087]/5 transition active:scale-[0.98] text-sm"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
