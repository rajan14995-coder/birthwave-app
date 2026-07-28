'use client';

import React from 'react';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import HeroSection from '@/components/marketing/HeroSection';
import DoctorIntroSection from '@/components/marketing/DoctorIntroSection';
import StorytellingGrid from '@/components/marketing/StorytellingGrid';
import ServicesSection from '@/components/marketing/ServicesSection';
import TestimonialsSection from '@/components/marketing/TestimonialsSection';
import GalleryAndFaqSection from '@/components/marketing/GalleryAndFaqSection';

export default function Home() {
  const handleBookClick = () => {
    // Direct redirect to patient login screen
    window.location.href = '/patient/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-rose-100 selection:text-rose-900">

      <MarketingNav onBookClick={handleBookClick} />

      {/* Main Sections */}
      <HeroSection onBookClick={handleBookClick} />
      <DoctorIntroSection />
      <StorytellingGrid />
      <ServicesSection onBookClick={handleBookClick} />
      <TestimonialsSection />
      <GalleryAndFaqSection />

      <MarketingFooter />

    </div>
  );
}
