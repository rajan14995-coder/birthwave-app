import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Fetch all records ordered by creation date
    const rawAppointments = await (db as any).appointment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Map database fields to support both snake_case and camelCase formats
    const appointments = rawAppointments.map((apt: any) => ({
      id: apt.id || apt.booking_id || apt.bookingId,
      patientName: apt.patient_name || apt.patientName || apt.name || 'Patient',
      patientPhone: apt.patient_phone || apt.patientPhone || apt.phone || 'N/A',
      reason: apt.reason || apt.service || 'Consultation',
      preferredDate: apt.preferred_date || apt.preferredDate || apt.date || '',
      preferredTimeSlot: apt.preferred_time_slot || apt.preferredTimeSlot || apt.time_slot || apt.slot || '',
      status: apt.status || 'Pending Confirmation',
      confirmedSlot: apt.confirmed_slot || apt.confirmedSlot || null,
      confirmedDate: apt.confirmed_date || apt.confirmedDate || null,
      createdAt: apt.created_at || apt.createdAt,
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

    // Generate custom booking ID format: BW-XXXXXX
    const customId = `BW-${Math.floor(100000 + Math.random() * 900000)}`;

    const newAppointment = await (db as any).appointment.create({
      data: {
        id: customId,
        patient_name: patient_name || patientName || 'Patient',
        patient_phone: patient_phone || patientPhone || 'N/A',
        reason: reason || 'Consultation',
        preferred_date: preferred_date || preferredDate || '',
        preferred_time_slot: preferred_time_slot || preferredTimeSlot || '',
        status: status || 'Pending Confirmation',
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
        confirmed_slot: confirmed_slot || confirmedSlot || null,
        confirmed_date: confirmed_date || confirmedDate || null,
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
