"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"student" | "dasher">("student");
  const [show, setShow] = useState(false);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [dasherName, setDasherName] = useState<string | null>(null);

  useEffect(() => {
    setStudentName(localStorage.getItem("user_name") || localStorage.getItem("user_first"));
    setDasherName(localStorage.getItem("dasher_name"));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#003087] relative overflow-hidden">
      <div className="absolute inset-0 gradient-animate opacity-90 pointer-events-none"/>
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#F5B700]/25 rounded-full blur-3xl animate-float pointer-events-none"/>
      <div className="absolute top-40 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float pointer-events-none" style={{animationDelay:'1.5s'}}/>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-white">
        <div className="animate-float text-7xl mb-5 select-none drop-shadow-2xl">🛵</div>
        <h1 className="text-5xl font-black tracking-tight animate-slide-up">Dorm Dash</h1>
        <p className="text-white/70 mt-2 text-base animate-slide-up stagger-1">UCSD Triton Eats Delivery</p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-6">
          {["Fast Pickup", "Triton2Go ✓", "Dorm Delivery"].map((t, i) => (
            <span key={t} className={`bg-white/15 backdrop-blur text-white/90 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 animate-pop-in stagger-${i+2}`}>{t}</span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-4 py-1.5 animate-pop-in stagger-4">
          <span className="w-1.5 h-1.5 bg-[#F5B700] rounded-full"/>
          <span className="text-white/80 text-[11px] font-semibold tracking-wide">By UCSD students, for UCSD students</span>
        </div>
      </div>

      <div className="relative bg-[#F8FAFC] rounded-t-[2rem] px-6 pt-6 pb-10 shadow-2xl animate-slide-up stagger-2">
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          {(["student", "dasher"] as const).map((role) => (
            <button
              key={role}
              onClick={() => setTab(role)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold press transition-all ${
                tab === role ? "bg-white text-[#003087] shadow-md" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {role === "student" ? "🎓 Student" : "🛵 Dasher"}
            </button>
          ))}
        </div>

        {tab === "student" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-0.5">Welcome back</h2>
              <p className="text-gray-400 text-sm">Sign in to order from any dining hall</p>
            </div>

            {/* Quick continue if already logged in */}
            {studentName && (
              <button
                onClick={() => router.push("/home")}
                className="w-full flex items-center justify-between bg-[#003087]/5 border-2 border-[#003087]/20 rounded-2xl px-4 py-3.5 hover:bg-[#003087]/10 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#003087] flex items-center justify-center text-white text-sm font-black">
                    {studentName.trim().split(" ").map((n: string) => n[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-[#003087]">Continue as {studentName.split(" ")[0]}</p>
                    <p className="text-xs text-gray-400">Already signed in</p>
                  </div>
                </div>
                <span className="text-[#003087] font-bold text-sm">→</span>
              </button>
            )}

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
            <Link href="/home" className="mt-1 w-full flex items-center justify-center bg-[#F5B700] text-[#003087] font-bold py-4 rounded-2xl shadow-lg hover:bg-[#e0a800] hover:shadow-xl press text-base animate-glow-pulse">
              Sign In →
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"/>
              <span className="text-xs text-gray-400">New to Dorm Dash?</span>
              <div className="flex-1 h-px bg-gray-200"/>
            </div>
            <Link href="/signup" className="w-full flex items-center justify-center border-2 border-[#003087] text-[#003087] font-semibold py-3.5 rounded-2xl hover:bg-[#003087]/5 transition text-sm">
              Create Student Account
            </Link>
          </div>
        )}

        {tab === "dasher" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-0.5">Dasher Portal</h2>
              <p className="text-gray-400 text-sm">Earn money delivering on campus</p>
            </div>

            {/* Quick continue if already logged in */}
            {dasherName && (
              <button
                onClick={() => router.push("/dasher/home")}
                className="w-full flex items-center justify-between bg-[#003087]/5 border-2 border-[#003087]/20 rounded-2xl px-4 py-3.5 hover:bg-[#003087]/10 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#003087] flex items-center justify-center text-white text-sm font-black">
                    {dasherName.trim().split(" ").map((n: string) => n[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-[#003087]">Continue as {dasherName.split(" ")[0]}</p>
                    <p className="text-xs text-gray-400">Already signed in</p>
                  </div>
                </div>
                <span className="text-[#003087] font-bold text-sm">→</span>
              </button>
            )}

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
            <div className="flex gap-2 flex-wrap">
              {["UCSD Students Only", "Earn on Campus", "Flexible Hours"].map((t) => (
                <span key={t} className="bg-[#003087]/8 text-[#003087] text-xs font-medium px-2.5 py-1 rounded-full border border-[#003087]/15">{t}</span>
              ))}
            </div>
            <Link href="/dasher/home" className="w-full flex items-center justify-center bg-[#F5B700] text-[#003087] font-bold py-4 rounded-2xl shadow-lg hover:bg-[#e0a800] hover:shadow-xl press text-base animate-glow-pulse">
              Sign In as Dasher →
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"/>
              <span className="text-xs text-gray-400">new dasher?</span>
              <div className="flex-1 h-px bg-gray-200"/>
            </div>
            <Link href="/dasher/signup" className="w-full flex items-center justify-center border-2 border-[#003087] text-[#003087] font-semibold py-3.5 rounded-2xl hover:bg-[#003087]/5 transition text-sm">
              Become a Dasher
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

const cls = "w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition";
