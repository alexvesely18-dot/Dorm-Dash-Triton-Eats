"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, User } from "lucide-react";

const TABS = [
  { label: "Home",   icon: <Home size={20}/>,          href: "/home"    },
  { label: "Orders", icon: <ClipboardList size={20}/>, href: "/orders"  },
  { label: "Profile",icon: <User size={20}/>,          href: "/profile" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-50">
      <div className="max-w-md mx-auto flex items-center h-16">
        {TABS.map((tab) => {
          const active = path === tab.href;
          return (
            <Link key={tab.label} href={tab.href} className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition ${active ? "text-[#003087]" : "text-gray-400 hover:text-gray-600"}`}>
              {tab.icon}
              <span className="text-[10px] font-semibold">{tab.label}</span>
              {active && <span className="w-1.5 h-1.5 bg-[#F5B700] rounded-full"/>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
