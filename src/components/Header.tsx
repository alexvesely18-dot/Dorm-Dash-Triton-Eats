"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

interface HeaderProps {
  showBack?: boolean;
  backHref?: string;
  title?: string;
}

export default function Header({ showBack, backHref = "/", title }: HeaderProps) {
  return (
    <header className="bg-[#003087] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
        {showBack && (
          <Link href={backHref} className="p-1 -ml-1 rounded-full hover:bg-white/10 transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
        )}

        {!showBack && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C69214] rounded-full flex items-center justify-center">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Dorm Dash</span>
          </div>
        )}

        {title && (
          <span className="font-semibold text-base truncate">{title}</span>
        )}

        {!showBack && (
          <div className="ml-auto">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
              A8
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
