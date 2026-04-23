"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw, Package, Clock, CheckCircle, Bike, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/orderStore";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false, loading: () => <div className="w-full h-full bg-[#1a2035] animate-pulse"/> });

const STATUS_META: Record<OrderStatus, { label: string; color: string; dot: string }> = {
  pending:    { label: "Waiting for Dasher", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",  dot: "bg-yellow-400"  },
  claimed:    { label: "Dasher Picking Up",  color: "bg-blue-500/15 text-blue-400 border-blue-500/30",        dot: "bg-blue-400"    },
  picked_up:  { label: "En Route",           color: "bg-orange-500/15 text-orange-400 border-orange-500/30",  dot: "bg-orange-400"  },
  delivered:  { label: "Delivered",          color: "bg-green-500/15 text-green-400 border-green-500/30",     dot: "bg-green-400"   },
};

function elapsed(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [tab, setTab] = useState<"live" | "all" | "map">("live");
  const [tick, setTick] = useState(0);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignName, setAssignName] = useState("");
  const [assignTransport, setAssignTransport] = useState<"bike" | "scooter">("bike");
  const [assignCollege, setAssignCollege] = useState("");

  useEffect(() => {
    if (localStorage.getItem("admin_authed") !== "1") {
      router.replace("/admin");
    }
  }, [router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data.orders ?? []);
      setLastRefresh(new Date());
    } catch { /* retry next tick */ }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => { fetchOrders(); setTick(t => t + 1); }, 4000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_authed");
    router.push("/admin");
  };

  const assignOrder = async (orderId: string) => {
    if (!assignName.trim()) return;
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "claimed",
        dasherName: assignName.trim(),
        dasherTransport: assignTransport,
        claimedAt: new Date().toISOString(),
      }),
    });
    setAssigning(null);
    setAssignName("");
    setAssignCollege("");
    fetchOrders();
  };

  const live    = orders.filter(o => o.status !== "delivered");
  const all     = orders;
  const pending  = orders.filter(o => o.status === "pending").length;
  const active   = orders.filter(o => o.status === "claimed" || o.status === "picked_up").length;
  const delivered = orders.filter(o => o.status === "delivered").length;
  const dashers  = [...new Set(orders.filter(o => o.dasherName).map(o => o.dasherName!))];

  const displayed = tab === "live" ? live : all;
  const activeOrders = orders.filter(o => o.status === "claimed" || o.status === "picked_up");

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">

      {/* Top bar */}
      <div className="bg-[#0D1526] border-b border-white/8 px-5 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F5B700] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-[#003087] font-black text-sm">DD</span>
          </div>
          <div>
            <p className="font-black text-sm leading-tight">Dorm Dash Admin</p>
            <p className="text-white/30 text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"/>
              Live · refreshed {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchOrders} className="w-8 h-8 bg-white/6 rounded-lg flex items-center justify-center hover:bg-white/12 transition">
            <RefreshCw size={13} className="text-white/50"/>
          </button>
          <button onClick={logout} className="w-8 h-8 bg-white/6 rounded-lg flex items-center justify-center hover:bg-white/12 transition">
            <LogOut size={13} className="text-white/50"/>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Orders",   value: orders.length,  icon: <Package size={16}/>,    color: "text-white/60"       },
            { label: "Waiting",        value: pending,        icon: <Clock size={16}/>,       color: "text-yellow-400"    },
            { label: "In Progress",    value: active,         icon: <Bike size={16}/>,        color: "text-blue-400"      },
            { label: "Delivered",      value: delivered,      icon: <CheckCircle size={16}/>, color: "text-green-400"     },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/8 rounded-2xl p-4">
              <div className={`mb-2 ${s.color}`}>{s.icon}</div>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Active dashers strip */}
        {dashers.length > 0 && (
          <div className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Active Dashers</p>
            <div className="flex flex-wrap gap-2">
              {dashers.map(d => {
                const order = orders.find(o => o.dasherName === d && o.status !== "delivered");
                return (
                  <div key={d} className="flex items-center gap-2 bg-white/8 rounded-xl px-3 py-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"/>
                    <span className="text-sm font-semibold">{d}</span>
                    {order && <span className="text-white/40 text-xs">{order.dasherTransport === "scooter" ? "🛵" : "🚲"} → {order.building}</span>}
                  </div>
                );
              })}
              {dashers.length === 0 && <p className="text-white/30 text-sm">No dashers active</p>}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white/5 border border-white/8 rounded-2xl p-1 gap-1">
          {([
            { id: "live", label: `Live (${live.length})` },
            { id: "all",  label: `All Orders (${all.length})` },
            { id: "map",  label: "Map View" },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${tab === t.id ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Map view */}
        {tab === "map" && (
          <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Live Delivery Map</p>
              <span className="text-[10px] text-green-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block"/>
                {activeOrders.length} active
              </span>
            </div>
            {activeOrders.length > 0 ? (
              <div style={{ height: 300 }}>
                <LiveMap
                  hallLat={activeOrders[0].hallLat}
                  hallLng={activeOrders[0].hallLng}
                  hallName={activeOrders[0].hall}
                  hallEmoji={activeOrders[0].hallEmoji}
                  destLat={activeOrders[0].destLat}
                  destLng={activeOrders[0].destLng}
                  building={activeOrders[0].building}
                  dasherLat={activeOrders[0].dasherLat}
                  dasherLng={activeOrders[0].dasherLng}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-white/20">
                <MapPin size={32} className="mb-3"/>
                <p className="text-sm">No active deliveries right now</p>
              </div>
            )}
          </div>
        )}

        {/* Orders list */}
        {tab !== "map" && (
          <div className="flex flex-col gap-2">
            {displayed.length === 0 && (
              <div className="text-center py-16 text-white/20">
                <Package size={36} className="mx-auto mb-3"/>
                <p className="text-sm">{tab === "live" ? "No active orders right now" : "No orders yet"}</p>
              </div>
            )}

            {displayed.map(order => {
              const meta = STATUS_META[order.status];
              const isOpen = expanded === order.id;
              return (
                <div key={order.id} className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">

                  {/* Row header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/3 transition"
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot} ${order.status !== "delivered" ? "animate-pulse" : ""}`}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">{order.order_number}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>{meta.label}</span>
                      </div>
                      <p className="text-white/40 text-xs mt-0.5 truncate">
                        {order.hall} → {order.building}{order.room ? ` Rm ${order.room}` : ""}
                        {order.dasherName ? ` · ${order.dasherName}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-white/30 text-[10px]">{elapsed(order.createdAt)}</span>
                      {isOpen ? <ChevronUp size={14} className="text-white/30"/> : <ChevronDown size={14} className="text-white/30"/>}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="border-t border-white/8 px-4 py-4 flex flex-col gap-4 animate-fade-in">

                      {/* Two-col info grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Order #",       value: order.order_number },
                          { label: "Total",         value: order.total },
                          { label: "Dining Hall",   value: order.hall },
                          { label: "College",       value: order.hallCollege },
                          { label: "Deliver to",    value: order.building },
                          { label: "Delivery Area", value: order.deliveryCollege },
                          { label: "Room Delivery", value: order.toDoor ? `Yes — Room ${order.room}` : "Lobby drop-off" },
                          { label: "PID Last 4",    value: order.pid_last4 ?? "—" },
                          { label: "Pickup Time",   value: order.pickup_time ?? "—" },
                          { label: "Placed",        value: new Date(order.createdAt).toLocaleTimeString() },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-white/4 rounded-xl px-3 py-2">
                            <p className="text-white/35 text-[10px] font-bold uppercase tracking-wide">{label}</p>
                            <p className="text-sm font-semibold mt-0.5 truncate">{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Items */}
                      <div className="bg-white/4 rounded-xl px-3 py-3">
                        <p className="text-white/35 text-[10px] font-bold uppercase tracking-wide mb-2">Items</p>
                        <div className="flex flex-col gap-1">
                          {order.cart.map((item, i) => (
                            <p key={i} className="text-xs text-white/70">• {item}</p>
                          ))}
                        </div>
                      </div>

                      {/* Dasher info */}
                      {order.dasherName && (
                        <div className="bg-white/4 rounded-xl px-3 py-3 flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#F5B700] rounded-full flex items-center justify-center text-[#003087] font-black text-xs flex-shrink-0">
                            {order.dasherName.split(" ").map(n => n[0]).join("").slice(0,2)}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{order.dasherName}</p>
                            <p className="text-white/40 text-xs">
                              {order.dasherTransport === "scooter" ? "🛵 Scooter" : "🚲 Bike"}
                              {order.claimedAt ? ` · Claimed ${elapsed(order.claimedAt)}` : ""}
                              {order.dasherLat ? ` · GPS active` : ""}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Admin — Assign Dasher (pending orders only) */}
                      {order.status === "pending" && (
                        <div className="bg-white/4 rounded-xl px-3 py-3">
                          <p className="text-white/35 text-[10px] font-bold uppercase tracking-wide mb-2">Assign Dasher</p>
                          {assigning !== order.id ? (
                            <button
                              onClick={() => { setAssigning(order.id); setAssignName(""); setAssignCollege(""); }}
                              className="w-full py-2 rounded-xl bg-[#F5B700]/20 text-[#F5B700] text-sm font-bold hover:bg-[#F5B700]/30 transition"
                            >
                              + Assign a Dasher Manually
                            </button>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <input
                                placeholder="Dasher's full name"
                                value={assignName}
                                onChange={e => setAssignName(e.target.value)}
                                className="w-full bg-white/8 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                              />
                              <div className="flex gap-2">
                                {(["bike", "scooter"] as const).map(t => (
                                  <button
                                    key={t}
                                    onClick={() => setAssignTransport(t)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${assignTransport === t ? "bg-[#F5B700] text-[#003087]" : "bg-white/8 text-white/60 hover:bg-white/12"}`}
                                  >
                                    {t === "bike" ? "🚲 Bike" : "🛵 Scooter"}
                                  </button>
                                ))}
                              </div>
                              <input
                                placeholder="Dasher's college (optional — for door delivery check)"
                                value={assignCollege}
                                onChange={e => setAssignCollege(e.target.value)}
                                className="w-full bg-white/8 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                              />
                              {/* College mismatch disclaimer */}
                              {order.toDoor && assignCollege && order.deliveryCollege && assignCollege !== order.deliveryCollege && (
                                <div className="bg-yellow-500/15 border border-yellow-500/40 rounded-xl px-3 py-2.5 text-xs text-yellow-300 font-semibold leading-relaxed">
                                  ⚠️ College mismatch — this door delivery requires a <span className="text-yellow-200">{order.deliveryCollege}</span> dasher, but you&apos;re assigning someone from <span className="text-yellow-200">{assignCollege}</span>. The student may not receive their order at their door. Proceed only if no matching dasher is available.
                                </div>
                              )}
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => setAssigning(null)}
                                  className="flex-1 py-2 rounded-xl bg-white/6 text-white/60 text-sm font-semibold hover:bg-white/10 transition"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => assignOrder(order.id)}
                                  disabled={!assignName.trim()}
                                  className="flex-1 py-2 rounded-xl bg-[#F5B700] text-[#003087] text-sm font-black hover:bg-[#e0a800] transition disabled:opacity-40"
                                >
                                  Assign →
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mini live map for in-progress */}
                      {(order.status === "claimed" || order.status === "picked_up") && order.hallLat && (
                        <div className="rounded-xl overflow-hidden border border-white/8" style={{ height: 180 }}>
                          <LiveMap
                            hallLat={order.hallLat}
                            hallLng={order.hallLng}
                            hallName={order.hall}
                            hallEmoji={order.hallEmoji}
                            destLat={order.destLat}
                            destLng={order.destLng}
                            building={order.building}
                            dasherLat={order.dasherLat}
                            dasherLng={order.dasherLng}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invisible tick to force elapsed time re-renders */}
      <span className="hidden">{tick}</span>
    </div>
  );
}
