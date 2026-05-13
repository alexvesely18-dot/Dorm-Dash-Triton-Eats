import Link from "next/link";

export const metadata = {
  title: "Privacy & Data — Dorm Dash",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-5">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <Link href="/" className="text-[#003087] text-sm font-semibold">← Back</Link>
        <h1 className="text-3xl font-black text-gray-900 mt-4 mb-2">Privacy &amp; Data</h1>
        <p className="text-gray-500 text-sm mb-6">Last updated: 2026-05-09</p>

        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed flex flex-col gap-4">
          <p>
            Dorm Dash is an independent student-run delivery service for UCSD students. This page
            summarizes what we collect and why. We are not affiliated with UCSD&apos;s administration.
          </p>

          <h2 className="text-base font-bold text-gray-900 mt-4">What we collect</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm">
            <li><b>Name, email, phone</b> — to authenticate you and notify you of order status.</li>
            <li><b>Building &amp; room number</b> — required for delivery.</li>
            <li><b>Receipt screenshot &amp; PID last four</b> — to verify pickup at the dining hall.</li>
            <li><b>Order details</b> — items, dining hall, total — used to fulfill the delivery and for internal analytics.</li>
            <li><b>Live GPS</b> — only while a dasher is on an active delivery, only to show the live route to the student. Not retained after the order is delivered.</li>
            <li><b>In-app messages</b> — between student and dasher; deleted when the order completes.</li>
            <li><b>Delivery photo</b> — if enabled, used as proof-of-delivery and deleted after 24 hours.</li>
          </ul>

          <h2 className="text-base font-bold text-gray-900 mt-4">Who sees it</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm">
            <li><b>Your dasher</b> sees only your name, pickup PID last four, building, and room (if room delivery).</li>
            <li><b>Dorm Dash admins</b> may access individual records to resolve disputes or safety incidents only.</li>
            <li>We never sell or share data with third parties for advertising.</li>
          </ul>

          <h2 className="text-base font-bold text-gray-900 mt-4">FERPA</h2>
          <p className="text-sm">
            We do not access your UCSD academic records. Your PID last four is used solely to identify
            your Triton2Go order at the counter, never to look up registrar information.
          </p>

          <h2 className="text-base font-bold text-gray-900 mt-4">Your rights</h2>
          <p className="text-sm">
            Email <a href="mailto:privacy@dormdash.local" className="text-[#003087] font-semibold">privacy@dormdash.local</a> to
            request a copy of your data, correct it, or delete your account. Requests are honored within 30 days.
          </p>

          <h2 className="text-base font-bold text-gray-900 mt-4">Dasher liability</h2>
          <p className="text-sm">
            Dashers operate as independent contractors. They are responsible for their own
            transportation, helmet/safety gear, and any third-party insurance. Dorm Dash does
            not provide vehicle or medical insurance.
          </p>
        </div>
      </div>
    </div>
  );
}
