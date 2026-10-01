"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BrandHighlights from "@/components/BrandHighlights";
import FacilityExplorer from "@/components/FacilityExplorer";
import LiveSlotGridDemo from "@/components/LiveSlotGridDemo";
import RoleWorkflowSection from "@/components/RoleWorkflowSection";
import BonusFeaturesSection from "@/components/BonusFeaturesSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F1F1F]">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Sections */}
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Brand Highlights & Core Value Transformation */}
        <BrandHighlights />

        {/* Live Facility Explorer with Search and Hourly Slot Grids */}
        <FacilityExplorer />

        {/* Live Real-Time Slot Matrix Demo */}
        <LiveSlotGridDemo />

        {/* Role-Based Access Control Workflows (Faculty, Admin, Student, RBAC) */}
        <RoleWorkflowSection />

        {/* Advanced Bonus Features (Waitlist, No-Show Penalties, Analytics, Mailers) */}
        <BonusFeaturesSection />

        {/* Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
