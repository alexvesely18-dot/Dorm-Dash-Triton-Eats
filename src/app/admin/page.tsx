"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]   = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow]     = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Skip login if already authenticated
  useEffect(() => {
    if (localStorage.getItem("admin_token")) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const login = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("admin_token", data.token);
        window.location.href = "/admin/dashboard";
        return;
      }
      if (res.status === 500) {
        setErrorMsg("Server missing ADMIN_EMAIL / ADMIN_PASS env vars.");
      } else if (res.status === 429) {
        setErrorMsg("Too many attempts. Wait a minute and retry.");
      } else {
        setErrorMsg("Invalid credentials — try again.");
      }
    } catch {
      setErrorMsg("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#F5B700] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield size={30} className="text-[#003087]"/>
          </div>
          <h1 className="text-white text-2xl font-black tracking-tight">Dorm Dash Admin</h1>
          <p className="text-white/40 text-sm mt-1">Operations Dashboard</p>
        </div>

        <div className="bg-white rounded-3xl px-6 py-8 shadow-2xl">
          <h2 className="text-gray-900 font-bold text-lg mb-6">Sign in to Admin</h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrorMsg(""); }}
                onKeyDown={e => { if (e.key === "Enter") login(); }}
                placeholder="you@ucsd.edu"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition"
              />
            </div>

            <div>
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrorMsg(""); }}
                  onKeyDown={e => { if (e.key === "Enter") login(); }}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-11 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-red-500 text-xs font-semibold text-center">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              onClick={login}
              disabled={loading}
              className="mt-1 w-full bg-[#003087] text-white font-black py-3.5 rounded-xl hover:bg-[#002060] transition active:scale-[0.98] shadow-lg disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
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
