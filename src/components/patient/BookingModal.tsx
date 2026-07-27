'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientInfo: { name: string; phone: string } | null;
  onBookingSuccess: (appointment: any) => void;
}

interface DoctorOption {
  id: string;
  name: string;
  specialtyLabel: string;
  consultationMode: 'IN_PERSON' | 'ONLINE';
  serviceId: string;
  serviceName: string;
}

interface Alternative {
  date: string;
  time: string;
}

export default function BookingModal({ isOpen, onClose, patientInfo, onBookingSuccess }: BookingModalProps) {
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [preferredDate, setPreferredDate] = useState('');

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');

  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchingEarliest, setSearchingEarliest] = useState(false);

  // Load the doctor directory once when the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLoadingDoctors(true);
    fetch('/api/doctors', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setDoctors(Array.isArray(data) ? data : []))
      .catch(() => setErrorMessage('Could not load the doctor list. Please try again.'))
      .finally(() => setLoadingDoctors(false));
  }, [isOpen]);

  // Reset everything each time the modal is opened fresh
  useEffect(() => {
    if (isOpen) {
      setSelectedServiceId('');
      setSelectedDoctorId('');
      setPreferredDate('');
      setAvailableSlots([]);
      setSelectedSlot('');
      setAlternatives([]);
      setErrorMessage('');
    }
  }, [isOpen]);

  const services = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    doctors.forEach((d) => map.set(d.serviceId, { id: d.serviceId, name: d.serviceName }));
    return Array.from(map.values());
  }, [doctors]);

  const doctorsForSelectedService = useMemo(
    () => doctors.filter((d) => d.serviceId === selectedServiceId),
    [doctors, selectedServiceId]
  );

  // Auto-select the doctor when a service only has one
  useEffect(() => {
    if (doctorsForSelectedService.length === 1) {
      setSelectedDoctorId(doctorsForSelectedService[0].id);
    } else {
      setSelectedDoctorId('');
    }
    setPreferredDate('');
    setAvailableSlots([]);
    setSelectedSlot('');
    setAlternatives([]);
  }, [selectedServiceId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSlots = useCallback(async (doctorId: string, date: string) => {
    setLoadingSlots(true);
    setSelectedSlot('');
    setAlternatives([]);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/doctors/${doctorId}/slots?date=${date}`, { cache: 'no-store' });
      const data = await res.json();
      setAvailableSlots(Array.isArray(data.slots) ? data.slots : []);
    } catch {
      setAvailableSlots([]);
      setErrorMessage('Could not load available slots. Please try again.');
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDoctorId && preferredDate) {
      fetchSlots(selectedDoctorId, preferredDate);
    }
  }, [selectedDoctorId, preferredDate, fetchSlots]);

  // If the chosen date has nothing open, walk forward (up to 14 days) to find one that does
  const findEarliestAvailableDate = async () => {
    if (!selectedDoctorId || !preferredDate) return;
    setSearchingEarliest(true);
    setErrorMessage('');
    try {
      let candidate = new Date(preferredDate + 'T00:00:00');
      for (let i = 1; i <= 14; i++) {
        candidate.setDate(candidate.getDate() + 1);
        const dateStr = candidate.toISOString().split('T')[0];
        if (candidate.getDay() === 0) continue; // skip Sundays
        const res = await fetch(`/api/doctors/${selectedDoctorId}/slots?date=${dateStr}`, { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data.slots) && data.slots.length > 0) {
          setPreferredDate(dateStr);
          return;
        }
      }
      setErrorMessage('No availability found in the next two weeks. Please try a different doctor.');
    } finally {
      setSearchingEarliest(false);
    }
  };

  const submitBooking = async (dateOverride?: string, timeOverride?: string) => {
    if (!patientInfo) return;
    const bookDate = dateOverride || preferredDate;
    const bookTime = timeOverride || selectedSlot;

    if (!selectedDoctorId) {
      setErrorMessage('Please select a doctor.');
      return;
    }
    if (!bookDate || !bookTime) {
      setErrorMessage('Please select a date and time slot.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setAlternatives([]);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientInfo.name,
          patientPhone: patientInfo.phone,
          doctorId: selectedDoctorId,
          preferredDate: bookDate,
          exactTime: bookTime,
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        setErrorMessage(data.error || 'That slot was just taken.');
        setAlternatives(Array.isArray(data.alternatives) ? data.alternatives : []);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit booking. Please try again.');
      }

      onBookingSuccess(data);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    submitBooking();
  };

  if (!isOpen) return null;

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-100 space-y-5 text-slate-900 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">Book Appointment</h2>
            <p className="text-xs text-slate-500">Choose a service, doctor, and time that works for you</p>
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
          <div className="text-xs bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl font-medium space-y-2">
            <p>{errorMessage}</p>
            {alternatives.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="font-bold text-rose-700">Next available with {selectedDoctor?.name}:</p>
                <div className="flex flex-col gap-1.5">
                  {alternatives.map((alt) => (
                    <button
                      key={`${alt.date}-${alt.time}`}
                      type="button"
                      onClick={() => submitBooking(alt.date, alt.time)}
                      disabled={isSubmitting}
                      className="text-left px-3 py-2 rounded-lg bg-white border border-rose-200 hover:bg-rose-100 font-bold text-rose-700"
                    >
                      {alt.date} at {alt.time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleBook} className="space-y-4">

          <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-rose-950">{patientInfo?.name}</p>
              <p className="text-[10px] font-medium text-rose-700">+91 {patientInfo?.phone}</p>
            </div>
            <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2.5 py-1 rounded-lg">Verified Patient</span>
          </div>

          {/* Service */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Consultation Type
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              disabled={isSubmitting || loadingDoctors}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-rose-500 font-medium text-slate-900"
              required
            >
              <option value="">{loadingDoctors ? 'Loading...' : 'Select a consultation type'}</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor picker — only shown when more than one doctor offers this service */}
          {selectedServiceId && doctorsForSelectedService.length > 1 && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Choose Your Doctor
              </label>
              <div className="space-y-2">
                {doctorsForSelectedService.map((doc) => (
                  <button
                    type="button"
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    disabled={isSubmitting}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      selectedDoctorId === doc.id
                        ? 'bg-rose-600 border-rose-600 text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-200'
                    }`}
                  >
                    <p className="text-sm font-bold">{doc.name}</p>
                    <p className={`text-[11px] ${selectedDoctorId === doc.id ? 'text-rose-100' : 'text-slate-500'}`}>
                      {doc.specialtyLabel} {doc.consultationMode === 'ONLINE' ? '· Online only' : ''}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedDoctorId && doctorsForSelectedService.length === 1 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-sm font-bold text-slate-900">{selectedDoctor?.name}</p>
              <p className="text-[11px] text-slate-500">
                {selectedDoctor?.specialtyLabel} {selectedDoctor?.consultationMode === 'ONLINE' ? '· Online only' : ''}
              </p>
            </div>
          )}

          {/* Date */}
          {selectedDoctorId && (
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
          )}

          {/* Live slot picker */}
          {selectedDoctorId && preferredDate && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Available Slots
              </label>
              {loadingSlots ? (
                <p className="text-xs text-slate-500">Checking availability...</p>
              ) : availableSlots.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">No open slots on this date.</p>
                  <button
                    type="button"
                    onClick={findEarliestAvailableDate}
                    disabled={searchingEarliest}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    {searchingEarliest ? 'Searching...' : 'Find the next available date →'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      disabled={isSubmitting}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                        selectedSlot === slot
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50 hover:border-rose-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !selectedSlot}
            className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all mt-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Booking...' : selectedSlot ? `Confirm ${selectedSlot} →` : 'Select a slot to continue'}
          </button>
        </form>

      </div>
    </div>
  );
}
