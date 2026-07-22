import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface DoctorIntroSectionProps {
  onBookClick?: () => void;
}

export default function DoctorIntroSection({ onBookClick }: DoctorIntroSectionProps) {
  const highlights = [
    { title: 'Obstetrician & Gynecologist', desc: 'Specialist in high-risk pregnancy & maternal care' },
    { title: 'Fertility & IVF Specialist', desc: 'Personalized fertility assessment & guidance' },
    { title: 'Childbirth Educator', desc: 'Empowering parents with holistic birthing techniques' },
    { title: '15+ Years Clinical Excellence', desc: 'Trusted by over 10,000+ families' },
  ];

  return (
    <section id="doctor-intro" className="py-20 bg-gradient-to-b from-white via-rose-50/30 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Image Card with Floating Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-tr from-rose-100 to-amber-50 aspect-[4/5] max-w-md mx-auto">
              <Image
                src="/images/dr-santhoshi.jpg"
                alt="Dr. Santhoshi"
                fill
                className="object-cover object-top hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="px-3 py-1 bg-rose-600/90 text-white text-xs font-semibold rounded-full uppercase tracking-wider backdrop-blur-sm">
                  Lead Medical Director
                </span>
                <h3 className="text-2xl font-bold mt-2">Dr. Santhoshi</h3>
                <p className="text-rose-200 text-sm">MBBS, MS - Obstetrics & Gynaecology</p>
              </div>
            </div>

            {/* Experience Floating Badge */}
            <div className="absolute -bottom-6 -right-2 sm:right-4 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-rose-100 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  15+
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Years of Trust</p>
                  <p className="text-xs text-gray-500">Dedicated Care</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Credentials */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 text-rose-800 text-xs font-bold uppercase tracking-wider">
              The Heart & Identity of BirthWave
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              Compassionate Care Designed Around You & Your Baby
            </h2>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              At BirthWave, every consultation, guidance session, and birth preparation plan is personally overseen by <strong className="text-gray-900">Dr. Santhoshi</strong>. We combine evidence-based clinical medicine with empathetic care to make your journey calm, confident, and joyful.
            </p>

            {/* Grid of Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {highlights.map((item, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-2xl bg-white border border-rose-100/80 shadow-sm hover:shadow-md hover:border-rose-200 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="pt-6 flex flex-wrap gap-4 items-center">
              <button
                onClick={onBookClick}
                className="px-7 py-3.5 rounded-xl bg-gray-900 hover:bg-rose-600 text-white font-semibold text-sm transition-colors duration-200 shadow-md"
              >
                Schedule Consultation
              </button>
              <Link
                href="/patient/assessment"
                className="px-6 py-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-sm transition-colors duration-200"
              >
                AI Fertility Assessment
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
