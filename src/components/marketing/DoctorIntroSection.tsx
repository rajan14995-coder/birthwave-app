'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

// Everyone besides Dr. Santhoshi doesn't have a photo uploaded yet, so they get a
// tasteful gradient initials card instead of a broken or mismatched photo.
const OTHER_DOCTORS = [
  {
    initials: 'DB',
    name: 'Dr. Bharathy',
    specialty: 'Gynaecologist',
    hours: 'Mornings 10 AM–12 PM · Evenings 6–8 PM',
    gradient: 'from-rose-400 to-rose-600',
  },
  {
    initials: 'DD',
    name: 'Dr. Deepika',
    specialty: 'Pediatrician',
    hours: 'Mornings 10 AM–12 PM · Evenings 6–8 PM',
    gradient: 'from-amber-400 to-amber-600',
  },
  {
    initials: 'S',
    name: 'Sheetal',
    specialty: 'Birth Doula',
    hours: 'Online consultations only',
    gradient: 'from-purple-400 to-purple-600',
  },
  {
    initials: 'DA',
    name: 'Dr. Amudha',
    specialty: 'Fertility, Prenatal & Postnatal Yoga Expert & Naturopathy Consultant',
    hours: 'Mornings 10 AM–1 PM · Afternoons 2–4 PM · Evenings 5–9 PM',
    gradient: 'from-emerald-400 to-emerald-600',
  },
  {
    initials: 'DA',
    name: 'Dr. Adithi',
    specialty: 'Pelvic Floor Expert',
    hours: 'Mornings 10 AM–1 PM · Afternoons 2–4 PM · Evenings 5–9 PM',
    gradient: 'from-sky-400 to-sky-600',
  },
];

export default function DoctorIntroSection() {
  return (
    <section id="doctors" className="py-20 sm:py-24 bg-gradient-to-b from-white to-rose-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Dr. Santhoshi — featured lead card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-rose-100">
          <div className="md:col-span-5 relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-lg group">
            <img
              src="/images/dr-santhoshi.jpg"
              alt="Dr. Santhoshi — Senior Obstetrician & Fertility Specialist"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-6">
              <h3 className="text-xl font-bold text-white">Dr. Santhoshi</h3>
              <p className="text-xs text-rose-200 font-medium">
                Senior Consultant Obstetrician &amp; Fertility Specialist
              </p>
            </div>
          </div>

          <div className="md:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              Medical Leadership
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
              Compassionate, Evidence-Based Healthcare for Women
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              With over 15+ years of dedicated clinical experience in obstetrics, high-risk pregnancies,
              and reproductive endocrinology, Dr. Santhoshi provides personalized diagnostic and treatment
              plans for mothers at every stage of their journey. Also consults at Cloud9 Hospitals, Apollo
              Hospitals, and Motherhood Hospitals, Chennai.
            </p>
            <p className="text-xs font-semibold text-rose-700">
              Gynaecologist · Mornings 10 AM–1 PM · Afternoons 2–4 PM · Evenings 5–9 PM
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
                <p className="text-2xl font-black text-rose-600">15+</p>
                <p className="text-xs font-semibold text-slate-600">Years Experience</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
                <p className="text-2xl font-black text-rose-600">5,000+</p>
                <p className="text-xs font-semibold text-slate-600">Successful Deliveries</p>
              </div>
            </div>
          </div>
        </div>

        {/* The rest of the team */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
              Our Full Team
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-gray-900">
              Meet the Rest of the BirthWave Team
            </h2>
            <p className="text-sm text-gray-600">
              Six specialists, one connected care journey — choose your doctor when you book.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OTHER_DOCTORS.map((doc) => (
              <div
                key={doc.name}
                className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
              >
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-tr ${doc.gradient} text-white font-black text-lg flex items-center justify-center shadow-md mb-4`}
                >
                  {doc.initials}
                </div>
                <h3 className="text-base font-bold text-gray-900">{doc.name}</h3>
                <p className="text-xs font-semibold text-rose-600 mt-1">{doc.specialty}</p>
                <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">{doc.hours}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
