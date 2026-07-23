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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

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
      preferredTimeSlot: apt.slotWindow || '',
      status: apt.status || 'PENDING',
      confirmedSlot: apt.proposedSlotWindow || apt.slotWindow || null,
      confirmedDate: apt.proposedDate ? new Date(apt.proposedDate).toISOString().split('T')[0] : null,
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

    const name = patientName || patient_name || 'Amudha';
    const phone = patientPhone || patient_phone || '9489881864';
    const dateStr = preferredDate || preferred_date || new Date().toISOString().split('T')[0];
    const parsedDateTime = new Date(dateStr);
    const validRequestedDate = isNaN(parsedDateTime.getTime()) ? new Date() : parsedDateTime;
    const rawSlot = preferredTimeSlot || preferred_time_slot || '';
    const mappedSlotWindow = slotWindow || getSlotWindowEnum(rawSlot);

    let targetPatientId = patientId;
    if (!targetPatientId) {
      let patient = await (db as any).patient.findFirst({
        where: { OR: [{ phone: phone }, { name: name }] },
      });
      if (!patient) {
        patient = await (db as any).patient.create({
          data: { name, phone },
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

    // Ensure status maps correctly to AppointmentStatus Enum
    const validStatus = status === 'APPROVED' || status === 'CONFIRMED' ? 'CONFIRMED' : status || 'CONFIRMED';

    const updated = await (db as any).appointment.update({
      where: { id },
      data: {
        status: validStatus,
        proposedSlotWindow: confirmedSlot ? getSlotWindowEnum(confirmedSlot) : undefined,
        proposedDate: confirmedDate ? new Date(confirmedDate) : undefined,
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
