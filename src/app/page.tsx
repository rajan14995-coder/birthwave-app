'use client';

import React from 'react';
import Link from 'next/link';
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
      
      {/* Top Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-rose-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-black text-xl flex items-center justify-center shadow-md shadow-rose-200">
              BW
            </span>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Birth<span className="text-rose-600">Wave</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium -mt-1">WOMEN'S HEALTH CLINIC</p>
            </div>
          </Link>

          {/* Navigation Links & Portals */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/patient/login"
              className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-all border border-rose-200"
            >
              👤 Patient Portal
            </Link>

            <Link
              href="/clinical/dashboard"
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-all border border-slate-200"
            >
              🩺 Doctor Desk
            </Link>

            <button
              onClick={handleBookClick}
              className="hidden sm:inline-block px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all hover:scale-105"
            >
              Book Appointment →
            </button>
          </div>

        </div>
      </header>

      {/* Main Sections */}
      <HeroSection onBookClick={handleBookClick} />
      <DoctorIntroSection />
      <StorytellingGrid />
      <ServicesSection onBookClick={handleBookClick} />
      <TestimonialsSection />
      <GalleryAndFaqSection />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xs font-semibold text-slate-400">
            © 2026 BirthWave Healthcare. All Rights Reserved. Dr. Santhoshi Senior Obstetrician & Fertility Specialist.
          </p>
          <div className="flex justify-center gap-6 text-xs text-slate-500">
            <Link href="/patient/login" className="hover:text-rose-400">Patient Dashboard</Link>
            <span>•</span>
            <Link href="/clinical/dashboard" className="hover:text-rose-400">Clinical Desk</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
