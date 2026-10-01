import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqs = [
  { q: "Who can book a facility?", a: "Faculty and convenors (users with the book_facility permission) can request 1-hour slots. Students can browse facilities and view live availability read-only — the booking action is hidden and blocked at the API." },
  { q: "How long is a slot?", a: "Every booking is exactly 1 hour, inside the facility's operating hours, with a limit of 1 active slot per day per user." },
  { q: "What happens after I request?", a: "Your booking becomes PENDING. An admin approves or rejects it (a reason is required for rejection) and you are notified." },
  { q: "How do cancellations work?", a: "Owners of approved bookings can request cancellation with a reason. The booking moves to CANCELLATION_REQUESTED until an admin approves (→ CANCELLED) or rejects (→ back to APPROVED) it." },
  { q: "Will I be reminded?", a: "Yes — the backend sends a reminder notification 30 minutes before your approved slot." },
  { q: "What if my slot gets taken?", a: "If someone else books a slot you were viewing, the backend rejects your request with a conflict. Refresh availability and pick another slot — or join the waitlist." },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F1F1F]">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
        <p className="text-xs font-bold uppercase tracking-widest text-[#EF2B4D]">FAQ</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Frequently asked questions</h1>
        <div className="mt-8 flex flex-col gap-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-gray-200 p-5 open:ring-1 open:ring-[#EF2B4D]/30">
              <summary className="cursor-pointer font-bold">{f.q}</summary>
              <p className="mt-2 text-sm text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-sm text-gray-600">
          Ready to book? <Link href="/register" className="font-bold text-[#EF2B4D] hover:underline">Create an account</Link> or <Link href="/login" className="font-bold text-[#EF2B4D] hover:underline">log in</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
