'use client';

import React, { useState, useEffect } from 'react';

export default function DoctorDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  
  // Tab State & Search
  const [activeTab, setActiveTab] = useState<'action' | 'history' | 'all'>('action');
  const [searchQuery, setSearchQuery] = useState('');

  const envMobile = process.env.NEXT_PUBLIC_DOCTOR_MOBILE || '9876543210';
  const envPassword = process.env.NEXT_PUBLIC_DOCTOR_PASSWORD || 'doctor@123';

  useEffect(() => {
    const doctorAuth = localStorage.getItem('bw_doctor_auth');
    if (doctorAuth === 'true') {
      setIsAuthenticated(true);
      loadAppointments();
    }
  }, []);

  const loadAppointments = () => {
    // Load strictly from user/patient entries in localStorage
    const saved = JSON.parse(localStorage.getItem('bw_appointments') || '[]');
    setAppointments(saved);
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

  const handleStatusUpdate = (id: string, newStatus: string) => {
    const updated = appointments.map((apt) =>
      apt.id === id ? { ...apt, status: newStatus } : apt
    );
    setAppointments(updated);
    localStorage.setItem('bw_appointments', JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem('bw_doctor_auth');
    setIsAuthenticated(false);
  };

  // Filter Logic: Search + Tabs
  const filteredAppointments = appointments.filter((apt) => {
    // Search Query Filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      apt.patientName?.toLowerCase().includes(query) ||
      apt.patientPhone?.includes(query) ||
      apt.id?.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    // Tab Filter
    if (activeTab === 'action') {
      return apt.status === 'Pending Confirmation';
    } else if (activeTab === 'history') {
      return apt.status === 'Confirmed' || apt.status === 'Cancelled';
    }
    return true; // 'all' tab
  });

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

  const actionCount = appointments.filter((a) => a.status === 'Pending Confirmation').length;
  const historyCount = appointments.filter((a) => a.status === 'Confirmed' || a.status === 'Cancelled').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white">Dr. Santhoshi Clinical Desk</h1>
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase">
              Live Operations
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">BirthWave Specialist Operations & Request Approvals</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAppointments}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all border border-slate-700"
          >
            🔄 Refresh Queue
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-xs font-bold text-rose-300 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Tabs & Search Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-slate-900 p-3 rounded-2xl border border-slate-800">
          
          {/* Tabs */}
          <div className="flex items-center gap-2">
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
              📜 History of Appointments
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'history' ? 'bg-rose-800 text-white' : 'bg-slate-800 text-slate-300'}`}>
                {historyCount}
              </span>
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

          {/* Search Input Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, or ID..."
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

        </div>

        {/* Appointment Cards List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <span className="text-3xl">📋</span>
              <h3 className="text-base font-bold text-slate-300">No Appointments Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? `No records match "${searchQuery}". Try a different search.`
                  : activeTab === 'action'
                  ? 'There are currently no pending appointment requests requiring action.'
                  : 'No confirmed or cancelled appointment history available yet.'}
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
                      <span className="text-slate-500 font-semibold">Requested Slot:</span>{' '}
                      {apt.preferredDate} ({apt.preferredTimeSlot || 'Standard Slot'})
                    </p>
                  </div>
                </div>

                {/* Status Controls */}
                <div className="flex items-center gap-3 shrink-0">
                  {apt.status === 'Pending Confirmation' && (
                    <button
                      onClick={() => handleStatusUpdate(apt.id, 'Confirmed')}
                      className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
                    >
                      Confirm Slot ✓
                    </button>
                  )}

                  {apt.status === 'Confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(apt.id, 'Pending Confirmation')}
                      className="px-4 py-2.5 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 font-bold text-xs transition-all"
                    >
                      Move Back to Pending
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </main>

    </div>
  );
}
