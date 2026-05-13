"use client";

import { useEffect } from "react";
import Link from "next/link";

// Next.js App Router global error boundary. Catches any otherwise-uncaught render
// error so a single bad component doesn't whiteout the entire app.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface to the browser console for the dasher/student to screenshot if needed.
    // Do not leak the message or stack into any user-facing string — keeps internal
    // paths out of the UI.
    console.error("App crashed:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-7 text-center">
          <div className="text-5xl mb-4 select-none">🛵</div>
          <h1 className="text-2xl font-black text-gray-900">Something went sideways</h1>
          <p className="text-sm text-gray-500 mt-2">
            Dorm Dash hit an unexpected error. Try again, and if it keeps happening, let support know.
          </p>
          {error?.digest && (
            <p className="text-[11px] text-gray-400 font-mono mt-3">Ref: {error.digest}</p>
          )}
          <div className="flex flex-col gap-2 mt-5">
            <button
              onClick={() => reset()}
              className="w-full py-3 rounded-2xl bg-[#003087] text-white font-bold hover:bg-[#002060] transition"
            >
              Try again
            </button>
            <Link
              href="/"
              className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
            >
              Go to home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
