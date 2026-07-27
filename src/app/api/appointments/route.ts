import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  MIN_BOOKING_LEAD_MINUTES,
  generateDaySlots,
  getSlotDateTime,
  isSunday,
  findNextAvailableSlots,
} from '@/lib/scheduling';

function normalizePhone(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  return digits.slice(-10);
}

// Derives the coarse MORNING/EVENING enum from an exact "HH:mm AM/PM" slot label
function slotWindowFromExactTime(timeLabel: string): 'MORNING' | 'EVENING' {
  const isPM = /PM$/i.test(timeLabel.trim());
  const hourPart = parseInt(timeLabel.trim().split(':')[0], 10);
  const hour24 = isPM && hourPart !== 12 ? hourPart + 12 : !isPM && hourPart === 12 ? 0 : hourPart;
  return hour24 < 14 ? 'MORNING' : 'EVENING';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPhone = searchParams.get('phone');
    const phone = rawPhone ? normalizePhone(rawPhone) : '';
    const doctorId = searchParams.get('doctorId');

    const whereClause: any = {};
    if (phone) whereClause.patient = { phone };
    if (doctorId) whereClause.doctorId = doctorId;

    const rawAppointments = await (db as any).appointment.findMany({
      where: whereClause,
      include: {
        patient: true,
        service: true,
        doctor: true,
      },
      orderBy: { requestedDate: 'desc' },
    });

    const appointments = rawAppointments.map((apt: any) => ({
      id: apt.id,
      patientName: apt.patient?.name || 'Patient',
      patientPhone: apt.patient?.phone || 'N/A',
      reason: apt.service?.name || 'Consultation',
      doctorId: apt.doctorId || null,
      doctorName: apt.doctor?.name || null,
      specialtyLabel: apt.doctor?.specialtyLabel || null,
      consultationMode: apt.doctor?.consultationMode || null,
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
    const { patientName, patientPhone, doctorId, preferredDate, exactTime } = body;

    const name = (patientName || '').trim();
    const phone = normalizePhone(patientPhone || '');

    if (!name || !phone) {
      return NextResponse.json({ error: 'Patient name and phone number are required.' }, { status: 400 });
    }
    if (!doctorId) {
      return NextResponse.json({ error: 'Please select a doctor.' }, { status: 400 });
    }
    if (!preferredDate || !exactTime) {
      return NextResponse.json({ error: 'Please select a date and time slot.' }, { status: 400 });
    }

    const doctor = await (db as any).doctor.findUnique({ where: { id: doctorId }, include: { service: true } });
    if (!doctor || !doctor.active) {
      return NextResponse.json({ error: 'The selected doctor is not available.' }, { status: 400 });
    }

    // --- Booking rules ---
    if (isSunday(preferredDate)) {
      return NextResponse.json(
        { error: 'Sundays are not available for booking. Please choose another date.' },
        { status: 400 }
      );
    }

    const slotDt = getSlotDateTime(preferredDate, exactTime);
    if (!slotDt) {
      return NextResponse.json({ error: 'Invalid time slot.' }, { status: 400 });
    }
    if (slotDt.getTime() < Date.now()) {
      return NextResponse.json({ error: 'You cannot book an appointment in the past.' }, { status: 400 });
    }
    const minBookableTime = Date.now() + MIN_BOOKING_LEAD_MINUTES * 60 * 1000;
    if (slotDt.getTime() < minBookableTime) {
      return NextResponse.json(
        { error: `Appointments must be booked at least ${MIN_BOOKING_LEAD_MINUTES} minutes in advance.` },
        { status: 400 }
      );
    }

    const daySlots = generateDaySlots(doctor.windows);
    if (!daySlots.includes(exactTime)) {
      return NextResponse.json({ error: 'That time is outside the doctor\u2019s available hours.' }, { status: 400 });
    }
    // --- End booking rules ---

    const dayStart = new Date(preferredDate + 'T00:00:00');
    const dayEnd = new Date(preferredDate + 'T23:59:59');

    // Pull everything this doctor has approved in the next 30 days once, so we can both
    // check this exact slot AND compute alternatives without querying per-day in a loop.
    const horizonEnd = new Date(dayStart);
    horizonEnd.setDate(horizonEnd.getDate() + 30);

    const upcomingApproved = await (db as any).appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: 'APPROVED',
        requestedDate: { gte: dayStart, lte: horizonEnd },
      },
    });

    const bookedByDate = new Map<string, string[]>();
    for (const apt of upcomingApproved) {
      const dateKey = new Date(apt.requestedDate).toISOString().split('T')[0];
      if (!bookedByDate.has(dateKey)) bookedByDate.set(dateKey, []);
      if (apt.confirmedTimeLabel) bookedByDate.get(dateKey)!.push(apt.confirmedTimeLabel);
    }

    const alreadyBooked = (bookedByDate.get(preferredDate) || []).includes(exactTime);

    if (alreadyBooked) {
      const alternatives = findNextAvailableSlots(
        doctor.windows,
        preferredDate,
        3,
        (dateStr) => bookedByDate.get(dateStr) || []
      );
      return NextResponse.json(
        {
          error: 'That slot was just taken. Here are the next available times with this doctor.',
          alternatives,
        },
        { status: 409 }
      );
    }

    // --- Slot is free: find/create the patient, then auto-confirm the booking ---
    let patient = await (db as any).patient.findFirst({ where: { phone } });
    if (!patient) {
      patient = await (db as any).patient.create({ data: { name, phone } });
    } else if (patient.name !== name) {
      patient = await (db as any).patient.update({ where: { id: patient.id }, data: { name } });
    }

    const slotWindow = slotWindowFromExactTime(exactTime);
    const requestedDateTime = new Date(preferredDate + 'T00:00:00');

    const newAppointment = await (db as any).appointment.create({
      data: {
        patientId: patient.id,
        serviceId: doctor.serviceId,
        doctorId: doctor.id,
        requestedDate: requestedDateTime,
        slotWindow,
        preferredTimeLabel: exactTime,
        status: 'APPROVED',
        proposedDate: requestedDateTime,
        proposedSlotWindow: slotWindow,
        confirmedTimeLabel: exactTime,
      },
      include: { patient: true, service: true, doctor: true },
    });

    return NextResponse.json(
      {
        id: newAppointment.id,
        patientName: newAppointment.patient?.name,
        patientPhone: newAppointment.patient?.phone,
        reason: newAppointment.service?.name,
        doctorId: newAppointment.doctorId,
        doctorName: newAppointment.doctor?.name,
        specialtyLabel: newAppointment.doctor?.specialtyLabel,
        preferredDate,
        confirmedSlot: exactTime,
        confirmedDate: preferredDate,
        status: 'APPROVED',
      },
      { status: 201 }
    );
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

    let validStatus = status;
    if (status === 'CONFIRMED' || status === 'SCHEDULED' || status === 'APPROVED') {
      validStatus = 'APPROVED';
    }

    const updated = await (db as any).appointment.update({
      where: { id },
      data: {
        status: validStatus || 'APPROVED',
        confirmedTimeLabel: confirmedSlot === null ? null : confirmedSlot || undefined,
        proposedDate: confirmedDate === null ? null : confirmedDate ? new Date(confirmedDate) : undefined,
      },
      include: { patient: true, service: true, doctor: true },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
