import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F1F1F]">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-12">
        <p className="text-xs font-bold uppercase tracking-widest text-[#EF2B4D]">About SlotSync</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
          Paper registers are over. Meet conflict-free campus booking.
        </h1>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Booking a classroom, seminar hall, or lab at NITK still means paper
          registers, running around for signatures, and double-bookings nobody
          notices until the day. SlotSync replaces that with live availability,
          1-hour slot requests, and role-based approvals — all in one place.
        </p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: "Live availability", desc: "Every facility exposes a real-time slot grid per date, served by the backend. No guessing, no stale spreadsheets." },
            { title: "1-hour discipline", desc: "One slot per day per user, exactly 60 minutes, inside operating hours. Overlaps are rejected atomically." },
            { title: "Role-based control", desc: "Students browse read-only. Faculty and convenors book. Admins approve, reject with reasons, and manage everything." },
            { title: "Full lifecycle", desc: "Pending → approved/rejected → cancellation-requested → cancelled, with notifications and a 30-minute reminder." },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold">{c.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className="rounded-xl bg-[#EF2B4D] px-6 py-3 text-sm font-bold text-white hover:bg-[#D81E40]">Get started</Link>
          <Link href="/facilities" className="rounded-xl bg-[#F4F5F7] px-6 py-3 text-sm font-bold hover:bg-gray-200">Browse facilities</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
