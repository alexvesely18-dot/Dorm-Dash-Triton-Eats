"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

export default function DasherCompletePage() {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [earning, setEarning] = useState(4.75);
  const [toDoor, setToDoor] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("dasher_history") ?? "[]");
      if (history.length > 0) {
        const latest = history[0];
        setEarning(latest.earning ?? 4.75);
        setToDoor(!!latest.toDoor);
        const todayStr = new Date().toDateString();
        const total = history
          .filter((d: { completedAt: string }) => new Date(d.completedAt).toDateString() === todayStr)
          .reduce((s: number, d: { earning: number }) => s + (d.earning ?? 0), 0);
        setTodayTotal(total);
      }
    } catch {}
  }, []);

  const base = toDoor ? 4.75 : 3.50;
  const bonus = toDoor ? 2.00 : 1.25;

  return (
    <div className="min-h-screen bg-[#003087] flex flex-col items-center justify-center px-6 text-white">

      <div className="text-6xl mb-6 animate-float select-none">🎉</div>
      <h1 className="text-3xl font-black text-center">Order Delivered!</h1>
      <p className="text-white/60 mt-2 text-sm text-center">Great work, Dasher</p>

      <div className="mt-8 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-gray-900">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Earnings Breakdown</p>

        <div className="flex flex-col gap-2.5 mb-4">
          {[
            { label: "Base pay",      value: `$${base.toFixed(2)}` },
            { label: toDoor ? "Door delivery bonus" : "Distance bonus", value: `$${bonus.toFixed(2)}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-sm font-bold text-gray-800">{value}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <p className="font-black text-gray-900">Total Earned</p>
          <p className="font-black text-2xl text-[#003087]">${earning.toFixed(2)}</p>
        </div>

        <div className="mt-4 bg-[#003087]/5 rounded-2xl px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-semibold">Today&apos;s Total</p>
          <p className="font-black text-[#003087]">${todayTotal.toFixed(2)}</p>
        </div>
      </div>

      {!submitted ? (
        <div className="mt-5 w-full max-w-sm bg-white/10 rounded-3xl p-5">
          <p className="text-sm font-bold text-center mb-3">How was this delivery?</p>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setStars(n)}
              >
                <Star
                  size={32}
                  className={`transition-all ${
                    (hovered || stars) >= n ? "text-[#F5B700] fill-[#F5B700]" : "text-white/40"
                  }`}
                />
              </button>
            ))}
          </div>
          <button
            onClick={() => { if (stars > 0) setSubmitted(true); }}
            className={`w-full py-3 rounded-2xl font-bold transition ${
              stars > 0
                ? "bg-white text-[#003087] hover:bg-white/90"
                : "bg-white/20 text-white/40 cursor-not-allowed"
            }`}
          >
            Submit Rating
          </button>
        </div>
      ) : (
        <div className="mt-5 w-full max-w-sm bg-white/10 rounded-3xl px-5 py-4 flex items-center justify-center gap-2 animate-fade-in">
          <span className="text-2xl">⭐</span>
          <p className="font-bold text-sm">Thanks for your feedback!</p>
        </div>
      )}

      <div className="mt-6 w-full max-w-sm flex flex-col gap-3">
        <Link
          href="/dasher/home"
          className="w-full flex items-center justify-center bg-[#F5B700] text-[#003087] font-black py-4 rounded-2xl shadow-lg hover:bg-[#e0a800] transition active:scale-[0.98] text-base"
        >
          Back to Dashing 🛵
        </Link>
        <Link href="/dasher" className="text-center text-xs text-white/40 hover:text-white/70">
          Sign out
        </Link>
      </div>
    </div>
  );
}
