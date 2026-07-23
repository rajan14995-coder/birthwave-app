'use client';

import React, { useState } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientInfo: { name: string; phone: string } | null;
  onBookingSuccess: (appointment: any) => void;
}

export default function BookingModal({ isOpen, onClose, patientInfo, onBookingSuccess }: BookingModalProps) {
  const [reason, setReason] = useState('Consultation');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('09:00 AM - 11:00 AM');

  if (!isOpen) return null;

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientInfo) return;

    const newAppointment = {
      id: `BW-${Math.floor(100000 + Math.random() * 900000)}`,
      patientName: patientInfo.name,
      patientPhone: patientInfo.phone,
      reason,
      preferredDate,
      preferredTimeSlot,
      status: 'Pending Confirmation',
      createdAt: new Date().toISOString(),
    };

    onBookingSuccess(newAppointment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-rose-100 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-slate-900">Book Appointment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <form onSubmit={handleBook} className="space-y-4">
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
            <p className="text-xs text-rose-800 font-bold">Patient: {patientInfo?.name}</p>
            <p className="text-[11px] text-rose-600">Phone: {patientInfo?.phone}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason for Visit</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900"
            >
              <option value="Consultation">General Consultation</option>
              <option value="Prenatal Checkup">Prenatal Checkup</option>
              <option value="Fertility Assessment">Fertility Assessment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Preferred Date</label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all"
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}
