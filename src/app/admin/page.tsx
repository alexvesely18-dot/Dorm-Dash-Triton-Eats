"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);

  const login = () => {
    if (email === "avesely@ucsd.edu" && password === "Password124!") {
      localStorage.setItem("admin_authed", "1");
      router.push("/admin/dashboard");
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center px-6">

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#F5B700] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield size={30} className="text-[#003087]"/>
          </div>
          <h1 className="text-white text-2xl font-black tracking-tight">Dorm Dash Admin</h1>
          <p className="text-white/40 text-sm mt-1">Operations Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl px-6 py-8 backdrop-blur-sm">
          <h2 className="text-white font-bold text-lg mb-6">Sign in to Admin</h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wide block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(false); }}
                onKeyDown={e => { if (e.key === "Enter") login(); }}
                placeholder="you@ucsd.edu"
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F5B700]/60 focus:ring-1 focus:ring-[#F5B700]/30 transition"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wide block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(false); }}
                  onKeyDown={e => { if (e.key === "Enter") login(); }}
                  placeholder="••••••••"
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F5B700]/60 focus:ring-1 focus:ring-[#F5B700]/30 transition"
                />
                <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-semibold text-center animate-fade-in">
                Invalid credentials. Try again.
              </p>
            )}

            <button
              onClick={login}
              className="mt-1 w-full bg-[#F5B700] text-[#003087] font-black py-3.5 rounded-xl hover:bg-[#e0a800] transition active:scale-[0.98] shadow-lg"
            >
              Sign In
            </button>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Admin access only · Dorm Dash UCSD
        </p>
      </div>
    </div>
  );
}
