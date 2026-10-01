"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Users,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  Info,
} from "lucide-react";

export interface Facility {
  id: string;
  name: string;
  type: "Classroom" | "Seminar Hall" | "Computer Lab" | "Auditorium";
  building: string;
  floor: string;
  capacity: number;
  operatingHours: string;
  status: "available" | "maintenance" | "booked_full";
  amenities: string[];
  slots: {
    time: string;
    status: "available" | "booked" | "pending" | "maintenance";
    bookedBy?: string;
    purpose?: string;
  }[];
}

const campusFacilities: Facility[] = [
  {
    id: "lhc-101",
    name: "LHC-101 (Lecture Hall)",
    type: "Classroom",
    building: "Lecture Hall Complex",
    floor: "Ground Floor",
    capacity: 120,
    operatingHours: "08:00 AM – 06:00 PM",
    status: "available",
    amenities: ["Dual 4K Projectors", "Air Conditioned", "Podium Mic", "Tiered Seating", "LAN Ports"],
    slots: [
      { time: "08:00 - 09:00 AM", status: "booked", bookedBy: "Dr. K. Rao (Maths)", purpose: "Calculus III Lecture" },
      { time: "09:00 - 10:00 AM", status: "booked", bookedBy: "Dr. S. Nair (CSE)", purpose: "Data Structures" },
      { time: "10:00 - 11:00 AM", status: "available" },
      { time: "11:00 - 12:00 PM", status: "available" },
      { time: "12:00 - 01:00 PM", status: "pending", bookedBy: "Prof. Arvind (AI)", purpose: "Neural Networks Seminar" },
      { time: "02:00 - 03:00 PM", status: "available" },
      { time: "03:00 - 04:00 PM", status: "booked", bookedBy: "Dr. P. Hegde (ECE)", purpose: "VLSI Circuit Design" },
      { time: "04:00 - 05:00 PM", status: "available" },
      { time: "05:00 - 06:00 PM", status: "available" },
    ],
  },
  {
    id: "csh-main",
    name: "Central Seminar Hall",
    type: "Seminar Hall",
    building: "Main Academic Block",
    floor: "1st Floor",
    capacity: 250,
    operatingHours: "09:00 AM – 08:00 PM",
    status: "available",
    amenities: ["Surround Sound 7.1", "Central AC", "Livestream Rig", "Stage Lighting", "Dual Lapel Mics"],
    slots: [
      { time: "09:00 - 10:00 AM", status: "available" },
      { time: "10:00 - 11:00 AM", status: "booked", bookedBy: "Dean (Academics)", purpose: "Orientation Briefing" },
      { time: "11:00 - 12:00 PM", status: "booked", bookedBy: "Dean (Academics)", purpose: "Orientation Briefing" },
      { time: "02:00 - 03:00 PM", status: "available" },
      { time: "03:00 - 04:00 PM", status: "available" },
      { time: "04:00 - 05:00 PM", status: "pending", bookedBy: "IEEE Student Branch", purpose: "Tech Talk on Quantum Computing" },
      { time: "05:00 - 06:00 PM", status: "available" },
      { time: "06:00 - 07:00 PM", status: "available" },
      { time: "07:00 - 08:00 PM", status: "available" },
    ],
  },
  {
    id: "lab-turing",
    name: "Alan Turing Computing Lab",
    type: "Computer Lab",
    building: "Dept. of Computer Science",
    floor: "2nd Floor",
    capacity: 65,
    operatingHours: "08:30 AM – 07:30 PM",
    status: "available",
    amenities: ["65x RTX Workstations", "Gigabit Fiber", "Linux/Windows Dual Boot", "UPS Redundancy"],
    slots: [
      { time: "08:30 - 09:30 AM", status: "available" },
      { time: "09:30 - 10:30 AM", status: "booked", bookedBy: "Dr. R. Bhat (CSE)", purpose: "OS Kernel Lab Batch A" },
      { time: "10:30 - 11:30 AM", status: "booked", bookedBy: "Dr. R. Bhat (CSE)", purpose: "OS Kernel Lab Batch B" },
      { time: "11:30 - 12:30 PM", status: "available" },
      { time: "02:00 - 03:00 PM", status: "available" },
      { time: "03:00 - 04:00 PM", status: "available" },
      { time: "04:00 - 05:00 PM", status: "booked", bookedBy: "GDG Club", purpose: "WebDev Workshop" },
      { time: "05:00 - 06:00 PM", status: "available" },
      { time: "06:00 - 07:30 PM", status: "available" },
    ],
  },
  {
    id: "lhc-204",
    name: "LHC-204 (Smart Classroom)",
    type: "Classroom",
    building: "Lecture Hall Complex",
    floor: "2nd Floor",
    capacity: 90,
    operatingHours: "08:00 AM – 06:00 PM",
    status: "available",
    amenities: ["Interactive Touch Board", "Hybrid Class Camera", "Air Conditioned", "High-Gain Mics"],
    slots: [
      { time: "08:00 - 09:00 AM", status: "available" },
      { time: "09:00 - 10:00 AM", status: "available" },
      { time: "10:00 - 11:00 AM", status: "booked", bookedBy: "Dr. M. Pai (Civil)", purpose: "Structural Dynamics" },
      { time: "11:00 - 12:00 PM", status: "available" },
      { time: "02:00 - 03:00 PM", status: "pending", bookedBy: "Prof. S. Shetty (Mech)", purpose: "Thermodynamics Q&A" },
      { time: "03:00 - 04:00 PM", status: "available" },
      { time: "04:00 - 05:00 PM", status: "available" },
      { time: "05:00 - 06:00 PM", status: "available" },
    ],
  },
  {
    id: "mech-hall",
    name: "Mechanical Seminar Hall",
    type: "Seminar Hall",
    building: "Mechanical Sciences Block",
    floor: "Ground Floor",
    capacity: 160,
    operatingHours: "09:00 AM – 05:00 PM",
    status: "maintenance",
    amenities: ["Acoustic Wall Paneling", "High Lumen Projector", "PA System"],
    slots: [
      { time: "09:00 - 10:00 AM", status: "maintenance" },
      { time: "10:00 - 11:00 AM", status: "maintenance" },
      { time: "11:00 - 12:00 PM", status: "maintenance" },
      { time: "02:00 - 03:00 PM", status: "maintenance" },
      { time: "03:00 - 04:00 PM", status: "maintenance" },
      { time: "04:00 - 05:00 PM", status: "maintenance" },
    ],
  },
  {
    id: "nitk-audi",
    name: "Silver Jubilee Auditorium",
    type: "Auditorium",
    building: "Cultural Complex",
    floor: "Ground Floor",
    capacity: 850,
    operatingHours: "08:00 AM – 10:00 PM",
    status: "available",
    amenities: ["DMX Stage Lights", "Centralized HVAC", "Green Rooms", "Balcony Seating", "Dolby Atmos PA"],
    slots: [
      { time: "09:00 - 10:00 AM", status: "available" },
      { time: "10:00 - 11:00 AM", status: "available" },
      { time: "11:00 - 12:00 PM", status: "booked", bookedBy: "Dean (Student Welfare)", purpose: "National Conference Inauguration" },
      { time: "02:00 - 03:00 PM", status: "available" },
      { time: "03:00 - 04:00 PM", status: "available" },
      { time: "05:00 - 06:00 PM", status: "available" },
      { time: "06:00 - 07:00 PM", status: "booked", bookedBy: "Incident Convener", purpose: "Cultural Practice" },
      { time: "07:00 - 08:00 PM", status: "available" },
    ],
  },
];

export default function FacilityExplorer() {
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [capacityFilter, setCapacityFilter] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>("Today, Oct 1");
  const [activeGridFacilityId, setActiveGridFacilityId] = useState<string | null>("lhc-101");

  const categories = ["All", "Classroom", "Seminar Hall", "Computer Lab", "Auditorium"];

  const filteredFacilities = campusFacilities.filter((f) => {
    const matchesType = selectedType === "All" || f.type === selectedType;
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.amenities.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCapacity = capacityFilter === 0 || f.capacity >= capacityFilter;
    return matchesType && matchesSearch && matchesCapacity;
  });

  return (
    <section id="facilities" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1F1F] tracking-tight">
              Explore Campus Facilities & Real-Time Availability
            </h2>
            <p className="text-gray-600 mt-2 text-base max-w-2xl text-pretty">
              View operating hours, seating capacities, high-tech amenities, and live slot bookings 
              with automatic conflict detection.
            </p>
          </div>

          {/* Date Selector Pills */}
          <div className="flex items-center gap-2 bg-[#F4F5F7] p-1.5 rounded-xl border border-gray-200 shrink-0">
            {["Today, Oct 1", "Tomorrow, Oct 2", "Oct 3 (Friday)"].map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedDate === date
                    ? "bg-[#EF2B4D] text-white shadow-xs"
                    : "text-gray-600 hover:text-black hover:bg-white/60"
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#F4F5F7]/80 p-4 sm:p-5 rounded-2xl border border-gray-200 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for LHC-101, Seminar Hall, Workstations, Projector…"
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-[#EF2B4D] focus-visible:outline-none transition-all"
                aria-label="Search campus facilities"
              />
            </div>

            {/* Capacity Filter */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shrink-0">
              <Users className="w-4 h-4 text-gray-500" />
              <label htmlFor="capacity-select" className="text-xs font-semibold text-gray-600">
                Min Capacity:
              </label>
              <select
                id="capacity-select"
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(Number(e.target.value))}
                className="text-xs font-bold text-[#1F1F1F] bg-transparent focus-visible:outline-none cursor-pointer"
              >
                <option value={0}>Any Size</option>
                <option value={50}>50+ Seats</option>
                <option value={100}>100+ Seats</option>
                <option value={200}>200+ Seats</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedType(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedType === cat
                    ? "bg-[#1F1F1F] text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat === "All" ? "🏢 All Campus Spaces" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((facility) => {
            const isMaintenance = facility.status === "maintenance";
            const availableSlotsCount = facility.slots.filter((s) => s.status === "available").length;
            const isGridActive = activeGridFacilityId === facility.id;

            return (
              <div
                key={facility.id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                  isGridActive
                    ? "border-[#EF2B4D] ring-2 ring-[#EF2B4D]/20 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                {/* Card Top Info */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F4F5F7] text-gray-700 border border-gray-200">
                      {facility.type}
                    </span>

                    {/* Status Pill */}
                    {isMaintenance ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        Maintenance
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {availableSlotsCount} Slots Free
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-[#1F1F1F] tracking-tight">
                    {facility.name}
                  </h3>

                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{facility.building} · {facility.floor}</span>
                  </p>

                  {/* Capacity & Operating Hours */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{facility.capacity} Seats</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{facility.operatingHours}</span>
                    </div>
                  </div>

                  {/* Amenities Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {facility.amenities.slice(0, 3).map((amenity, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-200"
                      >
                        {amenity}
                      </span>
                    ))}
                    {facility.amenities.length > 3 && (
                      <span className="text-[10px] font-semibold bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-200">
                        +{facility.amenities.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action / Slot Grid Preview Trigger */}
                <div className="p-4 bg-[#F4F5F7]/70 border-t border-gray-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveGridFacilityId(isGridActive ? null : facility.id)
                    }
                    className="text-xs font-bold text-gray-700 hover:text-[#EF2B4D] flex items-center gap-1 transition-colors"
                  >
                    <span>{isGridActive ? "Hide Slot Grid" : "View Hourly Matrix"}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${isGridActive ? "rotate-90" : ""}`} />
                  </button>
                </div>

                {/* Expandable Live Slot Matrix on the Card */}
                {isGridActive && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200 animate-in fade-in">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Hourly Slots ({selectedDate}):</span>
                      <span className="text-[#EF2B4D] font-bold text-[10px]">1-Hr Constraint</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {facility.slots.map((slot, idx) => {
                        const isAvail = slot.status === "available";
                        const isPend = slot.status === "pending";
                        const isBook = slot.status === "booked";
                        const isMaint = slot.status === "maintenance";

                        return (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg text-left text-[11px] font-medium transition-all ${
                              isAvail
                                ? "bg-white border border-emerald-300 hover:bg-emerald-50 hover:border-emerald-500 text-gray-900 cursor-pointer shadow-2xs"
                                : isPend
                                ? "bg-amber-50/80 border border-amber-200 text-amber-900 cursor-not-allowed"
                                : isBook
                                ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed line-through"
                                : "bg-gray-200 border border-gray-300 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-800">{slot.time.split(" ")[0]}</span>
                              {isAvail && (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1 rounded">
                                  FREE
                                </span>
                              )}
                              {isPend && (
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 rounded">
                                  PENDING
                                </span>
                              )}
                              {isBook && (
                                <span className="text-[9px] font-medium text-gray-500">
                                  BOOKED
                                </span>
                              )}
                            </div>
                            {slot.bookedBy && (
                              <div className="text-[10px] text-gray-500 truncate mt-0.5">
                                {slot.bookedBy}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State when Search has no match */}
        {filteredFacilities.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
            <Info className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-gray-800">No matching facilities found</h3>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search keywords or lowering the capacity filter.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedType("All");
                setSearchQuery("");
                setCapacityFilter(0);
              }}
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#1F1F1F] rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
