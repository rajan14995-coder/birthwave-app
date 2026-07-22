'use client';

import React from 'react';

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  preferredDate: string;
  preferredTimeSlot: string;
  exactTime?: string | null;
  suggestedTime?: string | null;
  reason: string;
  notes?: string;
  status: 'Pending Confirmation' | 'Confirmed' | 'Suggested Time' | 'Cancelled';
  createdDate: string;
}

interface AppointmentHistoryProps {
  appointments: Appointment[];
  onAcceptSuggestion?: (id: string) => void;
  onCancelAppointment?: (id: string) => void;
}

export default function AppointmentHistory({
  appointments,
  onAcceptSuggestion,
  onCancelAppointment,
}: AppointmentHistoryProps) {

  const handleDownloadPDF = (apt: Appointment) => {
    // Basic browser printable pass / PDF layout generator
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Appointment Pass - ${apt.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #111; }
            .card { border: 2px solid #e11d48; border-radius: 16px; padding: 24px; max-w: 600px; margin: 0 auto; }
            .header { border-bottom: 2px solid #fecdd3; padding-bottom: 12px; margin-bottom: 20px; }
            .title { color: #be123c; font-size: 24px; font-weight: bold; margin: 0; }
            .subtitle { color: #666; font-size: 14px; margin-top: 4px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; }
            .label { font-weight: bold; color: #444; font-size: 13px; text-transform: uppercase; }
            .value { font-size: 15px; color: #111; }
            .badge { background: #ffe4e6; color: #9f1239; padding: 4px 12px; border-radius: 99px; font-weight: bold; font-size: 12px; }
            .footer { margin-top: 24px; pt: 16px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2 class="title">BirthWave Healthcare Pass</h2>
              <p class="subtitle">Dr. Santhoshi Clinical Consultation</p>
            </div>
            <div class="row"><span class="label">Booking Reference</span><span class="value"><strong>${apt.id}</strong></span></div>
            <div class="row"><span class="label">Patient Name</span><span class="value">${apt.patientName}</span></div>
            <div class="row"><span class="label">Phone</span><span class="value">${apt.patientPhone}</span></div>
            <div class="row"><span class="label">Consulting Doctor</span><span class="value">${apt.doctorName}</span></div>
            <div class="row"><span class="label">Date</span><span class="value">${apt.preferredDate}</span></div>
            <div class="row"><span class="label">Time</span><span class="value">${apt.exactTime || apt.preferredTimeSlot}</span></div>
            <div class="row"><span class="label">Reason</span><span class="value">${apt.reason}</span></div>
            <div class="row"><span class="label">Status</span><span class="badge">${apt.status}</span></div>
            <div class="footer">
              Please present this pass at the clinic reception upon arrival. Thank you for choosing BirthWave!
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-rose-100 shadow-sm">
        <p className="text-4xl mb-2">📅</p>
        <h4 className="text-base font-bold text-gray-800">No Appointments Scheduled</h4>
        <p className="text-xs text-gray-500 mt-1">Book your consultation with Dr. Santhoshi to view history and download passes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Your Consultations & History</h3>

      <div className="grid gap-4">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-md">
                  {apt.id}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    apt.status === 'Confirmed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : apt.status === 'Suggested Time'
                      ? 'bg-amber-100 text-amber-800'
                      : apt.status === 'Cancelled'
                      ? 'bg-gray-100 text-gray-500 line-through'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {apt.status}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900">{apt.reason}</h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Doctor: <strong className="text-gray-800">{apt.doctorName}</strong>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Requested Date: <strong>{apt.preferredDate}</strong> ({apt.preferredTimeSlot})
                </p>

                {/* Show Confirmed Exact Time */}
                {apt.exactTime && (
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg mt-1 inline-block">
                    Confirmed Slot: {apt.exactTime}
                  </p>
                )}

                {/* Show Clinic Suggested Time */}
                {apt.status === 'Suggested Time' && apt.suggestedTime && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <p className="font-bold">Clinic Suggested Alternative:</p>
                    <p className="mt-0.5">{apt.suggestedTime}</p>
                    {onAcceptSuggestion && (
                      <button
                        onClick={() => onAcceptSuggestion(apt.id)}
                        className="mt-2 px-3 py-1 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Accept Suggested Time ✓
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              {apt.status !== 'Cancelled' && (
                <button
                  onClick={() => handleDownloadPDF(apt)}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition-all flex items-center justify-center gap-1"
                >
                  📄 Download Pass
                </button>
              )}

              {apt.status !== 'Cancelled' && onCancelAppointment && (
                <button
                  onClick={() => onCancelAppointment(apt.id)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-rose-600 font-semibold text-xs transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
