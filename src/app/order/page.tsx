"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle, X, Loader2, Minus, Plus, Upload, AlertCircle } from "lucide-react";

const HALLS = [
  { id: "64deg",    name: "64 Degrees",     college: "Revelle",        emoji: "🍳", bg: "bg-orange-50",  border: "border-orange-200" },
  { id: "pines",    name: "Pines",           college: "Muir",           emoji: "🌮", bg: "bg-green-50",   border: "border-green-200"  },
  { id: "sixth",    name: "Sixth Market",    college: "Sixth",          emoji: "🥗", bg: "bg-sky-50",     border: "border-sky-200"    },
  { id: "ovt",      name: "OceanView",       college: "Roosevelt",      emoji: "🍜", bg: "bg-purple-50",  border: "border-purple-200" },
  { id: "ventanas", name: "Café Ventanas",   college: "Warren",         emoji: "☕", bg: "bg-amber-50",   border: "border-amber-200"  },
  { id: "canyon",   name: "Canyon Vista",    college: "Marshall",       emoji: "🌯", bg: "bg-rose-50",    border: "border-rose-200"   },
  { id: "bistro",   name: "The Bistro",      college: "Seventh/Eighth", emoji: "🥪", bg: "bg-indigo-50",  border: "border-indigo-200" },
];

const MENUS: Record<string, { category: string; items: { name: string; price: number }[] }[]> = {
  "64deg": [
    { category: "🍽 Entrees", items: [
      { name: "Grilled Chicken Bowl", price: 11.50 },
      { name: "Fish & Chips",         price: 12.00 },
      { name: "Pasta Bolognese",      price: 10.50 },
      { name: "Veggie Burger",        price: 9.75  },
      { name: "Breakfast Burrito",    price: 8.50  },
    ]},
    { category: "🥗 Sides", items: [
      { name: "French Fries",   price: 3.50 },
      { name: "Garden Salad",   price: 4.25 },
      { name: "Soup of the Day",price: 3.75 },
    ]},
    { category: "🥤 Drinks", items: [
      { name: "Water",    price: 1.50 },
      { name: "Lemonade", price: 2.50 },
      { name: "Coffee",   price: 2.75 },
    ]},
  ],
  "pines": [
    { category: "🍽 Entrees", items: [
      { name: "Tacos (2pc)",       price: 9.00  },
      { name: "Burrito Bowl",      price: 10.25 },
      { name: "Quesadilla",        price: 8.75  },
      { name: "Street Corn Salad", price: 7.50  },
    ]},
    { category: "🥗 Sides", items: [
      { name: "Chips & Salsa", price: 3.00 },
      { name: "Mexican Rice",  price: 2.50 },
      { name: "Guacamole",     price: 2.75 },
    ]},
    { category: "🥤 Drinks", items: [
      { name: "Horchata",       price: 2.75 },
      { name: "Sparkling Water",price: 1.75 },
      { name: "Water",          price: 1.50 },
    ]},
  ],
  "sixth": [
    { category: "🍽 Entrees", items: [
      { name: "Buddha Bowl",  price: 11.00 },
      { name: "Acai Bowl",    price: 9.50  },
      { name: "Grain Bowl",   price: 10.00 },
      { name: "Power Salad",  price: 8.75  },
    ]},
    { category: "🥗 Sides", items: [
      { name: "Fresh Fruit",    price: 3.00 },
      { name: "Hummus & Pita",  price: 3.50 },
    ]},
    { category: "🥤 Drinks", items: [
      { name: "Kombucha", price: 3.50 },
      { name: "Smoothie", price: 4.00 },
      { name: "Water",    price: 1.50 },
    ]},
  ],
  "ovt": [
    { category: "🍽 Entrees", items: [
      { name: "Ramen Bowl",      price: 11.50 },
      { name: "Fried Rice",      price: 9.75  },
      { name: "Teriyaki Bowl",   price: 10.50 },
      { name: "Spring Rolls",    price: 6.00  },
    ]},
    { category: "🥗 Sides", items: [
      { name: "Miso Soup", price: 2.50 },
      { name: "Edamame",   price: 3.00 },
    ]},
    { category: "🥤 Drinks", items: [
      { name: "Green Tea", price: 2.00 },
      { name: "Boba",      price: 4.50 },
      { name: "Water",     price: 1.50 },
    ]},
  ],
  "ventanas": [
    { category: "🍽 Entrees", items: [
      { name: "Avocado Toast",    price: 9.00  },
      { name: "Bagel & Lox",     price: 10.50 },
      { name: "Breakfast Burrito",price: 8.75  },
      { name: "Açaí Bowl",       price: 9.50  },
    ]},
    { category: "🥗 Sides", items: [
      { name: "Fresh Fruit", price: 3.00 },
      { name: "Pastry",      price: 2.75 },
    ]},
    { category: "☕ Drinks", items: [
      { name: "Latte",      price: 4.75 },
      { name: "Cold Brew",  price: 4.25 },
      { name: "Matcha",     price: 4.50 },
      { name: "OJ",         price: 2.75 },
    ]},
  ],
  "canyon": [
    { category: "🍽 Entrees", items: [
      { name: "Pizza Slice",        price: 5.50  },
      { name: "Pasta Station",      price: 10.00 },
      { name: "Grill Burger",       price: 11.50 },
      { name: "Rotisserie Chicken", price: 12.00 },
    ]},
    { category: "🥗 Sides", items: [
      { name: "Caesar Salad", price: 4.50 },
      { name: "Garlic Bread", price: 2.50 },
    ]},
    { category: "🥤 Drinks", items: [
      { name: "Soda",  price: 2.50 },
      { name: "Juice", price: 2.75 },
      { name: "Water", price: 1.50 },
    ]},
  ],
  "bistro": [
    { category: "🍽 Entrees", items: [
      { name: "Sandwich of the Day", price: 9.50  },
      { name: "Wrap",                price: 8.75  },
      { name: "Grain Bowl",          price: 10.00 },
    ]},
    { category: "🥗 Sides", items: [
      { name: "Kettle Chips", price: 2.00 },
      { name: "Apple",        price: 1.50 },
    ]},
    { category: "🥤 Drinks", items: [
      { name: "Coffee", price: 2.75 },
      { name: "Juice",  price: 2.75 },
      { name: "Water",  price: 1.50 },
    ]},
  ],
};

type Extracted = {
  pid_last4: string | null;
  order_number: string | null;
  dining_hall: string | null;
  items: string[] | null;
  pickup_time: string | null;
  total: string | null;
};

const BUILDINGS = ["Tioga Hall","Tenaya Hall","Tahoe Hall","Shasta Hall","Anza Hall","De Anza Hall","Cuicacalli","Matthews","Rita Atkinson Residences","Mesa Nueva","Marshall Upper/Lower","Warren Apartments","Revelle Dorms"];

export default function OrderPage() {
  const [hall, setHall] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [triton, setTriton] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [ocrError, setOcrError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [building, setBuilding] = useState("Tioga Hall");
  const [toDoor, setToDoor] = useState(false);
  const [room, setRoom] = useState("");

  const menu = MENUS[hall] ?? [];
  const allItems = menu.flatMap((g) => g.items);

  const add = (name: string) =>
    setCart((c) => ({ ...c, [name]: (c[name] ?? 0) + 1 }));
  const sub = (name: string) =>
    setCart((c) => {
      const next = { ...c, [name]: (c[name] ?? 1) - 1 };
      if (next[name] <= 0) delete next[name];
      return next;
    });

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [name, qty]) => {
    const price = allItems.find((i) => i.name === name)?.price ?? 0;
    return sum + price * qty;
  }, 0);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setExtracted(null);
    setOcrError(false);
    setAnalyzing(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      try {
        const res = await fetch("/api/analyze-screenshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: f.type || "image/jpeg" }),
        });
        const json = await res.json();
        if (json.success) setExtracted(json.data);
        else setOcrError(true);
      } catch {
        setOcrError(true);
      }
      setAnalyzing(false);
    };
    reader.readAsDataURL(f);
  };

  const clearFile = () => {
    setFile(null); setPreview(null); setExtracted(null); setOcrError(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const canSubmit = hall && cartCount > 0 && triton && file && !analyzing && (extracted || ocrError) && building && (!toDoor || room.trim());

  const saveAndGo = () => {
    const hallData = HALLS.find((h) => h.id === hall);
    const doorFee = toDoor ? 2.0 : 0;
    const order = {
      hall: hallData?.name,
      college: hallData?.college,
      emoji: hallData?.emoji,
      cart: Object.entries(cart).map(([name, qty]) => `${qty}× ${name}`),
      triton2go: true,
      pid_last4: extracted?.pid_last4 ?? null,
      pickup_time: extracted?.pickup_time ?? null,
      order_number: extracted?.order_number ?? `TDE-${Math.floor(20000 + Math.random() * 9999)}`,
      subtotal: `$${cartTotal.toFixed(2)}`,
      total: `$${(cartTotal * 1.0775 + 1.5 + doorFee).toFixed(2)}`,
      building,
      room: toDoor ? room.trim() : null,
      toDoor,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("dorm_dash_active_order", JSON.stringify(order));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="bg-[#003087] px-5 pt-14 pb-6 text-white">
        <Link href="/home" className="text-white/60 text-sm flex items-center gap-1 mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Home
        </Link>
        <h1 className="text-3xl font-black">New Order</h1>
        <p className="text-white/60 text-sm mt-1">Select your dining hall and items</p>
      </div>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-6 pb-36 flex flex-col gap-8">

        {/* ── Step 1: Dining Hall ── */}
        <section>
          <Step n={1} label="Which dining hall?" />
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {HALLS.map((d) => (
              <button
                key={d.id}
                onClick={() => { setHall(d.id); setCart({}); }}
                className={`flex flex-col items-start p-3.5 rounded-2xl border-2 transition text-left ${
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

        {/* ── Step 2: Menu ── */}
        {hall && (
          <section className="animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <Step n={2} label={`Choose from ${HALLS.find(h => h.id === hall)?.name}`} />
              {cartCount > 0 && (
                <span className="bg-[#F5B700] text-[#003087] text-xs font-black px-2.5 py-1 rounded-full">
                  {cartCount} item{cartCount > 1 ? "s" : ""} · ${cartTotal.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-5">
              {menu.map((group) => (
                <div key={group.category}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{group.category}</p>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                    {group.items.map((item) => {
                      const qty = cart[item.name] ?? 0;
                      return (
                        <div key={item.name} className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-400">${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {qty > 0 ? (
                              <>
                                <button onClick={() => sub(item.name)} className="w-7 h-7 rounded-full border-2 border-[#003087] flex items-center justify-center text-[#003087] hover:bg-[#003087] hover:text-white transition">
                                  <Minus size={12}/>
                                </button>
                                <span className="w-5 text-center text-sm font-bold text-[#003087]">{qty}</span>
                                <button onClick={() => add(item.name)} className="w-7 h-7 rounded-full bg-[#003087] flex items-center justify-center text-white hover:bg-[#002060] transition">
                                  <Plus size={12}/>
                                </button>
                              </>
                            ) : (
                              <button onClick={() => add(item.name)} className="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#003087] hover:text-[#003087] transition">
                                <Plus size={12}/>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Step 3: Triton2Go ── */}
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
              <p className="font-bold text-gray-800">🥡 Yes, it&apos;s in a Triton2Go container</p>
              <p className="text-xs text-gray-400 mt-0.5">Eco-friendly reusable container</p>
            </div>
          </button>
        </section>

        {/* ── Step 4: Screenshot + OCR ── */}
        <section>
          <Step n={4} label="Upload your Triton2Go confirmation" />
          <p className="text-xs text-gray-400 mt-1 mb-3">
            We&apos;ll automatically read your order details, student ID last 4, and pickup time from the screenshot.
          </p>

          {!file ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full bg-white border-2 border-dashed border-gray-300 rounded-2xl py-10 flex flex-col items-center gap-2 hover:border-[#003087] hover:bg-[#003087]/3 transition"
            >
              <div className="w-12 h-12 bg-[#003087]/10 rounded-full flex items-center justify-center">
                <Upload size={22} className="text-[#003087]"/>
              </div>
              <p className="text-sm font-semibold text-gray-600">Tap to upload screenshot</p>
              <p className="text-xs text-gray-400">JPG · PNG · HEIC</p>
            </button>
          ) : (
            <div className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview!} alt="screenshot" className="w-full max-h-52 object-cover"/>
                <button onClick={clearFile} className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition">
                  <X size={13}/>
                </button>
              </div>

              {/* Analysis state */}
              {analyzing && (
                <div className="px-4 py-4 bg-[#003087]/5 flex items-center gap-3">
                  <Loader2 size={18} className="text-[#003087] animate-spin flex-shrink-0"/>
                  <div>
                    <p className="text-sm font-bold text-[#003087]">Reading your screenshot…</p>
                    <p className="text-xs text-gray-400 mt-0.5">Extracting order details with AI</p>
                  </div>
                </div>
              )}

              {/* OCR success */}
              {extracted && !analyzing && (
                <div className="px-4 py-4 bg-green-50 border-t-2 border-green-200 animate-slide-up">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0"/>
                    <p className="text-sm font-bold text-green-800">Screenshot read successfully</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Student ID (last 4)", value: extracted.pid_last4 },
                      { label: "Pickup Time",          value: extracted.pickup_time },
                      { label: "Order #",              value: extracted.order_number },
                      { label: "Dining Hall",          value: extracted.dining_hall },
                    ].map(({ label, value }) => value && (
                      <div key={label} className="bg-white rounded-xl px-3 py-2 border border-green-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                        <p className="text-sm font-bold text-[#003087] mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                  {extracted.items && extracted.items.length > 0 && (
                    <div className="mt-2 bg-white rounded-xl px-3 py-2 border border-green-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Items from Screenshot</p>
                      {extracted.items.map((item: string, i: number) => (
                        <p key={i} className="text-xs text-gray-700">• {item}</p>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">This info will be sent to your Dasher automatically.</p>
                </div>
              )}

              {/* OCR error */}
              {ocrError && !analyzing && (
                <div className="px-4 py-3 bg-amber-50 border-t border-amber-200 flex items-start gap-2">
                  <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="text-xs font-bold text-amber-800">Couldn&apos;t read the screenshot automatically</p>
                    <p className="text-xs text-amber-600 mt-0.5">That&apos;s OK — your Dasher will still receive your order details.</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile}/>
        </section>

        {/* ── Step 5: Delivery Address ── */}
        <section>
          <Step n={5} label="Where should we deliver?" />
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Building</label>
              <select
                value={building}
                onChange={e => setBuilding(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition appearance-none"
              >
                {BUILDINGS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>

            {/* To-door upgrade */}
            <button
              onClick={() => setToDoor(!toDoor)}
              className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-4 transition text-left ${
                toDoor ? "bg-[#003087]/5 border-[#003087]" : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${toDoor ? "bg-[#003087] border-[#003087] scale-110" : "border-gray-300"}`}>
                {toDoor && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div>
                <p className="font-bold text-gray-800">🚪 Deliver to my room door <span className="text-[#003087]">+$2.00</span></p>
                <p className="text-xs text-gray-400 mt-0.5">Dasher will bring it directly to your door</p>
              </div>
            </button>

            {toDoor && (
              <div className="animate-fade-in flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Room Number</label>
                <input
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition"
                  placeholder="e.g. 214B"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                />
              </div>
            )}
          </div>
        </section>

      </main>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#F8FAFC]/95 backdrop-blur border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <Link
            href={canSubmit ? "/chat" : "#"}
            onClick={(e) => { if (!canSubmit) { e.preventDefault(); return; } saveAndGo(); }}
            className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl shadow-lg transition text-base ${
              canSubmit
                ? "bg-[#F5B700] text-[#003087] hover:bg-[#e0a800] active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {analyzing ? <><Loader2 size={18} className="animate-spin"/> Analyzing…</> : <>Submit Order <ChevronRight size={18}/></>}
          </Link>
          {!canSubmit && !analyzing && (
            <p className="text-center text-xs text-gray-400 mt-2">
              {!hall ? "Select a dining hall" : cartCount === 0 ? "Add at least one item" : !triton ? "Confirm Triton2Go container" : !file ? "Upload your screenshot" : toDoor && !room.trim() ? "Enter your room number" : "Almost there!"}
            </p>
          )}
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
