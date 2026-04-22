"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ShoppingBag, ChevronRight, Upload, CheckCircle, X } from "lucide-react";

const DINING_HALLS = [
  { id: "64deg", name: "64 Degrees", college: "Revelle" },
  { id: "pines", name: "Pines", college: "Muir" },
  { id: "sixth", name: "Sixth Market", college: "Sixth" },
  { id: "ovt", name: "OceanView Terrace", college: "Roosevelt" },
  { id: "ventanas", name: "Café Ventanas", college: "Warren" },
  { id: "canyon", name: "Canyon Vista", college: "Marshall" },
  { id: "bistro", name: "The Bistro", college: "Seventh/Eighth" },
];

export default function OrderPage() {
  const [diningHall, setDiningHall] = useState("");
  const [items, setItems] = useState("");
  const [tritonConfirmed, setTritonConfirmed] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeFile = () => {
    setScreenshot(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const canSubmit = diningHall && items.trim() && tritonConfirmed && screenshot;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb]">
      {/* Header */}
      <header className="bg-[#003087] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#C69214] rounded-full flex items-center justify-center">
              <ShoppingBag size={13} className="text-white" />
            </div>
            <span className="font-bold">Place Your Order</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-6 pt-6 pb-28 flex-1 flex flex-col gap-6">

        {/* Step 1 — Dining Hall */}
        <section>
          <StepLabel number={1} text="Which dining hall did you order from?" />
          <div className="flex flex-col gap-2 mt-3">
            {DINING_HALLS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDiningHall(d.id)}
                className={`w-full text-left bg-white rounded-xl border px-4 py-3 flex items-center justify-between shadow-sm transition hover:shadow-md ${
                  diningHall === d.id
                    ? "border-[#003087] ring-2 ring-[#003087]/20"
                    : "border-gray-100"
                }`}
              >
                <div>
                  <p className="font-semibold text-sm text-gray-800">{d.name}</p>
                  <p className="text-xs text-gray-400">{d.college} College</p>
                </div>
                {diningHall === d.id && (
                  <CheckCircle size={18} className="text-[#003087] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Step 2 — What they ordered */}
        <section>
          <StepLabel number={2} text="What did you order?" />
          <textarea
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder={"e.g.\n1x Grilled Chicken Bowl\n1x Garden Salad\n1x Water"}
            rows={4}
            className="mt-3 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087] shadow-sm"
          />
        </section>

        {/* Step 3 — Triton2Go confirmation */}
        <section>
          <StepLabel number={3} text="Confirm your order is in a Triton2Go container" />
          <button
            onClick={() => setTritonConfirmed(!tritonConfirmed)}
            className={`mt-3 w-full flex items-center gap-3 bg-white border rounded-xl px-4 py-4 shadow-sm transition ${
              tritonConfirmed
                ? "border-green-500 ring-2 ring-green-200"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                tritonConfirmed
                  ? "bg-green-500 border-green-500"
                  : "border-gray-300"
              }`}
            >
              {tritonConfirmed && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">🥡 Yes, it&apos;s in a Triton2Go container</p>
              <p className="text-xs text-gray-400 mt-0.5">Eco-friendly reusable container</p>
            </div>
          </button>
        </section>

        {/* Step 4 — Screenshot upload */}
        <section>
          <StepLabel number={4} text="Upload a screenshot from the Triton2Go app" />
          <p className="text-xs text-gray-400 mt-1 mb-3">
            Screenshot should show your order confirmation, last 4 of student ID, and target time.
          </p>

          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Screenshot preview" className="w-full max-h-56 object-cover" />
              <button
                onClick={removeFile}
                className="absolute top-2 right-2 w-7 h-7 bg-gray-900/60 rounded-full flex items-center justify-center text-white hover:bg-gray-900/80 transition"
              >
                <X size={14} />
              </button>
              <div className="bg-green-50 border-t border-green-100 px-4 py-2 flex items-center gap-2">
                <CheckCircle size={14} className="text-green-600" />
                <p className="text-xs text-green-700 font-medium">{screenshot?.name}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-1 w-full bg-white border-2 border-dashed border-gray-300 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-[#003087] hover:bg-[#003087]/5 transition"
            >
              <Upload size={24} className="text-gray-400" />
              <p className="text-sm font-medium text-gray-500">Tap to upload screenshot</p>
              <p className="text-xs text-gray-400">JPG, PNG, or HEIC</p>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </section>

      </main>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <Link
            href={canSubmit ? "/chat" : "#"}
            onClick={(e) => !canSubmit && e.preventDefault()}
            className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl shadow-md transition text-sm ${
              canSubmit
                ? "bg-[#003087] text-white hover:bg-[#002270] active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Submit Order
            <ChevronRight size={16} />
          </Link>
          {!canSubmit && (
            <p className="text-center text-xs text-gray-400 mt-2">Complete all steps above to continue</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StepLabel({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 bg-[#003087] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
        {number}
      </div>
      <p className="text-sm font-semibold text-gray-800 leading-snug">{text}</p>
    </div>
  );
}
