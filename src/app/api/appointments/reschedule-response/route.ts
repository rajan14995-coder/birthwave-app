import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rescheduleResponseSchema } from "@/lib/validation";
import { sendSms, smsTemplates, CLINIC_ALERT_PHONE } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = rescheduleResponseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { proposalToken: parsed.data.token },
    include: { patient: true },
  });

  if (!appointment || appointment.status !== "RESCHEDULE_PROPOSED") {
    return NextResponse.json({ error: "This reschedule link is no longer valid." }, { status: 410 });
  }
  if (!appointment.proposalTokenExp || appointment.proposalTokenExp < new Date()) {
    return NextResponse.json({ error: "This reschedule link has expired. Please contact the clinic." }, { status: 410 });
  }

  if (parsed.data.decision === "ACCEPT") {
    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: "APPROVED",
        requestedDate: appointment.proposedDate!,
        slotWindow: appointment.proposedSlotWindow!,
        proposalToken: null,
        proposalTokenExp: null,
      },
    });
    await sendSms(
      CLINIC_ALERT_PHONE,
      smsTemplates.rescheduleConfirmedToStaff(
        appointment.patient.phone,
        updated.requestedDate.toDateString(),
        updated.slotWindow
      )
    );
    return NextResponse.json({ success: true, status: "APPROVED", appointment: updated });
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "CANCELLED", proposalToken: null, proposalTokenExp: null },
  });
  await sendSms(CLINIC_ALERT_PHONE, smsTemplates.rescheduleDeclinedToStaff(appointment.patient.phone));
  return NextResponse.json({ success: true, status: "CANCELLED", appointment: updated });
}
