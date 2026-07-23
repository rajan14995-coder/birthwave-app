'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      setError('Please enter the full 4-digit OTP.');
      return;
    }

    // Save login session
    const patientData = { name: name.trim(), phone: phone.trim() };
    localStorage.setItem('bw_patient', JSON.stringify(patientData));

    // Redirect straight to dashboard
    router.push('/patient/dashboard');
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-rose-950">
            BW
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Birth<span className="text-rose-500">Wave</span> Patient Portal
          </h1>
          <p className="text-xs text-slate-400">
            {step === 'details'
              ? 'Enter your details to access your healthcare portal & bookings'
              : `Enter the 4-digit code sent to +91 ${phone}`}
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs p-3 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: Name & Phone Number */}
        {step === 'details' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amudha"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-rose-500 text-white placeholder-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="flex">
                <span className="px-3 py-3.5 bg-slate-800 border border-r-0 border-slate-700 rounded-l-xl text-sm text-slate-400 font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile"
                  className="w-full px-4 py-3.5 rounded-r-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-rose-500 text-white placeholder-slate-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all mt-2"
            >
              Get Verification OTP →
            </button>
          </form>
        ) : (
          /* STEP 2: OTP Verification */
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  className="w-14 h-14 text-center text-xl font-bold rounded-2xl bg-slate-800 border border-slate-700 focus:outline-none focus:border-rose-500 text-white"
                />
              ))}
            </div>

            <p className="text-[11px] text-center text-slate-500">
              Demo Mode: Enter any 4-digit OTP (e.g. <span className="text-rose-400 font-bold">1234</span>)
            </p>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              Verify & Enter Portal →
            </button>

            <button
              type="button"
              onClick={() => setStep('details')}
              className="w-full text-center text-xs text-slate-400 hover:text-white"
            >
              ← Change Mobile Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
