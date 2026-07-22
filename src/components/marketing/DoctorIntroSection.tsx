'use client';

import React from 'react';

export default function DoctorIntroSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-rose-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-rose-100">
          
          {/* Doctor Image */}
          <div className="md:col-span-5 relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-lg group">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800"
              alt="Dr. Santhoshi - Senior Obstetrician & Fertility Specialist"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-6">
              <h3 className="text-xl font-bold text-white">Dr. Santhoshi</h3>
              <p className="text-xs text-rose-200 font-medium">
                Senior Consultant Obstetrician & Fertility Specialist
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-7 space-y-4">
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
              Medical Leadership
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Compassionate, Evidence-Based Healthcare for Women
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              With over 15+ years of dedicated clinical experience in obstetrics, high-risk pregnancies, and reproductive endocrinology, Dr. Santhoshi provides personalized diagnostic and treatment plans for mothers at every stage of their journey.
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
      </div>
    </section>
  );
}
