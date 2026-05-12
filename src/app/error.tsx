"use client";

import { useEffect } from "react";
import Link from "next/link";

// Route-segment error boundary. Catches errors thrown in a route segment so the
// layout/header/nav stays mounted and the user can recover without a full reload.
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Route error:", error); }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center">
        <div className="text-4xl mb-3 select-none">⚠️</div>
        <h2 className="text-xl font-black text-gray-900">Couldn&apos;t load this page</h2>
        <p className="text-sm text-gray-500 mt-1.5">Hit refresh or head back home.</p>
        {error?.digest && <p className="text-[11px] text-gray-400 font-mono mt-3">Ref: {error.digest}</p>}
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={() => reset()}
            className="w-full py-3 rounded-2xl bg-[#003087] text-white font-bold hover:bg-[#002060] transition"
          >
            Try again
          </button>
          <Link href="/" className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
