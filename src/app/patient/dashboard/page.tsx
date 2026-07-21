"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FertilityAssessmentQuiz from "@/components/patient/FertilityAssessmentQuiz";
import BookingModal from "@/components/patient/BookingModal";
import AppointmentHistory from "@/components/patient/AppointmentHistory";
import CalculatorsPanel from "@/components/patient/CalculatorsPanel";
import { useAuthStore } from "@/lib/store";

const SERVICES = [
  "Childbirth Education",
  "PCOS Management",
  "Cosmetic Gynaecology",
  "Retreats",
  "Yoga",
  "Trying to Conceive",
  "Pregnancy",
  "Lactation",
  "Postpartum Counselling",
  "Gynaecology",
  "Laparoscopy",
  "Preventive Gynaecology",
];

export default function PatientDashboardPage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login/patient");
  }

  return (
    <main className="min-h-screen bg-blush px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-plum">Welcome{user?.name ? `, ${user.name}` : ""}</h1>
            <p className="text-sm text-plum/60">Your BirthWave dashboard</p>
          </div>
          <button onClick={logout} className="text-sm text-plum/50 underline">
            Log out
          </button>
        </div>

        {/* Highlight feature */}
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-plum">Speak with Dr. Santoshi AI</h2>
            {!showQuiz && (
              <button
                onClick={() => setShowQuiz(true)}
                className="rounded-xl bg-rose-gold px-4 py-2 text-sm font-medium text-white"
              >
                Start Fertility Assessment
              </button>
            )}
          </div>
          {showQuiz && <FertilityAssessmentQuiz onBookAppointment={() => setBookingOpen(true)} />}
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CalculatorsPanel />
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-rose/20">
            <h3 className="mb-3 text-sm font-semibold text-plum">Clinic Services</h3>
            <ul className="space-y-2 text-sm text-plum/70">
              {SERVICES.map((s) => (
                <li key={s} className="rounded-lg bg-blush px-3 py-2">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-plum">Appointments</h2>
            <button
              onClick={() => setBookingOpen(true)}
              className="rounded-xl bg-plum px-4 py-2 text-sm font-medium text-white"
            >
              + New Appointment
            </button>
          </div>
          <AppointmentHistory />
        </section>
      </div>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </main>
  );
}
