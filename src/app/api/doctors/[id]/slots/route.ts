import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAvailableSlotsForDate, isSunday } from '@/lib/scheduling';

// GET /api/doctors/[id]/slots?date=YYYY-MM-DD — real available exact-time slots
// for one doctor on one date, used by the patient booking picker.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    if (!date) {
      return NextResponse.json({ error: 'A date query param is required.' }, { status: 400 });
    }

    const doctor = await (db as any).doctor.findUnique({ where: { id: params.id } });
    if (!doctor || !doctor.active) {
      return NextResponse.json({ error: 'Doctor not found.' }, { status: 404 });
    }

    if (isSunday(date)) {
      return NextResponse.json({ date, slots: [], reason: 'Sundays are not available for booking.' }, { status: 200 });
    }

    const dayStart = new Date(date + 'T00:00:00');
    const dayEnd = new Date(date + 'T23:59:59');

    // Booked appointments are stored with requestedDate == the actual confirmed date
    // on this new auto-booking flow (no separate "request vs assign" step anymore).
    const existing = await (db as any).appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: 'APPROVED',
        requestedDate: { gte: dayStart, lte: dayEnd },
      },
    });

    const bookedTimes = existing.map((apt: any) => apt.confirmedTimeLabel).filter(Boolean);

    const slots = getAvailableSlotsForDate(doctor.windows, date, bookedTimes);

    return NextResponse.json(
      { date, slots },
      { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } }
    );
  } catch (error: any) {
    console.error('Error fetching doctor slots:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch slots' }, { status: 500 });
  }
}
