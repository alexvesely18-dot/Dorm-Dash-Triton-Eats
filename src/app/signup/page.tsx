"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, User, BookOpen, Home } from "lucide-react";

const COLLEGES = ["Revelle","Muir","Marshall","Warren","Roosevelt","Sixth","Seventh","Eighth"].map(c => c + " College");
const BUILDINGS = ["Tioga Hall","Tenaya Hall","Tahoe Hall","Shasta Hall","Anza Hall","De Anza Hall","Cuicacalli","Matthews","Rita Atkinson Residences","Mesa Nueva","Marshall Upper/Lower","Warren Apartments","Revelle Dorms"];

export default function SignUpPage() {
  const [show, setShow] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-[#003087] px-6 pt-14 pb-8 text-white">
        <Link href="/" className="text-white/60 text-sm flex items-center gap-1 mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </Link>
        <h1 className="text-3xl font-black">Create account</h1>
        <p className="text-white/60 text-sm mt-1">Join the Triton Eats community</p>
      </div>

      <main className="flex-1 px-5 py-6 pb-32 flex flex-col gap-4 max-w-md mx-auto w-full">

        {/* Section: Account */}
        <SectionCard icon={<User size={15}/>} title="Account Info">
          <Field label="Username">
            <input type="text" placeholder="triton_alex" className={cls}/>
          </Field>
          <Field label="Password">
            <div className="relative">
              <input type={show ? "text" : "password"} placeholder="••••••••" className={`${cls} pr-11`}/>
              <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {show ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </Field>
        </SectionCard>

        {/* Section: Personal */}
        <SectionCard icon={<span className="text-sm">👤</span>} title="Personal Info">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name">
              <input type="text" placeholder="Alex" className={cls}/>
            </Field>
            <Field label="Last Name">
              <input type="text" placeholder="Triton" className={cls}/>
            </Field>
          </div>
          <Field label="UCSD Email">
            <input type="email" placeholder="triton@ucsd.edu" className={cls}/>
          </Field>
          <Field label="Phone">
            <input type="tel" placeholder="(619) 555-0100" className={cls}/>
          </Field>
        </SectionCard>

        {/* Section: UCSD */}
        <SectionCard icon={<BookOpen size={15}/>} title="UCSD Info">
          <Field label="College">
            <select className={`${cls} appearance-none`} defaultValue="">
              <option value="" disabled>Select your college…</option>
              {COLLEGES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Building of Residence">
            <select className={`${cls} appearance-none`} defaultValue="">
              <option value="" disabled>Select your building…</option>
              {BUILDINGS.map(b => <option key={b}>{b}</option>)}
            </select>
          </Field>
        </SectionCard>

      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#F8FAFC]/90 backdrop-blur border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <Link href="/home" className="w-full flex items-center justify-center gap-2 bg-[#F5B700] text-[#003087] font-bold py-4 rounded-2xl shadow-lg hover:bg-[#e0a800] transition active:scale-[0.98] text-base">
            <Home size={16}/> Create My Account
          </Link>
        </div>
      </div>
    </div>
  );
}

const cls = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] shadow-sm transition";

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-[#003087]">{icon}</span>
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      {children}
    </div>
  );
}
