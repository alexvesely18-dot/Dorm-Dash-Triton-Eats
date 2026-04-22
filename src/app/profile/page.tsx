"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Check, X, ChevronRight, Bell, LogOut, Lock, MapPin, BookOpen, User } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const COLLEGES = ["Revelle College","Muir College","Marshall College","Warren College","Roosevelt College","Sixth College","Seventh College","Eighth College"];
const BUILDINGS = ["Tioga Hall","Tenaya Hall","Tahoe Hall","Shasta Hall","Anza Hall","De Anza Hall","Cuicacalli","Matthews","Rita Atkinson Residences","Mesa Nueva","Marshall Upper/Lower","Warren Apartments","Revelle Dorms"];

type Field = { label: string; value: string; type?: string };

function useEditable(initial: string) {
  const [value, setValue] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);
  const save = () => { setValue(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };
  const open = () => { setDraft(value); setEditing(true); };
  return { value, draft, setDraft, editing, save, cancel, open };
}

export default function ProfilePage() {
  const firstName  = useEditable("Alex");
  const lastName   = useEditable("Triton");
  const phone      = useEditable("(619) 555-0100");
  const username   = useEditable("triton_alex");
  const email      = useEditable("atriton@ucsd.edu");
  const building   = useEditable("Tioga Hall");
  const room       = useEditable("214B");
  const college    = useEditable("Sixth College");

  const [notifOrders, setNotifOrders]  = useState(true);
  const [notifPromos, setNotifPromos]  = useState(false);
  const [showPwModal, setShowPwModal]  = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">

      {/* Header */}
      <div className="bg-[#003087] px-5 pt-14 pb-10 text-white text-center">
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 bg-[#F5B700] rounded-full flex items-center justify-center text-[#003087] text-2xl font-black shadow-lg">
            AT
          </div>
          <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
            <Pencil size={12} className="text-[#003087]"/>
          </button>
        </div>
        <h1 className="text-xl font-black">{firstName.value} {lastName.value}</h1>
        <p className="text-white/60 text-sm mt-0.5">{email.value}</p>
        <span className="inline-block mt-2 bg-white/15 text-white/80 text-xs font-medium px-3 py-1 rounded-full">
          {college.value}
        </span>
      </div>

      <main className="max-w-md mx-auto px-5 -mt-3 flex flex-col gap-4 pb-4">

        {/* Personal Info */}
        <Card icon={<User size={14}/>} title="Personal Info">
          <EditRow label="First Name" field={firstName} />
          <EditRow label="Last Name"  field={lastName}  />
          <EditRow label="Phone"      field={phone} type="tel" />
        </Card>

        {/* Account */}
        <Card icon={<Lock size={14}/>} title="Account">
          <EditRow label="Username" field={username} />
          <EditRow label="Email"    field={email}    type="email" />
          <button
            onClick={() => setShowPwModal(true)}
            className="w-full flex items-center justify-between py-3 border-t border-gray-100 mt-1"
          >
            <span className="text-sm font-semibold text-gray-700">Change Password</span>
            <ChevronRight size={15} className="text-gray-400"/>
          </button>
        </Card>

        {/* Delivery Location */}
        <Card icon={<MapPin size={14}/>} title="Delivery Location">
          <div className="flex flex-col gap-1 py-2">
            <p className="text-xs font-semibold text-gray-400">Building</p>
            {building.editing ? (
              <SelectEdit
                value={building.draft}
                options={BUILDINGS}
                onChange={building.setDraft}
                onSave={building.save}
                onCancel={building.cancel}
              />
            ) : (
              <EditableRow value={building.value} onEdit={building.open} />
            )}
          </div>
          <div className="flex flex-col gap-1 py-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400">Room Number</p>
            <EditRow label="" field={room} compact />
          </div>
        </Card>

        {/* UCSD Info */}
        <Card icon={<BookOpen size={14}/>} title="UCSD Info">
          <div className="flex flex-col gap-1 py-2">
            <p className="text-xs font-semibold text-gray-400">College</p>
            {college.editing ? (
              <SelectEdit
                value={college.draft}
                options={COLLEGES}
                onChange={college.setDraft}
                onSave={college.save}
                onCancel={college.cancel}
              />
            ) : (
              <EditableRow value={college.value} onEdit={college.open} />
            )}
          </div>
        </Card>

        {/* Notifications */}
        <Card icon={<Bell size={14}/>} title="Notifications">
          <ToggleRow label="Order updates" sub="Delivery status & confirmations" value={notifOrders} onChange={setNotifOrders} />
          <ToggleRow label="Promotions"    sub="Deals and dining hall specials"  value={notifPromos} onChange={setNotifPromos} />
        </Card>

        {/* Sign Out */}
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-200 text-red-500 font-bold py-4 rounded-2xl shadow-sm hover:bg-red-50 transition active:scale-[0.98]"
        >
          <LogOut size={16}/> Sign Out
        </Link>

      </main>

      <BottomNav />

      {/* Change Password Modal */}
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
                className="mt-2 w-full bg-[#003087] text-white font-bold py-3.5 rounded-2xl hover:bg-[#002060] transition"
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

/* ── Sub-components ── */

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <span className="text-[#003087]">{icon}</span>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</span>
      </div>
      <div className="px-4 divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function EditRow({ label, field, type, compact }: {
  label: string;
  field: ReturnType<typeof useEditable>;
  type?: string;
  compact?: boolean;
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
          <button onClick={field.save} className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check size={14} className="text-white"/>
          </button>
          <button onClick={field.cancel} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <X size={14} className="text-gray-600"/>
          </button>
        </div>
      ) : (
        <EditableRow value={field.value} onEdit={field.open} />
      )}
    </div>
  );
}

function EditableRow({ value, onEdit }: { value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-sm font-semibold text-gray-800">{value}</span>
      <button onClick={onEdit} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#003087]/10 transition ml-2 flex-shrink-0">
        <Pencil size={12} className="text-[#003087]"/>
      </button>
    </div>
  );
}

function SelectEdit({ value, options, onChange, onSave, onCancel }: {
  value: string; options: string[];
  onChange: (v: string) => void;
  onSave: () => void; onCancel: () => void;
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

function ToggleRow({ label, sub, value, onChange }: {
  label: string; sub: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 relative ${value ? "bg-[#003087]" : "bg-gray-200"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${value ? "left-6" : "left-0.5"}`}/>
      </button>
    </div>
  );
}

const inputCls = "bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition w-full";
