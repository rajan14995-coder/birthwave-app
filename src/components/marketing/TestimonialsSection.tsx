import React from 'react';
import Image from 'next/image';

export default function TestimonialsSection() {
  const stats = [
    { value: '10,000+', label: 'Happy Mothers & Families', desc: 'Supported across pregnancy & birthing' },
    { value: '15+', label: 'Years Experience', desc: 'Dedicated clinical & fertility guidance' },
    { value: '95%', label: 'Patient Satisfaction', desc: 'Rated highly across prenatal care' },
    { value: '24/7', label: 'Clinical Support', desc: 'Direct emergency assistance & counseling' },
  ];

  const testimonials = [
    {
      name: 'Priyanka Sharma',
      role: 'First-time Mother',
      quote: 'Dr. Santhoshi and the BirthWave team transformed my pregnancy journey. The personalized care and childbirth education gave me complete confidence.',
      rating: 5,
      image: '/images/patient-1.jpg',
    },
    {
      name: 'Ananya & Rohan Verma',
      role: 'Fertility Guidance Patients',
      quote: 'After months of uncertainty, Dr. Santhoshi’s clear assessment and warm approach gave us hope and a clear path forward. We are forever grateful.',
      rating: 5,
      image: '/images/patient-2.jpg',
    },
    {
      name: 'Kavitha Sundaram',
      role: 'Prenatal Yoga & Wellness',
      quote: 'The prenatal yoga classes combined with regular consultations made my delivery experience smooth and manageable. Highly recommended!',
      rating: 5,
      image: '/images/patient-3.jpg',
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Soft Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Statistics Banner */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-rose-700/50">
            {stats.map((stat, idx) => (
              <div key={idx} className={`text-center ${idx > 0 ? 'pt-6 lg:pt-0' : ''}`}>
                <p className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-rose-200">
                  {stat.value}
                </p>
                <p className="text-sm font-bold mt-1 text-rose-100">{stat.label}</p>
                <p className="text-xs text-rose-300/80 mt-1">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
            Patient Stories
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Loved by Thousands of Mothers & Families
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Real experiences from parents who trusted Dr. Santhoshi and BirthWave with their healthcare journey.
          </p>
        </div>

        {/* Testimonials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-rose-50/40 rounded-3xl p-8 border border-rose-100/80 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <span key={i} className="text-lg">★</span>
                  ))}
                </div>

                <p className="text-gray-700 italic text-sm leading-relaxed mb-6">
                  "{item.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-rose-100">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-rose-200 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                  <p className="text-xs text-rose-600 font-medium">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
