'use client';

import React, { useState } from 'react';

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  preferredDate: string;
  preferredTimeSlot: string;
  exactTime?: string | null;
  suggestedTime?: string | null;
  reason: string;
  notes?: string;
  status: 'Pending Confirmation' | 'Confirmed' | 'Suggested Time' | 'Cancelled';
  createdDate: string;
  aiQuizSummary?: string;
}

export default function ClinicalDashboard() {
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'all'>('pending');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [exactTimeInput, setExactTimeInput] = useState('');
  const [suggestedTimeInput, setSuggestedTimeInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'confirm' | 'suggest'>('confirm');

  // Dummy Initial Data
  const [appointments, setAppointments] = useState<Appointment[]>([
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
      aiQuizSummary: 'Low Risk | Week 8 Pregnancy | Normal vitals',
    },
    {
      id: 'BW-992381',
      patientName: 'Priyanka Verma',
      patientPhone: '9123456789',
      doctorName: 'Dr. Santhoshi',
      preferredDate: '2026-08-02',
      preferredTimeSlot: '11:00 AM - 01:00 PM',
      exactTime: null,
      reason: 'Fertility Assessment',
      notes: 'Seeking guidance on cycle tracking',
      status: 'Pending Confirmation',
      createdDate: '2026-07-21',
      aiQuizSummary: 'Moderate Priority | Irregular Cycle (35+ days) | Needs Hormone Evaluation',
    },
    {
      id: 'BW-392104',
      patientName: 'Kavitha Sundaram',
      patientPhone: '9988776655',
      doctorName: 'Dr. Santhoshi',
      preferredDate: '2026-08-05',
      preferredTimeSlot: '02:00 PM - 04:00 PM',
      exactTime: null,
      suggestedTime: '03:30 PM - August 5th',
      reason: 'Postnatal Consultation',
      notes: 'Lactation review',
      status: 'Suggested Time',
      createdDate: '2026-07-22',
      aiQuizSummary: 'Postnatal 4 Weeks | Lactation support requested',
    },
  ]);

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === 'pending') return apt.status === 'Pending Confirmation';
    if (activeTab === 'confirmed') return apt.status === 'Confirmed';
    return true;
  });

  const handleOpenActionModal = (apt: Appointment, type: 'confirm' | 'suggest') => {
    setSelectedAppointment(apt);
    setActionType(type);
    setExactTimeInput(apt.exactTime || '10:00 AM');
    setSuggestedTimeInput(apt.suggestedTime || '03:00 PM');
    setIsModalOpen(true);
  };

  const handleSaveAction = () => {
    if (!selectedAppointment) return;

    if (actionType === 'confirm') {
      setAppointments(
        appointments.map((apt) =>
          apt.id === selectedAppointment.id
            ? {
                ...apt,
                status: 'Confirmed',
                exactTime: exactTimeInput,
              }
            : apt
        )
      );
    } else {
      setAppointments(
        appointments.map((apt) =>
          apt.id === selectedAppointment.id
            ? {
                ...apt,
                status: 'Suggested Time',
                suggestedTime: `${suggestedTimeInput} on ${apt.preferredDate}`,
              }
            : apt
        )
      );
    }

    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans pb-20">
      
      {/* Clinical Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-black text-xl flex items-center justify-center shadow-lg">
              BW
            </span>
            <div>
              <h1 className="font-bold text-lg text-white">Dr. Santhoshi Clinical Desk</h1>
              <p className="text-xs text-rose-400 font-medium">BirthWave Specialist Operations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Clinic Queue
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-800 rounded-3xl p-6 border border-gray-700">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Requests</p>
            <p className="text-3xl font-black text-amber-400 mt-2">
              {appointments.filter((a) => a.status === 'Pending Confirmation').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Requires exact slot assignment</p>
          </div>

          <div className="bg-gray-800 rounded-3xl p-6 border border-gray-700">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confirmed Appointments</p>
            <p className="text-3xl font-black text-emerald-400 mt-2">
              {appointments.filter((a) => a.status === 'Confirmed').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Ready for patient consultation</p>
          </div>

          <div className="bg-gray-800 rounded-3xl p-6 border border-gray-700">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Active Queue</p>
            <p className="text-3xl font-black text-rose-400 mt-2">{appointments.length}</p>
            <p className="text-xs text-gray-500 mt-1">Patients tracked in portal</p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-gray-950 shadow-md'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Pending Requests ({appointments.filter((a) => a.status === 'Pending Confirmation').length})
          </button>

          <button
            onClick={() => setActiveTab('confirmed')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'confirmed'
                ? 'bg-emerald-500 text-gray-950 shadow-md'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Confirmed Queue ({appointments.filter((a) => a.status === 'Confirmed').length})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            All Appointments ({appointments.length})
          </button>
        </div>

        {/* Appointment Table / Cards */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-gray-800/50 rounded-3xl p-12 text-center border border-gray-800">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm font-bold text-gray-300">No appointments found in this view</p>
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs bg-gray-900 text-rose-400 px-3 py-1 rounded-lg border border-gray-700 font-bold">
                      {apt.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        apt.status === 'Confirmed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : apt.status === 'Suggested Time'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{apt.patientName}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Phone: <span className="text-gray-200">{apt.patientPhone}</span> | Visit Reason: <span className="text-rose-400 font-semibold">{apt.reason}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Preferred Window: <strong className="text-gray-200">{apt.preferredDate}</strong> ({apt.preferredTimeSlot})
                    </p>

                    {apt.exactTime && (
                      <p className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-lg mt-2 inline-block">
                        Assigned Time: {apt.exactTime}
                      </p>
                    )}

                    {apt.suggestedTime && (
                      <p className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-3 py-1 rounded-lg mt-2 inline-block">
                        Proposed Time: {apt.suggestedTime}
                      </p>
                    )}
                  </div>

                  {/* AI Quiz Insights Badge */}
                  {apt.aiQuizSummary && (
                    <div className="p-3 bg-gray-900/80 rounded-xl border border-purple-500/30 text-xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-0.5">
                        🤖 AI Pre-Assessment Summary
                      </p>
                      <p className="text-gray-300 font-medium">{apt.aiQuizSummary}</p>
                    </div>
                  )}
                </div>

                {/* Actions Desk */}
                <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenActionModal(apt, 'confirm')}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    Confirm Exact Slot
                  </button>

                  <button
                    onClick={() => handleOpenActionModal(apt, 'suggest')}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    Suggest Alternative Slot
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </main>

      {/* Action Modal */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 w-full max-w-md rounded-3xl p-8 border border-gray-700 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">
                {actionType === 'confirm' ? 'Confirm Exact Time Slot' : 'Propose Alternative Time'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Patient: <strong className="text-white">{selectedAppointment.patientName}</strong> ({selectedAppointment.preferredDate})
              </p>
            </div>

            {actionType === 'confirm' ? (
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-2">
                  Exact Appointment Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10:15 AM"
                  value={exactTimeInput}
                  onChange={(e) => setExactTimeInput(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-rose-500 outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-2">
                  Suggested Alternative Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 03:30 PM"
                  value={suggestedTimeInput}
                  onChange={(e) => setSuggestedTimeInput(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAction}
                className={`flex-1 py-3 text-white font-bold text-xs rounded-xl shadow-md transition-colors ${
                  actionType === 'confirm' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                Save & Update Patient
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
