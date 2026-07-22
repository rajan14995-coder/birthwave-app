import React from 'react';
import Image from 'next/image';

export default function StorytellingGrid() {
  const stories = [
    {
      title: 'Prenatal & Childbirth Care',
      subtitle: 'Comprehensive Journey Support',
      tag: 'Pregnancy',
      image: '/images/story-pregnancy.jpg',
      span: 'md:col-span-2 md:row-span-2',
      bgGradient: 'from-rose-500/80 to-purple-900/80',
    },
    {
      title: 'Fertility & Conception Guidance',
      subtitle: 'Personalized Clinical Diagnostics',
      tag: 'Fertility',
      image: '/images/story-fertility.jpg',
      span: 'md:col-span-1 md:row-span-1',
      bgGradient: 'from-amber-500/80 to-rose-900/80',
    },
    {
      title: 'Prenatal Yoga & Wellness',
      subtitle: 'Mindful Movement & Breathing',
      tag: 'Wellness',
      image: '/images/story-yoga.jpg',
      span: 'md:col-span-1 md:row-span-1',
      bgGradient: 'from-teal-500/80 to-emerald-900/80',
    },
    {
      title: 'Postnatal & New Baby Care',
      subtitle: 'Nurturing Mother & Child',
      tag: 'Mother & Baby',
      image: '/images/story-baby.jpg',
      span: 'md:col-span-2 md:row-span-1',
      bgGradient: 'from-rose-600/80 to-pink-900/80',
    },
  ];

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
            Holistic Care Spectrum
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Every Step of Your Journey, Handled with Love & Expertise
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            From fertility planning to your baby's first milestones, explore how BirthWave supports your health and happiness.
          </p>
        </div>

        {/* Mosaic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[260px]">
          {stories.map((story, index) => (
            <div
              key={index}
              className={`relative rounded-3xl overflow-hidden shadow-lg group transition-all duration-300 hover:shadow-2xl ${story.span}`}
            >
              {/* Image */}
              <Image
                src={story.image}
                alt={story.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${story.bgGradient} opacity-70 group-hover:opacity-80 transition-opacity duration-300`} />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 text-white">
                <div>
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/30">
                    {story.tag}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-rose-100 uppercase tracking-widest">
                    {story.subtitle}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                    {story.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
