"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, ClipboardList, User } from "lucide-react";

export default function BottomNav() {
  const path = usePathname();
  const [hasActiveOrder, setHasActiveOrder] = useState(false);

  useEffect(() => {
    const check = () => setHasActiveOrder(!!localStorage.getItem("dorm_dash_order_id"));
    check();
    const id = setInterval(check, 2000);
    return () => clearInterval(id);
  }, []);

  const TABS = [
    { label: "Home",   icon: <Home size={20}/>,          href: "/home",    badge: false },
    { label: "Orders", icon: <ClipboardList size={20}/>, href: "/orders",  badge: hasActiveOrder },
    { label: "Profile",icon: <User size={20}/>,          href: "/profile", badge: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200/60 shadow-2xl z-50">
      <div className="max-w-md mx-auto flex items-center h-16">
        {TABS.map((tab) => {
          const active = path === tab.href;
          return (
            <Link key={tab.label} href={tab.href} className={`flex-1 flex flex-col items-center gap-0.5 py-2 press transition-colors relative ${active ? "text-[#003087]" : "text-gray-400 hover:text-gray-600"}`}>
              <div className={`relative transition-transform duration-300 ${active ? "scale-110 -translate-y-0.5" : ""}`}>
                {tab.icon}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F5B700] rounded-full border-2 border-white animate-glow-pulse"/>
                )}
              </div>
              <span className={`text-[10px] transition-all ${active ? "font-black" : "font-semibold"}`}>{tab.label}</span>
              {active && <span className="w-1.5 h-1.5 bg-[#F5B700] rounded-full animate-pop-in"/>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
