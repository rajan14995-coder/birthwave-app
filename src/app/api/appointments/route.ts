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

    const newAppointment = await (db as any).appointment.create({
      data: {
        id: customId,
        patientName: patientName || patient_name || 'Patient',
        patientPhone: patientPhone || patient_phone || 'N/A',
        reason: reason || 'Consultation',
        preferredDate: preferredDate || preferred_date || '',
        preferredTimeSlot: preferredTimeSlot || preferred_time_slot || '',
        status: status || 'PENDING',
      },
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
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

    const updated = await (db as any).appointment.update({
      where: { id },
      data: {
        status: status,
        confirmedSlot: confirmedSlot || confirmed_slot || null,
        confirmedDate: confirmedDate || confirmed_date || null,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}
