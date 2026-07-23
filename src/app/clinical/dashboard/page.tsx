'use client';

import React, { useState, useEffect } from 'react';

export default function DoctorDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);

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
    const saved = JSON.parse(localStorage.getItem('bw_appointments') || '[]');
    
    // Default fallback demo data ONLY if storage is completely empty
    const demoData = [
      {
        id: 'BW-849201',
        patientName: 'Ananya Sharma',
        patientPhone: '9876543210',
        reason: 'Prenatal Checkup',
        preferredDate: '2026-08-01',
        preferredTimeSlot: '09:00 AM - 11:00 AM',
        status: 'Confirmed',
        assignedTime: '10:15 AM',
        summary: 'Low Risk | Week 8 Pregnancy | Normal vitals',
      },
      {
        id: 'BW-992381',
        patientName: 'Priyanka Verma',
        patientPhone: '9123456789',
        reason: 'Fertility Assessment',
        preferredDate: '2026-08-02',
        preferredTimeSlot: '11:00 AM - 01:00 PM',
        status: 'Pending Confirmation',
        summary: 'Moderate Priority | Irregular Cycle | Needs Hormone Evaluation',
      },
    ];

    setAppointments(saved.length > 0 ? saved : demoData);
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
      
      {/* Top Bar */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white">Dr. Santhoshi Clinical Desk</h1>
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase">
              Live Patient Queue
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">BirthWave Specialist Operations & Request Approvals</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAppointments}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all"
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

      {/* Main Queue List */}
      <main className="max-w-6xl mx-auto space-y-4">
        <h2 className="text-sm font-bold text-rose-400 uppercase tracking-wider">
          Active Patient Requests ({appointments.length})
        </h2>

        {appointments.map((apt: any) => (
          <div key={apt.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between md:items-center gap-6">
            
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-900">
                  {apt.id}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  apt.status === 'Confirmed'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {apt.status}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">{apt.patientName}</h3>
              
              <div className="text-xs text-slate-400 space-y-1">
                <p><span className="text-slate-500 font-semibold">Phone:</span> +91 {apt.patientPhone} | <span className="text-slate-500 font-semibold">Reason:</span> <span className="text-rose-300 font-bold">{apt.reason}</span></p>
                <p><span className="text-slate-500 font-semibold">Requested Window:</span> {apt.preferredDate} ({apt.preferredTimeSlot || 'Morning Slot'})</p>
              </div>

              {apt.summary && (
                <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium">
                  🩺 <span className="text-slate-400 font-bold">AI Pre-Assessment:</span> {apt.summary}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              {apt.status !== 'Confirmed' ? (
                <button
                  onClick={() => handleStatusUpdate(apt.id, 'Confirmed')}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
                >
                  Confirm Slot ✓
                </button>
              ) : (
                <button
                  onClick={() => handleStatusUpdate(apt.id, 'Pending Confirmation')}
                  className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
                >
                  Mark Pending
                </button>
              )}
            </div>

          </div>
        ))}
      </main>

    </div>
  );
}
