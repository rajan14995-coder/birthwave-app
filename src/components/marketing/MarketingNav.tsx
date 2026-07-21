"use client";

import { useState } from "react";
import Link from "next/link";

const SPECIALITIES = [
  "Normal Delivery Hospital",
  "Trying To Conceive",
  "Pregnancy",
  "Childbirth",
  "Lactation",
  "Postpartum Counseling",
  "Gynaecology",
  "Laparoscopy",
  "Fertility",
  "PCOS",
  "Preventive Gynaecology",
  "Cosmetic Gynaecology",
  "Pregnancy Yoga",
];

const WELLNESS_GUIDES = [
  "Foods for your conceive journey",
  "Childbirth Education",
  "DNA Fragmentation Guide",
  "Fibroids Guide",
  "Pregnancy Pillow Guide",
  "PCOS Supplement Guide",
];

const CALCULATORS = [
  "Due Date Calculator",
  "Period Calculator",
  "Conception Calculator",
  "Pregnancy Calculator",
  "Ovulation Calculator",
  "BMI Calculator",
  "Fertility Calculator",
];

const PEDIATRICIAN = ["Pediatric Care", "Vaccination & Immunization", "Child Growth & Development"];

function Dropdown({ label, items }: { label: string; items: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="text-sm font-medium text-plum hover:text-rose-gold">{label}</button>
      {open && (
        <div className="absolute left-0 top-full z-40 w-64 rounded-xl bg-white p-2 shadow-lg ring-1 ring-rose/20">
          {items.map((item) => (
            <div key={item} className="rounded-lg px-3 py-2 text-sm text-plum/70 hover:bg-blush">
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-rose/20 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-plum">
          The BirthWave
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <span className="text-sm font-medium text-plum hover:text-rose-gold">Doctors</span>
          <Dropdown label="Our Specialities" items={SPECIALITIES} />
          <Dropdown label="Wellness Guide" items={WELLNESS_GUIDES} />
          <Dropdown label="Health Calculators" items={CALCULATORS} />
          <Dropdown label="Pediatrician" items={PEDIATRICIAN} />
          <span className="text-sm font-medium text-plum hover:text-rose-gold">VBAC</span>
        </nav>

        <div className="flex items-center gap-2">
          <a href="tel:+919363031925" className="hidden text-sm font-medium text-plum sm:block">
            Call: 93630 31925
          </a>
          <Link href="/login/patient" className="rounded-xl bg-rose-gold px-4 py-2 text-sm font-medium text-white">
            Patient Login
          </Link>
          <Link href="/login/staff" className="rounded-xl bg-plum px-4 py-2 text-sm font-medium text-white">
            Staff Login
          </Link>
        </div>
      </div>
    </header>
  );
}
