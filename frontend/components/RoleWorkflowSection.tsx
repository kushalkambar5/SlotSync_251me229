"use client";

import React, { useState } from "react";
import {
  Shield,
  GraduationCap,
  Briefcase,
  Sliders,
  Check,
  X,
  Lock,
  ArrowRight,
  Bell,
  Clock,
  CalendarCheck,
  Ban,
  FileText,
  UserCheck,
  Settings2,
} from "lucide-react";

export default function RoleWorkflowSection() {
  const [activeTab, setActiveTab] = useState<"faculty" | "admin" | "student" | "rbac">("faculty");

  const roles = [
    {
      id: "faculty",
      label: "Faculty & Convenor",
      icon: Briefcase,
      badge: "Full Booking Access",
      color: "bg-[#EF2B4D]",
    },
    {
      id: "admin",
      label: "Facility Manager / Admin",
      icon: Shield,
      badge: "Approval & Management Authority",
      color: "bg-[#1F1F1F]",
    },
    {
      id: "student",
      label: "Regular Student",
      icon: GraduationCap,
      badge: "Read-Only Transparency",
      color: "bg-blue-600",
    },
    {
      id: "rbac",
      label: "Configurable RBAC (Bonus)",
      icon: Settings2,
      badge: "Dynamic DB-Driven Roles",
      color: "bg-purple-600",
    },
  ];

  return (
    <section id="roles" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDE8EB] text-xs font-bold text-[#EF2B4D] uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            Role-Based Access Control
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1F1F] mt-3 tracking-tight">
            Tailored Experiences for Every Campus Stakeholder
          </h2>
          <p className="text-gray-600 mt-2 text-base text-pretty">
            Strict role enforcement at both UI presentation and backend API route layers ensures zero unauthorized booking attempts.
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2">
          <div className="flex bg-[#F4F5F7] p-1.5 rounded-2xl border border-gray-200 gap-1.5 max-w-full">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = activeTab === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveTab(r.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white text-[#1F1F1F] shadow-sm ring-1 ring-black/5"
                      : "text-gray-600 hover:text-black hover:bg-white/50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-[#EF2B4D]" : "text-gray-400"
                    }`}
                  />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="bg-[#F4F5F7]/70 rounded-3xl border border-gray-200 p-6 sm:p-10">
          
          {/* FACULTY & CONVENOR VIEW */}
          {activeTab === "faculty" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FDE8EB] text-xs font-bold text-[#EF2B4D]">
                  Role: Faculty & Convenors (NITK)
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] tracking-tight">
                  Seamless Room Requests with Instant Status Tracking
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Faculty and student convenors can browse any classroom, seminar hall, or computer lab, check real-time availability on the slot grid, and lock in a 1-hour slot in seconds.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>1-Hour Slot Allocation:</strong> Request any available slot within facility operating hours.</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>Fair Usage Limit:</strong> Enforces max 1 booking request per user per day.</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>Lifecycle Tracking:</strong> View real-time status: Pending, Approved, Rejected (with reason), or Cancelled.</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>30-Minute Alerts:</strong> Automated reminders sent before the session starts.</span>
                  </div>
                </div>
              </div>

              {/* Interactive Mock Dashboard Card */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FDE8EB] text-[#EF2B4D] flex items-center justify-center font-bold text-xs">
                      DR
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">Dr. Ramesh Bhat</div>
                      <div className="text-[10px] text-gray-500">Dept. of Computer Science & Engg</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    Daily Limit: 0/1 Used
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Recent Booking Requests
                  </div>

                  {/* Booking Item 1 */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#1F1F1F]">Central Seminar Hall</div>
                      <div className="text-[11px] text-gray-500">Oct 1 · 02:00 PM – 03:00 PM · AI Symposium</div>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Approved ✓
                    </span>
                  </div>

                  {/* Booking Item 2 */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#1F1F1F]">LHC-101</div>
                      <div className="text-[11px] text-gray-500">Oct 2 · 11:00 AM – 12:00 PM · Guest Lecture</div>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                      Pending Admin ⏱
                    </span>
                  </div>

                  {/* Cancellation Request simulation */}
                  <div className="pt-2">
                    <button
                      type="button"
                      className="w-full py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                    >
                      Request Cancellation for LHC-101 (Subject to Admin Approval)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN / FACILITY MANAGER VIEW */}
          {activeTab === "admin" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1F1F1F] text-xs font-bold text-white">
                  Role: Admin / Facility Manager
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] tracking-tight">
                  Complete Facility Control & One-Click Approvals
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Facility managers have full oversight of all campus infrastructure: modifying room operating hours, putting halls under maintenance, and approving or rejecting requests with mandatory reason audit logs.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>Facility Management CRUD:</strong> Add, edit capacity, location, operating hours, or remove venues.</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>Maintenance Mode Switch:</strong> Rooms under maintenance or outside hours cannot be booked.</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>Rejection Reason Enforcement:</strong> Admins must provide explicit reasons for any rejected booking.</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>Cancellation Approvals:</strong> Review faculty cancellation requests and trigger instant waitlist promotion.</span>
                  </div>
                </div>
              </div>

              {/* Interactive Admin Decision Simulation */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="text-xs font-bold text-gray-900">
                    Pending Approval Queue (2 Requests)
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-[#EF2B4D] rounded-full">
                    Admin Action Required
                  </span>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-[#1F1F1F]">
                        Prof. Arvind (AI Lab) · LHC-101
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Slot: Oct 1, 12:00 PM - 01:00 PM · Purpose: Faculty Board Meet
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Zero Conflict
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    >
                      Approve Booking ✓
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                    >
                      Reject with Reason ✕
                    </button>
                  </div>
                </div>

                {/* Facility Maintenance Toggle Mockup */}
                <div className="mt-4 p-3 bg-[#F4F5F7] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-gray-800">Mechanical Seminar Hall</div>
                    <div className="text-[10px] text-gray-500">Status: Under Scheduled Maintenance</div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-200 text-amber-900 rounded-md">
                    Maintenance ON
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STUDENT VIEW */}
          {activeTab === "student" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-xs font-bold text-blue-800">
                  Role: Regular Student
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] tracking-tight">
                  Transparent Campus Schedules & Availability
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Students have full read-only visibility into room occupancy, lecture hall bookings, club events, and maintenance schedules across all NITK blocks.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>Real-Time Schedule Visibility:</strong> Check if a hall is free for informal study groups or club meetings.</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>Booking Locked:</strong> Booking action is hidden on the UI and strictly rejected at the API level (403 Forbidden).</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>Convenor Upgrade:</strong> Students heading registered student branches or fests can be assigned the Convenor role by Admin.</span>
                  </div>
                </div>
              </div>

              {/* Student View Mockup */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="text-xs font-bold text-gray-900">Student Portal · Read Only View</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                    Role: Student
                  </span>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                  <div className="text-xs font-bold text-blue-900 mb-1">
                    Live Room Occupancy Inspection
                  </div>
                  <p className="text-[11px] text-blue-800 leading-normal">
                    Viewing LHC-101 schedule. You can see Dr. Ramesh has booked 09:00 - 10:00 AM, and 10:00 - 12:00 PM is currently free.
                  </p>
                </div>

                <div className="mt-4 p-3 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Booking Permission Status:</span>
                  <span className="text-xs font-extrabold text-rose-600 flex items-center gap-1">
                    <Ban className="w-3.5 h-3.5" /> Blocked (Read Only)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CONFIGURABLE RBAC (BONUS) VIEW */}
          {activeTab === "rbac" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-100 text-xs font-bold text-purple-800">
                  Bonus Feature: Configurable RBAC System
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] tracking-tight">
                  Dynamic Database-Driven Roles & Granular Permissions
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Admins can dynamically create custom roles (e.g. <em>Dean</em>, <em>Lab Coordinator</em>, <em>Club Head</em>) directly from the UI without modifying any backend code.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>Zero Code Changes:</strong> Roles and permissions stored in relational tables (`roles`, `permissions`, `role_permissions`).</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>Granular Keys:</strong> `view_facilities`, `book_facility`, `cancel_booking`, `approve_booking`, `manage_facilities`, `view_analytics`, `manage_roles`.</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>Instant Propagation:</strong> Role assignment updates apply immediately on subsequent requests.</span>
                  </div>
                </div>
              </div>

              {/* Interactive Permission Matrix Mockup */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="text-xs font-bold text-gray-900">Dynamic RBAC Permission Matrix</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                    Live Database Sync
                  </span>
                </div>

                <div className="mt-3 overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 text-[10px] uppercase">
                        <th className="py-2">Permission</th>
                        <th className="py-2 text-center">Admin</th>
                        <th className="py-2 text-center">Faculty</th>
                        <th className="py-2 text-center">Student</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { perm: "view_facilities", admin: true, fac: true, stu: true },
                        { perm: "book_facility", admin: true, fac: true, stu: false },
                        { perm: "cancel_booking", admin: true, fac: true, stu: false },
                        { perm: "approve_booking", admin: true, fac: false, stu: false },
                        { perm: "manage_facilities", admin: true, fac: false, stu: false },
                        { perm: "view_analytics", admin: true, fac: false, stu: false },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-2 font-mono text-[11px] text-gray-800">{row.perm}</td>
                          <td className="py-2 text-center">{row.admin ? "✅" : "❌"}</td>
                          <td className="py-2 text-center">{row.fac ? "✅" : "❌"}</td>
                          <td className="py-2 text-center">{row.stu ? "✅" : "❌"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
