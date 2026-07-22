'use client';

import React, { useState } from 'react';

interface PatientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (patient: { name: string; phone: string }) => void;
}

export default function PatientAuthModal({ isOpen, onClose, onLoginSuccess }: PatientAuthModalProps) {
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'NAME'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    // Generate simulated 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setStep('OTP');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      setError(`Invalid OTP. Please enter ${generatedOtp}`);
      return;
    }
    setError('');
    setStep('NAME');
  };

  const handleCompleteLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    onLoginSuccess({ name, phone });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-rose-100 p-6 sm:p-8 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
        >
          ✕
        </button>

        {step === 'PHONE' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Patient Login / Register</h3>
              <p className="text-xs text-slate-500">Enter your phone number to receive a verification code</p>
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-xl text-center font-medium">{error}</p>}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 9876543210"
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Send Verification Code →
            </button>
          </form>
        )}

        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Verify Code</h3>
              <p className="text-xs text-slate-500">Code sent to +91 {phone}</p>
            </div>

            {/* Test OTP Banner */}
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-center space-y-1">
              <p className="text-[11px] font-bold text-amber-800">Simulated SMS Verification Code:</p>
              <p className="text-2xl font-black tracking-widest text-amber-900">{generatedOtp}</p>
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-xl text-center font-medium">{error}</p>}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 text-center">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                placeholder="******"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center text-lg font-bold tracking-widest focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Verify OTP →
            </button>
          </form>
        )}

        {step === 'NAME' && (
          <form onSubmit={handleCompleteLogin} className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Patient Details</h3>
              <p className="text-xs text-slate-500">Please confirm your full name for medical records</p>
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-xl text-center font-medium">{error}</p>}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amudha"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Enter Patient Portal →
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
