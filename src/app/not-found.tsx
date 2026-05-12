import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-7 text-center">
        <div className="text-5xl mb-4 select-none">🍽</div>
        <h1 className="text-2xl font-black text-gray-900">Page not found</h1>
        <p className="text-sm text-gray-500 mt-2">That route isn&apos;t on the menu.</p>
        <Link
          href="/"
          className="inline-block mt-5 px-5 py-3 rounded-2xl bg-[#003087] text-white font-bold hover:bg-[#002060] transition"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
