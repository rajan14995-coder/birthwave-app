import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { appointmentActionSchema } from "@/lib/validation";
import { sendSms, smsTemplates, CLINIC_ALERT_PHONE } from "@/lib/sms";
import { format } from "date-fns";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "STAFF") {
    return NextResponse.json({ error: "Only clinic staff can perform this action." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = appointmentActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { patient: true, service: true },
  });
  if (!appointment) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });

  const dateStr = format(appointment.requestedDate, "dd MMM yyyy");

  if (parsed.data.action === "APPROVE") {
    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "APPROVED" },
    });

    await sendSms(appointment.patient.phone, smsTemplates.appointmentApproved(dateStr, appointment.slotWindow));
    await sendSms(
      CLINIC_ALERT_PHONE,
      smsTemplates.clinicAlertNewApproval(appointment.patient.phone, dateStr, appointment.slotWindow)
    );

    return NextResponse.json({ success: true, appointment: updated });
  }

  if (parsed.data.action === "RESCHEDULE") {
    const token = crypto.randomBytes(24).toString("hex");
    const proposedDate = new Date(parsed.data.proposedDate);

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: "RESCHEDULE_PROPOSED",
        proposedDate,
        proposedSlotWindow: parsed.data.proposedSlotWindow,
        proposalToken: token,
        proposalTokenExp: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72h to respond
      },
    });

    const link = `${process.env.NEXT_PUBLIC_APP_URL}/reschedule/${token}`;
    await sendSms(
      appointment.patient.phone,
      smsTemplates.reschedulePropo(format(proposedDate, "dd MMM yyyy"), parsed.data.proposedSlotWindow, link)
    );

    return NextResponse.json({ success: true, appointment: updated });
  }

  if (parsed.data.action === "DECLINE") {
    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "DECLINED" },
    });
    return NextResponse.json({ success: true, appointment: updated });
  }

  // COMPLETE
  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "COMPLETED" },
  });
  return NextResponse.json({ success: true, appointment: updated });
}
