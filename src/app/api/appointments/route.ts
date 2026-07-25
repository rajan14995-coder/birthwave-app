import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function getSlotWindowEnum(slot: string): 'MORNING' | 'EVENING' {
  const lower = (slot || '').toLowerCase();
  if (lower.includes('09:00') || lower.includes('11:00') || lower.includes('am') || lower.includes('morning')) {
    return 'MORNING';
  }
  // Maps afternoon/evening to EVENING since schema only has MORNING and EVENING
  return 'EVENING';
}

// Parses a slot label like "09:00 AM - 11:00 AM" into the actual start Date on the given day
function getSlotStartDateTime(dateStr: string, slotLabel: string): Date | null {
  if (!dateStr || !slotLabel) return null;
  const startPart = slotLabel.split('-')[0].trim();
  const match = startPart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  const dt = new Date(dateStr + 'T00:00:00');
  if (isNaN(dt.getTime())) return null;
  dt.setHours(hours, minutes, 0, 0);
  return dt;
}

const MIN_BOOKING_LEAD_HOURS = 4;

// Strips everything but digits and keeps the last 10 — matches phone numbers
// regardless of spacing, dashes, or a leading +91/91 the user (or a form) might add.
function normalizePhone(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  return digits.slice(-10);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPhone = searchParams.get('phone');
    const phone = rawPhone ? normalizePhone(rawPhone) : '';

    const whereClause = phone
      ? {
          patient: {
            phone: phone,
          },
        }
      : {};

    const rawAppointments = await (db as any).appointment.findMany({
      where: whereClause,
      include: {
        patient: true,
        service: true,
      },
      orderBy: { requestedDate: 'desc' },
    });

    const appointments = rawAppointments.map((apt: any) => ({
      id: apt.id,
      patientName: apt.patient?.name || 'Patient',
      patientPhone: apt.patient?.phone || 'N/A',
      reason: apt.service?.name || 'Consultation',
      preferredDate: apt.requestedDate ? new Date(apt.requestedDate).toISOString().split('T')[0] : '',
      preferredTimeSlot: apt.preferredTimeLabel || apt.slotWindow || '',
      status: apt.status || 'PENDING',
      // Only surface a confirmed slot once staff has actually approved the appointment —
      // never fall back to the patient's original requested slot.
      confirmedSlot: apt.status === 'APPROVED' ? apt.confirmedTimeLabel || apt.proposedSlotWindow || null : null,
      confirmedDate:
        apt.status === 'APPROVED' && apt.proposedDate
          ? new Date(apt.proposedDate).toISOString().split('T')[0]
          : null,
      createdAt: apt.createdAt,
    }));

    return NextResponse.json(appointments, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      patientName,
      patient_name,
      patientPhone,
      patient_phone,
      reason,
      preferredDate,
      preferred_date,
      preferredTimeSlot,
      preferred_time_slot,
      status,
      slotWindow,
      patientId,
      serviceId,
    } = body;

    const name = (patientName || patient_name || '').trim();
    const phone = normalizePhone(patientPhone || patient_phone || '');

    if (!name || !phone) {
      return NextResponse.json({ error: 'Patient name and phone number are required.' }, { status: 400 });
    }

    const dateStr = preferredDate || preferred_date || new Date().toISOString().split('T')[0];
    const parsedDateTime = new Date(dateStr);
    const validRequestedDate = isNaN(parsedDateTime.getTime()) ? new Date() : parsedDateTime;
    const rawSlot = preferredTimeSlot || preferred_time_slot || '';
    const mappedSlotWindow = slotWindow || getSlotWindowEnum(rawSlot);

    // --- Booking rules enforcement (server-side, in addition to the client-side UX checks) ---
    const requestedDateOnly = new Date(dateStr + 'T00:00:00');
    if (isNaN(requestedDateOnly.getTime())) {
      return NextResponse.json({ error: 'Invalid appointment date.' }, { status: 400 });
    }

    // No Sunday bookings
    if (requestedDateOnly.getDay() === 0) {
      return NextResponse.json(
        { error: 'Sundays are not available for booking. Please choose another date.' },
        { status: 400 }
      );
    }

    // No backdated bookings (date-only check, catches any unparseable slot label too)
    const todayDateOnly = new Date();
    todayDateOnly.setHours(0, 0, 0, 0);
    if (requestedDateOnly.getTime() < todayDateOnly.getTime()) {
      return NextResponse.json({ error: 'You cannot book an appointment in the past.' }, { status: 400 });
    }

    // Minimum 4-hour lead time, checked against the exact slot start time when parseable
    const slotStart = getSlotStartDateTime(dateStr, rawSlot);
    if (slotStart) {
      if (slotStart.getTime() < Date.now()) {
        return NextResponse.json({ error: 'You cannot book an appointment in the past.' }, { status: 400 });
      }
      const minBookableTime = new Date(Date.now() + MIN_BOOKING_LEAD_HOURS * 60 * 60 * 1000);
      if (slotStart.getTime() < minBookableTime.getTime()) {
        return NextResponse.json(
          { error: `Appointments must be booked at least ${MIN_BOOKING_LEAD_HOURS} hours in advance.` },
          { status: 400 }
        );
      }
    }
    // --- End booking rules enforcement ---

    let targetPatientId = patientId;
    if (!targetPatientId) {
      // Match strictly by phone — phone is the real unique identifier (see schema).
      // Matching by name too would silently attach bookings to the wrong person
      // whenever two patients happen to share a name.
      let patient = await (db as any).patient.findFirst({
        where: { phone },
      });
      if (!patient) {
        patient = await (db as any).patient.create({
          data: { name, phone },
        });
      } else if (patient.name !== name) {
        // Keep the stored name in sync with whatever they most recently entered
        patient = await (db as any).patient.update({
          where: { id: patient.id },
          data: { name },
        });
      }
      targetPatientId = patient.id;
    }

    let targetServiceId = serviceId;
    if (!targetServiceId) {
      const serviceName = reason || 'General Consultation';
      let service = await (db as any).service.findFirst({
        where: { name: serviceName },
      });
      if (!service) {
        service = await (db as any).service.create({
          data: {
            name: serviceName,
          },
        });
      }
      targetServiceId = service.id;
    }

    const newAppointment = await (db as any).appointment.create({
      data: {
        patientId: targetPatientId,
        serviceId: targetServiceId,
        requestedDate: validRequestedDate,
        slotWindow: mappedSlotWindow,
        preferredTimeLabel: rawSlot || null,
        status: status || 'PENDING',
      },
      include: {
        patient: true,
        service: true,
      },
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, confirmedSlot, confirmedDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing appointment ID' }, { status: 400 });
    }

    // Map any legacy UI status values to the real AppointmentStatus enum.
    // 'APPROVED' is the single source of truth — the DB schema has no 'CONFIRMED' value.
    let validStatus = status;
    if (status === 'CONFIRMED' || status === 'SCHEDULED' || status === 'APPROVED') {
      validStatus = 'APPROVED';
    }

    const updated = await (db as any).appointment.update({
      where: { id },
      data: {
        status: validStatus || 'APPROVED',
        confirmedTimeLabel: confirmedSlot === null ? null : confirmedSlot || undefined,
        proposedSlotWindow: confirmedSlot ? getSlotWindowEnum(confirmedSlot) : confirmedSlot === null ? null : undefined,
        proposedDate: confirmedDate === null ? null : confirmedDate ? new Date(confirmedDate) : undefined,
      },
      include: {
        patient: true,
        service: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
