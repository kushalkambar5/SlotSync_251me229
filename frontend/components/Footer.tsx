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
