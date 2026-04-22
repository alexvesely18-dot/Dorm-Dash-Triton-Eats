"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Eye, EyeOff, ChevronRight } from "lucide-react";

const UCSD_COLLEGES = [
  "Revelle College",
  "Muir College",
  "Marshall College",
  "Warren College",
  "Roosevelt College",
  "Sixth College",
  "Seventh College",
  "Eighth College",
];

const DORM_BUILDINGS = [
  "Tioga Hall", "Tenaya Hall", "Tahoe Hall", "Shasta Hall",
  "Anza Hall", "De Anza Hall", "Cuicacalli", "Matthews",
  "Rita Atkinson Residences", "Mesa Nueva", "Canyonview",
  "Marshall Upper/Lower", "Revelle Dorms", "Warren Apartments",
];

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb]">
      {/* Header */}
      <header className="bg-[#003087] text-white sticky top-0 z-50 shadow-md">
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
            <span className="font-bold">Create Account</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-6 pb-28 pt-6 flex-1">
        <p className="text-sm text-gray-500 mb-6">Fill in your details to get started with Dorm Dash.</p>

        <div className="flex flex-col gap-5">

          {/* Username */}
          <Field label="Username">
            <input
              type="text"
              placeholder="e.g. triton_alex"
              className={inputClass}
            />
          </Field>

          {/* Password */}
          <Field label="Password">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {/* First + Last Name */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Field label="First Name">
                <input type="text" placeholder="Alex" className={inputClass} />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Last Name">
                <input type="text" placeholder="Triton" className={inputClass} />
              </Field>
            </div>
          </div>

          {/* UCSD Email */}
          <Field label="UCSD Email">
            <input
              type="email"
              placeholder="triton@ucsd.edu"
              className={inputClass}
            />
          </Field>

          {/* Phone */}
          <Field label="Phone Number">
            <input
              type="tel"
              placeholder="(619) 555-0100"
              className={inputClass}
            />
          </Field>

          {/* College */}
          <Field label="College at UCSD">
            <select className={`${inputClass} appearance-none`} defaultValue="">
              <option value="" disabled>Select your college…</option>
              {UCSD_COLLEGES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          {/* Building */}
          <Field label="Building of Residence">
            <select className={`${inputClass} appearance-none`} defaultValue="">
              <option value="" disabled>Select your building…</option>
              {DORM_BUILDINGS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </Field>

        </div>
      </main>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <Link
            href="/order"
            className="w-full flex items-center justify-center gap-2 bg-[#003087] text-white font-semibold py-3.5 rounded-xl shadow-md hover:bg-[#002270] transition active:scale-[0.98] text-sm"
          >
            Create Account
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087] shadow-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
