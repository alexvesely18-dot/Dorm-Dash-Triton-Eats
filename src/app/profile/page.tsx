"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, ChevronRight, Bell, LogOut, Lock, MapPin, BookOpen, User, ShoppingBag, Heart } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { getCollegeTheme } from "@/lib/campus";

import { BUILDINGS_BY_COLLEGE } from "@/lib/orderStore";

const COLLEGES = ["Revelle College","Muir College","Marshall College","Warren College","Roosevelt College","Sixth College","Seventh College","Eighth College"];

function useEditable(initial: string) {
  const [value, setValue] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);
  const save = (onSave?: (v: string) => void) => { setValue(draft); setEditing(false); onSave?.(draft); };
  const cancel = () => { setDraft(value); setEditing(false); };
  const open = () => { setDraft(value); setEditing(true); };
  const set = (v: string) => { setValue(v); setDraft(v); };
  return { value, draft, setDraft, editing, save, cancel, open, set };
}

export default function ProfilePage() {
  const router = useRouter();
  const firstName  = useEditable("");
  const lastName   = useEditable("");
  const phone      = useEditable("");
  const username   = useEditable("");
  const email      = useEditable("");
  const building   = useEditable("");
  const room       = useEditable("");
  const college    = useEditable("");
  const [notifOrders, setNotifOrders]  = useState(true);
  const [notifPromos, setNotifPromos]  = useState(false);
  const [adaFreeDelivery, setAdaFreeDelivery] = useState(false);
  const [showPwModal, setShowPwModal]  = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [theme, setTheme] = useState(getCollegeTheme(null));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Auth guard — bounce unauthenticated visitors back to the landing page.
    if (!localStorage.getItem("user_name") && !localStorage.getItem("user_first")) {
      router.replace("/");
      return;
    }
    const col = localStorage.getItem("user_college") ?? "";
    setTheme(getCollegeTheme(col));

    const fullName = localStorage.getItem("user_name") ?? "";
    const parts = fullName.trim().split(" ");
    firstName.set(parts[0] ?? "");
    lastName.set(parts.slice(1).join(" ") ?? "");
    email.set(localStorage.getItem("user_email") ?? "");
    college.set(col);
    building.set(localStorage.getItem("user_building") ?? "");
    phone.set(localStorage.getItem("user_phone") ?? "");
    username.set(localStorage.getItem("user_username") ?? "");
    room.set(localStorage.getItem("user_room") ?? "");
    setAdaFreeDelivery(localStorage.getItem("user_ada_free_delivery") === "true");

    try {
      const history = JSON.parse(localStorage.getItem("student_history") ?? "[]");
      const delivered = history.filter((o: { status: string }) => o.status === "delivered");
      setOrderCount(delivered.length);
      const spent = delivered.reduce((sum: number, o: { total: string }) => {
        const n = typeof o.total === "number" ? o.total : parseFloat(String(o.total).replace("$", ""));
        return sum + (isNaN(n) ? 0 : n);
      }, 0);
      setTotalSpent(spent);
    } catch {}

    setLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveField = (key: string, value: string) => {
    localStorage.setItem(key, value);
  };

  const saveFullName = () => {
    const full = `${firstName.value} ${lastName.value}`.trim();
    localStorage.setItem("user_name", full);
    localStorage.setItem("user_first", firstName.value);
  };

  const saveCollege = (val: string) => {
    localStorage.setItem("user_college", val);
    setTheme(getCollegeTheme(val));
  };

  const signOut = () => {
    // Clear every key this app owns so a shared device doesn't leak the previous
    // student's name, history, or order tracking.
    [
      "user_name","user_first","user_email","user_college","user_building",
      "user_phone","user_username","user_room","user_ada_free_delivery",
      "dorm_dash_order_id","student_history",
    ].forEach(k => localStorage.removeItem(k));
    router.push("/");
  };

  const initials = `${firstName.value[0] ?? ""}${lastName.value[0] ?? ""}`.toUpperCase() || "?";

  if (!loaded) return <div className="min-h-screen bg-[#F8FAFC]"/>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">

      <div style={{ backgroundColor: theme.accent }} className="px-5 pt-14 pb-10 text-white text-center">
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black shadow-lg" style={{ backgroundColor: theme.avatarBg, color: theme.avatarText }}>
            {initials}
          </div>
        </div>
        <h1 className="text-xl font-black">{firstName.value} {lastName.value}</h1>
        <p className="text-white/60 text-sm mt-0.5">{email.value || "No email set"}</p>
        {college.value && (
          <span className="inline-block mt-2 bg-white/15 text-white/80 text-xs font-medium px-3 py-1 rounded-full">
            {college.value}
          </span>
        )}

        {/* Order stats */}
        <div className="mt-4 flex justify-center gap-6 text-white">
          <div>
            <p className="text-xl font-black">{orderCount}</p>
            <p className="text-white/50 text-xs">Orders</p>
          </div>
          <div className="w-px bg-white/20"/>
          <div>
            <p className="text-xl font-black">${totalSpent.toFixed(2)}</p>
            <p className="text-white/50 text-xs">Total Spent</p>
          </div>
          <div className="w-px bg-white/20"/>
          <div>
            <p className="text-xl font-black">{orderCount > 0 ? "4.9" : "—"}</p>
            <p className="text-white/50 text-xs">Rating</p>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-5 -mt-3 flex flex-col gap-4 pb-4">

        {/* Quick link to orders */}
        <button
          onClick={() => router.push("/orders")}
          className="w-full flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${theme.accent}15` }}>
              <ShoppingBag size={16} style={{ color: theme.accent }}/>
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-sm">Order History</p>
              <p className="text-xs text-gray-400">{orderCount} delivered order{orderCount !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400"/>
        </button>

        {/* Personal Info */}
        <Card icon={<User size={14}/>} title="Personal Info" theme={theme.accent}>
          <EditRow label="First Name" field={firstName} onSave={saveFullName} />
          <EditRow label="Last Name"  field={lastName}  onSave={saveFullName} />
          <EditRow label="Phone" field={phone} type="tel" onSave={(v) => saveField("user_phone", v)} />
        </Card>

        {/* Account */}
        <Card icon={<Lock size={14}/>} title="Account" theme={theme.accent}>
          <EditRow label="Username" field={username} onSave={(v) => saveField("user_username", v)} />
          <EditRow label="Email"    field={email}    type="email" onSave={(v) => saveField("user_email", v)} />
          <button
            onClick={() => setShowPwModal(true)}
            className="w-full flex items-center justify-between py-3 border-t border-gray-100 mt-1"
          >
            <span className="text-sm font-semibold text-gray-700">Change Password</span>
            <ChevronRight size={15} className="text-gray-400"/>
          </button>
        </Card>

        {/* Delivery Location */}
        <Card icon={<MapPin size={14}/>} title="Delivery Location" theme={theme.accent}>
          <div className="flex flex-col gap-1 py-2">
            <p className="text-xs font-semibold text-gray-400">Building</p>
            {building.editing ? (
              <GroupedSelectEdit
                value={building.draft}
                groups={BUILDINGS_BY_COLLEGE}
                onChange={building.setDraft}
                onSave={() => { building.save((v) => saveField("user_building", v)); }}
                onCancel={building.cancel}
                accent={theme.accent}
              />
            ) : (
              <EditableRow value={building.value || "Not set"} onEdit={building.open} accent={theme.accent} />
            )}
          </div>
          <div className="flex flex-col gap-1 py-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400">Room Number</p>
            <EditRow label="" field={room} compact onSave={(v) => saveField("user_room", v)} />
          </div>
        </Card>

        {/* UCSD Info */}
        <Card icon={<BookOpen size={14}/>} title="UCSD Info" theme={theme.accent}>
          <div className="flex flex-col gap-1 py-2">
            <p className="text-xs font-semibold text-gray-400">College</p>
            {college.editing ? (
              <SelectEdit
                value={college.draft}
                options={COLLEGES}
                onChange={college.setDraft}
                onSave={() => { college.save(saveCollege); }}
                onCancel={college.cancel}
                accent={theme.accent}
              />
            ) : (
              <EditableRow value={college.value || "Not set"} onEdit={college.open} accent={theme.accent} />
            )}
          </div>
        </Card>

        {/* Notifications */}
        <Card icon={<Bell size={14}/>} title="Notifications" theme={theme.accent}>
          <ToggleRow label="Order updates" sub="Delivery status & confirmations" value={notifOrders} onChange={setNotifOrders} accent={theme.accent} />
          <ToggleRow label="Promotions"    sub="Deals and dining hall specials"  value={notifPromos} onChange={setNotifPromos} accent={theme.accent} />
        </Card>

        {/* Accessibility — read-only status. Free delivery is granted by UCSD OSD, not self-serve. */}
        <Card icon={<Heart size={14}/>} title="Accessibility" theme={theme.accent}>
          <div className="flex items-start justify-between gap-3 py-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Free delivery (ADA)</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Requires pre-approval from UCSD&apos;s Office for Students with Disabilities (OSD).
                Approved students have delivery and room fees waived automatically.
              </p>
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0 ${
                adaFreeDelivery
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}
            >
              {adaFreeDelivery ? "Approved" : "Not enrolled"}
            </span>
          </div>
          {!adaFreeDelivery && (
            <a
              href="mailto:osd@ucsd.edu?subject=Triton%20Eats%20delivery%20accommodation%20request"
              className="block w-full text-center text-xs font-bold text-[#003087] bg-[#003087]/5 hover:bg-[#003087]/10 transition rounded-xl px-3 py-2 mt-1"
            >
              Request access through OSD →
            </a>
          )}
        </Card>

        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-200 text-red-500 font-bold py-4 rounded-2xl shadow-sm hover:bg-red-50 transition active:scale-[0.98]"
        >
          <LogOut size={16}/> Sign Out
        </button>

      </main>

      <BottomNav />

      {showPwModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowPwModal(false)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-10 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5"/>
            <h2 className="text-lg font-black text-gray-900 mb-4">Change Password</h2>
            <div className="flex flex-col gap-3">
              {["Current Password","New Password","Confirm New Password"].map((label) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
                  <input type="password" placeholder="••••••••" className={inputCls}/>
                </div>
              ))}
              <button
                onClick={() => setShowPwModal(false)}
                className="mt-2 w-full text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition"
                style={{ backgroundColor: theme.accent }}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ icon, title, children, theme }: { icon: React.ReactNode; title: string; children: React.ReactNode; theme: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <span style={{ color: theme }}>{icon}</span>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</span>
      </div>
      <div className="px-4 divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function EditRow({ label, field, type, compact, onSave }: {
  label: string;
  field: ReturnType<typeof useEditable>;
  type?: string;
  compact?: boolean;
  onSave?: (v: string) => void;
}) {
  return (
    <div className={`${compact ? "" : "py-3"}`}>
      {label && <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>}
      {field.editing ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type={type || "text"}
            value={field.draft}
            onChange={e => field.setDraft(e.target.value)}
            className={`flex-1 ${inputCls}`}
          />
          <button onClick={() => field.save(onSave)} className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check size={14} className="text-white"/>
          </button>
          <button onClick={field.cancel} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <X size={14} className="text-gray-600"/>
          </button>
        </div>
      ) : (
        <EditableRow value={field.value || "Not set"} onEdit={field.open} accent="#003087" />
      )}
    </div>
  );
}

function EditableRow({ value, onEdit, accent }: { value: string; onEdit: () => void; accent: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-sm font-semibold text-gray-800">{value}</span>
      <button onClick={onEdit} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition ml-2 flex-shrink-0">
        <Pencil size={12} style={{ color: accent }}/>
      </button>
    </div>
  );
}

function SelectEdit({ value, options, onChange, onSave, onCancel, accent: _accent }: {
  value: string; options: string[];
  onChange: (v: string) => void;
  onSave: () => void; onCancel: () => void;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <select value={value} onChange={e => onChange(e.target.value)} className={`flex-1 ${inputCls} appearance-none`}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <button onClick={onSave} className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
        <Check size={14} className="text-white"/>
      </button>
      <button onClick={onCancel} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
        <X size={14} className="text-gray-600"/>
      </button>
    </div>
  );
}

function GroupedSelectEdit({ value, groups, onChange, onSave, onCancel }: {
  value: string; groups: Record<string, string[]>;
  onChange: (v: string) => void;
  onSave: () => void; onCancel: () => void;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <select value={value} onChange={e => onChange(e.target.value)} className={`flex-1 ${inputCls} appearance-none`}>
        <option value="" disabled>Select building…</option>
        {Object.entries(groups).map(([col, buildings]) => (
          <optgroup key={col} label={col}>
            {buildings.map(b => <option key={b} value={b}>{b}</option>)}
          </optgroup>
        ))}
      </select>
      <button onClick={onSave} className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
        <Check size={14} className="text-white"/>
      </button>
      <button onClick={onCancel} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
        <X size={14} className="text-gray-600"/>
      </button>
    </div>
  );
}

function ToggleRow({ label, sub, value, onChange, accent }: {
  label: string; sub: string; value: boolean; onChange: (v: boolean) => void; accent: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 relative"
        style={{ backgroundColor: value ? accent : "#E5E7EB" }}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${value ? "left-6" : "left-0.5"}`}/>
      </button>
    </div>
  );
}

const inputCls = "bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition w-full";
