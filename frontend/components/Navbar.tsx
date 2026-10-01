"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  X,
  Calendar,
  Shield,
  Layers,
  BarChart3,
  HelpCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Facilities", href: "#facilities", icon: Layers },
    { label: "Live Slot Grid", href: "#live-grid", icon: Calendar },
    { label: "Role Matrix", href: "#roles", icon: Shield },
    { label: "Bonus Features", href: "#bonus-features", icon: Sparkles },
    { label: "Analytics", href: "#analytics", icon: BarChart3 },
    { label: "FAQ", href: "#faq", icon: HelpCircle },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white border-b border-gray-100/80"
      }`}
    >
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF2B4D] rounded-lg p-1 transition-opacity hover:opacity-95"
            aria-label="SlotSync Home"
          >
            <div className="relative h-10 w-44 sm:w-48">
              <Image
                src="/navbar_logo.png"
                alt="SlotSync Logo - Campus Infrastructure Booking"
                fill
                priority
                className="object-contain object-left"
                sizes="(max-width: 640px) 176px, 192px"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#EF2B4D] hover:bg-[#FDE8EB]/40 transition-colors focus-visible:ring-2 focus-visible:ring-[#EF2B4D] focus-visible:outline-none"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#roles"
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-black hover:bg-[#F4F5F7] rounded-lg transition-colors border border-gray-200 focus-visible:ring-2 focus-visible:ring-[#EF2B4D] focus-visible:outline-none"
            >
              Login
            </a>
            <a
              href=""
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#EF2B4D] hover:bg-[#D81E40] active:scale-[0.98] rounded-lg shadow-sm hover:shadow transition-all focus-visible:ring-2 focus-visible:ring-[#EF2B4D] focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <span>Signup</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <a
              href="#facilities"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#EF2B4D] rounded-md"
            >
              Book
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-[#EF2B4D] focus-visible:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-[#EF2B4D] hover:bg-[#FDE8EB]/50 transition-colors"
                >
                  <Icon className="w-4 h-4 text-[#EF2B4D]" aria-hidden="true" />
                  {link.label}
                </a>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
            <a
              href="#facilities"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 text-center text-sm font-semibold text-white bg-[#EF2B4D] hover:bg-[#D81E40] rounded-lg shadow-sm"
            >
              Request 1-Hour Slot
            </a>
            <a
              href="#roles"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2 px-4 text-center text-sm font-semibold text-gray-700 bg-[#F4F5F7] hover:bg-gray-200 rounded-lg"
            >
              View Role Permissions
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
