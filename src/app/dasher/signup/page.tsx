"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Check, ChevronRight, Upload, X, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

const STEPS = ["Account", "Student ID", "Transport"];
const COLLEGES = ["Revelle College","Muir College","Marshall College","Warren College","Roosevelt College","Sixth College","Seventh College","Eighth College"];

export default function DasherSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPw, setShowPw] = useState(false);

  // Step 1 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("Sixth College");

  // Step 2 fields
  const [pid, setPid] = useState("");
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 3 fields
  const [transport, setTransport] = useState<"bike" | "scooter" | "">("");

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canNext = [
    firstName && lastName && email && phone && password.length >= 6 && college,
    pid.length >= 7 && idPhoto,
    !!transport,
  ][step];

  const onIdPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setIdPhoto(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#003087]">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-6 pt-14 pb-8 text-white">
        <div className="animate-float text-5xl mb-4 select-none">🛵</div>
        <h1 className="text-3xl font-black tracking-tight">Become a Dasher</h1>
        <p className="text-white/60 mt-1.5 text-sm">Earn money delivering on campus</p>

        {/* Step dots */}
        <div className="flex items-center gap-2 mt-5">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all ${
                i < step ? "bg-[#F5B700] text-[#003087]"
                : i === step ? "bg-white text-[#003087]"
                : "bg-white/20 text-white/50"
              }`}>
                {i < step ? <Check size={13}/> : i + 1}
              </div>
              <span className={`text-xs font-semibold ${i === step ? "text-white" : "text-white/40"}`}>{label}</span>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-white/25 mx-1"/>}
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 bg-[#F8FAFC] rounded-t-[2rem] px-6 pt-8 pb-10 shadow-2xl">

        {/* Step 1: Account Info */}
        {step === 0 && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Account Info</h2>
              <p className="text-gray-400 text-sm mt-0.5">Create your dasher account</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name">
                <input className={inp} placeholder="Alex" value={firstName} onChange={e => setFirstName(e.target.value)}/>
              </Field>
              <Field label="Last Name">
                <input className={inp} placeholder="Triton" value={lastName} onChange={e => setLastName(e.target.value)}/>
              </Field>
            </div>
            <Field label="UCSD Email">
              <input className={inp} type="email" placeholder="triton@ucsd.edu" value={email} onChange={e => setEmail(e.target.value)}/>
            </Field>
            <Field label="Phone Number">
              <input className={inp} type="tel" placeholder="(619) 555-0100" value={phone} onChange={e => setPhone(e.target.value)}/>
            </Field>
            <Field label="Password">
              <div className="relative">
                <input className={`${inp} pr-11`} type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}/>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="text-xs text-red-500 mt-1">At least 6 characters required</p>
              )}
            </Field>
            <Field label="Your College">
              <select className={`${inp} appearance-none`} value={college} onChange={e => setCollege(e.target.value)}>
                {COLLEGES.map(c => <option key={c}>{c}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">Used to match you with door-delivery orders in your college area</p>
            </Field>
          </div>
        )}

        {/* Step 2: Student ID Verification */}
        {step === 1 && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Student ID Verify</h2>
              <p className="text-gray-400 text-sm mt-0.5">Only UCSD students can dash</p>
            </div>

            <Field label="Student PID Number">
              <input
                className={inp}
                placeholder="A12345678"
                value={pid}
                onChange={e => setPid(e.target.value.toUpperCase())}
                maxLength={10}
              />
              <p className="text-xs text-gray-400 mt-1">Found on your UCSD student ID card</p>
            </Field>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Upload Student ID Card Photo</p>
              {!idPhoto ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full bg-white border-2 border-dashed border-gray-300 rounded-2xl py-10 flex flex-col items-center gap-2 hover:border-[#003087] hover:bg-[#003087]/3 transition"
                >
                  <div className="w-12 h-12 bg-[#003087]/10 rounded-full flex items-center justify-center">
                    <Upload size={22} className="text-[#003087]"/>
                  </div>
                  <p className="text-sm font-semibold text-gray-600">Tap to upload ID photo</p>
                  <p className="text-xs text-gray-400">Front of your UCSD student ID</p>
                </button>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border-2 border-green-300 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={idPhoto} alt="Student ID" className="w-full max-h-48 object-cover"/>
                  <button
                    onClick={() => { setIdPhoto(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white"
                  >
                    <X size={13}/>
                  </button>
                  <div className="bg-green-50 px-4 py-2 flex items-center gap-2 border-t border-green-200">
                    <Check size={14} className="text-green-600"/>
                    <p className="text-xs font-bold text-green-700">ID photo uploaded</p>
                  </div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onIdPhoto}/>
            </div>

            <div className="bg-[#003087]/5 rounded-2xl px-4 py-3 flex gap-3">
              <span className="text-xl flex-shrink-0">🔒</span>
              <p className="text-xs text-gray-600 leading-relaxed">Your ID is only used to verify UCSD enrollment. It is never stored or shared.</p>
            </div>
          </div>
        )}

        {/* Step 3: Transportation */}
        {step === 2 && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">How will you dash?</h2>
              <p className="text-gray-400 text-sm mt-0.5">Choose your transportation method</p>
            </div>
            <div className="flex flex-col gap-3">
              {([
                { id: "bike", emoji: "🚲", label: "Bike", sub: "Perfect for short campus routes" },
                { id: "scooter", emoji: "🛵", label: "Scooter", sub: "Cover more ground, faster pickups" },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTransport(t.id)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition text-left ${
                    transport === t.id
                      ? "border-[#003087] bg-[#003087]/5 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <span className="text-4xl">{t.emoji}</span>
                  <div className="flex-1">
                    <p className={`font-bold text-lg ${transport === t.id ? "text-[#003087]" : "text-gray-800"}`}>{t.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.sub}</p>
                  </div>
                  {transport === t.id && (
                    <div className="w-7 h-7 bg-[#003087] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white"/>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {transport && (
              <div className="animate-fade-in bg-[#F5B700]/15 rounded-2xl px-4 py-3 flex gap-3">
                <span className="text-xl flex-shrink-0">{transport === "bike" ? "🚲" : "🛵"}</span>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  {transport === "bike"
                    ? "Biking is great for quick hops between nearby dorms and dining halls."
                    : "Scooter dashes earn a +$0.50 distance bonus on deliveries over 0.5 miles."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={back} className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">
              ← Back
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={next}
              disabled={!canNext}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition text-base ${
                canNext
                  ? "bg-[#F5B700] text-[#003087] hover:bg-[#e0a800] shadow-lg active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue <ChevronRight size={18}/>
            </button>
          ) : (
            <button
              onClick={() => {
                if (!canNext) return;
                localStorage.setItem("dasher_name", `${firstName} ${lastName}`);
                localStorage.setItem("dasher_college", college);
                localStorage.setItem("dasher_transport", transport);
                router.push("/dasher/home");
              }}
              disabled={!canNext}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition text-base ${
                canNext
                  ? "bg-[#F5B700] text-[#003087] hover:bg-[#e0a800] shadow-lg active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Start Dashing 🛵
            </button>
          )}
        </div>

        {step === 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Already a dasher?{" "}
            <Link href="/dasher" className="text-[#003087] font-semibold">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inp = "w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition";
