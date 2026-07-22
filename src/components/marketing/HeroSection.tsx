import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroSectionProps {
  onBookClick?: () => void;
}

export default function HeroSection({ onBookClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-rose-50/70 via-white to-amber-50/30 overflow-hidden pt-20 pb-16">
      {/* Background Glow Effects */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-100/30 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-rose-100 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-rose-800 tracking-wide uppercase">
                Premium Women's Healthcare & Birth Preparation
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
              Empowering Your Journey To <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600">
                Motherhood & Wellness
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Led by <strong className="text-gray-900 font-semibold">Dr. Santhoshi</strong>, BirthWave provides holistic prenatal care, fertility guidance, childbirth education, and personalized gynecological care.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onBookClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold text-base shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/35 hover:-translate-y-0.5 transition-all duration-200"
              >
                Book Appointment
              </button>
              <Link
                href="#doctor-intro"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/80 backdrop-blur-md border border-gray-200 text-gray-800 font-semibold text-base hover:bg-gray-50 transition-all duration-200 text-center"
              >
                Meet Dr. Santhoshi
              </Link>
              <Link
                href="#services"
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-rose-700 font-semibold text-base hover:text-rose-800 transition-colors text-center"
              >
                Explore Services &rarr;
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 border-t border-rose-100/80 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">15+</p>
                <p className="text-xs sm:text-sm text-gray-500">Years Experience</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">10k+</p>
                <p className="text-xs sm:text-sm text-gray-500">Happy Mothers</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">98%</p>
                <p className="text-xs sm:text-sm text-gray-500">Positive Feedback</p>
              </div>
            </div>
          </div>

          {/* Right Column: Dr. Santhoshi Hero Focus */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-rose-100">
              <Image
                src="/images/dr-santhoshi.jpg"
                alt="Dr. Santhoshi"
                fill
                priority
                className="object-cover object-top hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30">
                <p className="text-lg font-bold">Dr. Santhoshi</p>
                <p className="text-xs text-rose-100">Senior Consultant Obstetrician & Fertility Specialist</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
