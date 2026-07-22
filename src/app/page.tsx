'use client';

import React from 'react';
import MarketingNav from '@/components/marketing/MarketingNav';
import HeroSection from '@/components/marketing/HeroSection';
import DoctorIntroSection from '@/components/marketing/DoctorIntroSection';
import StorytellingGrid from '@/components/marketing/StorytellingGrid';
import ServicesSection from '@/components/marketing/ServicesSection';
import TestimonialsSection from '@/components/marketing/TestimonialsSection';
import GalleryAndFaqSection from '@/components/marketing/GalleryAndFaqSection';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export default function Home() {
  const handleBookClick = () => {
    // Navigates or opens appointment booking modal/portal
    window.location.href = '/patient';
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased selection:bg-rose-500 selection:text-white">
      {/* Fixed/Sticky Marketing Navigation */}
      <MarketingNav />

      {/* Main Landing Flow */}
      <main>
        {/* 1. Hero Section with Dr. Santhoshi Highlight */}
        <HeroSection onBookClick={handleBookClick} />

        {/* 2. Doctor Santhoshi Identity & Brand Focus */}
        <DoctorIntroSection onBookClick={handleBookClick} />

        {/* 3. Visual Storytelling & Image Grid */}
        <StorytellingGrid />

        {/* 4. Interactive Feature Cards Services */}
        <ServicesSection onBookClick={handleBookClick} />

        {/* 5. Animated Stats & Testimonials */}
        <TestimonialsSection />

        {/* 6. Gallery & Frequently Asked Questions */}
        <GalleryAndFaqSection />
      </main>

      {/* Premium Marketing Footer */}
      <MarketingFooter />
    </div>
  );
}
