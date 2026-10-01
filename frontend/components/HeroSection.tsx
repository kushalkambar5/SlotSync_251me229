"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Users,
  Bell,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  Check,
  Zap,
} from "lucide-react";

export default function HeroSection() {
  const [selectedSlot, setSelectedSlot] = useState<string>("10:00 - 11:00 AM");
  const [isSimulatedBooked, setIsSimulatedBooked] = useState(false);

  const sampleSlots = [
    { time: "09:00 - 10:00 AM", status: "booked", by: "Physics Dept" },
    { time: "10:00 - 11:00 AM", status: "available" },
    { time: "11:00 - 12:00 PM", status: "available" },
    { time: "02:00 - 03:00 PM", status: "available" },
    { time: "03:00 - 04:00 PM", status: "booked", by: "CSE Seminar" },
  ];

  const handleSimulateBook = () => {
    setIsSimulatedBooked(true);
    setTimeout(() => {
      setIsSimulatedBooked(false);
    }, 4000);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FDE8EB]/30 via-white to-white pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Background ambient gradient and dot pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-10 -left-20 w-96 h-96 bg-[#EF2B4D]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-[#EF2B4D]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines, Value Prop, CTAs, 4 Pillars */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Main Headline with Brand Red Accent */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-[#1F1F1F] tracking-tight leading-[1.12] text-balance">
              Your Campus Spaces,{" "}
              <span className="text-[#EF2B4D] block sm:inline">
                Just a Few Clicks Away.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl text-pretty">
              Eliminate paper registers, manual signatures, and accidental double-bookings. 
              <strong> SlotSync</strong> gives NITK faculty, convenors, and students transparent 
              live availability, rapid 1-hour slot requests, and role-based automated approvals.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <a
                href=""
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold text-white bg-[#EF2B4D] hover:bg-[#D81E40] active:scale-[0.98] rounded-xl shadow-md hover:shadow-lg hover:shadow-[#EF2B4D]/20 transition-all focus-visible:ring-2 focus-visible:ring-[#EF2B4D] focus-visible:ring-offset-2"
              >
                <span>Signup</span>
              </a>

              <a
                href=""
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-[#1F1F1F] bg-[#F4F5F7] hover:bg-gray-200 active:scale-[0.98] rounded-xl border border-gray-200 transition-colors focus-visible:ring-2 focus-visible:ring-[#EF2B4D]"
              >
                <span>Login</span>
              </a>
            </div>

            {/* 4 Brand Pillars (directly from SlotSync Brand Identity Guide) */}
            <div className="mt-10 pt-8 border-t border-gray-200/80 w-full">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 border border-gray-100 shadow-xs hover:border-[#EF2B4D]/30 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#FDE8EB] text-[#EF2B4D] shrink-0">
                    <Calendar className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-[#1F1F1F] truncate">
                      Book Rooms
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      1-Click Request
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 border border-gray-100 shadow-xs hover:border-[#EF2B4D]/30 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#FDE8EB] text-[#EF2B4D] shrink-0">
                    <Users className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-[#1F1F1F] truncate">
                      Check Availability
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      Real-Time Matrix
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 border border-gray-100 shadow-xs hover:border-[#EF2B4D]/30 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#FDE8EB] text-[#EF2B4D] shrink-0">
                    <Bell className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-[#1F1F1F] truncate">
                      Get Notified
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      30-Min Alerts
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 border border-gray-100 shadow-xs hover:border-[#EF2B4D]/30 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#FDE8EB] text-[#EF2B4D] shrink-0">
                    <Building2 className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-[#1F1F1F] truncate">
                      All in One Place
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      Centralized Hub
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Hero Concept Visual matching Brand Identity Guide */}
          <div className="lg:col-span-5 relative">
            
            {/* Main Styled Hero Card with crimson slant and interactive booking preview */}
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-2xl border border-gray-200/90">
              
              {/* Crimson Brand Header banner */}
              <div className="relative bg-gradient-to-br from-[#EF2B4D] via-[#D81E40] to-[#990F28] p-6 text-white overflow-hidden">
                {/* Diagonal light texture */}
                <div className="absolute inset-0 bg-white/5 bg-grid-pattern opacity-30" />
                
                {/* Angled Brand Badge (from Brand Identity Guide) */}
                <div className="absolute -right-6 -top-2 transform rotate-12 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-lg border border-white/20 text-[10px] font-extrabold tracking-wider uppercase text-white shadow-md">
                  SAME CAMPUS · MORE POSSIBILITIES
                </div>

                <div className="relative z-10">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-rose-100/90">
                    S L O T S Y N C
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black mt-1 leading-tight text-white tracking-tight">
                    Spaces for Every Possibility
                  </h2>
                  <p className="text-[11px] tracking-wider uppercase font-semibold text-rose-100 mt-2">
                    CLASSROOMS · SEMINAR HALLS · LABS · AND MORE
                  </p>
                </div>
              </div>

              {/* Interactive Mock Venue Card */}
              <div className="p-6 bg-white space-y-4">
                
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#1F1F1F]">
                        LH-101 (Lecture Hall)
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Available
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      Lecture Hall Complex · Ground Floor · Capacity: 120
                    </p>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 bg-[#F4F5F7] text-gray-700 rounded-md border border-gray-200 shrink-0">
                    08:00 AM – 06:00 PM
                  </span>
                </div>

                {/* Live Slot Selection Chips */}
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-2">
                    <span>Select 1-Hour Slot for Today:</span>
                    <span className="text-[#EF2B4D] font-semibold text-[11px]">
                      1 Slot/Day Policy
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sampleSlots.map((slot) => {
                      const isSelected = selectedSlot === slot.time;
                      const isBooked = slot.status === "booked";

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isBooked
                              ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed line-through"
                              : isSelected
                              ? "bg-[#EF2B4D] text-white shadow-sm ring-2 ring-[#EF2B4D]/30"
                              : "bg-[#F4F5F7] text-gray-700 hover:bg-[#FDE8EB] hover:text-[#EF2B4D] border border-gray-200"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {slot.time}
                          </span>
                          {isBooked ? (
                            <span className="text-[10px] font-normal">
                              {slot.by}
                            </span>
                          ) : isSelected ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              Free
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instant Simulation Action */}
                <div className="pt-2 border-t border-gray-100 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      Requesting as:{" "}
                      <span className="font-bold text-[#1F1F1F]">
                        Faculty / Convenor
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                      <Zap className="w-3 h-3" /> Auto Overlap Check Passed
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateBook}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#EF2B4D] hover:bg-[#D81E40] active:scale-[0.99] shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>Instant Request for {selectedSlot}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {isSimulatedBooked && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Request Submitted Successfully!</strong> Admin
                        has been notified with zero slot conflict. 30-min
                        reminder will fire before slot start.
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Feature highlights strip */}
              <div className="bg-[#1F1F1F] p-3 text-white text-xs flex items-center justify-between px-6">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-[#EF2B4D]" />
                  Atomic Overlap Prevention
                </span>
                <span className="text-[11px] text-rose-300 font-medium">
                  Strict 1-Hour Constraint
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
