'use client';

import React, { useState, useEffect } from 'react';

// Slot generation helper
const generateSubSlots = (preferredWindow: string) => {
  if (preferredWindow.includes('09:00 AM')) {
    return ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'];
  } else if (preferredWindow.includes('11:00 AM')) {
    return ['11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM'];
  } else if (preferredWindow.includes('02:00 PM')) {
    return ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];
  }
  return ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM', '03:00 PM'];
};

const ALTERNATIVE_DAY_SLOTS = ['04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'];

export default function DoctorDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Navigation & Analytics Views
  const [activeTab, setActiveTab] = useState<'today' | 'action' | 'history' | 'monthly' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation Modal State
  const [confirmingApt, setConfirmingApt] = useState<any | null>(null);
  const [selectedExactSlot, setSelectedExactSlot] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [useCustomDate, setUseCustomDate] = useState(false);

  const envMobile = process.env.NEXT_PUBLIC_DOCTOR_MOBILE || '9876543210';
  const envPassword = process.env.NEXT_PUBLIC_DOCTOR_PASSWORD || 'doctor@123';

  useEffect(() => {
    const doctorAuth = localStorage.getItem('bw_doctor_auth');
    if (doctorAuth === 'true') {
      setIsAuthenticated(true);
      loadAppointments();
    }
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : data.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching appointments from API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile === envMobile && password === envPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('bw_doctor_auth', 'true');
      setError('');
      loadAppointments();
    } else {
      setError('Invalid Mobile Number or Password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bw_doctor_auth');
    setIsAuthenticated(false);
  };

  // Open Modal to pick specific exact time slot
  const initiateConfirmation = (apt: any) => {
    setConfirmingApt(apt);
    const subSlots = generateSubSlots(apt.preferredTimeSlot || '');
    setSelectedExactSlot(subSlots[0] || '');
    setUseCustomDate(false);
    setCustomDate(apt.preferredDate || new Date().toISOString().split('T')[0]);
  };

  // Save Confirmed Slot to DB via API
  const finalizeConfirmation = async () => {
    if (!confirmingApt) return;

    const finalDate = useCustomDate ? customDate : confirmingApt.preferredDate;

    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: confirmingApt.id,
          status: 'Confirmed',
          confirmedSlot: selectedExactSlot,
          confirmedDate: finalDate,
        }),
      });

      if (response.ok) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === confirmingApt.id
              ? {
                  ...apt,
                  status: 'Confirmed',
                  confirmedSlot: selectedExactSlot,
                  confirmedDate: finalDate,
                }
              : apt
          )
        );
      }
    } catch (err) {
      console.error('Error confirming appointment:', err);
    } finally {
      setConfirmingApt(null);
    }
  };

  const handleMoveBackToPending = async (id: string) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: 'Pending Confirmation',
          confirmedSlot: null,
        }),
      });

      if (response.ok) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === id ? { ...apt, status: 'Pending Confirmation', confirmedSlot: undefined } : apt
          )
        );
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
    }
  };

  // Get list of occupied slots on a date
  const getOccupiedSlots = (date: string) => {
    return appointments
      .filter((a) => a.status === 'Confirmed' && (a.confirmedDate === date || a.preferredDate === date))
      .map((a) => a.confirmedSlot);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering Logic
  const filteredAppointments = appointments.filter((apt) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      apt.patientName?.toLowerCase().includes(query) ||
      apt.patientPhone?.includes(query) ||
      apt.id?.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (activeTab === 'today') {
      return apt.preferredDate === todayStr || apt.confirmedDate === todayStr;
    } else if (activeTab === 'action') {
      return apt.status === 'Pending Confirmation';
    } else if (activeTab === 'history') {
      return apt.status === 'Confirmed' || apt.status === 'Cancelled';
    }
    return true;
  });

  // Calculate Metrics
  const todayCount = appointments.filter((a) => a.preferredDate === todayStr || a.confirmedDate === todayStr).length;
  const actionCount = appointments.filter((a) => a.status === 'Pending Confirmation').length;
  const historyCount = appointments.filter((a) => a.status === 'Confirmed' || a.status === 'Cancelled').length;
  const totalConfirmed = appointments.filter((a) => a.status === 'Confirmed').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md space-y-5 text-white shadow-2xl">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Clinical Desk Access</span>
            <h2 className="text-2xl font-black">Dr. Santhoshi Portal</h2>
          </div>
          {error && <p className="text-xs text-red-400 bg-red-950/50 p-3 rounded-xl border border-red-800 text-center font-medium">{error}</p>}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter Doctor Mobile"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-rose-500 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-rose-500 text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
          >
            Access Doctor Desk →
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white">Dr. Santhoshi Clinical Desk</h1>
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase">
              Live Operations
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">BirthWave Specialist Operations & Smart Scheduling Control</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAppointments}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all border border-slate-700"
          >
            {isLoading ? '⏳ Refreshing...' : '🔄 Refresh Queue'}
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-xs font-bold text-rose-300 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-slate-900 p-3 rounded-2xl border border-slate-800">
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'today'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              📅 Today's Queue
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'today' ? 'bg-rose-800 text-white' : 'bg-slate-800 text-slate-300'}`}>
                {todayCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('action')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'action'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              ⚠️ Action Needed
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'action' ? 'bg-rose-800 text-white' : 'bg-slate-800 text-slate-300'}`}>
                {actionCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              📜 History
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'history' ? 'bg-rose-800 text-white' : 'bg-slate-800 text-slate-300'}`}>
                {historyCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'monthly'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              📊 Monthly Analytics
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All ({appointments.length})
            </button>
          </div>

          {/* Search Bar */}
          {activeTab !== 'monthly' && (
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, or ID..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <span className="absolute left-3 top-3 text-xs text-slate-500">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          )}

        </div>

        {/* MONTHLY DASHBOARD */}
        {activeTab === 'monthly' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Consultations</span>
                <p className="text-3xl font-black text-white">{appointments.length}</p>
                <p className="text-[11px] text-emerald-400">↑ 12% vs last month</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmed Slots</span>
                <p className="text-3xl font-black text-emerald-400">{totalConfirmed}</p>
                <p className="text-[11px] text-slate-400">
                  {appointments.length ? Math.round((totalConfirmed / appointments.length) * 100) : 0}% Conversion Rate
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Action</span>
                <p className="text-3xl font-black text-amber-400">{actionCount}</p>
                <p className="text-[11px] text-amber-300">Requires Doctor Approval</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Est. Monthly Revenue</span>
                <p className="text-3xl font-black text-white">₹{(totalConfirmed * 1200).toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-slate-400">Based on standard consultation fee</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-base font-bold text-white">Monthly Patient Distribution Overview</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Fertility Preconception Assessments</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[65%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Routine Prenatal Checkups</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[25%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Hormonal / PCOS Evaluations</span>
                    <span>10%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[10%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* APPOINTMENT CARDS LIST */
          <div className="space-y-4">
            {isLoading ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                Loading live records from database...
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <span className="text-3xl">📋</span>
                <h3 className="text-base font-bold text-slate-300">No Records Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery
                    ? `No entries match "${searchQuery}".`
                    : activeTab === 'today'
                    ? 'No appointments scheduled for today.'
                    : activeTab === 'action'
                    ? 'All pending requests have been processed.'
                    : 'No historical appointments found.'}
                </p>
              </div>
            ) : (
              filteredAppointments.map((apt: any) => (
                <div
                  key={apt.id}
                  className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between md:items-center gap-6 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2.5 max-w-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-900">
                        {apt.id}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          apt.status === 'Confirmed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : apt.status === 'Cancelled'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white">{apt.patientName}</h3>

                    <div className="text-xs text-slate-400 space-y-1">
                      <p>
                        <span className="text-slate-500 font-semibold">Phone:</span> +91 {apt.patientPhone} |{' '}
                        <span className="text-slate-500 font-semibold">Reason:</span>{' '}
                        <span className="text-rose-300 font-bold">{apt.reason}</span>
                      </p>
                      <p>
                        <span className="text-slate-500 font-semibold">Requested Window:</span>{' '}
                        {apt.preferredDate} ({apt.preferredTimeSlot || 'Standard Window'})
                      </p>
                      {apt.confirmedSlot && (
                        <p className="text-emerald-400 font-bold">
                          ✓ Final Confirmed Slot: {apt.confirmedDate || apt.preferredDate} at {apt.confirmedSlot}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {apt.status === 'Pending Confirmation' && (
                      <button
                        onClick={() => initiateConfirmation(apt)}
                        className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
                      >
                        Confirm Slot ✓
                      </button>
                    )}

                    {apt.status === 'Confirmed' && (
                      <button
                        onClick={() => handleMoveBackToPending(apt.id)}
                        className="px-4 py-2.5 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 font-bold text-xs transition-all"
                      >
                        Reschedule / Move Pending
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>

      {/* MODAL */}
      {confirmingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 font-sans text-slate-100">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Slot Assignment</span>
                <h3 className="text-xl font-black text-white">Confirm Appointment Time</h3>
                <p className="text-xs text-slate-400 mt-0.5">Patient: {confirmingApt.patientName}</p>
              </div>
              <button
                onClick={() => setConfirmingApt(null)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
              <p><span className="text-slate-500">Requested Date:</span> <strong>{confirmingApt.preferredDate}</strong></p>
              <p><span className="text-slate-500">Requested Window:</span> <strong className="text-rose-400">{confirmingApt.preferredTimeSlot}</strong></p>
            </div>

            {!useCustomDate ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Specific 30-Min Time Slot:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {generateSubSlots(confirmingApt.preferredTimeSlot || '').map((slot) => {
                    const occupied = getOccupiedSlots(confirmingApt.preferredDate).includes(slot);
                    return (
                      <button
                        key={slot}
                        disabled={occupied}
                        onClick={() => setSelectedExactSlot(slot)}
                        className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                          occupied
                            ? 'bg-slate-950 border-slate-800 text-slate-600 line-through cursor-not-allowed'
                            : selectedExactSlot === slot
                            ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {slot} {occupied ? '(Booked)' : ''}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block mb-2">Or select same-day alternative evening slots:</span>
                  <div className="flex flex-wrap gap-2">
                    {ALTERNATIVE_DAY_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedExactSlot(slot)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                          selectedExactSlot === slot
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setUseCustomDate(true)}
                  className="text-xs text-rose-400 hover:underline font-semibold pt-1 block"
                >
                  📅 No slots working? Pick a different date →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Choose New Date:
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Select Available Slot for {customDate}:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['10:00 AM', '11:30 AM', '03:00 PM', '05:00 PM'].map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedExactSlot(slot)}
                        className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                          selectedExactSlot === slot
                            ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setUseCustomDate(false)}
                  className="text-xs text-slate-400 hover:text-white font-semibold block"
                >
                  ← Back to requested date
                </button>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={finalizeConfirmation}
                disabled={!selectedExactSlot}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                Confirm Booking ({selectedExactSlot || 'Select Slot'})
              </button>
              <button
                onClick={() => setConfirmingApt(null)}
                className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
