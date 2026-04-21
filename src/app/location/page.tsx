"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Home, ChevronRight, ShoppingBag, MessageSquare } from "lucide-react";

const CAMPUS_LOCATIONS = [
  { id: "pc-east", name: "Price Center East", description: "Near Panda Express, main plaza", zone: "Central" },
  { id: "pc-west", name: "Price Center West", description: "Near the bookstore entrance", zone: "Central" },
  { id: "geisel", name: "Geisel Library (North)", description: "Front steps, ground level", zone: "Central" },
  { id: "sixth-college", name: "Sixth College Plaza", description: "Near the residence halls", zone: "Residential" },
  { id: "muir-quad", name: "Muir Quad", description: "Outside Pines dining hall", zone: "Residential" },
  { id: "revelle", name: "Revelle Plaza", description: "Outside 64 Degrees", zone: "Residential" },
  { id: "erc", name: "ERC Town Square", description: "Near OceanView Terrace", zone: "Residential" },
  { id: "warren", name: "Warren Mall", description: "Near Café Ventanas", zone: "Residential" },
  { id: "bcb", name: "Biomedical Research Bldg", description: "Main lobby, La Jolla Health", zone: "Academic" },
  { id: "cse", name: "CSE Building", description: "Main entrance, ground floor", zone: "Academic" },
];

const DORM_BUILDINGS = [
  "Tioga Hall", "Tenaya Hall", "Tahoe Hall", "Shasta Hall",
  "Anza Hall", "De Anza Hall", "Cuicacalli", "Matthews",
  "Rita Atkinson Residences", "Mesa Nueva",
];

type Mode = "campus" | "dorm";

export default function LocationPage() {
  const [mode, setMode] = useState<Mode>("campus");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedDorm, setSelectedDorm] = useState<string>("");
  const [room, setRoom] = useState("");
  const [comments, setComments] = useState("");

  const activeZones = [...new Set(CAMPUS_LOCATIONS.map((l) => l.zone))];

  const canContinue =
    mode === "campus"
      ? selectedLocation !== null
      : selectedDorm !== "" && room.trim() !== "";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#003087] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/order-queue" className="p-1 -ml-1 rounded-full hover:bg-white/10 transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#C69214] rounded-full flex items-center justify-center">
              <ShoppingBag size={13} className="text-white" />
            </div>
            <span className="font-bold">Select Location</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-4 pb-28 flex-1">
        <p className="text-sm text-gray-500 mt-5 mb-4">
          Where should your Dasher bring your order?
        </p>

        {/* Mode toggle */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-5 gap-1">
          <button
            onClick={() => setMode("campus")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${
              mode === "campus"
                ? "bg-white shadow text-[#003087]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MapPin size={15} />
            Campus Pickup
          </button>
          <button
            onClick={() => setMode("dorm")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${
              mode === "dorm"
                ? "bg-white shadow text-[#003087]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Home size={15} />
            Dorm Delivery
          </button>
        </div>

        {mode === "campus" && (
          <div>
            {activeZones.map((zone) => (
              <div key={zone} className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{zone}</p>
                <div className="flex flex-col gap-2">
                  {CAMPUS_LOCATIONS.filter((l) => l.zone === zone).map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc.id)}
                      className={`w-full text-left bg-white rounded-2xl border px-4 py-3.5 flex items-center gap-3 transition shadow-sm hover:shadow-md ${
                        selectedLocation === loc.id
                          ? "border-[#003087] ring-2 ring-[#003087]/20"
                          : "border-gray-100"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedLocation === loc.id
                            ? "bg-[#003087] text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <MapPin size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">{loc.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{loc.description}</p>
                      </div>
                      {selectedLocation === loc.id && (
                        <div className="w-5 h-5 bg-[#003087] rounded-full flex items-center justify-center flex-shrink-0">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {mode === "dorm" && (
          <div className="flex flex-col gap-4">
            {/* Dorm select */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5 px-1">
                Residence Hall
              </label>
              <select
                value={selectedDorm}
                onChange={(e) => setSelectedDorm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087] shadow-sm appearance-none"
              >
                <option value="">Select your dorm building…</option>
                {DORM_BUILDINGS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Room number */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5 px-1">
                Room Number
              </label>
              <input
                type="text"
                placeholder="e.g. 214B"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087] shadow-sm"
              />
            </div>

            {/* Dorm delivery note */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-2.5">
              <Home size={15} className="text-[#00629B] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#003087]">
                Your Dasher will deliver to your dorm room door. Make sure to be available when they arrive!
              </p>
            </div>
          </div>
        )}

        {/* Comments box */}
        <div className="mt-5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5 px-1">
            Pickup Notes (Optional)
          </label>
          <div className="relative">
            <MessageSquare size={15} className="absolute left-4 top-3.5 text-gray-400" />
            <textarea
              placeholder="E.g. I'll be wearing a blue hoodie, call when you arrive…"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087] shadow-sm"
            />
          </div>
        </div>
      </main>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <Link
            href={canContinue ? "/matching" : "#"}
            className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-2xl shadow-md transition text-sm ${
              canContinue
                ? "bg-[#003087] text-white hover:bg-[#002270] active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            onClick={(e) => !canContinue && e.preventDefault()}
          >
            Find My Dasher
            <ChevronRight size={16} />
          </Link>
          {!canContinue && (
            <p className="text-center text-xs text-gray-400 mt-2">
              {mode === "campus" ? "Select a pickup location to continue" : "Enter your dorm building and room number"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
