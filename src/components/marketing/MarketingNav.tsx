'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Phone } from 'lucide-react';

const SPECIALITIES = [
  'Normal Delivery Hospital',
  'Trying To Conceive',
  'Pregnancy',
  'Childbirth',
  'Lactation',
  'Postpartum Counseling',
  'Gynaecology',
  'Laparoscopy',
  'Fertility',
  'PCOS',
  'Preventive Gynaecology',
  'Cosmetic Gynaecology',
  'Pregnancy Yoga',
];

const WELLNESS_GUIDES = [
  'Foods for your conceive journey',
  'Childbirth Education',
  'DNA Fragmentation Guide',
  'Fibroids Guide',
  'Pregnancy Pillow Guide',
  'PCOS Supplement Guide',
];

const CALCULATORS = [
  'Due Date Calculator',
  'Period Calculator',
  'Conception Calculator',
  'Pregnancy Calculator',
  'Ovulation Calculator',
  'BMI Calculator',
  'Fertility Calculator',
];

const PEDIATRICIAN = ['Pediatric Care', 'Vaccination & Immunization', 'Child Growth & Development'];

function Dropdown({ label, items }: { label: string; items: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors">
        {label}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 w-64 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-rose-100">
          {items.map((item) => (
            <div key={item} className="rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-rose-50 hover:text-rose-700 cursor-default">
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketingNav({ onBookClick }: { onBookClick?: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-rose-100 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-black text-base flex items-center justify-center shadow-md shadow-rose-200">
            BW
          </span>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            Birth<span className="text-rose-600">Wave</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link href="#doctors" className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors">
            Doctors
          </Link>
          <Dropdown label="Our Specialities" items={SPECIALITIES} />
          <Dropdown label="Wellness Guide" items={WELLNESS_GUIDES} />
          <Dropdown label="Health Calculators" items={CALCULATORS} />
          <Dropdown label="Pediatrician" items={PEDIATRICIAN} />
          <Link href="#faq" className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          
            href="tel:+919363031925"
            className="hidden xl:flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-rose-600 mr-1"
          >
            <Phone className="h-3.5 w-3.5" />
            93630 31925
          </a>
          <Link
            href="/patient/login"
            className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-rose-700 hover:bg-rose-100 transition-all"
          >
            Patient Login
          </Link>
          <Link
            href="/clinical/dashboard"
            className="hidden sm:inline-block rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-all"
          >
            Doctor Desk
          </Link>
          <button
            onClick={onBookClick}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:scale-105"
          >
            Book Appointment →
          </button>
        </div>
      </div>
    </header>
  );
}
