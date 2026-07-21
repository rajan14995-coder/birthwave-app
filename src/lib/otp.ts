import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

export async function createOtp(params: {
  phone: string;
  purpose: "LOGIN" | "RESCHEDULE_CONFIRM";
  patientId?: string;
  staffId?: string;
}) {
  const code = generateOtp();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: {
      phone: params.phone,
      codeHash,
      purpose: params.purpose,
      expiresAt,
      patientId: params.patientId,
      staffId: params.staffId,
    },
  });

  return code; // caller sends this via SMS; never persisted in plaintext
}

export async function verifyOtp(params: {
  phone: string;
  purpose: "LOGIN" | "RESCHEDULE_CONFIRM";
  code: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      phone: params.phone,
      purpose: params.purpose,
      consumedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return { ok: false, reason: "No active OTP found. Please request a new code." };
  if (otp.expiresAt < new Date()) return { ok: false, reason: "OTP expired. Please request a new code." };
  if (otp.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "Too many attempts. Please request a new code." };

  const matches = await bcrypt.compare(params.code, otp.codeHash);

  if (!matches) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, reason: "Incorrect code." };
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  return { ok: true };
}
