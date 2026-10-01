"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BrandHighlights from "@/components/BrandHighlights";
import FacilityExplorer, { Facility } from "@/components/FacilityExplorer";
import LiveSlotGridDemo from "@/components/LiveSlotGridDemo";
import RoleWorkflowSection from "@/components/RoleWorkflowSection";
import BonusFeaturesSection from "@/components/BonusFeaturesSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacilityForModal, setSelectedFacilityForModal] = useState<Facility | null>(null);
  const [selectedSlotForModal, setSelectedSlotForModal] = useState<string>("10:00 - 11:00 AM");

  const handleOpenBookingModal = (facilityName?: string, slotTime?: string) => {
    if (slotTime) {
      setSelectedSlotForModal(slotTime);
    }
    setIsModalOpen(true);
  };

  const handleSelectFacilitySlot = (facility: Facility, slotTime: string) => {
    setSelectedFacilityForModal(facility);
    setSelectedSlotForModal(slotTime);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F1F1F]">
      {/* Navigation Bar */}
      <Navbar onOpenBookingModal={() => handleOpenBookingModal()} />

      {/* Main Content Sections */}
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onOpenBookingModal={() => handleOpenBookingModal()}
          onSelectFacility={(facilityName) => handleOpenBookingModal(facilityName)}
        />

        {/* Brand Highlights & Core Value Transformation */}
        <BrandHighlights />

        {/* Live Facility Explorer with Search and Hourly Slot Grids */}
        <FacilityExplorer onSelectSlot={handleSelectFacilitySlot} />

        {/* Live Real-Time Slot Matrix Demo */}
        <LiveSlotGridDemo onOpenBookingModal={handleOpenBookingModal} />

        {/* Role-Based Access Control Workflows (Faculty, Admin, Student, RBAC) */}
        <RoleWorkflowSection />

        {/* Advanced Bonus Features (Waitlist, No-Show Penalties, Analytics, Mailers) */}
        <BonusFeaturesSection />

        {/* Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Booking Simulation Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultFacility={selectedFacilityForModal}
        defaultSlot={selectedSlotForModal}
      />
    </div>
  );
}
