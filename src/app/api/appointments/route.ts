import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const rawAppointments = await (db as any).appointment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const appointments = rawAppointments.map((apt: any) => ({
      id: apt.id,
      patientName: apt.patientName || apt.patient_name || 'Patient',
      patientPhone: apt.patientPhone || apt.patient_phone || 'N/A',
      reason: apt.reason || 'Consultation',
      preferredDate: apt.preferredDate || (apt.requestedDate ? new Date(apt.requestedDate).toISOString().split('T')[0] : ''),
      preferredTimeSlot: apt.preferredTimeSlot || apt.preferred_time_slot || '',
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

    const dateStr = preferredDate || preferred_date || new Date().toISOString().split('T')[0];
    const parsedDateTime = new Date(dateStr);

    const newAppointment = await (db as any).appointment.create({
      data: {
        patientName: patientName || patient_name || 'Patient',
        patientPhone: patientPhone || patient_phone || 'N/A',
        reason: reason || 'Consultation',
        preferredDate: dateStr,
        requestedDate: isNaN(parsedDateTime.getTime()) ? new Date() : parsedDateTime,
        preferredTimeSlot: preferredTimeSlot || preferred_time_slot || '',
        status: status || 'PENDING',
      },
    });

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
    const { id, status, confirmedSlot, confirmed_date, confirmedDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing appointment ID' }, { status: 400 });
    }

    const updated = await (db as any).appointment.update({
      where: { id },
      data: {
        status: status,
        confirmedSlot: confirmedSlot || null,
        confirmedDate: confirmedDate || confirmed_date || null,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update appointment' },
      { status: 500 }
    );
  }
}
