import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifyPatient, buildCancellationMessage } from '@/lib/notifications';

// POST /api/appointments/[id]/cancel — doctor cancels an appointment, with an
// optional reason, and the patient is notified immediately.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json().catch(() => ({}));
    const reason: string | undefined = (body?.reason || '').trim() || undefined;

    const appointment = await (db as any).appointment.findUnique({
      where: { id: params.id },
      include: { patient: true, doctor: true },
    });
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 });
    }

    const updated = await (db as any).appointment.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        cancelledBy: 'DOCTOR',
        cancellationReason: reason || null,
      },
      include: { patient: true, doctor: true, service: true },
    });

    const dateStr = appointment.proposedDate
      ? new Date(appointment.proposedDate).toISOString().split('T')[0]
      : new Date(appointment.requestedDate).toISOString().split('T')[0];
    const timeLabel = appointment.confirmedTimeLabel || appointment.preferredTimeLabel || '';
    const doctorName = appointment.doctor?.name || 'your doctor';

    const { title, message } = buildCancellationMessage(doctorName, dateStr, timeLabel, reason);
    await notifyPatient({
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      type: 'CANCELLED_BY_DOCTOR',
      title,
      message,
      oldDate: dateStr,
      oldTime: timeLabel,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
