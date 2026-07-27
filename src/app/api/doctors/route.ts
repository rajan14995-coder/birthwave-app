import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/doctors — list all active doctors with their service/specialty,
// used by the booking flow (service -> doctor picker) and the doctor dashboard filter.
export async function GET() {
  try {
    const doctors = await (db as any).doctor.findMany({
      where: { active: true },
      include: { service: true },
      orderBy: [{ serviceId: 'asc' }, { name: 'asc' }],
    });

    const shaped = doctors.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      specialtyLabel: doc.specialtyLabel,
      consultationMode: doc.consultationMode,
      windows: doc.windows,
      serviceId: doc.serviceId,
      serviceName: doc.service?.name || '',
    }));

    return NextResponse.json(shaped, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
    });
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch doctors' }, { status: 500 });
  }
}
