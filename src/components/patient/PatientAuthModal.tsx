'use client';

import React, { useState } from 'react';

interface PatientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (patientData: { name: string; phone: string }) => void;
}

export default function PatientAuthModal({ isOpen, onClose, onLoginSuccess }: PatientAuthModalProps) {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Info -> Step 2: OTP
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerateOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsSubmitting(true);

    // Simulate OTP generation API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
    }, 800);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance input focus
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      setError('Please enter the 4-digit code sent to your phone');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate authentication verification
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({ name: patientName, phone });
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-rose-100 relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <span className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 inline-flex items-center justify-center text-xl mb-3">
            🔐
          </span>
          <h3 className="text-2xl font-bold text-gray-900">Patient Portal Login</h3>
          <p className="text-xs text-gray-500 mt-1">
            {step === 1 ? 'Step 1: Enter your details to get started' : 'Step 2: Enter the 4-digit OTP sent to your phone'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Step 1 Form: Name & Phone */}
        {step === 1 && (
          <form onSubmit={handleGenerateOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Patient Name</label>
              <input
                type="text"
                placeholder="e.g. Ananya Sharma"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Generating OTP...' : 'Generate OTP →'}
            </button>
          </form>
        )}

        {/* Step 2 Form: OTP Entry */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <p className="text-xs text-gray-600 text-center mb-4">
                Code sent to <strong className="text-gray-900">{phone}</strong>{' '}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-rose-600 font-semibold underline text-xs ml-1"
                >
                  Edit
                </button>
              </p>

              <div className="flex justify-center gap-3">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Confirm & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
