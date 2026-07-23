'use client';

import React, { useState } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientInfo: { name: string; phone: string } | null;
  onBookingSuccess: (appointment: any) => void;
}

const TIME_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
];

export default function BookingModal({ isOpen, onClose, patientInfo, onBookingSuccess }: BookingModalProps) {
  const [reason, setReason] = useState('General Consultation');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState(TIME_SLOTS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientInfo) return;

    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      patientName: patientInfo.name,
      patientPhone: patientInfo.phone,
      reason,
      preferredDate,
      preferredTimeSlot,
      status: 'PENDING',
    };

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit booking. Please try again.');
      }

      const savedAppointment = await response.json();

      // Pass the DB saved record back to parent UI
      onBookingSuccess(savedAppointment);
      onClose();
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-100 space-y-5 text-slate-900">
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">Book Appointment</h2>
            <p className="text-xs text-slate-500">Consultation with Dr. Santhoshi</p>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="text-xs bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleBook} className="space-y-4">
          
          {/* Patient Details Context */}
          <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-rose-950">{patientInfo?.name}</p>
              <p className="text-[10px] font-medium text-rose-700">+91 {patientInfo?.phone}</p>
            </div>
            <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2.5 py-1 rounded-lg">Verified Patient</span>
          </div>

          {/* Visit Reason */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Reason for Visit
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-rose-500 font-medium text-slate-900"
            >
              <option value="General Consultation">General Consultation</option>
              <option value="Prenatal Checkup">Prenatal Checkup</option>
              <option value="Fertility Assessment">Fertility Assessment</option>
              <option value="High-Risk Pregnancy Review">High-Risk Pregnancy Review</option>
            </select>
          </div>

          {/* Preferred Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Select Preferred Date
            </label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-rose-500 font-medium text-slate-900"
              required
            />
          </div>

          {/* Preferred Time Slot Picker */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Select Preferred Time Slot
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setPreferredTimeSlot(slot)}
                  disabled={isSubmitting}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                    preferredTimeSlot === slot
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50 hover:border-rose-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all mt-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting to Server...' : 'Confirm & Submit Booking →'}
          </button>
        </form>

      </div>
    </div>
  );
}
