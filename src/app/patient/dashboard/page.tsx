'use client';

import React, { useState } from 'react';
import PatientAuthModal from '@/components/patient/PatientAuthModal';
import BookingModal from '@/components/patient/BookingModal';
import AppointmentHistory from '@/components/patient/AppointmentHistory';
import FertilityAssessmentQuiz from '@/components/patient/FertilityAssessmentQuiz';

export default function PatientDashboard() {
  const [patient, setPatient] = useState<{ name: string; phone: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Initial dummy appointments for demonstration
  const [appointments, setAppointments] = useState<any[]>([
    {
      id: 'BW-849201',
      patientName: 'Ananya Sharma',
      patientPhone: '9876543210',
      doctorName: 'Dr. Santhoshi',
      preferredDate: '2026-08-01',
      preferredTimeSlot: '09:00 AM - 11:00 AM',
      exactTime: '10:15 AM',
      reason: 'Prenatal Checkup',
      notes: 'First trimester routine checkup',
      status: 'Confirmed',
      createdDate: '2026-07-20',
    },
    {
      id: 'BW-392104',
      patientName: 'Ananya Sharma',
      patientPhone: '9876543210',
      doctorName: 'Dr. Santhoshi',
      preferredDate: '2026-08-05',
      preferredTimeSlot: '02:00 PM - 04:00 PM',
      exactTime: null,
      suggestedTime: '03:30 PM - August 5th',
      reason: 'Fertility Assessment',
      notes: 'AI quiz results review',
      status: 'Suggested Time',
      createdDate: '2026-07-22',
    },
  ]);

  const handleLoginSuccess = (data: { name: string; phone: string }) => {
    setPatient(data);
  };

  const handleBookingSuccess = (newAppointment: any) => {
    setAppointments([newAppointment, ...appointments]);
  };

  const handleAcceptSuggestion = (id: string) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id
          ? {
              ...apt,
              status: 'Confirmed',
              exactTime: apt.suggestedTime || apt.preferredTimeSlot,
            }
          : apt
      )
    );
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: 'Cancelled' } : apt
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-gray-50 text-gray-900 font-sans pb-20">
      
      {/* Top Header */}
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

          <div className="flex items-center gap-4">
            {patient ? (
              <div className="flex items-center gap-3 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-200">
                <span className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs">
                  {patient.name.charAt(0)}
                </span>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-gray-900">{patient.name}</p>
                  <p className="text-[10px] text-rose-600 font-medium">{patient.phone}</p>
                </div>
                <button
                  onClick={() => setPatient(null)}
                  className="text-xs text-gray-400 hover:text-rose-600 ml-2 font-bold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Login / Register
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Banner Section */}
        <div className="mb-10 bg-gradient-to-r from-rose-900 via-rose-800 to-purple-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="px-3 py-1 rounded-full bg-white/20 text-rose-100 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              Patient Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">
              {patient ? `Welcome back, ${patient.name}!` : 'Your Health & Care Dashboard'}
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm leading-relaxed">
              Schedule visits with Dr. Santhoshi, review assessment reports, and manage consultation passes seamlessly.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setIsBookingOpen(true)}
                className="px-6 py-3 rounded-xl bg-white text-rose-900 font-bold text-xs shadow-md hover:bg-rose-50 transition-all"
              >
                + Book New Appointment
              </button>
            </div>
          </div>
        </div>

        {/* AI Fertility Assessment Highlight Card */}
        <div className="mb-12 bg-gradient-to-r from-rose-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              AI Diagnostic Tool
            </span>
            <h3 className="text-xl sm:text-2xl font-bold">
              Dr. Santhoshi AI Fertility & Wellness Assessment
            </h3>
            <p className="text-xs sm:text-sm text-rose-100">
              Complete a 2-minute clinical questionnaire to generate custom health insights prior to your appointment.
            </p>
          </div>
          <button
            onClick={() => setIsQuizOpen(true)}
            className="px-6 py-3 rounded-xl bg-white text-rose-700 font-bold text-xs shadow-md hover:bg-rose-50 transition-all shrink-0"
          >
            Start Assessment →
          </button>
        </div>

        {/* Appointment History List */}
        <AppointmentHistory
          appointments={appointments}
          onAcceptSuggestion={handleAcceptSuggestion}
          onCancelAppointment={handleCancelAppointment}
        />

      </main>

      {/* Modals */}
      <PatientAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        patientInfo={patient}
        onBookingSuccess={handleBookingSuccess}
      />

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
