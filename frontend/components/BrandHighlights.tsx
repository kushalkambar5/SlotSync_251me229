"use client";

import React from "react";
import {
  FileX2,
  Clock3,
  CalendarCheck2,
  ShieldCheck,
  Zap,
  Users2,
  BellRing,
  Building,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function BrandHighlights() {
  const stats = [
    {
      value: "45+",
      label: "Campus Venues",
      desc: "LHC Classrooms, Seminar Halls & Specialized Labs",
    },
    {
      value: "0",
      label: "Double Bookings",
      desc: "Microsecond concurrency lock prevents schedule collisions",
    },
    {
      value: "< 2 min",
      label: "Request to Log",
      desc: "Instant submission replaces physical signatures",
    },
    {
      value: "100%",
      label: "RBAC Compliance",
      desc: "Strict backend validation on Faculty, Admin & Student routes",
    },
  ];

  return (
    <section className="py-16 bg-[#F4F5F7]/70 border-y border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs text-center hover:border-[#EF2B4D]/40 transition-colors"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-[#EF2B4D] tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm font-bold text-[#1F1F1F] mt-1">
                {stat.label}
              </div>
              <div className="text-xs text-gray-500 mt-1 leading-normal">
                {stat.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Before vs After Problem Solution Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-sm">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] mt-3 tracking-tight">
              Why NITK is Moving Away from Paper Registers
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Managing high-demand seminar halls, lecture complexes, and labs requires modern automated synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* The Old Way */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm mb-4">
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <span>The Legacy Paper Approach</span>
                </div>
                
                <ul className="space-y-3.5 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                    <span><strong>Physical Register Books:</strong> Running between HOD offices and facility managers for manual signatures.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                    <span><strong>Double-Booking Blindspots:</strong> Two clubs or classes arriving at the same hall on event day with conflicting paper receipts.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                    <span><strong>Zero Student Visibility:</strong> Students cannot check whether a lecture hall or lab is occupied or undergoing maintenance.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                    <span><strong>Manual Cancellations & Ghost Halls:</strong> Cancelled slots remain empty because other waitlisted faculty are never informed.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400 font-medium italic">
                Result: High admin friction, resource wastage & scheduling chaos.
              </div>
            </div>

            {/* The SlotSync Way */}
            <div className="p-6 rounded-2xl bg-[#FDE8EB]/30 border-2 border-[#EF2B4D]/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#EF2B4D] font-bold text-sm mb-4">
                  <CheckCircle2 className="w-5 h-5 text-[#EF2B4D]" />
                  <span>The SlotSync Synchronized Standard</span>
                </div>
                
                <ul className="space-y-3.5 text-xs sm:text-sm text-gray-800">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#EF2B4D] mt-0.5 shrink-0" />
                    <span><strong>1-Click Digital Requests:</strong> Faculty and convenors choose 1-hour slots with instant database validation.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#EF2B4D] mt-0.5 shrink-0" />
                    <span><strong>Atomic Overlap Prevention:</strong> Backend transaction isolation guarantees two approved bookings never collide.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#EF2B4D] mt-0.5 shrink-0" />
                    <span><strong>Automated Waitlist & 30-Min Alerts:</strong> Cancellations trigger automatic promotion to first in line, plus pre-slot reminders.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#EF2B4D] mt-0.5 shrink-0" />
                    <span><strong>Role-Based Administrative Control:</strong> Admins approve/reject with logged reasons, toggle maintenance, and monitor peak analytics.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EF2B4D]/20 text-xs font-semibold text-[#EF2B4D]">
                Result: Transparent, conflict-free, high-efficiency campus operations.
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
