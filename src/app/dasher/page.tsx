"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const COLLEGES = [
  "Revelle College",
  "Muir College",
  "Marshall College",
  "Warren College",
  "Roosevelt College",
  "Sixth College",
  "Seventh College",
  "Eighth College",
];

export default function DasherLoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [college, setCollege] = useState(COLLEGES[0]);
  const [transport, setTransport] = useState<"bike" | "scooter">("bike");

  const signIn = () => {
    if (!name.trim()) return;
    localStorage.setItem("dasher_name", name.trim());
    localStorage.setItem("dasher_college", college);
    localStorage.setItem("dasher_transport", transport);
    router.push("/dasher/home");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#003087]">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-white">
        <div className="animate-float text-6xl mb-5 select-none">🛵</div>
        <h1 className="text-4xl font-black tracking-tight">Dasher Portal</h1>
        <p className="text-white/60 mt-2 text-base">UCSD Triton Eats Delivery</p>
        <div className="flex gap-2 mt-6 flex-wrap justify-center">
          {["UCSD Students Only", "Earn on Campus", "Flexible Hours"].map((t) => (
            <span key={t} className="bg-white/15 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      <div className="bg-[#F8FAFC] rounded-t-[2rem] px-6 pt-8 pb-10 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Dasher Sign In</h2>
        <p className="text-gray-400 text-sm mb-6">Sign in to start dashing</p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Name</label>
            <input
              type="text"
              placeholder="First Last"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") signIn(); }}
              className={cls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">UCSD Email</label>
            <input type="email" placeholder="triton@ucsd.edu" className={cls}/>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} placeholder="••••••••" className={`${cls} pr-12`}/>
              <button onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {show ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your College</label>
            <select
              value={college}
              onChange={e => setCollege(e.target.value)}
              className={cls}
            >
              {COLLEGES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Transport</label>
            <div className="flex gap-3">
              {(["bike", "scooter"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTransport(t)}
                  className={`flex-1 py-3 rounded-2xl border-2 font-semibold text-sm transition ${
                    transport === t ? "border-[#003087] bg-[#003087]/5 text-[#003087]" : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {t === "bike" ? "🚲 Bike" : "🛵 Scooter"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={signIn}
            disabled={!name.trim()}
            className={`mt-1 w-full flex items-center justify-center font-bold py-4 rounded-2xl shadow-lg transition active:scale-[0.98] text-base ${
              name.trim() ? "bg-[#F5B700] text-[#003087] hover:bg-[#e0a800]" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Sign In →
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"/>
            <span className="text-xs text-gray-400">new dasher?</span>
            <div className="flex-1 h-px bg-gray-200"/>
          </div>

          <Link href="/dasher/signup" className="w-full flex items-center justify-center border-2 border-[#003087] text-[#003087] font-semibold py-3.5 rounded-2xl hover:bg-[#003087]/5 transition text-sm">
            Become a Dasher
          </Link>

          <Link href="/" className="text-center text-xs text-gray-400 hover:text-gray-600 mt-1">
            ← Back to Student Login
          </Link>
        </div>
      </div>
    </div>
  );
}

const cls = "w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition appearance-none";
