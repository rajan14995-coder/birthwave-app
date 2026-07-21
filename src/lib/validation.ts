import { z } from "zod";

export const sendOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  purpose: z.enum(["LOGIN", "RESCHEDULE_CONFIRM"]).default("LOGIN"),
  role: z.enum(["PATIENT", "STAFF"]).default("PATIENT"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  code: z.string().length(6),
  purpose: z.enum(["LOGIN", "RESCHEDULE_CONFIRM"]).default("LOGIN"),
  role: z.enum(["PATIENT", "STAFF"]).default("PATIENT"),
  name: z.string().min(1).max(120).optional(), // for first-time patient signup
});

export const createAppointmentSchema = z.object({
  serviceId: z.string().min(1),
  requestedDate: z.string().datetime(), // ISO string
  slotWindow: z.enum(["MORNING", "EVENING"]),
  notes: z.string().max(500).optional(),
});

export const appointmentActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("APPROVE") }),
  z.object({
    action: z.literal("RESCHEDULE"),
    proposedDate: z.string().datetime(),
    proposedSlotWindow: z.enum(["MORNING", "EVENING"]),
  }),
  z.object({ action: z.literal("DECLINE") }),
  z.object({ action: z.literal("COMPLETE") }),
]);

export const rescheduleResponseSchema = z.object({
  token: z.string().min(10),
  decision: z.enum(["ACCEPT", "DECLINE"]),
});

export const fertilityQuizSchema = z.object({
  age: z.number().int().min(15).max(60),
  tryingDurationMonths: z.number().int().min(0).max(240),
  cycleRegularity: z.enum(["REGULAR", "IRREGULAR", "SEVERELY_IRREGULAR"]),
  priorDiagnosis: z.array(z.enum(["PCOS", "ENDOMETRIOSIS", "THYROID", "NONE"])).default([]),
  priorMiscarriage: z.boolean().default(false),
});
