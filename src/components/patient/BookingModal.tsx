'use client';

import React, { useState } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientInfo?: { name: string; phone: string } | null;
  onBookingSuccess: (appointment: any) => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  patientInfo,
  onBookingSuccess,
}: BookingModalProps) {
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('General Consultation');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      setError('Please select a preferred appointment date');
      return;
    }
    if (!timeSlot) {
      setError('Please choose a preferred time slot');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const bookingId = 'BW-' + Math.floor(100000 + Math.random() * 900000);

    const newAppointment = {
      id: bookingId,
      patientName: patientInfo?.name || 'Guest Patient',
      patientPhone: patientInfo?.phone || 'N/A',
      doctorName: 'Dr. Santhoshi',
      preferredDate: date,
      preferredTimeSlot: timeSlot,
      exactTime: null, // Pending clinical assignment
      reason,
      notes,
      status: 'Pending Confirmation',
      createdDate: new Date().toISOString().split('T')[0],
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onBookingSuccess(newAppointment);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-rose-100 relative animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
            Dr. Santhoshi Consultation
          </span>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">Book an Appointment</h3>
          <p className="text-xs text-gray-500 mt-1">
            Select your preferred date and time slot. Our clinic team will confirm your exact slot.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Preferred Date */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Preferred Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all"
            />
          </div>

          {/* Preferred Time Slot */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              Preferred Time Slot
            </label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                    timeSlot === slot
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-rose-50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Reason for Visit
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all bg-white"
            >
              <option value="General Consultation">General Consultation</option>
              <option value="Prenatal Checkup">Prenatal Checkup</option>
              <option value="Fertility Assessment">Fertility Assessment</option>
              <option value="Postnatal Care">Postnatal Care</option>
              <option value="Ultrasound Scan">Ultrasound Scan</option>
            </select>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Any symptoms or specific requests for Dr. Santhoshi..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Requesting Appointment...' : 'Submit Appointment Request →'}
          </button>
        </form>

      </div>
    </div>
  );
}
