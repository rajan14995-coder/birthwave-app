'use client';

import React, { useState } from 'react';
import { Youtube, Instagram, PlayCircle } from 'lucide-react';

export default function GalleryAndFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const channels = [
    {
      Icon: Youtube,
      title: 'Birth To Remember',
      description: 'Real birth stories, delivery room moments, and honest conversations about labour.',
      href: 'https://www.youtube.com/@birthtoremember',
      cta: 'Watch on YouTube',
      gradient: 'from-red-500 to-rose-600',
    },
    {
      Icon: PlayCircle,
      title: 'Normal Delivery Gallery',
      description: 'A closer look at natural, empowered deliveries guided by the BirthWave team.',
      href: 'https://www.youtube.com/channel/UCexEsQ9gZq3udCb6Du8O6uA',
      cta: 'Watch the Gallery',
      gradient: 'from-amber-500 to-rose-600',
    },
    {
      Icon: Instagram,
      title: '@thebirthwave',
      description: 'Daily tips, clinic moments, and behind-the-scenes life at the practice.',
      href: 'https://www.instagram.com/thebirthwave',
      cta: 'Follow on Instagram',
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  const faqs = [
    {
      question: 'When should I schedule my first prenatal visit?',
      answer: 'We recommend scheduling your initial consultation as soon as you confirm your pregnancy, usually around weeks 6 to 8. Early care ensures optimal monitoring and guidance.',
    },
    {
      question: 'How does the AI Fertility Assessment work?',
      answer: 'Our AI assessment analyzes key inputs like cycle timing, health markers, and history to generate personalized insights and recommended clinical discussion points.',
    },
    {
      question: 'Can my partner attend the childbirth preparation classes?',
      answer: 'Yes! Partner participation is strongly encouraged in all our childbirth education and birth preparation workshops.',
    },
    {
      question: 'How does appointment booking work?',
      answer: 'Pick a specialist and an open time slot in the Patient Portal — if it\u2019s free, your appointment is confirmed instantly. No waiting on a callback.',
    },
    {
      question: 'Do you offer online consultations?',
      answer: 'Yes — our birth doula, Sheetal, consults exclusively online, and several other specialists offer video consultations on request.',
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-gradient-to-b from-gray-50 via-white to-rose-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- FOLLOW OUR JOURNEY --- */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
              Life at BirthWave
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900">
              Follow Our Journey
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Real birth stories, clinic moments, and honest conversations — on YouTube and Instagram.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {channels.map((channel) => {
              const Icon = channel.Icon;
              return (
                
                  key={channel.title}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-rose-100 transition-all duration-300 hover:-translate-y-1 bg-white p-6 flex flex-col"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${channel.gradient} flex items-center justify-center shadow-md text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{channel.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mt-2 mb-4 flex-1">{channel.description}</p>
                  <span className="text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    {channel.cta} &rarr;
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* --- FAQ PORTION --- */}
        <div id="faq" className="max-w-4xl mx-auto scroll-mt-24">
          <div className="text-center mb-12 space-y-3">
            <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
              Got Questions?
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900">
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
                    {openFaq === idx ? '\u2212' : '+'}
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
