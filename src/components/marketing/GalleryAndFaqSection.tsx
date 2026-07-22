'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function GalleryAndFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const galleryImages = [
    { src: '/images/gallery-1.jpg', title: 'Consultation Suite', category: 'Clinic' },
    { src: '/images/gallery-2.jpg', title: 'Prenatal Workshop', category: 'Classes' },
    { src: '/images/gallery-3.jpg', title: 'Mother & Baby Care', category: 'Wellness' },
    { src: '/images/gallery-4.jpg', title: 'Prenatal Yoga Session', category: 'Fitness' },
    { src: '/images/gallery-5.jpg', title: 'Ultrasound Diagnostics', category: 'Care' },
    { src: '/images/gallery-6.jpg', title: 'Newborn Celebration', category: 'Moments' },
  ];

  const faqs = [
    {
      question: 'When should I schedule my first prenatal visit with Dr. Santhoshi?',
      answer: 'We recommend scheduling your initial consultation as soon as you confirm your pregnancy, usually around weeks 6 to 8. Early care ensures optimal monitoring and guidance.'
    },
    {
      question: 'How does the AI Fertility Assessment work?',
      answer: 'Our AI assessment analyzes key inputs like cycle timing, health markers, and history to generate personalized insights and recommended clinical discussion points for Dr. Santhoshi.'
    },
    {
      question: 'Can my partner attend the childbirth preparation classes?',
      answer: 'Yes! Partner participation is strongly encouraged in all our childbirth education and birth preparation workshops.'
    },
    {
      question: 'How do appointment confirmations work across portals?',
      answer: 'When you submit a preferred slot, our clinical staff reviews it and assigns exact timing. Once confirmed, your appointment form and PDF pass are instantly downloadable from your Patient Portal.'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 via-white to-rose-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- GALLERY PORTION --- */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
              Life at BirthWave
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Our Clinic & Care Environment
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              A serene, comfortable, and modern facility designed to make every visit restful.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((img, idx) => (
              <div 
                key={idx}
                className="group relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-rose-100 transition-all duration-300"
              >
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-600 px-2.5 py-0.5 rounded-full">
                    {img.category}
                  </span>
                  <p className="text-base font-bold mt-1">{img.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- FAQ PORTION --- */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center font-bold text-gray-900 text-base focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <span className="text-rose-600 font-bold text-xl ml-4">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-rose-50/50 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
