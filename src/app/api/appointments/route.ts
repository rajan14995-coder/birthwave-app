import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function getSlotWindowEnum(slot: string): 'MORNING' | 'AFTERNOON' | 'EVENING' {
  const lower = (slot || '').toLowerCase();
  if (lower.includes('09:00') || lower.includes('11:00') || lower.includes('am')) {
    return 'MORNING';
  }
  if (lower.includes('02:00') || lower.includes('04:00') || lower.includes('pm')) {
    return 'AFTERNOON';
  }
  return 'EVENING';
}

export async function GET() {
  try {
    const rawAppointments = await (db as any).appointment.findMany({
      include: {
        patient: true,
        service: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const appointments = rawAppointments.map((apt: any) => ({
      id: apt.id,
      patientName: apt.patient?.name || apt.patientName || 'Patient',
      patientPhone: apt.patient?.phone || apt.patientPhone || 'N/A',
      reason: apt.service?.title || apt.service?.name || apt.reason || 'Consultation',
      preferredDate: apt.requestedDate ? new Date(apt.requestedDate).toISOString().split('T')[0] : '',
      preferredTimeSlot: apt.slotWindow || '',
      status: apt.status || 'PENDING',
      confirmedSlot: apt.proposedSlotWindow || null,
      confirmedDate: apt.proposedDate ? new Date(apt.proposedDate).toISOString().split('T')[0] : null,
      createdAt: apt.createdAt,
    }));

    return NextResponse.json(appointments, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
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

    const name = patientName || patient_name || 'Amudha';
    const phone = patientPhone || patient_phone || '9489881864';
    const dateStr = preferredDate || preferred_date || new Date().toISOString().split('T')[0];
    const parsedDateTime = new Date(dateStr);
    const validRequestedDate = isNaN(parsedDateTime.getTime()) ? new Date() : parsedDateTime;
    const rawSlot = preferredTimeSlot || preferred_time_slot || '';
    const mappedSlotWindow = slotWindow || getSlotWindowEnum(rawSlot);

    // 1. Resolve or create Patient record
    let targetPatientId = patientId;

    if (!targetPatientId) {
      // Find patient by phone or name
      let patient = await (db as any).patient.findFirst({
        where: {
          OR: [{ phone: phone }, { name: name }],
        },
      });

      if (!patient) {
        // Create patient if not existing
        patient = await (db as any).patient.create({
          data: {
            name: name,
            phone: phone,
          },
        });
      }
      targetPatientId = patient.id;
    }

    // 2. Resolve or fallback Service record
    let targetServiceId = serviceId;

    if (!targetServiceId) {
      let service = await (db as any).service.findFirst();
      if (!service) {
        service = await (db as any).service.create({
          data: {
            title: reason || 'General Consultation',
            name: reason || 'General Consultation',
          },
        });
      }
      targetServiceId = service.id;
    }

    // 3. Create Appointment with foreign keys
    const newAppointment = await (db as any).appointment.create({
      data: {
        patientId: targetPatientId,
        serviceId: targetServiceId,
        requestedDate: validRequestedDate,
        slotWindow: mappedSlotWindow,
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
    return NextResponse.json(
      { error: error?.message || String(error) },
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
        proposedSlotWindow: confirmedSlot || null,
        proposedDate: confirmedDate || confirmed_date ? new Date(confirmedDate || confirmed_date) : null,
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
