"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronRight, Upload, CheckCircle, X } from "lucide-react";

const HALLS = [
  { id: "64deg",    name: "64 Degrees",     college: "Revelle",        emoji: "🍳", bg: "bg-orange-50",  border: "border-orange-200" },
  { id: "pines",    name: "Pines",           college: "Muir",           emoji: "🌮", bg: "bg-green-50",   border: "border-green-200"  },
  { id: "sixth",    name: "Sixth Market",    college: "Sixth",          emoji: "🥗", bg: "bg-sky-50",     border: "border-sky-200"    },
  { id: "ovt",      name: "OceanView",       college: "Roosevelt",      emoji: "🍜", bg: "bg-purple-50",  border: "border-purple-200" },
  { id: "ventanas", name: "Café Ventanas",   college: "Warren",         emoji: "☕", bg: "bg-amber-50",   border: "border-amber-200"  },
  { id: "canyon",   name: "Canyon Vista",    college: "Marshall",       emoji: "🌯", bg: "bg-rose-50",    border: "border-rose-200"   },
  { id: "bistro",   name: "The Bistro",      college: "Seventh/Eighth", emoji: "🥪", bg: "bg-indigo-50",  border: "border-indigo-200" },
];

export default function OrderPage() {
  const [hall, setHall] = useState("");
  const [items, setItems] = useState("");
  const [triton, setTriton] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };
  const clear = () => { setFile(null); setPreview(null); if (ref.current) ref.current.value = ""; };

  const ready = hall && items.trim() && triton && file;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-[#003087] px-5 pt-14 pb-6 text-white">
        <Link href="/home" className="text-white/60 text-sm flex items-center gap-1 mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Home
        </Link>
        <h1 className="text-3xl font-black">New Order</h1>
        <p className="text-white/60 text-sm mt-1">Tell us what you picked up</p>
      </div>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-6 pb-32 flex flex-col gap-7">

        {/* Step 1 */}
        <section>
          <Step n={1} label="Which dining hall?" />
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {HALLS.map((d) => (
              <button
                key={d.id}
                onClick={() => setHall(d.id)}
                className={`flex flex-col items-start p-3.5 rounded-2xl border-2 transition ${
                  hall === d.id
                    ? "border-[#003087] bg-[#003087]/5 shadow-md"
                    : `${d.bg} ${d.border} hover:shadow-sm`
                }`}
              >
                <span className="text-3xl mb-2">{d.emoji}</span>
                <p className="font-bold text-sm text-gray-800 leading-tight">{d.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{d.college}</p>
                {hall === d.id && <CheckCircle size={14} className="text-[#003087] mt-1.5 self-end" />}
              </button>
            ))}
          </div>
        </section>

        {/* Step 2 */}
        <section>
          <Step n={2} label="What did you order?" />
          <div className="relative mt-3">
            <textarea
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder={"List your items, one per line:\n1× Grilled Chicken Bowl\n1× Garden Salad\n1× Sparkling Water"}
              rows={4}
              className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-sm resize-none focus:outline-none focus:border-[#003087] transition shadow-sm"
            />
          </div>
        </section>

        {/* Step 3 */}
        <section>
          <Step n={3} label="Confirm Triton2Go container" />
          <button
            onClick={() => setTriton(!triton)}
            className={`mt-3 w-full flex items-center gap-4 rounded-2xl border-2 px-4 py-4 transition ${
              triton ? "bg-green-50 border-green-400" : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${triton ? "bg-green-500 border-green-500 scale-110" : "border-gray-300"}`}>
              {triton && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-800 text-sm">🥡 In a Triton2Go container</p>
              <p className="text-xs text-gray-400 mt-0.5">Eco-friendly reusable container ✓</p>
            </div>
          </button>
        </section>

        {/* Step 4 */}
        <section>
          <Step n={4} label="Upload Triton2Go app screenshot" />
          <p className="text-xs text-gray-400 mt-1 mb-3">Shows your order #, last 4 of student ID, and pickup time.</p>

          {preview ? (
            <div className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className="w-full max-h-52 object-cover"/>
              <button onClick={clear} className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white">
                <X size={13}/>
              </button>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2.5 border-t border-green-100">
                <CheckCircle size={14} className="text-green-500"/>
                <p className="text-xs text-green-700 font-semibold truncate">{file?.name}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => ref.current?.click()}
              className="w-full bg-white border-2 border-dashed border-gray-300 rounded-2xl py-10 flex flex-col items-center gap-2 hover:border-[#003087] hover:bg-[#003087]/3 transition"
            >
              <div className="w-12 h-12 bg-[#003087]/10 rounded-full flex items-center justify-center">
                <Upload size={22} className="text-[#003087]"/>
              </div>
              <p className="text-sm font-semibold text-gray-600">Tap to upload screenshot</p>
              <p className="text-xs text-gray-400">JPG · PNG · HEIC</p>
            </button>
          )}
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onFile}/>
        </section>

      </main>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#F8FAFC]/90 backdrop-blur border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <Link
            href={ready ? "/chat" : "#"}
            onClick={(e) => !ready && e.preventDefault()}
            className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl shadow-lg transition text-base ${
              ready ? "bg-[#F5B700] text-[#003087] hover:bg-[#e0a800] active:scale-[0.98]" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Submit Order <ChevronRight size={18}/>
          </Link>
          {!ready && <p className="text-center text-xs text-gray-400 mt-2">Complete all 4 steps to continue</p>}
        </div>
      </div>
    </div>
  );
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 bg-[#003087] text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">{n}</div>
      <p className="font-bold text-gray-800">{label}</p>
    </div>
  );
}
