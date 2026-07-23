import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Ensure this points to your Prisma / Supabase DB instance

export async function GET() {
  try {
    // Fetch all records ordered by creation date
    const rawAppointments = await db.appointment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Map database fields to normalize snake_case and camelCase formats
    const appointments = rawAppointments.map((apt: any) => ({
      id: apt.id || apt.booking_id || apt.bookingId,
      patientName: apt.patientName || apt.patient_name || apt.name || 'Patient',
      patientPhone: apt.patientPhone || apt.patient_phone || apt.phone || 'N/A',
      reason: apt.reason || apt.service || 'Consultation',
      preferredDate: apt.preferredDate || apt.preferred_date || apt.date || '',
      preferredTimeSlot: apt.preferredTimeSlot || apt.preferred_time_slot || apt.time_slot || apt.slot || '',
      status: apt.status || 'Pending Confirmation',
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
    } = body;

    // Generate custom booking ID format: BW-XXXXXX
    const customId = `BW-${Math.floor(100000 + Math.random() * 900000)}`;

    const newAppointment = await db.appointment.create({
      data: {
        id: customId,
        patientName: patientName || patient_name,
        patientPhone: patientPhone || patient_phone,
        reason: reason || 'Consultation',
        preferredDate: preferredDate || preferred_date,
        preferredTimeSlot: preferredTimeSlot || preferred_time_slot,
        status: 'Pending Confirmation',
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
    const { id, status, confirmedSlot, confirmedDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing appointment ID' }, { status: 400 });
    }

    const updated = await db.appointment.update({
      where: { id },
      data: {
        status,
        confirmedSlot: confirmedSlot || null,
        confirmedDate: confirmedDate || null,
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
