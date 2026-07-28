import React from 'react';
import {
  Sprout, Heart, Baby, Droplets, HeartHandshake, Stethoscope,
  Scissors, Flower2, Activity, ShieldCheck, Sparkles, PersonStanding,
} from 'lucide-react';

interface ServicesSectionProps {
  onBookClick?: () => void;
}

export default function ServicesSection({ onBookClick }: ServicesSectionProps) {
  const services = [
    {
      Icon: Sprout,
      title: 'Trying to Conceive',
      description: 'Blending functional medicine with natural conception support, paired with a low-toxin lifestyle approach at every step.',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      Icon: Heart,
      title: 'Pregnancy',
      description: 'Holistic maternity care tailored to your pregnancy — from routine monitoring to complex concerns, built around excellence.',
      gradient: 'from-rose-500 to-pink-500',
    },
    {
      Icon: Baby,
      title: 'Childbirth',
      description: 'Guidance through every stage of labour, from early contractions to the final push, tailored to your birth plan.',
      gradient: 'from-purple-500 to-rose-500',
    },
    {
      Icon: Droplets,
      title: 'Lactation',
      description: 'Breastfeeding support that treats it as the whole emotional journey it is — not just a milestone after delivery.',
      gradient: 'from-sky-500 to-blue-500',
    },
    {
      Icon: HeartHandshake,
      title: 'Postpartum',
      description: 'A recovery plan spanning nutrition, physiotherapy, and gentle movement — personalised to how your body heals.',
      gradient: 'from-rose-600 to-purple-600',
    },
    {
      Icon: Stethoscope,
      title: 'Gynaecology',
      description: 'Comprehensive care across the uterus, ovaries, cervix, and beyond — the full spectrum of reproductive health.',
      gradient: 'from-indigo-500 to-rose-500',
    },
    {
      Icon: Scissors,
      title: 'Laparoscopy',
      description: 'Minimally invasive surgical options for fibroids and pelvic conditions, built for faster recovery and better outcomes.',
      gradient: 'from-amber-500 to-rose-500',
    },
    {
      Icon: Flower2,
      title: 'Fertility',
      description: '1 in 6 couples need medical support to conceive today — we offer clear, compassionate paths forward.',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      Icon: Activity,
      title: 'PCOS',
      description: 'Affecting 1 in 4 women, many undiagnosed — we help identify and manage PCOS before it affects long-term fertility.',
      gradient: 'from-teal-500 to-emerald-500',
    },
    {
      Icon: ShieldCheck,
      title: 'Preventive Gynaecology',
      description: 'Regular screening and early detection to catch reproductive health concerns before they become bigger ones.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      Icon: Sparkles,
      title: 'Cosmetic Gynaecology',
      description: 'A judgement-free conversation about your options — and full permission to love your body exactly as it is.',
      gradient: 'from-rose-500 to-amber-500',
    },
    {
      Icon: PersonStanding,
      title: 'Pregnancy Yoga',
      description: 'Curated yoga programs spanning adolescence through post-menopause — movement is medicine at every age.',
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <section id="services" className="py-20 sm:py-24 bg-gradient-to-b from-rose-50/40 via-white to-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
            Clinical &amp; Wellness Excellence
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-semibold text-gray-900 tracking-tight">
            Our Specialities
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Every service is structured around high clinical standards, led by our team of specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const Icon = service.Icon;
            return (
              <div
                key={service.title}
                className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-rose-100/80 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${service.gradient} flex items-center justify-center shadow-md text-white group-hover:scale-110 transition-transform duration-300 mb-5`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed mb-5">
                    {service.description}
                  </p>
                </div>
                <button
                  onClick={onBookClick}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-3 border-t border-gray-100"
                >
                  Book Appointment &rarr;
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
