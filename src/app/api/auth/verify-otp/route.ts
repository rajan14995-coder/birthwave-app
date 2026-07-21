import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone } from "@/lib/phone";
import { verifyOtpSchema } from "@/lib/validation";
import { verifyOtp } from "@/lib/otp";
import { createSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { phone: rawPhone, code, purpose, role, name } = parsed.data;
  const phone = normalizeIndianPhone(rawPhone);
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
  }

  const result = await verifyOtp({ phone, code, purpose });
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 401 });
  }

  if (role === "PATIENT") {
    const patient = await prisma.patient.upsert({
      where: { phone },
      update: name ? { name } : {},
      create: { phone, name },
    });
    await createSessionCookie({ sub: patient.id, role: "PATIENT", phone });
    return NextResponse.json({ success: true, patient: { id: patient.id, name: patient.name, phone } });
  }

  const staff = await prisma.staff.findUniqueOrThrow({ where: { phone } });
  await createSessionCookie({ sub: staff.id, role: "STAFF", phone, staffRole: staff.role });
  return NextResponse.json({ success: true, staff: { id: staff.id, name: staff.name, role: staff.role } });
}
