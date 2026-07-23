'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BookingModal from '@/components/patient/BookingModal';
import AppointmentHistory from '@/components/patient/AppointmentHistory';
import FertilityAssessmentQuiz from '@/components/patient/FertilityAssessmentQuiz';

export default function PatientDashboard() {
  const router = useRouter();
  const [patient, setPatient] = useState<{ name: string; phone: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Fetch appointments directly from Database API by phone
  const fetchPatientAppointments = useCallback(async (phone: string) => {
    try {
      const res = await fetch(`/api/appointments?phone=${encodeURIComponent(phone)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Failed to load patient appointments:', error);
    }
  }, []);

  useEffect(() => {
    const savedPatient = localStorage.getItem('bw_patient');
    if (!savedPatient) {
      // IF NOT LOGGED IN -> HARD REDIRECT TO LOGIN SCREEN IMMEDIATELY
      router.replace('/patient/login');
    } else {
      const parsed = JSON.parse(savedPatient);
      setPatient(parsed);
      fetchPatientAppointments(parsed.phone);
      setLoading(false);
    }
  }, [router, fetchPatientAppointments]);

  const handleLogout = () => {
    localStorage.removeItem('bw_patient');
    router.replace('/patient/login');
  };

  const handleBookingSuccess = (_newAppointment: any) => {
    if (patient?.phone) {
      fetchPatientAppointments(patient.phone);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-500 font-bold text-sm">
        Verifying Session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-gray-50 text-gray-900 font-sans pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-rose-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-black text-xl flex items-center justify-center shadow-md">
              BW
            </span>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Birth<span className="text-rose-600">Wave</span>
            </span>
          </a>

          <div className="flex items-center gap-3 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-200">
            <span className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs">
              {patient?.name.charAt(0).toUpperCase()}
            </span>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-gray-900">{patient?.name}</p>
              <p className="text-[10px] text-rose-600 font-medium">{patient?.phone}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-rose-600 ml-2 font-bold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Authenticated Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Banner */}
        <div className="mb-10 bg-gradient-to-r from-rose-900 via-rose-800 to-purple-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-rose-100 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              Patient Portal Active
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">
              Welcome, {patient?.name}!
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm leading-relaxed">
              Manage your care with Dr. Santhoshi, review assessment reports, and book appointments.
            </p>
          </div>

          <button
            onClick={() => setIsBookingOpen(true)}
            className="px-6 py-3.5 rounded-xl bg-white text-rose-900 font-bold text-xs shadow-md hover:bg-rose-50 transition-all shrink-0"
          >
            + Book New Appointment
          </button>
        </div>

        {/* AI Fertility Assessment & Health Tools inside Dashboard */}
        <div className="mb-12 bg-gradient-to-r from-rose-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              Diagnostic & Wellness
            </span>
            <h3 className="text-xl sm:text-2xl font-bold">
              Dr. Santhoshi AI Fertility & Health Assessment
            </h3>
            <p className="text-xs sm:text-sm text-rose-100">
              Complete the questionnaire to generate personalized clinical health insights.
            </p>
          </div>
          <button
            onClick={() => setIsQuizOpen(true)}
            className="px-6 py-3 rounded-xl bg-white text-rose-700 font-bold text-xs shadow-md hover:bg-rose-50 transition-all shrink-0"
          >
            Start Assessment →
          </button>
        </div>

        {/* Patient Appointment History */}
        <AppointmentHistory
          appointments={appointments}
          onAcceptSuggestion={() => {}}
          onCancelAppointment={() => {}}
        />

      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        patientInfo={patient}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Assessment Modal */}
      {isQuizOpen && (
        <FertilityAssessmentQuiz
          onBookAppointment={() => {
            setIsQuizOpen(false);
            setIsBookingOpen(true);
          }}
        />
      )}

    </div>
  );
}
