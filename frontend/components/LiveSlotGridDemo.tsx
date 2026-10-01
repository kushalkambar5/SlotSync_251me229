"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Lock,
  Zap,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Info,
} from "lucide-react";

export default function LiveSlotGridDemo() {
  const [selectedFacility, setSelectedFacility] = useState("LHC-101 (Lecture Complex)");
  const [selectedDate, setSelectedDate] = useState("Today (Oct 1)");
  const [activeSlot, setActiveSlot] = useState<string | null>("10:00 - 11:00 AM");

  const facilities = [
    "LHC-101 (Lecture Complex)",
    "Central Seminar Hall",
    "Alan Turing Lab (CSE)",
    "Silver Jubilee Auditorium",
  ];

  const timeSlots = [
    { time: "08:00 - 09:00 AM", status: "booked", user: "Dr. K. Rao (Maths)", dept: "Mathematics", reason: "Calculus III" },
    { time: "09:00 - 10:00 AM", status: "booked", user: "Dr. S. Nair (CSE)", dept: "CSE", reason: "Data Structures Lecture" },
    { time: "10:00 - 11:00 AM", status: "available" },
    { time: "11:00 - 12:00 PM", status: "available" },
    { time: "12:00 - 01:00 PM", status: "pending", user: "Prof. Arvind (AI Lab)", dept: "AI & ML", reason: "Faculty Board Meet" },
    { time: "01:00 - 02:00 PM", status: "recess", user: "Campus Lunch Recess", dept: "Campus-Wide", reason: "Maintenance & Recess" },
    { time: "02:00 - 03:00 PM", status: "available" },
    { time: "03:00 - 04:00 PM", status: "booked", user: "Dr. P. Hegde (ECE)", dept: "ECE", reason: "VLSI Architecture" },
    { time: "04:00 - 05:00 PM", status: "available" },
    { time: "05:00 - 06:00 PM", status: "available" },
  ];

  return (
    <section id="live-grid" className="py-20 bg-[#F4F5F7]/60 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1F1F] mt-3 tracking-tight">
            Real-Time Slot Synchronization
          </h2>
          <p className="text-gray-600 mt-2 text-base text-pretty">
            Visualized hourly grid for all campus facilities. Guaranteed conflict-free scheduling 
            with microsecond concurrency locks.
          </p>
        </div>

        {/* Slot Grid Container */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
          
          {/* Header Bar with Facility & Date Switcher */}
          <div className="p-6 bg-[#1F1F1F] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Facility Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 mr-1">
                Facility:
              </span>
              {facilities.map((fac) => (
                <button
                  key={fac}
                  type="button"
                  onClick={() => setSelectedFacility(fac)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedFacility === fac
                      ? "bg-[#EF2B4D] text-white shadow-sm"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {fac}
                </button>
              ))}
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
              <Calendar className="w-4 h-4 text-[#EF2B4D]" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus-visible:outline-none cursor-pointer"
              >
                <option value="Today (Oct 1)" className="text-black">Today · Oct 1</option>
                <option value="Tomorrow (Oct 2)" className="text-black">Tomorrow · Oct 2</option>
                <option value="Friday (Oct 3)" className="text-black">Friday · Oct 3</option>
              </select>
            </div>
          </div>

          {/* Legend Strip */}
          <div className="px-6 py-3 bg-[#F4F5F7] border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Available (Click to Request)</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>Approved & Booked</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>Pending Admin Approval</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                <span>Maintenance / Recess</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-500 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#EF2B4D]" />
              <span>1 Slot / Day / User Enforced</span>
            </div>
          </div>

          {/* Interactive Hourly Slot Grid */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {timeSlots.map((slot, index) => {
                const isAvailable = slot.status === "available";
                const isBooked = slot.status === "booked";
                const isPending = slot.status === "pending";
                const isRecess = slot.status === "recess";
                const isSelected = activeSlot === slot.time;

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (isAvailable) {
                        setActiveSlot(slot.time);
                      }
                    }}
                    className={`rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between min-h-[110px] ${
                      isAvailable
                        ? isSelected
                          ? "border-[#EF2B4D] bg-[#FDE8EB]/40 ring-2 ring-[#EF2B4D] cursor-pointer shadow-xs"
                          : "border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/60 hover:border-emerald-400 cursor-pointer"
                        : isPending
                        ? "border-amber-200 bg-amber-50/70 text-amber-900 cursor-not-allowed"
                        : isBooked
                        ? "border-rose-200 bg-rose-50/60 text-gray-700 cursor-not-allowed"
                        : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#1F1F1F]">
                          {slot.time}
                        </span>
                        {isAvailable && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white">
                            FREE
                          </span>
                        )}
                        {isBooked && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                            BOOKED
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white">
                            PENDING
                          </span>
                        )}
                        {isRecess && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-500 text-white">
                            PAUSE
                          </span>
                        )}
                      </div>

                      {isAvailable ? (
                        <p className="text-[11px] text-emerald-800 font-medium mt-2">
                          Ready for 1-hour reservation.
                        </p>
                      ) : (
                        <div className="mt-1">
                          <p className="text-[11px] font-bold text-gray-800 truncate">
                            {slot.user}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {slot.reason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-[10px]">
                      <span className="text-gray-500 font-mono">1 Hour</span>
                      {isAvailable ? (
                        <span className="text-[#EF2B4D] font-bold flex items-center gap-0.5">
                          Select <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      ) : (
                        <span className="text-gray-400 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Slot Status */}
            <div className="mt-8 p-5 bg-[#FDE8EB]/40 border border-[#EF2B4D]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EF2B4D] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1F1F1F]">
                    Selected: {selectedFacility} · {activeSlot || "10:00 - 11:00 AM"}
                  </div>
                  <div className="text-xs text-gray-600">
                    Live availability preview for {selectedDate}.
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
