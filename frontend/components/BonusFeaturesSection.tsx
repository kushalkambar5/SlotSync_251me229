"use client";

import React, { useState } from "react";
import {
  Sparkles,
  UsersRound,
  ShieldAlert,
  BarChart4,
  MailCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";

export default function BonusFeaturesSection() {
  const [waitlistDemoStep, setWaitlistDemoStep] = useState<"initial" | "cancelled" | "promoted">("initial");

  const handleSimulateCancellation = () => {
    setWaitlistDemoStep("cancelled");
    setTimeout(() => {
      setWaitlistDemoStep("promoted");
    }, 1500);
  };

  const resetWaitlistDemo = () => {
    setWaitlistDemoStep("initial");
  };

  return (
    <section id="bonus-features" className="py-20 bg-gradient-to-b from-white via-[#FDE8EB]/20 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1F1F] mt-3 tracking-tight">
            Engineered for Campus-Scale Reliability
          </h2>
          <p className="text-gray-600 mt-2 text-base text-pretty">
            Beyond standard booking: automated waitlist queues, no-show penalties, 
            instant mailers, and real-time usage analytics.
          </p>
        </div>

        {/* 4 Bonus Feature Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          
          {/* Card 1: Interactive Waitlist & Penalty Simulation */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between hover:border-[#EF2B4D]/40 transition-colors">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FDE8EB] text-[#EF2B4D] flex items-center justify-center font-bold">
                  <UsersRound className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-rose-100 text-[#EF2B4D] rounded-full">
                  Bonus Feature #2
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-[#1F1F1F] tracking-tight">
                Automated Waitlist & 24h No-Show Penalty
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                When a desired slot is already taken, faculty can join the waitlist. If the approved user cancels, the first in line is automatically promoted and alerted immediately.
              </p>

              {/* Interactive Simulation Area */}
              <div className="mt-6 p-4 rounded-2xl bg-[#F4F5F7] border border-gray-200 space-y-3">
                <div className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Slot: Central Seminar Hall · 03:00 - 04:00 PM</span>
                  <button
                    type="button"
                    onClick={resetWaitlistDemo}
                    className="text-[11px] text-[#EF2B4D] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                {/* Primary Booking State */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Current Booking:</span>
                    <div className="text-xs font-bold text-gray-900">
                      {waitlistDemoStep === "initial"
                        ? "Dr. S. Nair (Active Approved Booking)"
                        : "Dr. S. Nair (Cancelled by Admin)"}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      waitlistDemoStep === "initial"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {waitlistDemoStep === "initial" ? "Approved" : "Cancelled"}
                  </span>
                </div>

                {/* Waitlist Position 1 */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                      Waitlist #1 in Queue:
                    </span>
                    <div className="text-xs font-bold text-gray-900">
                      Prof. Arvind (AI Dept)
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      waitlistDemoStep === "promoted"
                        ? "bg-emerald-600 text-white animate-pulse"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {waitlistDemoStep === "promoted"
                      ? "PROMOTED TO APPROVED 🚀"
                      : "Waiting in Line"}
                  </span>
                </div>

                {/* Simulation Trigger */}
                {waitlistDemoStep === "initial" && (
                  <button
                    type="button"
                    onClick={handleSimulateCancellation}
                    className="w-full py-2.5 px-4 bg-[#1F1F1F] hover:bg-black text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Simulate Booking Cancellation & Auto-Promote
                  </button>
                )}

                {waitlistDemoStep === "promoted" && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Prof. Arvind was promoted automatically. Confirmation email + calendar invite dispatched!
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Penalty Notice */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-start gap-3 text-xs text-gray-600">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>24-Hour Penalty Policy:</strong> Users who fail to show up without cancelling receive an automated 24-hour temporary booking lock to ensure fair campus resource utilization.
              </span>
            </div>
          </div>

          {/* Card 2: Administrative Analytics & Usage Intelligence */}
          <div id="analytics" className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between hover:border-[#EF2B4D]/40 transition-colors">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FDE8EB] text-[#EF2B4D] flex items-center justify-center font-bold">
                  <BarChart4 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-rose-100 text-[#EF2B4D] rounded-full">
                  Bonus Feature #3
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-[#1F1F1F] tracking-tight">
                Campus Facility Usage Analytics
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Real-time dashboard for estate officers and deans showcasing peak booking hours, most requested halls, and utilization trends across departments.
              </p>

              {/* Mock Analytics Cards */}
              <div className="mt-6 space-y-3">
                
                {/* Peak Hours Breakdown Bar */}
                <div className="p-4 bg-[#F4F5F7] rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#EF2B4D]" /> Peak Utilization Hours
                    </span>
                    <span className="text-[#EF2B4D]">10:00 AM – 12:00 PM (92% Occupancy)</span>
                  </div>
                  
                  {/* Progress bar heatmap */}
                  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-400 w-[20%]" title="08-10 AM: 20%" />
                    <div className="bg-[#EF2B4D] w-[50%]" title="10-12 PM: 92%" />
                    <div className="bg-amber-400 w-[15%]" title="12-02 PM: 30%" />
                    <div className="bg-[#EF2B4D]/80 w-[40%]" title="02-04 PM: 85%" />
                  </div>
                </div>

                {/* Top 3 Booked Facilities */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-[#F4F5F7] rounded-xl border border-gray-200">
                    <div className="text-base font-extrabold text-[#1F1F1F]">LHC-101</div>
                    <div className="text-[10px] text-gray-500">142 Bookings / Mo</div>
                  </div>
                  <div className="p-3 bg-[#F4F5F7] rounded-xl border border-gray-200">
                    <div className="text-base font-extrabold text-[#1F1F1F]">CS Hall</div>
                    <div className="text-[10px] text-gray-500">98 Bookings / Mo</div>
                  </div>
                  <div className="p-3 bg-[#F4F5F7] rounded-xl border border-gray-200">
                    <div className="text-base font-extrabold text-[#1F1F1F]">Turing Lab</div>
                    <div className="text-[10px] text-gray-500">84 Bookings / Mo</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Mailer & Alerts footnote */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-start gap-3 text-xs text-gray-600">
              <MailCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Automated Mailer Center:</strong> Built-in notification dispatcher emails approval confirmations, rejection rationales, and 30-minute pre-slot countdown alerts.
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
