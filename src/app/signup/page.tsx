"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, BookOpen } from "lucide-react";

const COLLEGES = ["Revelle","Muir","Marshall","Warren","Roosevelt","Sixth","Seventh","Eighth"].map(c => c + " College");
const BUILDINGS = ["Tioga Hall","Tenaya Hall","Tahoe Hall","Shasta Hall","Anza Hall","De Anza Hall","Cuicacalli","Matthews","Rita Atkinson Residences","Mesa Nueva","Marshall Upper/Lower","Warren Apartments","Revelle Dorms"];

export default function SignUpPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [building, setBuilding] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (val: string) => {
    if (!val) { setEmailError(""); return; }
    if (!val.endsWith("@ucsd.edu")) {
      setEmailError("Must be a @ucsd.edu address");
    } else {
      setEmailError("");
    }
  };

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    email.endsWith("@ucsd.edu") &&
    username.trim() &&
    password.length >= 6 &&
    college &&
    building;

  const handleSubmit = () => {
    if (!canSubmit || submitted) return;
    setSubmitted(true);
    localStorage.setItem("user_name", `${firstName.trim()} ${lastName.trim()}`);
    localStorage.setItem("user_first", firstName.trim());
    localStorage.setItem("user_email", email);
    localStorage.setItem("user_college", college);
    localStorage.setItem("user_building", building);
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="bg-[#003087] px-6 pt-14 pb-8 text-white">
        <button onClick={() => router.back()} className="text-white/60 text-sm flex items-center gap-1 mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <h1 className="text-3xl font-black">Create account</h1>
        <p className="text-white/60 text-sm mt-1">Join the Triton Eats community</p>
      </div>

      <main className="flex-1 px-5 py-6 pb-36 flex flex-col gap-4 max-w-md mx-auto w-full">

        <SectionCard icon={<User size={15}/>} title="Account Info">
          <Field label="Username">
            <input
              type="text"
              placeholder="triton_alex"
              className={cls}
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                placeholder="••••••••"
                className={`${cls} pr-11`}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {show ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            {password && password.length < 6 && (
              <p className="text-xs text-red-500 mt-1">At least 6 characters required</p>
            )}
          </Field>
        </SectionCard>

        <SectionCard icon={<span className="text-sm">👤</span>} title="Personal Info">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name">
              <input type="text" placeholder="Alex" className={cls} value={firstName} onChange={e => setFirstName(e.target.value)}/>
            </Field>
            <Field label="Last Name">
              <input type="text" placeholder="Triton" className={cls} value={lastName} onChange={e => setLastName(e.target.value)}/>
            </Field>
          </div>
          <Field label="UCSD Email">
            <input
              type="email"
              placeholder="triton@ucsd.edu"
              className={`${cls} ${emailError ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
              value={email}
              onChange={e => { setEmail(e.target.value); validateEmail(e.target.value); }}
              onBlur={() => validateEmail(email)}
            />
            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
            {email.endsWith("@ucsd.edu") && (
              <p className="text-xs text-green-600 mt-1 font-semibold">✓ Valid UCSD email</p>
            )}
          </Field>
          <Field label="Phone">
            <input type="tel" placeholder="(619) 555-0100" className={cls} value={phone} onChange={e => setPhone(e.target.value)}/>
          </Field>
        </SectionCard>

        <SectionCard icon={<BookOpen size={15}/>} title="UCSD Info">
          <Field label="College">
            <select
              className={`${cls} appearance-none`}
              value={college}
              onChange={e => setCollege(e.target.value)}
            >
              <option value="" disabled>Select your college…</option>
              {COLLEGES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Building of Residence">
            <select
              className={`${cls} appearance-none`}
              value={building}
              onChange={e => setBuilding(e.target.value)}
            >
              <option value="" disabled>Select your building…</option>
              {BUILDINGS.map(b => <option key={b}>{b}</option>)}
            </select>
          </Field>
        </SectionCard>

      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#F8FAFC]/90 backdrop-blur border-t border-gray-100">
        <div className="max-w-md mx-auto flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitted}
            className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl shadow-lg transition text-base ${
              canSubmit
                ? "bg-[#F5B700] text-[#003087] hover:bg-[#e0a800] active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            🎓 Create My Account
          </button>
          {!canSubmit && (
            <p className="text-center text-xs text-gray-400">
              {!email ? "Enter your UCSD email" :
               !email.endsWith("@ucsd.edu") ? "Must use a @ucsd.edu email" :
               !firstName || !lastName ? "Enter your name" :
               !username ? "Choose a username" :
               password.length < 6 ? "Password must be 6+ characters" :
               !college ? "Select your college" :
               !building ? "Select your building" : "Almost there!"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const cls = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] shadow-sm transition";

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-[#003087]">{icon}</span>
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      {children}
    </div>
  );
}
