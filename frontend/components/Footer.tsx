"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Building,
  Heart,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1F1F1F] text-white border-t border-gray-800">
      
      {/* Top Banner inside Footer */}
      <div className="border-b border-gray-800/80 bg-black/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md shrink-0 border border-white/10">
              <Image
                src="/logo.png"
                alt="SlotSync App Icon"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-base font-extrabold text-white">
                SlotSync Campus Platform
              </div>
              <div className="text-xs text-gray-400">
                National Institute of Technology Karnataka, Surathkal
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Booking Services Operational
            </span>
            <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              v1.0.0 · Production Ready
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="relative h-9 w-40">
              <Image
                src="/navbar_logo.png"
                alt="SlotSync Logo"
                fill
                sizes="160px"
                className="object-contain object-left brightness-125"
              />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Automating room reservations, eliminating paper registers, and delivering conflict-free scheduling across all NITK departments.
            </p>
          </div>

          {/* Quick Nav Col */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#EF2B4D] mb-3">
              Infrastructure
            </div>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <a href="#facilities" className="hover:text-white transition-colors">
                  Classrooms & Lecture Halls
                </a>
              </li>
              <li>
                <a href="#facilities" className="hover:text-white transition-colors">
                  Central Seminar Halls
                </a>
              </li>
              <li>
                <a href="#facilities" className="hover:text-white transition-colors">
                  Computing & Robotics Labs
                </a>
              </li>
              <li>
                <a href="#facilities" className="hover:text-white transition-colors">
                  Silver Jubilee Auditorium
                </a>
              </li>
            </ul>
          </div>

          {/* Architecture Col */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#EF2B4D] mb-3">
              Technical Stack
            </div>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF2B4D]" />
                <span>Next.js 16 & React 19</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF2B4D]" />
                <span>Tailwind CSS v4</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF2B4D]" />
                <span>Relational DB & MVC Pattern</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF2B4D]" />
                <span>Zero-Overlap Concurrency Locking</span>
              </li>
            </ul>
          </div>

          {/* Mentors Col */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#EF2B4D] mb-3">
              Mentors & Guidance
            </div>
            <div className="space-y-2 text-xs text-gray-300">
              <div>
                <a
                  href="https://github.com/aditip149209"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 text-[#EF2B4D]"
                >
                  <span>Aditi Pandey</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[11px] text-gray-400">Technical Mentor</span>
              </div>
              <div className="pt-1">
                <a
                  href="https://github.com/AbhimanyuKapoor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 text-[#EF2B4D]"
                >
                  <span>Abhimanyu Kapoor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[11px] text-gray-400">Technical Mentor</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 SlotSync · Campus Infrastructure Booking Module. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#roles" className="hover:text-gray-300 transition-colors">
              Privacy & RBAC Policies
            </a>
            <a href="#faq" className="hover:text-gray-300 transition-colors">
              Support & Guidelines
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
