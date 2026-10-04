"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
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
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  // Avoid flashing the landing page for logged-in users while redirecting.
  // While the session is being checked, don't render the marketing content yet
  // if we already know the user is authenticated.
  if (!isLoading && isAuthenticated) {
    return null;
  }

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
