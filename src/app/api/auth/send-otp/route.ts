import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone, maskPhone } from "@/lib/phone";
import { sendOtpSchema } from "@/lib/validation";
import { createOtp } from "@/lib/otp";
import { sendSms, smsTemplates } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = sendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { phone: rawPhone, purpose, role } = parsed.data;
  const phone = normalizeIndianPhone(rawPhone);
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
  }

  let patientId: string | undefined;
  let staffId: string | undefined;

  if (role === "PATIENT") {
    const patient = await prisma.patient.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });
    patientId = patient.id;
  } else {
    const staff = await prisma.staff.findUnique({ where: { phone } });
    if (!staff) {
      return NextResponse.json({ error: "This number is not registered as clinic staff." }, { status: 403 });
    }
    staffId = staff.id;
  }

  const code = await createOtp({ phone, purpose, patientId, staffId });

  try {
    await sendSms(phone, smsTemplates.otp(code));
  } catch (err) {
    console.error("SMS send failure:", err);
    return NextResponse.json({ error: "Could not send SMS. Please try again shortly." }, { status: 502 });
  }

  return NextResponse.json({ success: true, phoneMasked: maskPhone(phone) });
}
