import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createAppointmentSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Please log in as a patient to book an appointment." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const service = await prisma.service.findUnique({ where: { id: parsed.data.serviceId } });
  if (!service || !service.active) {
    return NextResponse.json({ error: "Selected service is not available." }, { status: 400 });
  }

  const requestedDate = new Date(parsed.data.requestedDate);
  if (requestedDate < new Date(new Date().toDateString())) {
    return NextResponse.json({ error: "Cannot book a date in the past." }, { status: 400 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: session.sub,
      serviceId: parsed.data.serviceId,
      requestedDate,
      slotWindow: parsed.data.slotWindow,
      notes: parsed.data.notes,
      status: "PENDING",
    },
    include: { service: true },
  });

  return NextResponse.json({ success: true, appointment }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;
  const searchPhone = searchParams.get("phone") ?? undefined;

  if (session.role === "PATIENT") {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: session.sub, ...(status ? { status: status as any } : {}) },
      include: { service: true },
      orderBy: { requestedDate: "desc" },
    });
    return NextResponse.json({ appointments });
  }

  // STAFF: full queue view, filterable
  const appointments = await prisma.appointment.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(dateFrom || dateTo
        ? {
            requestedDate: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
      ...(searchPhone ? { patient: { phone: { contains: searchPhone } } } : {}),
    },
    include: { service: true, patient: { select: { id: true, phone: true, name: true } } },
    orderBy: [{ status: "asc" }, { requestedDate: "asc" }],
  });

  return NextResponse.json({ appointments });
}
