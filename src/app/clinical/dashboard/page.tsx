'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  reason: string;
  preferredDate: string;
  preferredTimeSlot?: string;
  confirmedSlot?: string | null;
  confirmedDate?: string;
  status: string;
}

// Full catalog of bookable slots in a clinical day (30-min increments, lunch break 12:30–2:00 PM)
const ALL_DAY_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM',
];

// Add N days to a YYYY-MM-DD date string
const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// Status Helpers
const isPendingStatus = (status: string) => {
  const s = (status || '').toUpperCase();
  return s === 'PENDING' || s === 'PENDING CONFIRMATION' || s === 'RESCHEDULE_PROPOSED';
};

const isConfirmedStatus = (status: string) => {
  const s = (status || '').toUpperCase();
  return s === 'APPROVED';
};

export default function DoctorDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Navigation & Analytics Views
  const [activeTab, setActiveTab] = useState<'today' | 'action' | 'history' | 'monthly' | 'all'>('action');
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation Modal State
  const [confirmingApt, setConfirmingApt] = useState<Appointment | null>(null);
  const [selectedExactSlot, setSelectedExactSlot] = useState('');
  const [viewDate, setViewDate] = useState('');
  const [autoAdvanceNotice, setAutoAdvanceNotice] = useState('');
  const [todayStr, setTodayStr] = useState('');

  // Monthly Calendar State
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [dayDetail, setDayDetail] = useState<{ date: string; type: 'confirmed' | 'action' } | null>(null);

  const envMobile = process.env.NEXT_PUBLIC_DOCTOR_MOBILE || '9876543210';
  const envPassword = process.env.NEXT_PUBLIC_DOCTOR_PASSWORD || 'doctor@123';

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setFeedbackMsg(null);
    try {
      const response = await fetch('/api/appointments', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : data.appointments || []);
      } else {
        throw new Error('Failed to load appointments from server.');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setFeedbackMsg({ type: 'error', text: 'Could not fetch latest appointments. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);

    const doctorAuth = localStorage.getItem('bw_doctor_auth');
    if (doctorAuth === 'true') {
      setIsAuthenticated(true);
      loadAppointments();
    }
  }, [loadAppointments]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile === envMobile && password === envPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('bw_doctor_auth', 'true');
      setLoginError('');
      loadAppointments();
    } else {
      setLoginError('Invalid Mobile Number or Password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bw_doctor_auth');
    setIsAuthenticated(false);
  };

  // Open Modal to pick specific exact time slot
  const initiateConfirmation = (apt: Appointment) => {
    setConfirmingApt(apt);
    const requestedDate = apt.preferredDate || new Date().toISOString().split('T')[0];
    const availableOnRequestedDate = getAvailableSlotsForDate(requestedDate);

    if (availableOnRequestedDate.length > 0) {
      setViewDate(requestedDate);
      setSelectedExactSlot(availableOnRequestedDate[0]);
      setAutoAdvanceNotice('');
    } else {
      const nextDate = findNextAvailableDate(addDays(requestedDate, 1));
      const availableOnNextDate = getAvailableSlotsForDate(nextDate);
      setViewDate(nextDate);
      setSelectedExactSlot(availableOnNextDate[0] || '');
      setAutoAdvanceNotice(`No slots available on ${requestedDate}. Showing the next available date: ${nextDate}.`);
    }
  };

  const closeModal = () => {
    setConfirmingApt(null);
    setSelectedExactSlot('');
    setViewDate('');
    setAutoAdvanceNotice('');
  };

  // Save Confirmed Slot to DB via API
  const finalizeConfirmation = async () => {
    if (!confirmingApt) return;

    const finalDate = viewDate || confirmingApt.preferredDate;
    setIsUpdating(true);
    setFeedbackMsg(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: confirmingApt.id,
          status: 'APPROVED',
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
                  status: 'APPROVED',
                  confirmedSlot: selectedExactSlot,
                  confirmedDate: finalDate,
                }
              : apt
          )
        );
        setFeedbackMsg({ type: 'success', text: `Appointment for ${confirmingApt.patientName} confirmed successfully.` });
        closeModal();
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (err) {
      console.error('Error confirming appointment:', err);
      setFeedbackMsg({ type: 'error', text: 'Failed to confirm booking. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMoveBackToPending = async (id: string) => {
    setIsUpdating(true);
    setFeedbackMsg(null);
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: 'PENDING',
          confirmedSlot: null,
          confirmedDate: null,
        }),
      });

      if (response.ok) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === id ? { ...apt, status: 'PENDING', confirmedSlot: null, confirmedDate: undefined } : apt
          )
        );
        setFeedbackMsg({ type: 'success', text: 'Appointment moved back to pending status.' });
      } else {
        throw new Error('Failed to revert status');
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      setFeedbackMsg({ type: 'error', text: 'Failed to reset status. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Get list of occupied slots on a date
  const getOccupiedSlots = (date: string) => {
    return appointments
      .filter((a) => isConfirmedStatus(a.status) && (a.confirmedDate === date || a.preferredDate === date))
      .map((a) => a.confirmedSlot);
  };

  // All bookable slots for a given date, minus whatever is already confirmed that day
  const getAvailableSlotsForDate = (date: string) => {
    const occupied = getOccupiedSlots(date);
    return ALL_DAY_SLOTS.filter((slot) => !occupied.includes(slot));
  };

  // Walk forward day by day (up to 30 days) to find the next date with at least one open slot
  const findNextAvailableDate = (fromDate: string, maxDaysToCheck = 30): string => {
    let candidate = fromDate;
    for (let i = 0; i < maxDaysToCheck; i++) {
      if (getAvailableSlotsForDate(candidate).length > 0) return candidate;
      candidate = addDays(candidate, 1);
    }
    return candidate;
  };

  // Per-date Confirmed / Action-Required counts for the monthly calendar
  const calendarCounts = useMemo(() => {
    const map: Record<string, { confirmed: number; action: number }> = {};
    appointments.forEach((apt) => {
      const confirmed = isConfirmedStatus(apt.status);
      const pending = isPendingStatus(apt.status);
      if (!confirmed && !pending) return;

      const dateKey = confirmed ? apt.confirmedDate || apt.preferredDate : apt.preferredDate;
      if (!dateKey) return;

      if (!map[dateKey]) map[dateKey] = { confirmed: 0, action: 0 };
      if (confirmed) map[dateKey].confirmed += 1;
      if (pending) map[dateKey].action += 1;
    });
    return map;
  }, [appointments]);

  // Build the grid of day cells (with leading blanks) for whichever month is being viewed
  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ date: string; day: number } | null> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ date: dateStr, day: d });
    }
    return cells;
  }, [calendarMonth]);

  const goToPrevMonth = () => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  // Appointments backing whichever count the doctor clicked on the calendar
  const getAppointmentsForDayDetail = (date: string, type: 'confirmed' | 'action') => {
    return appointments.filter((apt) =>
      type === 'confirmed'
        ? isConfirmedStatus(apt.status) && (apt.confirmedDate || apt.preferredDate) === date
        : isPendingStatus(apt.status) && apt.preferredDate === date
    );
  };

  // Filtering Logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        apt.patientName?.toLowerCase().includes(query) ||
        apt.patientPhone?.includes(query) ||
        apt.reason?.toLowerCase().includes(query) ||
        apt.id?.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (activeTab === 'today') {
        return apt.preferredDate === todayStr || apt.confirmedDate === todayStr;
      } else if (activeTab === 'action') {
        return isPendingStatus(apt.status);
      } else if (activeTab === 'history') {
        return isConfirmedStatus(apt.status) || (apt.status || '').toUpperCase() === 'CANCELLED';
      }
      return true;
    });
  }, [appointments, searchQuery, activeTab, todayStr]);

  // Calculate Metrics
  const todayCount = useMemo(() => appointments.filter((a) => a.preferredDate === todayStr || a.confirmedDate === todayStr).length, [appointments, todayStr]);
  const actionCount = useMemo(() => appointments.filter((a) => isPendingStatus(a.status)).length, [appointments]);
  const historyCount = useMemo(() => appointments.filter((a) => isConfirmedStatus(a.status) || (a.status || '').toUpperCase() === 'CANCELLED').length, [appointments]);
  const totalConfirmed = useMemo(() => appointments.filter((a) => isConfirmedStatus(a.status)).length, [appointments]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md space-y-5 shadow-2xl">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Clinical Desk Access</span>
            <h2 className="text-2xl font-black text-white">Dr. Santhoshi Portal</h2>
          </div>
          {loginError && <p className="text-xs text-red-400 bg-red-950/50 p-3 rounded-xl border border-red-800 text-center font-medium">{loginError}</p>}
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
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 mb-8 gap-4 max-w-6xl mx-auto">
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
            disabled={isLoading || isUpdating}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-bold text-slate-300 transition-all border border-slate-700"
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
        
        {/* Feedback Alert Banner */}
        {feedbackMsg && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex justify-between items-center ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="font-bold text-sm ml-4">✕</button>
          </div>
        )}

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
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
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

            {/* Monthly Calendar */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-base font-bold text-white">
                  📅 {calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevMonth}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setCalendarMonth(new Date())}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700"
                  >
                    Today
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700"
                  >
                    Next →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {calendarCells.map((cell, idx) => {
                  if (!cell) return <div key={`blank-${idx}`} />;
                  const counts = calendarCounts[cell.date] || { confirmed: 0, action: 0 };
                  const isToday = cell.date === todayStr;
                  return (
                    <div
                      key={cell.date}
                      className={`rounded-xl border p-2 min-h-[74px] flex flex-col gap-1 ${
                        isToday ? 'border-rose-600 bg-rose-950/20' : 'border-slate-800 bg-slate-950/40'
                      }`}
                    >
                      <span className={`text-[11px] font-bold ${isToday ? 'text-rose-400' : 'text-slate-400'}`}>
                        {cell.day}
                      </span>
                      <div className="flex flex-col gap-1">
                        {counts.confirmed > 0 && (
                          <button
                            onClick={() => setDayDetail({ date: cell.date, type: 'confirmed' })}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 text-left"
                          >
                            ✓ {counts.confirmed} Confirmed
                          </button>
                        )}
                        {counts.action > 0 && (
                          <button
                            onClick={() => setDayDetail({ date: cell.date, type: 'action' })}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-950 text-amber-400 border border-amber-800 hover:bg-amber-900 text-left"
                          >
                            ⚠ {counts.action} Action
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
              filteredAppointments.map((apt) => (
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
                          isConfirmedStatus(apt.status)
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : (apt.status || '').toUpperCase() === 'CANCELLED'
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
                      {isConfirmedStatus(apt.status) && apt.confirmedSlot && (
                        <p className="text-emerald-400 font-bold">
                          ✓ Final Confirmed Slot: {apt.confirmedDate || apt.preferredDate} at {apt.confirmedSlot}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isPendingStatus(apt.status) && (
                      <button
                        onClick={() => initiateConfirmation(apt)}
                        disabled={isUpdating}
                        className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
                      >
                        Confirm Slot ✓
                      </button>
                    )}

                    {isConfirmedStatus(apt.status) && (
                      <button
                        onClick={() => handleMoveBackToPending(apt.id)}
                        disabled={isUpdating}
                        className="px-4 py-2.5 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 disabled:opacity-50 font-bold text-xs transition-all"
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
                onClick={closeModal}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
              <p><span className="text-slate-500">Requested Date:</span> <strong>{confirmingApt.preferredDate}</strong></p>
              <p><span className="text-slate-500">Requested Window:</span> <strong className="text-rose-400">{confirmingApt.preferredTimeSlot}</strong></p>
            </div>

            <div className="space-y-3">
              {autoAdvanceNotice && (
                <p className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-900 rounded-xl px-3 py-2">
                  ⚠️ {autoAdvanceNotice}
                </p>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Appointment Date:
                </label>
                <input
                  type="date"
                  value={viewDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setViewDate(newDate);
                    setAutoAdvanceNotice('');
                    const available = getAvailableSlotsForDate(newDate);
                    setSelectedExactSlot(available[0] || '');
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Available Slots for {viewDate}:
              </label>
              {getAvailableSlotsForDate(viewDate).length === 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">No open slots on this date.</p>
                  <button
                    type="button"
                    onClick={() => {
                      const nextDate = findNextAvailableDate(addDays(viewDate, 1));
                      setAutoAdvanceNotice(`No slots available on ${viewDate}. Showing the next available date: ${nextDate}.`);
                      setViewDate(nextDate);
                      setSelectedExactSlot(getAvailableSlotsForDate(nextDate)[0] || '');
                    }}
                    className="text-xs text-rose-400 hover:underline font-semibold"
                  >
                    📅 Jump to next available date →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getAvailableSlotsForDate(viewDate).map((slot) => (
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
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={finalizeConfirmation}
                disabled={!selectedExactSlot || isUpdating}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                {isUpdating ? 'Saving...' : `Confirm Booking (${selectedExactSlot || 'Select Slot'})`}
              </button>
              <button
                onClick={closeModal}
                className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DAY DETAIL MODAL — shown when a Confirmed/Action count is clicked on the calendar */}
      {dayDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 font-sans text-slate-100">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    dayDetail.type === 'confirmed' ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                >
                  {dayDetail.type === 'confirmed' ? 'Confirmed Appointments' : 'Action Required'}
                </span>
                <h3 className="text-xl font-black text-white">{dayDetail.date}</h3>
              </div>
              <button
                onClick={() => setDayDetail(null)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {getAppointmentsForDayDetail(dayDetail.date, dayDetail.type).map((apt) => (
                <div key={apt.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{apt.patientName}</h4>
                    <span className="text-[10px] font-mono text-rose-400">{apt.id}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    +91 {apt.patientPhone} • {apt.reason}
                  </p>
                  <p className="text-xs text-slate-400">
                    {dayDetail.type === 'confirmed'
                      ? `Confirmed at ${apt.confirmedSlot}`
                      : `Requested: ${apt.preferredTimeSlot || 'Standard Window'}`}
                  </p>
                </div>
              ))}
              {getAppointmentsForDayDetail(dayDetail.date, dayDetail.type).length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No appointments found.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
