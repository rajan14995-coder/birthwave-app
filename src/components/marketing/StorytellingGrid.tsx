import React from 'react';
import { Sprout, GraduationCap, HeartPulse, Baby, HeartHandshake, MessagesSquare } from 'lucide-react';

export default function StorytellingGrid() {
  const reasons = [
    {
      title: 'Trying to Conceive',
      description: 'While the world chases fertility tech, we go back to nature — using Functional Medicine to help you conceive naturally.',
      Icon: Sprout,
      span: 'md:col-span-2 md:row-span-2',
      gradient: 'from-emerald-500 to-teal-700',
    },
    {
      title: 'Childbirth Education',
      description: 'Unique workshops that leave parents genuinely informed about every nuance of childbirth.',
      Icon: GraduationCap,
      span: 'md:col-span-1 md:row-span-1',
      gradient: 'from-amber-500 to-rose-700',
    },
    {
      title: 'Postpartum Recovery',
      description: 'A curated plan across nutrition, physiotherapy, and weight loss, individualised to how your body heals.',
      Icon: HeartPulse,
      span: 'md:col-span-1 md:row-span-1',
      gradient: 'from-rose-500 to-purple-700',
    },
    {
      title: 'Infant Massage & Bonding',
      description: 'Signature infant massage training sessions that deepen parent-baby attachment and nurture the nervous system.',
      Icon: Baby,
      span: 'md:col-span-1 md:row-span-1',
      gradient: 'from-sky-500 to-indigo-700',
    },
    {
      title: 'Mental Well-Being',
      description: 'Every consultation includes psychological and emotional care — we\u2019ve helped many overcome birth trauma and feel empowered again.',
      Icon: HeartHandshake,
      span: 'md:col-span-1 md:row-span-1',
      gradient: 'from-rose-600 to-pink-800',
    },
    {
      title: 'A Real Support Network',
      description: 'Join our WhatsApp community of parents striving toward a positive childbirth experience and holistic health.',
      Icon: MessagesSquare,
      span: 'md:col-span-1 md:row-span-1',
      gradient: 'from-teal-500 to-emerald-800',
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
            Why Choose Us
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-semibold text-gray-900 tracking-tight">
            Every Step of Your Journey, Handled with Love &amp; Expertise
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            From fertility planning to your baby's first milestones — here's what sets BirthWave apart.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[220px] md:auto-rows-[240px]">
          {reasons.map((reason) => {
            const Icon = reason.Icon;
            return (
              <div
                key={reason.title}
                className={`relative rounded-3xl overflow-hidden shadow-lg group transition-all duration-300 hover:shadow-2xl bg-gradient-to-br ${reason.gradient} ${reason.span}`}
              >
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)] group-hover:opacity-30 transition-opacity" />
                <div className="relative h-full p-6 flex flex-col justify-between text-white">
                  <Icon className="h-8 w-8 opacity-90 group-hover:scale-110 transition-transform duration-300" />
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-bold leading-tight">{reason.title}</h3>
                    <p className="text-xs sm:text-sm text-white/85 leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
