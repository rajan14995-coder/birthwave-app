import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const rawAppointments = await (db as any).appointment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const appointments = rawAppointments.map((apt: any) => ({
      id: apt.id || apt.booking_id || apt.bookingId,
      patientName: apt.patientName || apt.patient_name || apt.name || 'Patient',
      patientPhone: apt.patientPhone || apt.patient_phone || apt.phone || 'N/A',
      reason: apt.reason || apt.service || 'Consultation',
      preferredDate: apt.preferredDate || apt.preferred_date || apt.date || '',
      preferredTimeSlot: apt.preferredTimeSlot || apt.preferred_time_slot || apt.time_slot || apt.slot || '',
      status: apt.status || 'PENDING',
      confirmedSlot: apt.confirmedSlot || apt.confirmed_slot || null,
      confirmedDate: apt.confirmedDate || apt.confirmed_date || null,
      createdAt: apt.createdAt || apt.created_at,
    }));

    return NextResponse.json(appointments, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
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
    } = body;

    const customId = `BW-${Math.floor(100000 + Math.random() * 900000)}`;

    const pName = patientName || patient_name || 'Patient';
    const pPhone = patientPhone || patient_phone || 'N/A';
    const pReason = reason || 'Consultation';
    const pDate = preferredDate || preferred_date || '';
    const pSlot = preferredTimeSlot || preferred_time_slot || '';
    const pStatus = status || 'PENDING';

    let newAppointment;

    // First attempt: camelCase schema fields
    try {
      newAppointment = await (db as any).appointment.create({
        data: {
          id: customId,
          patientName: pName,
          patientPhone: pPhone,
          reason: pReason,
          preferredDate: pDate,
          preferredTimeSlot: pSlot,
          status: pStatus,
        },
      });
    } catch (dbErr) {
      // Fallback attempt: snake_case schema fields
      newAppointment = await (db as any).appointment.create({
        data: {
          id: customId,
          patient_name: pName,
          patient_phone: pPhone,
          reason: pReason,
          preferred_date: pDate,
          preferred_time_slot: pSlot,
          status: pStatus,
        },
      });
    }

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, confirmedSlot, confirmed_slot, confirmedDate, confirmed_date } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing appointment ID' }, { status: 400 });
    }

    const cSlot = confirmedSlot || confirmed_slot || null;
    const cDate = confirmedDate || confirmed_date || null;

    let updated;

    try {
      updated = await (db as any).appointment.update({
        where: { id },
        data: {
          status: status,
          confirmedSlot: cSlot,
          confirmedDate: cDate,
        },
      });
    } catch (dbErr) {
      updated = await (db as any).appointment.update({
        where: { id },
        data: {
          status: status,
          confirmed_slot: cSlot,
          confirmed_date: cDate,
        },
      });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update appointment' },
      { status: 500 }
    );
  }
}
