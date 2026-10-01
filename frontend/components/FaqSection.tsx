"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Shield, CheckCircle2 } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FaqItem[] = [
  {
    question: "Who is authorized to create booking requests in SlotSync?",
    answer:
      "Faculty members and designated student Convenors (e.g. club leads, fest coordinators) are authorized to submit booking requests. Regular students have read-only access to view schedules and real-time availability across all campus facilities. Student booking requests are blocked at both UI and API levels.",
    category: "Roles & Permissions",
  },
  {
    question: "What are the rules and constraints for requesting a slot?",
    answer:
      "All booking requests must be for a 1-hour duration within the facility's official operating hours. To ensure fair access across departments, users are limited to a maximum of 1 active booking request per day. Facilities marked under maintenance cannot be booked.",
    category: "Booking Rules",
  },
  {
    question: "How does the Zero-Overlap guarantee prevent double bookings?",
    answer:
      "SlotSync uses atomic relational database transactions with microsecond concurrency checks. When an admin approves a request or a slot is submitted, the slot time window is immediately verified against existing approved bookings. Two approved bookings can never occupy the same room and slot.",
    category: "Architecture & Security",
  },
  {
    question: "How does the automated waitlist and cancellation promotion work?",
    answer:
      "When a desired slot is occupied, authorized users can join the slot's waitlist. If the primary booking is cancelled (upon Admin sign-off), the first user in the waitlist queue is promoted automatically to approved status, and an instant email notification is dispatched.",
    category: "Waitlist & Workflow",
  },
  {
    question: "What happens if someone books a hall but does not show up?",
    answer:
      "To prevent campus space wastage, SlotSync incorporates a no-show penalty module. If a booked facility is left unutilized without a prior cancellation request, the requester receives an automated 24-hour restriction on new booking requests.",
    category: "Fair Use Policy",
  },
  {
    question: "What is the Configurable RBAC bonus capability?",
    answer:
      "Admins have access to a dynamic Role & Permission builder. Instead of hardcoded role strings, permissions like `view_facilities`, `book_facility`, `cancel_booking`, `approve_booking`, `manage_facilities`, and `view_analytics` are stored in database tables, allowing custom roles (like Dean, Lab Technician) to be created without touching backend code.",
    category: "Advanced Features",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-[#F4F5F7]/80 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDE8EB] text-xs font-bold text-[#EF2B4D] uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1F1F] mt-3 tracking-tight">
            Everything You Need to Know About SlotSync
          </h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base text-pretty">
            Clear guidelines on role permissions, 1-hour slot allocations, waitlist queues, and administrative rules.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-[#EF2B4D]/40 ring-1 ring-[#EF2B4D]/20 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF2B4D]"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#EF2B4D] bg-[#FDE8EB] px-2 py-0.5 rounded">
                      Q{index + 1}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#1F1F1F]">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#EF2B4D]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-gray-100 animate-in fade-in">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Topic:
                      </span>
                      <span className="text-[11px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Need Help Card */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#1F1F1F]">
              Have questions about your department’s facility allocation?
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Contact the Estate Office & Facility Management Deanery at NITK Surathkal.
            </p>
          </div>
          <a
            href="mailto:facilities@nitk.edu.in"
            className="px-4 py-2 bg-[#1F1F1F] text-white hover:bg-black text-xs font-bold rounded-xl transition-colors shrink-0"
          >
            Contact Facility Support
          </a>
        </div>

      </div>
    </section>
  );
}
