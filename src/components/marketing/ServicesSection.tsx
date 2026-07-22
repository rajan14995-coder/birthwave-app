import React from 'react';
import Link from 'next/link';

interface ServicesSectionProps {
  onBookClick?: () => void;
}

export default function ServicesSection({ onBookClick }: ServicesSectionProps) {
  const services = [
    {
      icon: '🤰',
      title: 'Prenatal & Pregnancy Care',
      description: 'Comprehensive maternal health monitoring, high-risk pregnancy management, and personal guidance through every trimester.',
      badge: 'Core Specialty',
      gradient: 'from-rose-500 to-pink-500',
    },
    {
      icon: '🌱',
      title: 'Fertility & Conception Guidance',
      description: 'Personalized fertility evaluations, ovulation tracking, lifestyle counseling, and advanced reproductive health solutions.',
      badge: 'AI Assisted',
      gradient: 'from-amber-500 to-rose-500',
    },
    {
      icon: '👶',
      title: 'Childbirth Education & Workshops',
      description: 'Birthing techniques, labor preparation, partner involvement strategies, and newborn care fundamentals.',
      badge: 'Interactive',
      gradient: 'from-purple-500 to-rose-500',
    },
    {
      icon: '🧘‍♀️',
      title: 'Prenatal Yoga & Fitness',
      description: 'Tailored gentle exercise routines, breathing exercises, and pelvis-strengthening workouts designed for pregnancy.',
      badge: 'Wellness',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: '💖',
      title: 'Postnatal & Breastfeeding Support',
      description: 'Lactation guidance, postpartum emotional health checks, recovery plans, and continuous baby monitoring.',
      badge: 'Post-Care',
      gradient: 'from-rose-600 to-purple-600',
    },
    {
      icon: '🤝',
      title: 'Couple & Family Counseling',
      description: 'Supporting couples mentally and emotionally through fertility journeys, pregnancy adjustments, and parenthood.',
      badge: 'Holistic',
      gradient: 'from-indigo-500 to-rose-500',
    },
  ];

  return (
    <section id="services" className="py-24 bg-gradient-to-b from-rose-50/40 via-white to-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
            Clinical & Wellness Excellence
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Comprehensive Services Tailored for Women
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Every service is structured around high clinical standards, led by Dr. Santhoshi and supported by a dedicated team.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl border border-rose-100/80 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div>
                {/* Icon & Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${service.gradient} flex items-center justify-center text-2xl shadow-md text-white group-hover:scale-110 transition-transform duration-300`}>
                    {service.icon}
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    {service.badge}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={onBookClick}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  Book Appointment &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
