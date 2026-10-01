"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  Building,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Facility } from "./FacilityExplorer";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFacility?: Facility | null;
  defaultSlot?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  defaultFacility,
  defaultSlot = "10:00 - 11:00 AM",
}: BookingModalProps) {
  const [role, setRole] = useState<"faculty" | "convenor" | "student">("faculty");
  const [selectedFacilityName, setSelectedFacilityName] = useState<string>(
    defaultFacility ? defaultFacility.name : "LHC-101 (Lecture Hall)"
  );
  const [slotTime, setSlotTime] = useState<string>(defaultSlot);
  const [bookingDate, setBookingDate] = useState<string>("2026-10-01");
  const [department, setDepartment] = useState<string>("Computer Science & Engg");
  const [purpose, setPurpose] = useState<string>("Semester Guest Lecture & Seminar");
  const [submissionState, setSubmissionState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (role === "student") {
      setErrorMessage("Regular students cannot submit booking requests. Please contact your Faculty Advisor or Student Convenor.");
      setSubmissionState("error");
      return;
    }

    if (!purpose.trim()) {
      setErrorMessage("Please specify the purpose of your booking request.");
      setSubmissionState("error");
      return;
    }

    setSubmissionState("submitting");
    setTimeout(() => {
      setSubmissionState("success");
    }, 800);
  };

  const handleResetAndClose = () => {
    setSubmissionState("idle");
    setErrorMessage("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="bg-[#1F1F1F] text-white p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#EF2B4D] text-white uppercase">
                SlotSync Simulation
              </span>
              <span className="text-xs text-gray-400">1-Hour Slot Engine</span>
            </div>
            <h3 id="modal-title" className="text-xl font-bold text-white mt-1">
              Campus Infrastructure Request
            </h3>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF2B4D]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {submissionState === "success" ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-extrabold text-[#1F1F1F]">
                Request Submitted for Approval!
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Your 1-hour booking for <strong>{selectedFacilityName}</strong> on{" "}
                <strong>{bookingDate}</strong> at <strong>{slotTime}</strong> has been logged.
                The Facility Admin has been notified.
              </p>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between text-gray-600">
                  <span>Status:</span>
                  <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Pending Admin Sign-off
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Overlap Check:</span>
                  <span className="font-bold text-emerald-700">Passed (Zero Overlap)</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Automated Alert:</span>
                  <span className="font-bold text-gray-800">30-min Pre-Event Scheduled</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="mt-4 px-6 py-2.5 bg-[#EF2B4D] hover:bg-[#D81E40] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                Back to Campus Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Role Switcher */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select User Role for Request:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "faculty", label: "Faculty" },
                    { id: "convenor", label: "Convenor" },
                    { id: "student", label: "Student" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setRole(r.id as any);
                        setErrorMessage("");
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        role === r.id
                          ? "bg-[#1F1F1F] text-white shadow-xs"
                          : "bg-[#F4F5F7] text-gray-700 hover:bg-gray-200 border border-gray-200"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Blocking Notice */}
              {role === "student" && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
                  <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Student Access Restriction:</strong> Regular students have read-only access to schedules. Booking actions are blocked to maintain academic priority.
                  </div>
                </div>
              )}

              {/* Facility Picker */}
              <div>
                <label
                  htmlFor="facility-picker"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1"
                >
                  Campus Facility
                </label>
                <select
                  id="facility-picker"
                  value={selectedFacilityName}
                  onChange={(e) => setSelectedFacilityName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F5F7] rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF2B4D]"
                >
                  <option value="LHC-101 (Lecture Hall)">LHC-101 (Lecture Hall) · Capacity 120</option>
                  <option value="Central Seminar Hall">Central Seminar Hall · Capacity 250</option>
                  <option value="Alan Turing Computing Lab">Alan Turing Computing Lab · Capacity 65</option>
                  <option value="LHC-204 (Smart Classroom)">LHC-204 (Smart Classroom) · Capacity 90</option>
                  <option value="Silver Jubilee Auditorium">Silver Jubilee Auditorium · Capacity 850</option>
                </select>
              </div>

              {/* Date and Slot Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="booking-date"
                    className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1"
                  >
                    Booking Date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F5F7] rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF2B4D]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="slot-time"
                    className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1"
                  >
                    1-Hour Time Slot
                  </label>
                  <select
                    id="slot-time"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F5F7] rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF2B4D]"
                  >
                    <option value="08:00 - 09:00 AM">08:00 - 09:00 AM</option>
                    <option value="09:00 - 10:00 AM">09:00 - 10:00 AM</option>
                    <option value="10:00 - 11:00 AM">10:00 - 11:00 AM</option>
                    <option value="11:00 - 12:00 PM">11:00 - 12:00 PM</option>
                    <option value="02:00 - 03:00 PM">02:00 - 03:00 PM</option>
                    <option value="03:00 - 04:00 PM">03:00 - 04:00 PM</option>
                    <option value="04:00 - 05:00 PM">04:00 - 05:00 PM</option>
                    <option value="05:00 - 06:00 PM">05:00 - 06:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Department */}
              <div>
                <label
                  htmlFor="department-input"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1"
                >
                  Branch / Department
                </label>
                <input
                  id="department-input"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3.5 py-2.5 bg-[#F4F5F7] rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF2B4D]"
                />
              </div>

              {/* Purpose */}
              <div>
                <label
                  htmlFor="purpose-input"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1"
                >
                  Purpose of Booking
                </label>
                <textarea
                  id="purpose-input"
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. AI Research Guest Lecture by Industry Expert…"
                  className="w-full px-3.5 py-2 bg-[#F4F5F7] rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF2B4D]"
                />
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Policy note */}
              <div className="p-3 bg-[#FDE8EB]/40 rounded-xl text-[11px] text-gray-600 flex items-center justify-between">
                <span>⚡ Limit: 1 slot/day per user enforced</span>
                <span className="font-semibold text-[#EF2B4D]">Instant Overlap Check</span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={role === "student" || submissionState === "submitting"}
                  className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white transition-all flex items-center justify-center gap-2 ${
                    role === "student"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#EF2B4D] hover:bg-[#D81E40] active:scale-[0.99] shadow-sm"
                  }`}
                >
                  <span>{submissionState === "submitting" ? "Verifying Availability…" : "Submit Booking Request"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
