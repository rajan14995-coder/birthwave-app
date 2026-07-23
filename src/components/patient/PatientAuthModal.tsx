'use client';

import React, { useState } from 'react';

interface PatientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (data: { name: string; phone: string }) => void;
}

export default function PatientAuthModal({ isOpen, onClose, onLoginSuccess }: PatientAuthModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.trim().length < 10) {
      setError('Please enter a valid full name and 10-digit phone number.');
      return;
    }
    setError('');
    onLoginSuccess({ name: name.trim(), phone: phone.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-rose-100 space-y-5">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">Patient Portal Login</span>
          <h2 className="text-2xl font-black text-slate-900">Enter Your Details</h2>
          <p className="text-xs text-slate-500">Provide your name & mobile number to book and view your appointments.</p>
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amudha"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all"
          >
            Continue to Dashboard →
          </button>
        </form>
      </div>
    </div>
  );
}
